/**
 * La actividad real del pozo de mainnet, leída de los eventos del contrato:
 * depósitos, retiros, rachas, referidos, cierres y sorteos, con la wallet, el
 * monto y la transacción de cada uno. Para mostrar en el README que el pozo
 * lo usa gente de verdad.
 *
 *   npx tsx scripts/actividad.ts             # mainnet
 *   npx tsx scripts/actividad.ts testnet
 *   npx tsx scripts/actividad.ts mainnet md  # además, la tabla en Markdown
 *
 * El RPC público retiene ~7 días de eventos; lo anterior no aparece. Para
 * la historia completa está stellar.expert, con el contrato del pozo.
 */

import { Address, rpc, scValToNative } from "@stellar/stellar-sdk";
import { PRINCIPAL, TEST, type Red } from "../src/lib/config";
import { servidorDe } from "../src/lib/contrato";
import { aTexto } from "../src/lib/montos";

type Evento = {
  tipo: string;
  cuenta: string | null;
  monto: bigint | null;
  ledger: number;
  cuando: string;
  tx: string;
};

const TIPOS: Record<string, string> = {
  deposito: "deposit",
  retiro: "withdrawal",
  racha: "streak",
  referido: "referral",
  ronda_cerrada: "round closed",
  sorteo_ejecutado: "draw",
};

async function main() {
  const red: Red = process.argv[2] === "testnet" ? "testnet" : "mainnet";
  const markdown = process.argv[3] === "md";
  const pozo = red === "testnet" ? TEST : PRINCIPAL;
  if (!pozo || pozo.red !== red) throw new Error(`there is no ${red} pool in config.ts`);

  const servidor = servidorDe(pozo.rpcUrl);
  // Desde el ledger más viejo que el RPC todavía tiene, para no pedir de más.
  const salud = await servidor.getHealth();
  const desde = Math.max(1, salud.oldestLedger + 1);
  console.error(
    `rpc ${pozo.rpcUrl}: ledgers ${salud.oldestLedger}..${salud.latestLedger} (retention ${salud.ledgerRetentionWindow})`,
  );

  const eventos: Evento[] = [];
  let crudos = 0;
  const desconocidos = new Set<string>();
  let cursor: string | null = null;
  for (let pagina = 0; pagina < 50; pagina++) {
    const filtros: rpc.Api.EventFilter[] = [{ type: "contract", contractIds: [pozo.id] }];
    const r: rpc.Api.GetEventsResponse = await servidor.getEvents(
      cursor === null
        ? { startLedger: desde, filters: filtros, limit: 200 }
        : { cursor, filters: filtros, limit: 200 },
    );
    crudos += r.events.length;
    for (const e of r.events) {
      const ev = leer(e);
      if (ev) eventos.push(ev);
      else desconocidos.add(describir(e));
    }
    if (r.events.length < 200) break;
    cursor = r.cursor;
  }
  console.error(`raw events: ${crudos}${desconocidos.size ? `; unrecognised: ${[...desconocidos].join(" | ")}` : ""}`);

  const explorer =
    red === "mainnet" ? "https://stellar.expert/explorer/public" : "https://stellar.expert/explorer/testnet";
  const wallets = new Set(eventos.filter((e) => e.cuenta).map((e) => e.cuenta as string));
  const cuenta = (tipo: string) => eventos.filter((e) => e.tipo === tipo).length;
  const suma = (tipo: string) =>
    eventos.filter((e) => e.tipo === tipo).reduce((s, e) => s + (e.monto ?? 0n), 0n);

  console.log(`Zorrito · ${red} · pool ${pozo.id}`);
  console.log(`Events since ledger ${desde} (about the last 7 days; the RPC keeps no more)\n`);
  console.log(`wallets: ${wallets.size}   deposits: ${cuenta("deposito")} (${aTexto(suma("deposito"), 2)} ${pozo.simbolo})   withdrawals: ${cuenta("retiro")} (${aTexto(suma("retiro"), 2)} ${pozo.simbolo})   streaks: ${cuenta("racha")}   referrals: ${cuenta("referido")}   rounds closed: ${cuenta("ronda_cerrada")}   draws: ${cuenta("sorteo_ejecutado")}\n`);

  console.log("when (UTC)           event         wallet                                                     amount        tx");
  for (const e of eventos) {
    console.log(
      `${e.cuando.slice(0, 19).replace("T", " ")}  ${TIPOS[e.tipo].padEnd(12)}  ${(e.cuenta ?? "").padEnd(56)}  ${
        e.monto == null ? "".padStart(12) : (aTexto(e.monto, 2) + " " + pozo.simbolo).padStart(12)
      }  ${e.tx}`,
    );
  }

  if (markdown) {
    console.log("\n\n<!-- README -->\n");
    console.log("| When (UTC) | Event | Wallet | Amount | Transaction |");
    console.log("|---|---|---|---|---|");
    for (const e of eventos) {
      const w = e.cuenta ? `[${corta(e.cuenta)}](${explorer}/account/${e.cuenta})` : "";
      const m = e.monto == null ? "" : `${aTexto(e.monto, 2)} ${pozo.simbolo}`;
      console.log(
        `| ${e.cuando.slice(0, 16).replace("T", " ")} | ${TIPOS[e.tipo]} | ${w} | ${m} | [${e.tx.slice(0, 8)}…](${explorer}/tx/${e.tx}) |`,
      );
    }
  }
}

function leer(e: rpc.Api.EventResponse): Evento | null {
  const tipo = scValToNative(e.topic[0]) as string;
  if (!(tipo in TIPOS)) return null;
  let cuenta: string | null = null;
  // Depósitos, retiros, rachas y referidos llevan la wallet en el topic 1;
  // el sorteo lleva la ronda en el 1 y el ganador en el 2.
  const t = tipo === "sorteo_ejecutado" ? e.topic[2] : e.topic[1];
  try {
    cuenta = t ? Address.fromScVal(t).toString() : null;
  } catch {
    cuenta = null;
  }
  const datos = scValToNative(e.value) as Record<string, unknown>;
  const crudo = datos?.monto ?? datos?.premio;
  const monto = typeof crudo === "bigint" ? crudo : typeof crudo === "number" ? BigInt(crudo) : null;
  return { tipo, cuenta, monto, ledger: e.ledger, cuando: e.ledgerClosedAt, tx: e.txHash };
}

/** Para diagnosticar un evento que no se reconoce: sus tópicos, como texto. */
function describir(e: rpc.Api.EventResponse): string {
  return e.topic
    .map((t) => {
      try {
        const v = scValToNative(t);
        return typeof v === "string" ? v : JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x));
      } catch {
        return t.switch().name;
      }
    })
    .join(",");
}

function corta(dir: string): string {
  return `${dir.slice(0, 4)}…${dir.slice(-4)}`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
