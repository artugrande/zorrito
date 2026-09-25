import type { Metadata } from "next";
import Link from "next/link";
import { Marco } from "@/components/Marco";
import { PRINCIPAL, SOROSWAP_ROUTER, TEST, USDT0_MAINNET } from "@/lib/config";
import { explorer } from "@/components/ui";

export const metadata: Metadata = {
  title: "How it works — Zorrito",
  description:
    "How Zorrito is built: the pool, the weighted draw, drand randomness verified on-chain, Blend as the source of yield, and the stack on Stellar.",
};

const BLEND_TESTNET = "CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF";
const BLEND_MAINNET = "CAJJZSGMMM3PD7N33TAPHGBUGTB43OC73HVIK2L2G6BNGGGYOSSYBXBD";
const ADAPTER_MAINNET = "CD5XQWHFSW427KOQAMAXBMMM6X4BIH6AXZUP76PBB6SWYSSAA4D53MKC";
const ADAPTER_TESTNET = "CCHLQA7SGZAEVGLAFUL4Y6DMBG7ZUZYSZZ7AGN44GNNJCCJ6VECV7ISA";
const DRAND_PK =
  "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a";

export default function Docs() {
  const principal = PRINCIPAL;
  const test = TEST;

  return (
    <Marco activo="docs" docs ancho="max-w-2xl">
      <article className="docs w-full">
        <h1>
          How it works
          <br />
          <span>Zorrito</span>
        </h1>
        <p className="tagline">The no-loss lottery on Stellar.</p>

        <div className="aviso">
          💡 <strong>The idea is simple:</strong> you put money into a pool, the pool lends it on
          Blend and earns interest, and every round that interest is drawn among the savers who
          are in. One saver wins everyone&apos;s yield. Nobody else loses anything: their capital is
          still there and they withdraw it whenever they want.
        </div>

        <h2 id="como-funciona">How it works</h2>
        <div className="flex flex-col gap-3">
          <Paso n={1} titulo="You deposit USDC">
            Your deposit goes straight into Blend and starts earning at once. There is no minimum.
            Every dollar, and every second it stays in, adds odds. If you hold XLM or USDT0, the
            app swaps them for USDC at the door. (The testnet pool uses XLM.)
          </Paso>
          <Paso n={2} titulo="The pool earns">
            Everyone&apos;s capital is lent on Blend, Stellar&apos;s lending market. The interest
            borrowers pay accumulates as the prize.
          </Paso>
          <Paso n={3} titulo="The timer runs out">
            When the week is up (10 minutes in the test pool), the round closes and the draw fires
            automatically. The prize and everyone&apos;s odds are frozen at that instant.
          </Paso>
          <Paso n={4} titulo="drand decides">
            The contract fixes in advance which drand random number will decide: one that does
            not exist yet. When drand publishes it, the contract verifies the signature before
            picking.
          </Paso>
          <Paso n={5} titulo="One wins, nobody loses">
            The whole prize goes to the winner&apos;s wallet in the same transaction. Everyone else
            keeps exactly what they put in, and a new round is already running.
          </Paso>
        </div>

        <hr />

        <h2 id="chances">🎯 How odds are calculated</h2>
        <p>
          Your weight in the draw is <strong>how much you put in, for how long</strong> it stayed
          in during the round. It is the same proportion in which your money earned the prize:
          whoever contributed more to the yield has more chances to take it.
        </p>
        <div className="formula">weight = Σ (deposit × seconds it was in the round)</div>
        <div className="formula">P(win) = your weight ÷ the pool&apos;s total weight</div>
        <p>
          Example: two people with 100 USDC. One joins on Monday, the other on Saturday. The first
          has 6 times the odds, because her money earned 6 times more. Jumping in at the last
          minute with a lot of money barely counts, and that is on purpose: there is no way to
          &quot;buy&quot; the draw at the last moment.
        </p>
        <p>
          Withdrawing does not erase what you already accrued. If you had money in for three days
          and take it out, those three days still count for that round&apos;s draw.
        </p>

        <h3 id="racha">🔥 The daily streak</h3>
        <p>
          Once a day (UTC) you can mark <strong>&quot;I saved today&quot;</strong>. Every day in a
          row adds weight to the current round, and each day adds more than the last:
        </p>
        <div className="formula">bonus on day k = deposit × (round length) × k / 28</div>
        <p>
          Since 1+2+…+7 = 28, seven days in a row add exactly one full round of weight: whoever
          marks every day <strong>doubles</strong> their odds compared to someone with the same
          money who marks none. Skipping a day goes back to day 1. The bonus belongs to the round
          in which it is marked; the next round starts from zero, like everything else.
        </p>
        <table className="tabla">
          <thead>
            <tr>
              <th>Days in a row</th>
              <th>Extra weight accumulated</th>
              <th>Odds vs. not marking</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>3.6 % of a round</td><td>×1.04</td></tr>
            <tr><td>3</td><td>21 %</td><td>×1.21</td></tr>
            <tr><td>5</td><td>54 %</td><td>×1.54</td></tr>
            <tr><td>7 🏆</td><td>100 %</td><td className="bien">×2</td></tr>
          </tbody>
        </table>

        <h3 id="referidos">🤝 Referrals</h3>
        <p>
          Your invite link is your address. Whoever joins through it, on their{" "}
          <strong>first deposit</strong>, declares you as their referrer, and from then on you
          weigh as if you held <strong>10 % of their capital</strong>, for as long as they are in.
          If they withdraw, the bonus goes down with them.
        </p>
        <div className="formula">base weight = your capital + min(10 % of your referrals&apos; capital, 50 % of your capital)</div>
        <p>
          The cap at half of your own capital is what makes inventing referrals pointless: with no
          money of your own in, there is no bonus, and with money in, the bonus is never worth more
          than half of it. Bringing friends adds up; bringing empty accounts does not.
        </p>

        <hr />

        <h2 id="azar">🎲 How the randomness works</h2>
        <p>
          Picking a winner on-chain is hard: the chain is deterministic and public, so any value
          known at draw time can be influenced by whoever builds the block. Zorrito uses nothing
          from the chain as a source of randomness. It uses{" "}
          <a href="https://drand.love" target="_blank" rel="noopener">
            drand
          </a>
          , a public randomness beacon run by about 20 organisations (Cloudflare, Protocol Labs,
          EPFL, Kudelski, among others) that publishes a signed number every 3 seconds.
        </p>

        <div className="flex flex-col gap-3">
          <div className="paso-item flex-col">
            <strong className="text-verde">🔒 Phase 1 — Close: a number that does not exist yet is fixed</strong>
            <p>
              When the round closes, the contract computes which drand round corresponds to{" "}
              <strong>10 minutes in the future</strong> and stores it. At that moment nobody, not
              even drand, knows what value it will have. It also freezes the prize, the total
              weight and an accumulated entropy from all the round&apos;s deposits.
            </p>
          </div>
          <div className="paso-item flex-col">
            <strong className="text-naranja">✍️ Phase 2 — Draw: the signature is verified on-chain</strong>
            <p>
              When drand publishes that round, the signature is brought to the contract. The
              contract verifies with BLS12-381, inside Soroban itself, that the signature is valid
              for that exact round and for the drand public key it has stored. If it does not
              verify, there is no draw. If it does, the seed is:
            </p>
            <div className="formula mt-2">
              seed = sha256(entropy ‖ signature ‖ drand_round)
              <br />
              winner = whoever lands on seed mod total_weight
            </div>
          </div>
        </div>

        <div className="aviso aviso-verde mt-3">
          🛡️ <strong>Why nobody can bias it.</strong> To pick the winner you would have to know the
          drand signature before it exists, and that requires corrupting a majority of the
          organisations that run the network. A Stellar validator cannot: the contract uses no
          ledger data as randomness. Neither can we: none of our keys is involved in the draw. And
          anyone can recompute it from what stays on-chain.
        </div>

        <h3>Approaches compared</h3>
        <table className="tabla">
          <thead>
            <tr>
              <th>Approach</th>
              <th>Who can influence it</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ledger timestamp or hash</td>
              <td className="mal">The validator building the block</td>
              <td className="mal">Rejected</td>
            </tr>
            <tr>
              <td>Commit-reveal with a keeper</td>
              <td className="medio">The keeper, by withholding the reveal</td>
              <td className="medio">Rejected: liveness</td>
            </tr>
            <tr>
              <td>VRF oracle</td>
              <td className="medio">The oracle operator</td>
              <td className="medio">None on Stellar</td>
            </tr>
            <tr>
              <td className="bien">drand + BLS verification on-chain ✓</td>
              <td className="bien">Nobody short of a drand majority</td>
              <td className="bien">What runs today</td>
            </tr>
          </tbody>
        </table>
        <p>
          BLS12-381 verification inside the contract is possible because Stellar added it as a
          native host function in Protocol 22. Zorrito uses it to verify drand quicknet
          signatures: a <code>pairing_check</code> between the signature, the message hash, the G2
          generator and the group public key.
        </p>

        <hr />

        <h2 id="keeper">🤖 Nobody has to be there</h2>
        <p>
          The draw fires on its own when the timer runs out: a keeper running as a serverless
          function closes the round and brings the drand signature, and so does every visit to the
          app that finds an expired round or a pending draw. Both actions are{" "}
          <strong>permissionless</strong>: there are no roles or privileged keys, and whoever
          performs them only pays the fee. If the keeper disappears, the pool does not get stuck:
          the first person to open the app unblocks it.
        </p>
        <p>
          And if drand stopped publishing, the only thing that would not happen is the draw.
          Capital can still be withdrawn, at any time, with or without a pending draw.
        </p>

        <hr />

        <h2 id="probar">🧪 Try it without waiting a week</h2>
        <p>
          The pool on the home page runs on mainnet with weekly rounds. To watch the whole cycle in
          minutes there is a <strong>test pool on testnet</strong>, with 10-minute rounds and test
          XLM:{" "}
          {test ? <Link href="/test">stellar.zorrito.app/test</Link> : <em>deploying</em>}.
          Same contract, same Blend (its testnet pool) and same drand. Free testnet XLM from{" "}
          <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener">
            the Stellar Laboratory
          </a>
          , or directly with{" "}
          <a href="https://cosmospay.lat" target="_blank" rel="noopener">
            Cosmos Wallet
          </a>
          , which funds a testnet account on creation.
        </p>

        <hr />

        <h2 id="blend">🌊 Blend: where the prize comes from</h2>
        <p>
          <a href="https://blend.capital" target="_blank" rel="noopener">
            Blend
          </a>{" "}
          is Stellar&apos;s lending protocol. The pool deposits everyone&apos;s capital as{" "}
          <strong>Supply</strong> in a Blend v2 pool (the USDC reserve of the Fixed pool on
          mainnet; XLM on TestnetV2 on testnet): a position that lends and earns interest but is
          not used as collateral, so it carries no debt and cannot be liquidated.
        </p>
        <ul>
          <li>
            <strong>The interest is paid by borrowers</strong> in the pool. The APY the app shows
            is what Blend is paying right now.
          </li>
          <li>
            <strong>The contract talks to Blend on its own</strong>, through its own adapter.
            Nobody holds the key to that position: only the pool can deposit and withdraw.
          </li>
          <li>
            <strong>The prize is the difference</strong> between what is in Blend and the capital
            deposited. If the pool earned nothing, the prize is 0 and nobody loses.
          </li>
        </ul>

        <hr />

        <h2 id="escala">📈 Built for a million accounts</h2>
        <p>
          Drawing among many participants with different weights is expensive if you have to walk
          through them. Zorrito keeps the weights in a <strong>Fenwick tree</strong> over the
          contract&apos;s storage, with room for 2<sup>20</sup> accounts (just over a million).
          Depositing, withdrawing and drawing always touch ~20 entries, whether there are 2
          participants or 1,000,000.
        </p>
        <p>
          Time is handled with algebra, not loops: each account&apos;s weight is{" "}
          <code>deposit × T − b</code>, where <code>b</code> is adjusted on every move. That way
          everyone&apos;s weight advances with the clock without anyone having to update it.
        </p>

        <hr />

        <h2 id="stack">🛠 Tech stack</h2>
        <table className="tabla">
          <tbody>
            <tr>
              <td>
                <strong>Contracts</strong>
              </td>
              <td>
                Rust + Soroban (<code>soroban-sdk</code> 27). Three contracts: the pool, the Blend
                adapter and a mock yield source for tests. 60 tests, including BLS verification
                with our own keys, the streak, referrals, Blend&apos;s rounding and the pool
                operating against Blend&apos;s real bytecode.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Randomness</strong>
              </td>
              <td>
                drand quicknet (bls-unchained-g1-rfc9380), verified on-chain with Stellar&apos;s
                BLS12-381 host functions. Point decompression on the client with{" "}
                <code>@noble/curves</code>.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Yield</strong>
              </td>
              <td>
                Blend v2: the USDC reserve of the Fixed pool on mainnet, the XLM reserve of
                TestnetV2 on testnet. Integrated with <code>contractimport!</code> of the official
                WASMs.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Currency swap</strong>
              </td>
              <td>
                To join with XLM or USDT0: simultaneous quotes from the Soroswap router
                (simulating <code>router_get_amounts_out</code>) and the classic DEX
                (Horizon&apos;s <code>/paths/strict-send</code>), then a swap through whichever pays
                more, with <code>swap_exact_tokens_for_tokens</code> or a{" "}
                <code>pathPaymentStrictSend</code>. In the user&apos;s wallet, never in the pool.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Web</strong>
              </td>
              <td>
                Next.js 16, Tailwind 4, <code>@stellar/stellar-sdk</code> 17, Stellar Wallets Kit
                (Freighter, xBull, Lobstr) plus a custom module for Cosmos Wallet. Deployed on
                Vercel.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Keeper</strong>
              </td>
              <td>
                Serverless function on Vercel (<code>/api/keeper</code>), triggered by cron and by
                every visit. Permissionless: anyone can run another one.
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2 id="contratos">📋 Contracts</h2>
        {principal && principal.red === "mainnet" && (
          <Direccion etiqueta="Zorrito pool · mainnet · USDC · weekly" id={principal.id} red="mainnet" />
        )}
        <Direccion etiqueta="Blend adapter · mainnet" id={ADAPTER_MAINNET} red="mainnet" />
        <Direccion etiqueta="Blend v2 pool · mainnet (Fixed)" id={BLEND_MAINNET} red="mainnet" />
        <Direccion etiqueta="Soroswap router · mainnet" id={SOROSWAP_ROUTER.mainnet} red="mainnet" />
        <Direccion etiqueta="USDT0 (Tether via LayerZero) · mainnet" id={USDT0_MAINNET.token} red="mainnet" />
        {test && <Direccion etiqueta="Test pool · testnet · XLM · 10 min" id={test.id} red="testnet" />}
        <Direccion etiqueta="Blend adapter · testnet" id={ADAPTER_TESTNET} red="testnet" />
        <Direccion etiqueta="Blend v2 pool · testnet (TestnetV2)" id={BLEND_TESTNET} red="testnet" />
        <div className="addr-box">
          <span className="addr-label">drand quicknet · group public key (G2)</span>
          {DRAND_PK.slice(0, 32)}…{DRAND_PK.slice(-32)}
          <br />
          <a href="https://api.drand.sh/v2/beacons/quicknet/info" target="_blank" rel="noopener">
            View on drand ↗
          </a>
        </div>
        <p className="text-sm">
          Open source:{" "}
          <a href="https://github.com/artugrande/zorrito" target="_blank" rel="noopener">
            github.com/artugrande/zorrito
          </a>
          . The tests, the deploy scripts and this very site are there.
        </p>

        <hr />

        <h2 id="riesgos">🛡️ Security and risks, no makeup</h2>

        <Riesgo nivel="bajo" titulo="Nobody can pick the winner">
          Randomness comes from drand and is verified in the contract. There is no admin key in
          the pool: no role can pause it, change the draw or touch funds. The adapter has an admin
          that only serves to set, once, which contract is the pool.
        </Riesgo>
        <Riesgo nivel="bajo" titulo="Your capital depends on nobody">
          Withdrawing needs no permission, has no penalty and works even with a pending draw, even
          if the keeper is down and even if drand stops publishing.
        </Riesgo>
        <Riesgo nivel="medio" titulo="Blend risk: liquidity">
          The capital is lent out. If the Blend pool has almost all of its liquidity borrowed, a
          withdrawal can fail until someone repays or deposits. This is the real risk behind
          &quot;nobody loses&quot;: no capital is lost, but you may have to wait. Blend mitigates it
          with rates that rise with utilisation.
        </Riesgo>
        <Riesgo nivel="medio" titulo="Blend risk: protocol">
          A bug in Blend affects the pool like any other lender. Blend v2 is audited and is the
          most used lending protocol on Stellar, but the risk is not zero.
        </Riesgo>
        <Riesgo nivel="bajo" titulo="drand liveness">
          If drand does not publish, there is no draw until it is back. Capital can still be
          withdrawn. drand has been publishing every 3 seconds for years with more than 20
          operators.
        </Riesgo>
        <Riesgo nivel="bajo" titulo="Storage rent on Stellar">
          Persistent entries expire unless someone extends them. The contract extends its own on
          every use; accounts idle for months need someone to extend them (anyone can). Automating
          it in the keeper is pending.
        </Riesgo>
        <Riesgo nivel="medio" titulo="New contract, not audited">
          Built from scratch during the hackathon. The mainnet pool has a{" "}
          <strong>capital cap</strong> fixed in the contract precisely for this reason: it limits
          how much can be inside until an audit says it can be raised. Do not put in money you
          cannot afford to lose.
        </Riesgo>

        <hr />

        <h2 id="faq">❓ Questions</h2>
        <Faq q="Can I lose money?">
          No. The draw only distributes the interest the pool earned. Your deposit is yours and you
          withdraw it whenever you want. The only thing that can happen is having to wait if Blend
          is short on liquidity at that moment.
        </Faq>
        <Faq q="What do I get if I do not win?">
          Nothing, and you lose nothing. It is the same money you had, but with a shot at a prize
          every round instead of a small interest. If you prefer the guaranteed interest, Blend is
          right there.
        </Faq>
        <Faq q="Why did the person with the most money not win?">
          Because weight is money times time, not just money. Someone with less money who joined
          earlier can weigh more. And even with more weight, it is a draw: more odds is not
          certainty.
        </Faq>
        <Faq q="Can I verify a draw?">
          Yes. Every draw emits an event with the drand round, the signature and the total weight.
          With that and the round&apos;s deposits, anyone can recompute the seed and the winner.
        </Faq>
        <Faq q="What if the round is not closed on time?">
          Nothing bad. It closes when the keeper or a visit to the app closes it, and until then
          the pool keeps earning. The draw is never lost, only delayed.
        </Faq>
        <Faq q="Why USDC on mainnet and XLM on testnet?">
          Because the prize comes from what people borrow, and on Stellar people borrow USDC: the
          USDC reserve of the Fixed pool is at 80 % utilisation and pays ~8 % a year to lenders;
          the XLM reserve sits at 0.1 % and pays 0 %. On testnet there is no easy USDC and XLM
          needs no trustline, so the test pool uses XLM. The contract is the same with any token
          Blend accepts.
        </Faq>
        <Faq q="Will there be a USDT0 pool?">
          Today you can join with USDT0 and it is swapped to USDC at the door. A pool that holds
          USDT0 directly needs Blend to lend it, because that is where the prize comes from. USDT0
          arrived on Stellar in September 2026 and has no reserve in any Blend pool yet. The day it
          does, it is one more entry in the configuration: the contract does not know which token
          it is.
        </Faq>
        <Faq q="What about Blend's 5-dollar minimum?">
          It does not apply. That minimum is for <em>collateral</em>, and the pool contract only
          checks it when a position has debt: it exists so that nobody leaves a loan with
          collateral too small to be worth liquidating. Zorrito only lends (non-collateral Supply)
          and never borrows, so the pool never evaluates that minimum on its position. Besides, the
          pool holds a single position on Blend that aggregates everyone&apos;s deposits: whoever
          puts in 0.50 USDC does not open their own position, they add to the pool&apos;s. Tested
          on mainnet with deposits under a dollar.
        </Faq>
        <Faq q="Do I need anything in my wallet to join?">
          USDC and a little XLM for fees. If your wallet does not accept USDC yet, the app offers
          to add it with one tap: it is Stellar&apos;s trustline, done once. Freighter, Cosmos
          Wallet, xBull and Lobstr all work.
        </Faq>
        <Faq q="Can I join with XLM or USDT0?">
          Yes, with both. Pick the currency next to the amount, the app gets quotes from the two
          places where swaps happen on Stellar, Soroswap and the classic DEX (the same one
          Freighter and Lobstr use), and shows you whichever gives more USDC at that moment. You
          sign twice: the swap and the deposit. The swap goes through your wallet, not through the
          pool: the pool receives USDC as always and your capital is in dollars from the first
          second. Up to 0.5 % less than the quote is accepted if the price moves between looking
          and signing; if it moves more, the whole swap fails and nothing happens. Withdrawals are
          always in USDC.
        </Faq>
        <Faq q="Can I have referrals without putting money in?">
          You can, but they add nothing: the referral bonus is worth at most half of your own
          capital, and with no capital it is worth zero.
        </Faq>

        <p className="mt-8 text-center text-sm">
          <Link href="/">← Back to the app</Link>
        </p>
      </article>
    </Marco>
  );
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="paso-item">
      <div className="paso-num">{n}</div>
      <div>
        <strong>{titulo}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Riesgo({
  nivel,
  titulo,
  children,
}: {
  nivel: "bajo" | "medio" | "info";
  titulo: string;
  children: React.ReactNode;
}) {
  const texto = { bajo: "LOW", medio: "MEDIUM", info: "INFO" }[nivel];
  return (
    <div className="riesgo">
      <span className={`tag tag-${nivel}`}>{texto}</span>
      <div>
        <strong>{titulo}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="riesgo flex-col gap-1">
      <strong>{q}</strong>
      <p>{children}</p>
    </div>
  );
}

function Direccion({ etiqueta, id, red }: { etiqueta: string; id: string; red: string }) {
  return (
    <div className="addr-box">
      <span className="addr-label">{etiqueta}</span>
      {id}
      <br />
      <a href={explorer(red, "contract", id)} target="_blank" rel="noopener">
        View on stellar.expert ↗
      </a>
    </div>
  );
}
