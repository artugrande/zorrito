/**
 * La actividad real del pozo, leída de sus eventos: depósitos, retiros,
 * rachas, referidos, cierres y sorteos, con la wallet, el monto y la
 * transacción de cada uno. Para mostrar en el README que el pozo lo usa gente
 * de verdad.
 *
 *   npx tsx scripts/actividad.ts             # mainnet
 *   npx tsx scripts/actividad.ts testnet
 *   npx tsx scripts/actividad.ts mainnet md  # además, la tabla en Markdown
 *
 * Los eventos vienen de la API de stellar.expert, que guarda la historia
 * entera (el RPC público retiene ~7 días). stellar.expert no da el hash de la
 * transacción, solo su posición en el ledger; el hash se busca en Horizon.
 */

import { scValToNative, xdr } from "@stellar/stellar-sdk";
import { HORIZON, PRINCIPAL, TEST, type Red } from "../src/lib/config";
import { aTexto } from "../src/lib/montos";

type Evento = {
  tipo: string;
  cuenta: string | null;
  monto: bigint | null;
  ledger: number;
  cuando: string;
  tx: string;
};

type RegistroExpert = {
  id: string;
  ts: number;
  initiator?: string;
  topics: string[];
  bodyXdr: string;
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

  const expert = `https://api.stellar.expert/explorer/${red === "mainnet" ? "public" : "testnet"}`;
  const explorer = `https://stellar.expert/explorer/${red === "mainnet" ? "public" : "testnet"}`;

  // Todas las páginas de eventos del contrato, de la más vieja a la más nueva.
  const registros: RegistroExpert[] = [];
  let url: string | null = `${expert}/contract/${pozo.id}/events?order=asc&limit=200`;
  while (url) {
    console.error(`fetching ${url}`);
    const r = await traer(url);
    if (!r.ok) throw new Error(`stellar.expert: HTTP ${r.status} for ${url}`);
    const j = (await r.json()) as {
      _embedded: { records: RegistroExpert[] };
      _links: { next?: { href: string } };
    };
    const lote = j._embedded.records;
    registros.push(...lote);
    url = lote.length === 200 && j._links.next ? `https://api.stellar.expert${j._links.next.href}` : null;
  }

  const hashes = new Map<string, string>();
  const eventos: Evento[] = [];
  for (const r of registros) {
    const tipo = r.topics[0];
    if (!(tipo in TIPOS)) continue;
    // Depósitos, retiros, rachas y referidos llevan la wallet en el tópico 1;
    // el sorteo, la ronda en el 1 y el ganador en el 2; el cierre, solo la ronda.
    const cuenta =
      tipo === "ronda_cerrada" ? null : tipo === "sorteo_ejecutado" ? (r.topics[2] ?? null) : (r.topics[1] ?? null);
    const datos = scValToNative(xdr.ScVal.fromXDR(r.bodyXdr, "base64")) as Record<string, unknown>;
    const crudo = datos?.monto ?? datos?.premio;
    const monto = typeof crudo === "bigint" ? crudo : typeof crudo === "number" ? BigInt(crudo) : null;
    const toid = BigInt(r.id.split("-")[0]);
    const ledger = Number(toid >> 32n);
    const txToid = (toid & ~0xfffn).toString();
    if (!hashes.has(txToid)) {
      console.error(`ledger ${ledger}: looking up the transaction hash on Horizon`);
      hashes.set(txToid, await hashDeToid(HORIZON[red], txToid));
    }
    eventos.push({
      tipo,
      cuenta,
      monto,
      ledger,
      cuando: new Date(r.ts * 1000).toISOString(),
      // Sin hash, stellar.expert igual resuelve la transacción por su toid.
      tx: hashes.get(txToid) || txToid,
    });
  }

  const wallets = new Set(eventos.filter((e) => e.cuenta).map((e) => e.cuenta as string));
  const cuenta = (tipo: string) => eventos.filter((e) => e.tipo === tipo).length;
  const suma = (tipo: string) =>
    eventos.filter((e) => e.tipo === tipo).reduce((s, e) => s + (e.monto ?? 0n), 0n);

  console.log(`Zorrito · ${red} · pool ${pozo.id}`);
  console.log(`${registros.length} events on stellar.expert, full history\n`);
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
      const t = e.tx ? `[${e.tx.length === 64 ? e.tx.slice(0, 8) + "…" : "tx"}](${explorer}/tx/${e.tx})` : "";
      console.log(`| ${e.cuando.slice(0, 16).replace("T", " ")} | ${TIPOS[e.tipo]} | ${w} | ${m} | ${t} |`);
    }
  }
}

/**
 * El hash de la transacción con ese toid (paging token de Horizon). El cursor
 * es exclusivo: el primer registro después de `toid - 1` es el toid exacto,
 * si existe.
 */
async function hashDeToid(horizon: string, txToid: string): Promise<string> {
  const cursor = (BigInt(txToid) - 1n).toString();
  const r = await traer(`${horizon}/transactions?cursor=${cursor}&order=asc&limit=1&include_failed=true`);
  if (!r.ok) {
    console.error(`horizon: HTTP ${r.status} for toid ${txToid}`);
    return "";
  }
  const j = (await r.json()) as { _embedded: { records: { hash: string; paging_token: string }[] } };
  const t = j._embedded.records[0];
  return t && t.paging_token === txToid ? t.hash : "";
}

/** `fetch` con límite de tiempo, para que un pedido colgado no deje el script mudo. */
function traer(url: string): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(20_000), headers: { accept: "application/json" } });
}

function corta(dir: string): string {
  return `${dir.slice(0, 4)}…${dir.slice(-4)}`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
