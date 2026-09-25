"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Pozo } from "@/lib/config";
import {
  RACHA_MAX,
  SEGUNDOS_DIA,
  ahorrarHoy,
  apyTexto,
  chancesBps,
  cuentaDe,
  depositar,
  depositarConReferente,
  estado,
  ganadorSeConoceEn,
  ganadores,
  retirar,
  saldo,
  type Cuenta,
  type Ganador,
  type Vista,
} from "@/lib/pozo";
import { aStroops, aTexto } from "@/lib/montos";
import { conectar, desconectar, direccionActual, firmar } from "@/lib/wallet";
import { porcentaje, tasaBlend, type TasaBlend } from "@/lib/blend";
import { agregarTrustline, estadoBilletera, type EstadoBilletera } from "@/lib/billetera";
import { cambiar, cotizar, dondeCambia, type Cotizacion } from "@/lib/cambio";
import { Marco } from "@/components/Marco";
import { BotonWallet } from "@/components/Wallet";
import { Boton, Etiqueta, Panel, corta, explorer } from "@/components/ui";
import { IconoMoneda } from "@/components/Logos";

type Accion = null | "depositar" | "cambiar" | "retirar" | "conectar" | "racha" | "trustline";

/**
 * Con qué paga el usuario: `null` es el token del pozo; si no, el símbolo de
 * una moneda de entrada (XLM, USDT0) que se cambia en Soroswap o en el DEX.
 */
type Moneda = string | null;

/** Un cartel de estado: qué pasó, en lenguaje normal, y opcionalmente la transacción o el detalle técnico. */
type Mensaje = { texto: string; tx?: string; detalle?: string };

/** XLM que hay que dejar en la wallet: la reserva de Stellar más fees. */
const RESERVA_XLM = 15_000_000n;

/** Cada cuántos segundos se relee el contrato. El premio crece solo. */
const REFRESCO_S = 20;

/**
 * Cada cuánto, como mucho, una pestaña abierta le pide al keeper serverless
 * que haga un paso. El keeper decide solo si hay algo que hacer; esto es para
 * no martillarlo mientras una ronda vencida espera a drand.
 */
const KEEPER_CADA_S = 60;

const PRESETS = ["1", "5", "10", "50"];

/**
 * Segundos desde epoch, refrescados cada segundo. Va en estado y no leído en
 * render, si no el countdown y el "vencido" solo se enteran cuando algo más
 * provoca un re-render.
 */
function useAhora(): number {
  const [ahora, setAhora] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setAhora(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  return ahora;
}

/**
 * Le avisa al keeper (`/api/keeper`) que hay trabajo: una ronda vencida con
 * gente adentro o un sorteo esperando la firma de drand. Cualquier visita
 * sirve de keeper; el que paga las fees es el server. Devuelve `true` si el
 * keeper hizo algo en este pozo, para releer el contrato enseguida.
 */
async function empujarKeeper(pozoId: string): Promise<boolean> {
  try {
    const r = await fetch("/api/keeper", { method: "POST" });
    const j = (await r.json()) as {
      ok: boolean;
      pozos?: { pozo: string; ok: boolean; paso?: { accion: string; tx: string | null } }[];
    };
    return Boolean(
      j.ok &&
        j.pozos?.some(
          (p) => p.pozo === pozoId && p.ok && p.paso && p.paso.accion !== "espera" && p.paso.tx,
        ),
    );
  } catch {
    return false;
  }
}

function hayTrabajo(v: Vista, ahora: number): boolean {
  if (v.sorteoPendiente) return true;
  return v.participantes > 0 && ahora >= Number(v.cierraAt);
}

/** `?ref=G...` en la URL: quién invitó. Solo cuenta en el primer depósito. */
function leerReferente(): string | null {
  if (typeof window === "undefined") return null;
  const ref = new URLSearchParams(window.location.search).get("ref");
  return ref && /^G[A-Z2-7]{55}$/.test(ref) ? ref : null;
}

export function PozoApp({ pozo, activo }: { pozo: Pozo | null; activo: "app" | "test" }) {
  const [yo, setYo] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista | null>(null);
  /** Cuándo se leyó `vista`, en ms: el premio en pantalla crece desde ahí. */
  const [leidoEn, setLeidoEn] = useState(0);
  const [revela, setRevela] = useState<number | null>(null);
  const [lista, setLista] = useState<Ganador[] | null>(null);
  const [tasa, setTasa] = useState<TasaBlend | null>(null);
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [billetera, setBilletera] = useState<EstadoBilletera | null>(null);
  const [miSaldo, setMiSaldo] = useState<bigint>(0n);
  const [misChances, setMisChances] = useState<number>(0);
  const [monto, setMonto] = useState("");
  const [error, setErrorCrudo] = useState<Mensaje | null>(null);
  const [aviso, setAvisoCrudo] = useState<Mensaje | null>(null);
  const setError = (m: string | Mensaje | null) =>
    setErrorCrudo(typeof m === "string" ? { texto: m } : m);
  const setAviso = (m: string | Mensaje | null) =>
    setAvisoCrudo(typeof m === "string" ? { texto: m } : m);
  const [accion, setAccion] = useState<Accion>(null);
  const [cargando, setCargando] = useState(true);
  const [referente, setReferente] = useState<string | null>(null);
  const [moneda, setMoneda] = useState<Moneda>(null);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  /** El monto que nadie pudo cotizar, para no insistir. */
  const [sinCotizacion, setSinCotizacion] = useState<bigint | null>(null);
  const ahora = useAhora();
  const ultimoEmpujon = useRef(0);

  const refrescar = useCallback(
    async (direccion: string | null) => {
      if (!pozo) return;
      try {
        const [v, s, ch, c, b] = await Promise.all([
          estado(pozo),
          direccion ? saldo(pozo, direccion) : Promise.resolve(0n),
          direccion ? chancesBps(pozo, direccion) : Promise.resolve(0),
          direccion ? cuentaDe(pozo, direccion) : Promise.resolve(null),
          direccion ? estadoBilletera(pozo, direccion).catch(() => null) : Promise.resolve(null),
        ]);
        setVista(v);
        setLeidoEn(Date.now());
        setMiSaldo(s);
        setMisChances(ch);
        setCuenta(c);
        setBilletera(b);
        setRevela(await ganadorSeConoceEn(pozo, v));
        setError(null);

        const t = Math.floor(Date.now() / 1000);
        if (hayTrabajo(v, t) && t - ultimoEmpujon.current >= KEEPER_CADA_S) {
          ultimoEmpujon.current = t;
          if (await empujarKeeper(pozo.id)) {
            const v2 = await estado(pozo);
            setVista(v2);
            setLeidoEn(Date.now());
            setRevela(await ganadorSeConoceEn(pozo, v2));
            ganadores(pozo).then(setLista).catch(() => {});
          }
        }
      } catch (e) {
        setError(mensaje(e));
      } finally {
        setCargando(false);
      }
    },
    [pozo],
  );

  useEffect(() => {
    if (!pozo) return;
    let direccion: string | null = null;
    (async () => {
      direccion = await direccionActual(pozo.red);
      setYo(direccion);
      setReferente(leerReferente());
      await refrescar(direccion);
    })();
    ganadores(pozo).then(setLista).catch(() => setLista([]));
    tasaBlend(pozo).then(setTasa).catch(() => setTasa(null));
    const t = setInterval(() => refrescar(direccion), REFRESCO_S * 1000);
    return () => clearInterval(t);
  }, [refrescar, pozo]);

  // Cotización en vivo mientras se escribe un monto en XLM. Con espera, para
  // no pedirle una simulación al RPC por cada tecla. La cotización guardada
  // vale solo si es del monto que está escrito ahora; si no, se está pidiendo.
  const entrada = moneda ? (pozo?.entradas?.monedas.find((m) => m.simbolo === moneda) ?? null) : null;
  const entraOtra = entrada ? aStroops(monto) : null;
  const cotizacionVigente =
    entrada && entraOtra != null && entraOtra > 0n && cotizacion?.entra === entraOtra &&
    cotizacion.moneda.simbolo === entrada.simbolo
      ? cotizacion
      : null;
  const cotizando =
    entraOtra != null && entraOtra > 0n && !cotizacionVigente && sinCotizacion !== entraOtra;
  useEffect(() => {
    if (!pozo || !yo || !entrada || entraOtra == null || entraOtra <= 0n) return;
    let vigente = true;
    const t = setTimeout(async () => {
      try {
        const c = await cotizar(pozo, yo, entrada, entraOtra);
        if (vigente) setCotizacion(c);
      } catch {
        if (vigente) setSinCotizacion(entraOtra);
      }
    }, 400);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [pozo, entrada, entraOtra, yo]);

  /** Lo que la wallet tiene de la moneda de entrada elegida. */
  const saldoEntrada = entrada && billetera ? billetera.entradas[entrada.simbolo] : null;

  async function correr(cual: Exclude<Accion, null>, fn: () => Promise<void>) {
    setAccion(cual);
    setError(null);
    setAviso(null);
    try {
      await fn();
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setAccion(null);
    }
  }

  function montoValido(): bigint | null {
    const m = aStroops(monto);
    if (m == null || m <= 0n) {
      setError("Enter a valid amount, with up to 7 decimals.");
      return null;
    }
    return m;
  }

  const conectarWallet = () =>
    correr("conectar", async () => {
      if (!pozo) return;
      const direccion = await conectar(pozo.red);
      setYo(direccion);
      await refrescar(direccion);
    });

  const firmante = (xdr: string) => firmar(xdr, pozo?.passphrase);

  // El referente aplica solo si todavía no hay cuenta y no es uno mismo.
  const referenteAplica = Boolean(referente && !cuenta && yo && referente !== yo);

  const sinTrustline = Boolean(yo && billetera && billetera.existe && !billetera.trustline);

  const hoy = Math.floor(ahora / SEGUNDOS_DIA);
  const marcoHoy = cuenta != null && cuenta.ultimoDia === hoy;
  const rachaViva =
    cuenta != null && (cuenta.ultimoDia === hoy || cuenta.ultimoDia + 1 === hoy) ? cuenta.racha : 0;

  return (
    <Marco
      activo={activo === "test" ? "app" : "app"}
      red={pozo?.red}
      wallet={
        <BotonWallet
          yo={yo}
          cargando={accion === "conectar"}
          onConectar={conectarWallet}
          onDesconectar={() =>
            correr("conectar", async () => {
              await desconectar();
              setYo(null);
              setCuenta(null);
              setBilletera(null);
              setMiSaldo(0n);
              setMisChances(0);
            })
          }
        />
      }
    >
      {!pozo && <SinDeploy />}

      {pozo && activo === "test" && (
        <div className="aviso text-center">
          🧪 <strong>Test pool on testnet.</strong> 10-minute rounds with play XLM, to watch the
          whole cycle. The real one is on the{" "}
          <Link href="/" className="font-bold text-naranja underline underline-offset-4">
            home page
          </Link>
          .
        </div>
      )}

      {pozo && activo === "app" && pozo.red === "testnet" && (
        <div className="aviso text-center">
          🧪 This pool runs on <strong>testnet</strong> with test XLM. The mainnet one, in USDC,
          is on its way.
        </div>
      )}

      {error && <Cartel m={error} tono="rojo" red={pozo?.red} />}
      {aviso && <Cartel m={aviso} tono="verde" red={pozo?.red} />}

      {pozo && cargando && !vista && <p className="header-tagline text-center">Reading the pool…</p>}

      {vista && pozo && (
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-4">
            <Premio
              vista={vista}
              ahora={ahora}
              revela={revela}
              simbolo={pozo.simbolo}
              tasa={tasa}
              leidoEn={leidoEn}
            />
            <Cifras vista={vista} tasa={tasa} simbolo={pozo.simbolo} />
            {yo && (
              <Racha
                cuenta={cuenta}
                miSaldo={miSaldo}
                marcoHoy={marcoHoy}
                rachaViva={rachaViva}
                cargando={accion === "racha"}
                deshabilitado={accion !== null}
                onMarcar={() =>
                  correr("racha", async () => {
                    const tx = await ahorrarHoy(pozo, yo, firmante);
                    await refrescar(yo);
                    setAviso({ texto: "🔥 Streak marked. Tomorrow counts for more.", tx });
                  })
                }
              />
            )}
            <Ganadores lista={lista} red={pozo.red} simbolo={pozo.simbolo} />
          </div>

          <div className="flex flex-col gap-4">
            <Panel titulo="🦊 Your position">
              {yo ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="stat">
                      <div className="stat-label">Your capital</div>
                      <div className="stat-value verde cifra">
                        {aTexto(miSaldo)} <span className="stat-unit">{pozo.simbolo}</span>
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">🎯 Your odds</div>
                      <div className="stat-value naranja cifra">
                        {(misChances / 100).toFixed(2)} <span className="stat-unit">%</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-tenue">
                    Weighted by how much you put in, for how long, plus your streak and referrals.
                  </p>
                  {miSaldo === 0n && misChances > 0 && (
                    <p className="aviso mt-3 text-xs">
                      You withdrew everything, but you still hold{" "}
                      <span className="font-bold text-foreground">{(misChances / 100).toFixed(2)} %</span>{" "}
                      of this round&apos;s odds: what you accrued while your money was in, earning
                      part of this prize. It stops growing now and resets next round.
                    </p>
                  )}

                  {billetera && billetera.existe && (
                    <p className="mt-2 text-xs text-tenue">
                      In your wallet: <span className="cifra font-bold text-foreground">{aTexto(billetera.saldo)} {pozo.simbolo}</span>
                    </p>
                  )}
                  {billetera && !billetera.existe && (
                    <p className="aviso mt-3 text-xs">
                      This wallet does not exist on {pozo.red} yet: send it some XLM first.
                    </p>
                  )}
                  {sinTrustline && (
                    <div className="aviso mt-3">
                      <p className="text-xs">
                        Your wallet does not accept {pozo.simbolo} yet. It is a one-time Stellar
                        step, and it costs nothing beyond the fee.
                      </p>
                      <div className="mt-2">
                        <Boton
                          onClick={() =>
                            correr("trustline", async () => {
                              const tx = await agregarTrustline(pozo, yo, firmante);
                              await refrescar(yo);
                              setAviso({ texto: `✓ Your wallet now accepts ${pozo.simbolo}.`, tx });
                            })
                          }
                          cargando={accion === "trustline"}
                          disabled={accion !== null}
                        >
                          Add {pozo.simbolo} to my wallet
                        </Boton>
                      </div>
                    </div>
                  )}

                  {referenteAplica && (
                    <p className="aviso aviso-verde mt-3 text-xs">
                      🤝 You were invited by <span className="mono">{corta(referente!)}</span>. With
                      your first deposit, you both gain odds.
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        className={`btn btn-blanco ${monto === p ? "seleccionado" : ""}`}
                        onClick={() => setMonto(p)}
                      >
                        {p}
                      </button>
                    ))}
                    {miSaldo > 0n && (
                      <button className="btn btn-blanco" onClick={() => setMonto(aTexto(miSaldo, 7))}>
                        all
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      inputMode="decimal"
                      placeholder={`Amount in ${entrada ? entrada.simbolo : pozo.simbolo}`}
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="input-monto flex-1"
                    />
                    {pozo.entradas && (
                      <div className="flex gap-1" role="radiogroup" aria-label="Pay with">
                        {[null, ...pozo.entradas.monedas.map((m) => m.simbolo)].map((m) => (
                          <button
                            key={m ?? pozo.simbolo}
                            role="radio"
                            aria-checked={moneda === m}
                            className={`btn btn-blanco btn-moneda ${moneda === m ? "seleccionado" : ""}`}
                            onClick={() => setMoneda(m)}
                            disabled={accion !== null}
                          >
                            <IconoMoneda simbolo={m ?? pozo.simbolo} alto={16} />
                            {m ?? pozo.simbolo}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {entrada && (
                    <p className="mt-2 text-xs text-tenue">
                      {saldoEntrada && !saldoEntrada.trustline ? (
                        `Your wallet has no ${entrada.simbolo}. Get some in Freighter or Lobstr and come back.`
                      ) : cotizacionVigente ? (
                        <>
                          Your {aTexto(cotizacionVigente.entra)} {entrada.simbolo} are worth{" "}
                          <span className="cifra font-bold text-foreground">
                            ≈ {aTexto(cotizacionVigente.sale, 2)} {pozo.simbolo}
                          </span>{" "}
                          right now on {dondeCambia(cotizacionVigente)}, the best rate at the moment.
                          They are swapped in your wallet and the {pozo.simbolo} goes in: your capital
                          is in dollars from the first second.
                          {saldoEntrada && ` You have ${aTexto(saldoEntrada.saldo)} ${entrada.simbolo}.`}
                        </>
                      ) : cotizando ? (
                        "Getting quotes from Soroswap and the Stellar DEX…"
                      ) : sinCotizacion != null && sinCotizacion === entraOtra ? (
                        "No quote for that amount right now. Try another one."
                      ) : (
                        `Enter an amount in ${entrada.simbolo} and I will tell you how much ${pozo.simbolo} it is today.` +
                        (saldoEntrada ? ` You have ${aTexto(saldoEntrada.saldo)}.` : "")
                      )}
                    </p>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {entrada ? (
                      <Boton
                        onClick={() =>
                          correr("cambiar", async () => {
                            const entra = montoValido();
                            if (entra == null) return;
                            if (!entrada.activo && billetera && entra > billetera.xlm - RESERVA_XLM) {
                              setError(
                                `You have ${aTexto(billetera.xlm)} XLM. Keep at least 1.5 XLM for the Stellar reserve and fees.`,
                              );
                              return;
                            }
                            if (entrada.activo && saldoEntrada && entra > saldoEntrada.saldo) {
                              setError(`You have ${aTexto(saldoEntrada.saldo)} ${entrada.simbolo} in your wallet, no more.`);
                              return;
                            }
                            // Cotización fresca al momento de firmar, no la de la pantalla.
                            const c = await cotizar(pozo, yo, entrada, entra);
                            setCotizacion(c);
                            if (vista.tope > 0n && vista.principal + c.sale > vista.tope) {
                              setError(
                                `The pool is capped at ${aTexto(vista.tope, 0)} ${pozo.simbolo} and already holds ${aTexto(vista.principal, 0)}.`,
                              );
                              return;
                            }
                            const recibido = await cambiar(pozo, yo, c, firmante);
                            setAviso(
                              `✓ You swapped ${aTexto(entra)} ${entrada.simbolo} for ${aTexto(recibido)} ${pozo.simbolo}. Now sign the deposit.`,
                            );
                            let tx: string;
                            try {
                              tx = referenteAplica
                                ? await depositarConReferente(pozo, yo, recibido, referente!, firmante)
                                : await depositar(pozo, yo, recibido, firmante);
                            } catch (e) {
                              // El cambio ya está hecho: que el error no diga que no pasó nada.
                              const m = mensaje(e);
                              setAviso(null);
                              setError({
                                ...m,
                                texto: `The swap went through: you have ${aTexto(recibido)} ${pozo.simbolo} in your wallet. What did not complete is the deposit. ${m.texto} Once that is sorted, pick ${pozo.simbolo} and tap Deposit.`,
                              });
                              return;
                            }
                            setMonto("");
                            setAviso({
                              texto: `✓ You swapped ${aTexto(entra)} ${entrada.simbolo} and deposited ${aTexto(recibido)} ${pozo.simbolo}. You are in the draw.`,
                              tx,
                            });
                            await refrescar(yo);
                          })
                        }
                        cargando={accion === "cambiar"}
                        disabled={
                          accion !== null ||
                          sinTrustline ||
                          !cotizacionVigente ||
                          (saldoEntrada != null && !saldoEntrada.trustline)
                        }
                      >
                        Swap and deposit
                      </Boton>
                    ) : (
                      <Boton
                        onClick={() =>
                          correr("depositar", async () => {
                            const m = montoValido();
                            if (m == null) return;
                            if (vista.tope > 0n && vista.principal + m > vista.tope) {
                              setError(
                                `The pool is capped at ${aTexto(vista.tope, 0)} ${pozo.simbolo} and already holds ${aTexto(vista.principal, 0)}.`,
                              );
                              return;
                            }
                            const tx = referenteAplica
                              ? await depositarConReferente(pozo, yo, m, referente!, firmante)
                              : await depositar(pozo, yo, m, firmante);
                            setMonto("");
                            setAviso({
                              texto: `✓ You deposited ${aTexto(m)} ${pozo.simbolo}. You are in the draw, and your capital comes out whenever you want.`,
                              tx,
                            });
                            await refrescar(yo);
                          })
                        }
                        cargando={accion === "depositar"}
                        disabled={accion !== null || sinTrustline}
                      >
                        Deposit
                      </Boton>
                    )}
                    <Boton
                      variante="peligro"
                      onClick={() =>
                        correr("retirar", async () => {
                          const m = montoValido();
                          if (m == null) return;
                          if (m > miSaldo) {
                            setError(`You have ${aTexto(miSaldo)} ${pozo.simbolo} in the pool, no more.`);
                            return;
                          }
                          const tx = await retirar(pozo, yo, m, firmante);
                          setMonto("");
                          setAviso({ texto: `✓ You withdrew ${aTexto(m)} ${pozo.simbolo}. It is in your wallet.`, tx });
                          await refrescar(yo);
                        })
                      }
                      cargando={accion === "retirar"}
                      disabled={accion !== null || miSaldo === 0n || entrada != null}
                    >
                      Withdraw
                    </Boton>
                  </div>
                  <p className="mt-3 text-xs text-tenue">
                    Withdraw whenever you want, with no penalty, even while a draw is running. Your
                    capital is never at stake.
                    {entrada && ` Withdrawals are always in ${pozo.simbolo}.`}
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm text-tenue">
                    Connect a Stellar wallet to deposit and see your odds.
                  </p>
                  <Boton onClick={conectarWallet} cargando={accion === "conectar"}>
                    Connect wallet
                  </Boton>
                </>
              )}
            </Panel>

            {yo && <Referidos yo={yo} cuenta={cuenta} ruta={pozo.ruta} simbolo={pozo.simbolo} />}
            <Blend tasa={tasa} simbolo={pozo.simbolo} />
            <ComoFunciona />
          </div>
        </div>
      )}
    </Marco>
  );
}

/** Milisegundos desde epoch, refrescados varias veces por segundo. Para lo que se ve crecer. */
function useAhoraMs(cadaMs: number): number {
  const [ms, setMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setMs(Date.now()), cadaMs);
    return () => clearInterval(t);
  }, [cadaMs]);
  return ms;
}

const SEGUNDOS_ANIO = 365.25 * 86400;

/**
 * El premio como se ve crecer: lo que dijo el contrato al leerlo, más lo que
 * el capital genera desde entonces a la tasa de Blend. Es una estimación
 * entre lecturas (cada 20 s se vuelve a leer y se corrige); el contrato es
 * la verdad. Congelado si el sorteo está pendiente: ese premio ya no cambia.
 */
function premioEnVivo(vista: Vista, tasa: TasaBlend | null, leidoEn: number, ahoraMs: number): bigint {
  if (vista.sorteoPendiente || !tasa || vista.principal <= 0n || leidoEn <= 0) return vista.premio;
  const segundos = Math.max(0, (ahoraMs - leidoEn) / 1000);
  const crecio = Number(vista.principal) * tasa.apy * (segundos / SEGUNDOS_ANIO);
  return vista.premio + BigInt(Math.floor(crecio));
}

function Premio({
  vista,
  ahora,
  revela,
  simbolo,
  tasa,
  leidoEn,
}: {
  vista: Vista;
  ahora: number;
  revela: number | null;
  simbolo: string;
  tasa: TasaBlend | null;
  leidoEn: number;
}) {
  const faltan = Number(vista.cierraAt) - ahora;
  const ahoraMs = useAhoraMs(200);
  const premio = premioEnVivo(vista, tasa, leidoEn, ahoraMs);
  const enVivo = !vista.sorteoPendiente && tasa != null && vista.principal > 0n;

  let etiqueta: string;
  let reloj: string;
  let nota: string;
  let pill: { texto: string; tono: "neutro" | "ok" | "alerta" };

  if (vista.sorteoPendiente) {
    const quedan = revela == null ? null : revela - ahora;
    etiqueta = "Winner revealed in";
    reloj = quedan == null ? "…" : quedan > 0 ? duracion(quedan) : "moments";
    nota =
      quedan != null && quedan <= 0
        ? "The result is already decided; we are bringing it onto the network."
        : `Nobody can change the result anymore. Round ${vista.ronda} has already started: what comes in now plays the next one.`;
    pill = { texto: "🎲 Draw in progress", tono: "ok" };
  } else if (faltan <= 0) {
    etiqueta = "Closing the round";
    reloj = "…";
    nota = "In seconds the prize is frozen and the winner is picked.";
    pill = { texto: "⏳ Closing", tono: "alerta" };
  } else {
    etiqueta = "Draw in";
    reloj = duracion(faltan);
    nota = enVivo
      ? "The prize grows second by second with Blend's interest. When the clock hits zero, it is frozen and one saver takes it."
      : "When it hits zero, the yield is frozen and one saver takes it.";
    pill = { texto: `Round ${vista.ronda} in progress`, tono: "neutro" };
  }

  return (
    <Panel titulo={<>🏆 {vista.sorteoPendiente ? "This round's prize" : "Prize at stake"}</>}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="premio-grande cifra">{aTexto(premio, enVivo ? 7 : 2)}</span>
        <span className="text-sm font-bold text-tenue">{simbolo}</span>
        {enVivo && (
          <span className="en-vivo" title="Grows with Blend's interest, second by second">
            <span className="en-vivo-punto" /> live
          </span>
        )}
      </div>
      <div className="mb-3 mt-2">
        <Etiqueta tono={pill.tono}>{pill.texto}</Etiqueta>
      </div>
      <div className="countdown-wrap">
        <div className="countdown-label">{etiqueta}</div>
        <div className="countdown-timer">{reloj}</div>
      </div>
      <p className="mt-3 text-xs text-tenue">{nota}</p>
      <p className="mt-2 text-sm text-tenue">
        This is the yield the whole pool earned on{" "}
        <span className="font-bold text-foreground">Blend</span>, not the capital. One saver takes
        it; everyone else keeps exactly what they put in.
        {vista.premio === 0n && vista.principal > 0n && " It just started: it grows by the hour."}
      </p>
    </Panel>
  );
}

/**
 * El APY que se muestra: el que Blend paga ahora por el token, leído del
 * pool. Si no se pudo leer, el que midió el pozo con su propio rendimiento.
 */
function apyMostrado(vista: Vista, tasa: TasaBlend | null): string | null {
  if (tasa) return porcentaje(tasa.apy);
  return apyTexto(vista.apyBps);
}

function Cifras({ vista, tasa, simbolo }: { vista: Vista; tasa: TasaBlend | null; simbolo: string }) {
  const apy = apyMostrado(vista, tasa);
  return (
    <Panel titulo="📊 The pool">
      <div className="grid grid-cols-3 gap-2">
        <div className="stat">
          <div className="stat-label">🦊 Savers</div>
          <div className="stat-value cifra">{vista.participantes}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Deposited</div>
          <div className="stat-value verde cifra">
            {aTexto(vista.principal, 0)} <span className="stat-unit">{simbolo}</span>
          </div>
          {vista.tope > 0n && (
            <span className="stat-secondary">cap {aTexto(vista.tope, 0)} {simbolo}</span>
          )}
        </div>
        <div className="stat">
          <div className="stat-label">APY on Blend</div>
          <div className="stat-value verde cifra">
            {apy ?? "—"}
            {apy && <span className="pulso ml-1 inline-block align-middle" />}
          </div>
          {apy && tasa && (
            <span className="stat-secondary">
              pool {(tasa.utilizacion * 100).toFixed(0)} % utilised
            </span>
          )}
          {!apy && <span className="stat-secondary">reading the pool…</span>}
        </div>
      </div>
    </Panel>
  );
}

function Racha({
  cuenta,
  miSaldo,
  marcoHoy,
  rachaViva,
  cargando,
  deshabilitado,
  onMarcar,
}: {
  cuenta: Cuenta | null;
  miSaldo: bigint;
  marcoHoy: boolean;
  rachaViva: number;
  cargando: boolean;
  deshabilitado: boolean;
  onMarcar: () => void;
}) {
  const dias = Array.from({ length: RACHA_MAX }, (_, i) => i + 1);
  const siguiente = Math.min(rachaViva + 1, RACHA_MAX);
  return (
    <Panel titulo="🔥 Your streak">
      <div className="mb-3 flex items-center justify-between gap-2">
        {dias.map((d) => {
          const hecho = d <= rachaViva;
          const actual = !marcoHoy && d === siguiente && miSaldo > 0n;
          return (
            <div
              key={d}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                hecho
                  ? "bg-[#fff3e0] text-naranja ring-2 ring-[rgba(253,132,14,0.3)]"
                  : actual
                    ? "bg-white text-naranja ring-2 ring-naranja"
                    : "bg-[#f0f0f0] text-[#a0a0a0]"
              } ${d === RACHA_MAX && hecho ? "bg-gradient-to-br from-[#ffd580] to-[#e06800] text-white" : ""}`}
            >
              {d}
            </div>
          );
        })}
      </div>
      <button
        className="btn btn-naranja"
        onClick={onMarcar}
        disabled={deshabilitado || marcoHoy || miSaldo === 0n}
      >
        {cargando
          ? "…"
          : marcoHoy
            ? "✓ Marked for today"
            : miSaldo === 0n
              ? "Deposit to start your streak"
              : rachaViva === 0
                ? "🔥 I saved today"
                : `🔥 I saved today · day ${siguiente}`}
      </button>
      <p className="mt-3 text-xs text-tenue">
        Once a day. Every day in a row adds more odds to the round; seven days in a row{" "}
        <span className="font-bold text-foreground">double</span> them. Skipping a day goes back
        to day 1.
        {cuenta && cuenta.racha > 0 && rachaViva === 0 && " Your previous streak broke."}
      </p>
    </Panel>
  );
}

function Referidos({
  yo,
  cuenta,
  ruta,
  simbolo,
}: {
  yo: string;
  /** `null` hasta el primer depósito: el contrato todavía no conoce esta wallet. */
  cuenta: Cuenta | null;
  ruta: string;
  simbolo: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const link =
    typeof window === "undefined" ? "" : `${window.location.origin}${ruta}?ref=${yo}`;
  return (
    <Panel titulo="🤝 Invite friends">
      <p className="text-sm text-tenue">
        Every friend who joins through your link adds{" "}
        <span className="font-bold text-foreground">10 % of their capital</span> to your odds,
        for as long as they are in. Up to half of your own capital.
      </p>
      {!cuenta && (
        <p className="aviso mt-3 text-xs">
          Your link starts counting with your first deposit: the pool has to know your wallet
          before it can record you as a referrer. Copy it anyway and share it.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <input readOnly value={link} className="input-monto flex-1 !text-left !text-xs !font-semibold !text-tenue" />
        <button
          className="btn btn-naranja !w-auto"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            } catch {}
          }}
        >
          {copiado ? "✓" : "Copy"}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="stat">
          <div className="stat-label">Referrals</div>
          <div className="stat-value cifra">{cuenta?.referidos ?? 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">They add</div>
          <div className="stat-value naranja cifra">
            {aTexto(cuenta?.bonoRef ?? 0n, 0)} <span className="stat-unit">{simbolo} of weight</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Blend({ tasa, simbolo }: { tasa: TasaBlend | null; simbolo: string }) {
  const apy = tasa ? porcentaje(tasa.apy) : null;
  return (
    <Panel titulo="🌊 Where the prize comes from">
      <div className="aviso aviso-verde flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold">Blend, Stellar&apos;s lending market</div>
          <div className="text-xs text-tenue">
            The pool&apos;s {simbolo} is lent out there. The interest borrowers pay is the prize.
          </div>
        </div>
        <div className="cifra shrink-0 text-lg font-extrabold text-verde">{apy ?? "—"}</div>
      </div>
      <ul className="mt-3 space-y-1 text-xs text-tenue">
        <li>
          <span className="font-bold text-foreground">No collateral, no debt.</span> The position
          cannot be liquidated.
        </li>
        <li>
          <span className="font-bold text-foreground">The capital is never touched.</span> Only the
          interest earned goes into the draw.
        </li>
        <li>
          <span className="font-bold text-foreground">No intermediaries.</span> The contract
          deposits into and withdraws from Blend on its own.
        </li>
      </ul>
      <Link href="/docs#blend" className="mt-3 inline-block text-xs font-bold text-naranja underline underline-offset-4">
        How it connects to Blend →
      </Link>
    </Panel>
  );
}

function Ganadores({ lista, red, simbolo }: { lista: Ganador[] | null; red: string; simbolo: string }) {
  return (
    <Panel titulo="🎉 Latest winners">
      {lista == null && <p className="text-xs text-tenue">Looking for draws…</p>}
      {lista && lista.length === 0 && (
        <p className="py-3 text-center text-sm text-tenue">No draws in this pool yet.</p>
      )}
      {lista && lista.length > 0 && (
        <div className="flex flex-col gap-2">
          {lista.map((g) => (
            <a
              key={g.tx}
              href={explorer(red, "tx", g.tx)}
              target="_blank"
              rel="noopener"
              className="fila"
              title="View the draw transaction"
            >
              <span className="text-tenue">
                <span className="font-bold text-foreground">Round {g.ronda}</span>
                <span className="mono ml-2">{corta(g.ganador)}</span>
              </span>
              <span className="cifra font-extrabold text-naranja">+{aTexto(g.premio, 4)} {simbolo}</span>
            </a>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-tenue">Every draw is a public transaction. Tap one to see it.</p>
    </Panel>
  );
}

function ComoFunciona() {
  return (
    <Panel titulo="💡 How it works">
      <ol className="space-y-2 text-sm text-tenue">
        <li>
          <span className="font-bold text-foreground">You deposit.</span> Your money earns yield
          on Blend together with everyone else&apos;s.
        </li>
        <li>
          <span className="font-bold text-foreground">Every week the yield is drawn.</span> One
          saver takes all of it. Nobody else loses anything: their capital is still there.
        </li>
        <li>
          <span className="font-bold text-foreground">You gain odds</span> with more money, more
          time, the daily streak and your referrals.
        </li>
        <li>
          <span className="font-bold text-foreground">The randomness comes from outside.</span>{" "}
          drand, a public beacon run by ~20 organisations, decides, and the contract verifies the
          signature. Neither we nor the network can pick the winner.
        </li>
      </ol>
      <Link href="/docs" className="mt-3 inline-block text-xs font-bold text-naranja underline underline-offset-4">
        Read how it is built →
      </Link>
    </Panel>
  );
}

function SinDeploy() {
  return (
    <Panel titulo="Contract missing">
      <p className="text-sm text-tenue">No pool is configured. Deploy one and point the app at it:</p>
      <pre className="code-box mt-3">{`scripts/enchufar-blend-testnet.sh      # testnet
scripts/desplegar-mainnet.sh           # mainnet

# then, the addresses go in web/src/lib/config.ts`}</pre>
    </Panel>
  );
}

/** "6d 23:59:58", "23:59:58" o "09:58": siempre con los segundos corriendo. */
function duracion(segundos: number): string {
  const d = Math.floor(segundos / 86400);
  const h = Math.floor((segundos % 86400) / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const dos = (n: number) => n.toString().padStart(2, "0");
  const hms = `${dos(h)}:${dos(m)}:${dos(s)}`;
  if (d > 0) return `${d}d ${hms}`;
  if (h > 0) return hms;
  return `${dos(m)}:${dos(s)}`;
}

/**
 * Los errores del host son para quien programa. Los que un usuario puede
 * provocar se traducen; el resto se muestra tal cual, que es lo que sirve
 * para reportarlo.
 */
function Cartel({ m, tono, red }: { m: Mensaje; tono: "verde" | "rojo"; red?: string }) {
  return (
    <div className={`aviso aviso-${tono}`} role={tono === "rojo" ? "alert" : "status"}>
      {m.texto}
      {m.tx && red && (
        <>
          {" "}
          <a href={explorer(red, "tx", m.tx)} target="_blank" rel="noreferrer">
            View transaction
          </a>
        </>
      )}
      {m.detalle && (
        <details>
          <summary>Technical details</summary>
          <p>{m.detalle}</p>
        </details>
      )}
    </div>
  );
}

function mensaje(e: unknown): Mensaje {
  const crudo = e instanceof Error ? e.message : String(e);
  const con = (texto: string): Mensaje => ({ texto, detalle: crudo });

  // Wallet
  if (crudo.includes("User declined") || crudo.includes("rejected")) {
    return { texto: "You cancelled the signature in the wallet. Nothing happened." };
  }
  if (crudo.includes("did not respond")) {
    return con("The wallet did not respond. Check that it is open and on the right network, and try again.");
  }

  // Saldo y fees
  if (crudo.includes("balance is not within the allowed range")) {
    return con("Your wallet balance is not enough for that amount. Stellar also reserves 1 XLM that cannot be spent.");
  }
  if (crudo.includes("tx_insufficient_balance")) {
    // La red cobra el storage que crea la transacción. El primer depósito
    // del pozo arma el árbol del sorteo y paga su renta; los siguientes, no.
    const fee = /"fee_charged":"(\d+)"/.exec(crudo)?.[1];
    const cuanto = fee ? `${aTexto(BigInt(fee), 2)} XLM` : "more XLM than you have free";
    return con(
      `The network asks ${cuanto} in fees for this transaction and your wallet does not have that much free XLM (Stellar reserves 1.5 XLM). Send it some XLM and try again. If you came from a swap, the USDC is already in your wallet: pick USDC and tap Deposit.`,
    );
  }
  if (crudo.includes("tx_insufficient_fee")) {
    return con("The network is busy and the fee was not enough. Wait a few seconds and try again.");
  }

  // Errores del pozo, por código
  const pozo: Record<string, string> = {
    "#2": "The amount has to be greater than zero.",
    "#3": "You are trying to withdraw more than you have in the pool.",
    "#4": "The pool is full.",
    "#5": "That wallet has no capital in the pool.",
    "#13": "The pool reached its capital cap. Try a smaller amount.",
    "#14": "You already marked your streak today. Tomorrow counts for more.",
    "#15": "You need capital in the pool to mark your streak.",
    "#16": "That invite link is not valid: the referrer has to be in the pool.",
    "#17": "The invite link only counts on your first deposit.",
  };
  const codigo = /Error\(Contract, (#\d+)\)/.exec(crudo)?.[1];
  if (codigo && pozo[codigo]) return con(pozo[codigo]);

  // Cambio
  if (crudo.includes("no venue quotes")) {
    return con("No quote for that amount right now, on Soroswap or on the DEX. Try another amount or come back in a while.");
  }
  if (crudo.includes("op_under_dest_min") || crudo.includes("op_too_few_offers")) {
    return con("The price moved more than allowed between the quote and the signature. Nothing was swapped: try again.");
  }
  if (crudo.includes("deadline") || crudo.includes("Deadline")) {
    return con("You took more than ten minutes to sign and the quote expired. Try again.");
  }

  // Red
  if (crudo.includes("did not make it") || crudo.includes("TRY_AGAIN_LATER")) {
    return con("The transaction did not make it into the network. Nothing moved: try again.");
  }
  if (crudo.includes("fetch") || crudo.includes("Failed to fetch") || crudo.includes("NetworkError")) {
    return con("Could not reach the Stellar network. Check your connection and try again.");
  }

  return con("Something went wrong and it did not complete. Nothing moved from your wallet. Try again; if it keeps failing, the technical details help explain what happened.");
}
