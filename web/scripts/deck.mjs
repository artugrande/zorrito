// Genera el pitch (public/deck.html, servido en /deck) como 8 diapositivas
// 16:9, en inglés, que contestan cuatro preguntas: problema, producto, negocio y técnica.
// Uso: node scripts/deck.mjs [salida] [--relativo]
//   --relativo: referencia los assets como "assets/..." en vez de "/assets/..."
//   (para publicar la página fuera de la app, junto a una copia de esa carpeta).
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Fa from "react-icons/fa";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(AQUI, "..", "public", "assets");
const args = process.argv.slice(2);
const RELATIVO = args.includes("--relativo");
const OUT = args.find((a) => !a.startsWith("--")) || path.join(AQUI, "..", "public", "deck.html");
const BASE = RELATIVO ? "assets/" : "/assets/";

const ico = (n, size = 22) => renderToStaticMarkup(React.createElement(Fa[n], { size }));

function main() {
  const soroswap = fs.readFileSync(`${ASSETS}/soroswap.svg`, "utf8").replace(/<\?xml[^>]*>/, "");
  const BG = `${BASE}bg.png`;
  const LOGO = `${BASE}zorritofinallogo.png`;
  // La foto del founder es opcional: si public/assets/arturo.jpg no está, va un ícono.
  const FOTO = fs.existsSync(`${ASSETS}/arturo.jpg`) ? `${BASE}arturo.jpg` : null;
  const BLOQUES = { problema: "Problem", producto: "Product", negocio: "Business", tecnica: "Tech" };

  const slide = (bloque, titulo, cuerpo) => `
    <section class="slide" data-bloque="${bloque}">
      <header><img src="${LOGO}" alt=""><h2>${titulo}</h2><span class="bloque b-${bloque}">${BLOQUES[bloque]}</span></header>
      <div class="cuerpo">${cuerpo}</div>
    </section>`;
  const paso = (n, icon, t, d) => `<div class="paso"><div class="paso-num">${n}</div><div class="ic">${ico(icon)}</div><h3>${t}</h3><p>${d}</p></div>`;
  const feat = (icon, t, d) => `<div class="feat"><div class="ic">${ico(icon)}</div><div><h3>${t}</h3><p>${d}</p></div></div>`;
  const stat = (n, d) => `<div class="stat"><b>${n}</b><span>${d}</span></div>`;

  const slides = [
    // 1 Portada
    `<section class="slide portada" style="background-image:url('${BG}')">
      <div class="tarjeta hero">
        <img src="${LOGO}" alt="Zorrito" class="logo-grande">
        <h1>The no-loss lottery</h1>
        <p class="lead">You put money into a pool. The pool earns yield on Blend. Every week, one saver takes the yield. Nobody loses their initial capital.</p>
        <p class="meta">Arturo Grande, founder · Argentina Builder Challenge, BAF × Stellar · September 2026</p>
      </div>
    </section>`,

    // 2 Problema
    slide("problema", "Saving does not motivate. The lottery destroys capital.", `
      <div class="dos">
        <div class="tarjeta"><div class="ic">${ico("FaPiggyBank")}</div><div class="grande">2 USD</div><p>What someone saving 50 USD at 4 % earns in a year. It changes nothing and motivates nobody.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaDice")}</div><div class="grande">0 USD</div><p>What almost everyone who plays the lottery is left with. It motivates like nothing else, and the money never comes back.</p></div>
      </div>
      <div class="stats">
        ${stat("1956", "UK Premium Bonds: a state-run no-loss pool with 22 M participants")}
        ${stat("812 → 0", "Stellar ecosystem projects surveyed; none does prize-linked savings")}
      </div>`),

    // 3 Cómo funciona
    slide("producto", "Combine the two and drop what is bad about each", `
      <div class="pasos">
        ${paso(1, "FaCoins", "You deposit", "USDC, or XLM and USDT0 swapped at the door. It goes straight into Blend.")}
        ${paso(2, "FaChartLine", "The pool earns", "Blend's interest accumulates as the prize, and grows live.")}
        ${paso(3, "FaRandom", "The timer runs out", "When the week is up, the draw fires on its own. drand provides the number and the contract verifies it.")}
        ${paso(4, "FaTrophy", "One wins", "The whole prize goes to one winner. Everyone else keeps what they put in.")}
      </div>
      <p class="cierre-slide verde">Withdraw whenever you want: no penalty, no waiting for the draw, no permission.</p>`),

    // 4 Producto en mainnet
    slide("producto", "On mainnet, with real money", `
      <div class="producto">
        <div class="tarjeta mock">
          <div class="eyebrow">Prize at stake</div>
          <div class="premio"><span class="cifra">12.3456789</span> <span class="unidad">USDC</span></div>
          <div class="envivo"><i></i> Live</div>
          <div class="countdown"><small>Draw in</small><b>6d 23:59:58</b></div>
          <p class="mini">Illustrative numbers</p>
        </div>
        <div class="feats">
          ${feat("FaWallet", "Join with what you have", "USDC, XLM or USDT0. The app quotes Soroswap and the Stellar DEX and swaps through whichever pays more.")}
          ${feat("FaFire", "Streak and referrals", "Seven days of “I saved today” double your odds. Each referral adds 10 % of their capital to your weight.")}
          ${feat("FaCheckCircle", "Tested end to end", "Swap, deposit into Blend and withdrawal with real money from the app. Freighter, Cosmos, xBull and Lobstr.")}
        </div>
      </div>
      <div class="stats">${stat("Sep 15", "live on mainnet")}${stat("3 days", "from idea to mainnet")}${stat("60", "contract tests")}${stat("5,000", "USDC cap until the audit")}</div>`),

    // 5 Negocio
    slide("negocio", `How it makes money <span class="tenue">(proposed)</span>`, `
      <div class="dos">
        <div class="tarjeta"><div class="ic">${ico("FaPercent")}</div><h3>Fee on the prize</h3><p>5 to 10 % of the yield drawn each round. Never on the capital. Fixed in the contract, no admin.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaStore")}</div><h3>Pools for communities</h3><p>A branded pool for a wallet, a fintech or a club: same contract, another token or cadence. The fee is shared.</p></div>
      </div>
      <div class="stats">${stat("1 M USDC", "in the pool at 8 % a year")}${stat("80,000 USD", "a year in prizes")}${stat("8,000 USD", "a year for Zorrito at 10 %, with no custody")}</div>
      <table>
        <thead><tr><th></th><th>Motivates</th><th>Capital safe</th><th>Verifiable randomness</th><th>On Stellar</th></tr></thead>
        <tbody>
          <tr><td>Lottery</td><td class="si">Yes</td><td class="no">No</td><td class="no">No</td><td class="no">No</td></tr>
          <tr><td>Blend directly</td><td class="no">No</td><td class="si">Yes</td><td class="na">n/a</td><td class="si">Yes</td></tr>
          <tr><td>PoolTogether</td><td class="si">Yes</td><td class="si">Yes</td><td class="si">Yes</td><td class="no">No</td></tr>
          <tr class="nosotros"><td>Zorrito</td><td class="si">Yes</td><td class="si">Yes</td><td class="si">Yes</td><td class="si">Yes</td></tr>
        </tbody>
      </table>`),

    // 6 Técnica
    slide("tecnica", "Why Stellar, and why trust it", `
      <div class="tres">
        <div class="tarjeta"><div class="ic">${ico("FaChartLine")}</div><h3>Real yield</h3><p>Blend v2, non-collateral Supply position: it earns interest and cannot be liquidated. USDC pays ~8 % a year.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaRandom")}</div><h3>Verifiable randomness</h3><p>drand signs a number that did not exist at close. The contract verifies it with Protocol 22's BLS12-381. Nobody can bias it.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaBolt")}</div><h3>Automatic, cheap draw</h3><p>When the timer runs out a keeper fires the draw for a fraction of a cent. If it fails, the app retries on its own.</p></div>
      </div>
      <div class="stats">${stat("0", "roles: no admin, no pause, nobody touches funds")}${stat("2^20", "accounts in a Fenwick tree; ~21 writes per operation")}${stat("60", "tests, including real Blend and BLS signatures")}${stat("Rust", "Soroban SDK 27 · Next.js 16 · stellar-sdk 17")}</div>`),

    // 7 Founder y roadmap
    `<section class="slide">
      <header><img src="${LOGO}" alt=""><h2>Who is behind it, and what comes next</h2></header>
      <div class="cuerpo">
        <div class="founder">
          <div class="tarjeta perfil">
            ${FOTO ? `<img class="foto" src="${FOTO}" alt="Arturo Grande">` : `<div class="ic xl">${ico("FaUserAstronaut", 56)}</div>`}
            <h3>Arturo Grande</h3>
            <p class="links">arturogrande.com · @ArtuGrande</p>
            <p>Product builder, entrepreneur and educator. Founder of Desafiatech, DevRel at Celo, SpaceXAI Ambassador, host of Builders OFF the Record (275 K+ views). Salta, Argentina.</p>
          </div>
          <div class="roadmap">
            <div class="tarjeta hecho"><div class="eyebrow">Today</div><p>Mainnet with USDC on Blend · join with XLM and USDT0 · streak and referrals · Freighter, Cosmos, xBull and Lobstr</p></div>
            <div class="tarjeta"><div class="eyebrow">Q4 2026</div><p>Audit and a higher cap · fee on the prize in the contract · distribution through communities</p></div>
            <div class="tarjeta"><div class="eyebrow">2027</div><p>Branded pools per community · USDT0 pool · mobile app and draw notifications</p></div>
          </div>
        </div>
      </div>
    </section>`,

    // 8 Cierre
    `<section class="slide portada" style="background-image:url('${BG}')">
      <div class="tarjeta hero">
        <img src="${LOGO}" alt="Zorrito" class="logo-medio">
        <h1>Try it on mainnet</h1>
        <p class="url">stellar.zorrito.app</p>
        <p class="lead ink">We are looking for an audit to raise the cap, and distribution with wallets and communities across Latin America.</p>
        <p class="meta">github.com/artugrande/zorrito · stellar.zorrito.app/docs</p>
        <div class="marcas">Powered by <span>Blend</span> · <span class="soro">${soroswap}</span> · <span>Stellar</span></div>
      </div>
    </section>`,
  ];

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Zorrito pitch: the no-loss lottery on Stellar.">
<link rel="icon" href="${RELATIVO ? "assets/zorritofinallogo.png" : "/icon.png"}">
<title>Zorrito · Pitch</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@600&display=swap">
<style>
  /* Un solo look, a propósito: diapositivas crema sobre un escenario oscuro. */
  :root {
    --paper: #fff9f2; --surface: #ffffff; --ink: #221b14; --muted: #6b6259; --line: #ead9c4;
    --orange: #fd840e; --orange-deep: #c25a00; --orange-tint: #fff1e2;
    --green: #1a9960; --green-tint: #e7f5ee; --green-line: #9fd6b8;
    --red: #b23a3a; --stage: #1c1410;
  }
  html, body { height: 100%; }
  body { margin: 0; background: var(--stage); color: var(--ink); font-family: "Nunito Sans", "Segoe UI", system-ui, sans-serif; overflow: hidden; }
  .escenario { position: fixed; inset: 0; display: grid; place-items: center; padding: 16px; }
  .marco { position: relative; width: 1280px; height: 720px; transform-origin: center center; }
  .slide {
    position: absolute; inset: 0; box-sizing: border-box;
    background: var(--paper); border-radius: 22px; overflow: hidden; padding: 40px 56px 44px;
    opacity: 0; visibility: hidden; transition: opacity .28s ease; display: flex; flex-direction: column; gap: 12px;
  }
  .slide.activa { opacity: 1; visibility: visible; }
  @media (prefers-reduced-motion: reduce) { .slide { transition: none; } .envivo i { animation: none; } }
  .slide.portada { background-size: cover; background-position: center; align-items: center; justify-content: center; }
  /* El cuerpo ocupa el resto y centra su contenido; las tarjetas miden lo que su texto pide. */
  .cuerpo { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 18px; min-height: 0; }

  h1, h2, h3 { font-family: "Baloo 2", "Nunito Sans", sans-serif; margin: 0; line-height: 1.12; text-wrap: balance; }
  h1 { font-size: 44px; font-weight: 800; color: var(--orange-deep); }
  h2 { font-size: 32px; font-weight: 800; flex: 1; }
  h3 { font-size: 20px; font-weight: 700; }
  p { margin: 0; line-height: 1.45; }
  header { display: flex; align-items: center; gap: 14px; }
  header img { width: 52px; height: 52px; object-fit: contain; }
  .tenue { color: var(--muted); font-weight: 600; font-size: 22px; }
  .mini { color: var(--muted); font-size: 12.5px; font-style: italic; }
  .eyebrow, .bloque { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; font-weight: 600; }
  .eyebrow { color: var(--orange-deep); }
  .bloque { padding: 6px 12px; border-radius: 999px; white-space: nowrap; }
  .b-problema { background: #fde5e5; color: #8f2a2a; }
  .b-producto { background: var(--orange-tint); color: var(--orange-deep); }
  .b-negocio { background: var(--green-tint); color: #146e46; }
  .b-tecnica { background: #e6eef8; color: #274b7a; }

  .tarjeta { background: var(--surface); border: 2px solid var(--orange); border-radius: 20px; padding: 20px 24px;
    box-shadow: 4px 5px 0 rgba(200,86,0,.18), 0 8px 24px rgba(253,132,14,.09); display: flex; flex-direction: column; gap: 10px; }
  .tarjeta.hecho { background: var(--green-tint); border-color: var(--green-line); }
  .tarjeta ul { margin: 0; padding-left: 18px; font-size: 15px; line-height: 1.5; }
  .tarjeta p { font-size: 16px; color: var(--muted); }
  .grande { font-family: "Baloo 2", sans-serif; font-size: 60px; font-weight: 800; color: var(--orange-deep); line-height: 1; font-variant-numeric: tabular-nums; }
  .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: stretch; }
  .tres { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .cierre-slide { text-align: center; font-size: 18px; }
  .cierre-slide.verde { color: var(--green); font-weight: 700; }

  .ic { width: 44px; height: 44px; border-radius: 50%; background: var(--orange-tint); color: var(--orange-deep); display: grid; place-items: center; flex: none; }
  .ic.xl { width: 110px; height: 110px; margin: 0 auto; }
  .foto { width: 130px; height: 130px; border-radius: 50%; object-fit: cover; margin: 0 auto; border: 3px solid var(--orange); box-shadow: 3px 4px 0 rgba(200,86,0,.18); }

  .pasos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .paso { position: relative; background: var(--surface); border: 2px solid var(--orange); border-radius: 18px; padding: 22px 18px 20px; text-align: center; box-shadow: 4px 5px 0 rgba(200,86,0,.18); display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .paso-num { position: absolute; left: 14px; top: 10px; font-family: "Baloo 2", sans-serif; font-weight: 800; font-size: 18px; color: var(--orange); }
  .paso p { font-size: 15px; color: var(--muted); }

  .producto { display: grid; grid-template-columns: 400px 1fr; gap: 28px; align-items: center; }
  .mock { gap: 8px; }
  .premio .cifra { font-family: "Baloo 2", sans-serif; font-size: 54px; font-weight: 800; color: var(--orange-deep); line-height: 1; font-variant-numeric: tabular-nums; }
  .premio .unidad { font-weight: 700; color: var(--muted); }
  .envivo { color: var(--green); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; display: flex; align-items: center; gap: 6px; }
  .envivo i { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; animation: pulso 1.6s ease-in-out infinite; }
  @keyframes pulso { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .4; transform: scale(1.4);} }
  .countdown { background: linear-gradient(145deg, #fff9f2, #fff4e6); border: 2px solid rgba(253,132,14,.28); border-radius: 16px; padding: 12px; text-align: center; margin-top: 6px; }
  .countdown small { display: block; font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); }
  .countdown b { font-family: "Baloo 2", sans-serif; font-size: 40px; color: var(--orange-deep); font-variant-numeric: tabular-nums; }
  .feats { display: flex; flex-direction: column; gap: 18px; }
  .feat { display: flex; gap: 14px; align-items: flex-start; }
  .feat p { font-size: 15.5px; color: var(--muted); }

  .stats { display: flex; gap: 16px; }
  .stat { flex: 1; background: var(--surface); border: 2px solid var(--orange); border-radius: 16px; padding: 12px 16px; text-align: center; box-shadow: 4px 5px 0 rgba(200,86,0,.18); }
  .stat b { display: block; font-family: "Baloo 2", sans-serif; font-size: 34px; font-weight: 800; color: var(--orange-deep); line-height: 1.05; }
  .stat span { font-size: 13px; color: var(--muted); }

  table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--surface); border: 2px solid var(--orange); border-radius: 16px; overflow: hidden; font-size: 15px; }
  th { background: var(--orange); color: #fff; font-family: "Baloo 2", sans-serif; padding: 8px 12px; font-size: 14px; }
  td { padding: 7px 12px; border-top: 1px solid var(--line); text-align: center; }
  td:first-child { text-align: left; font-weight: 700; }
  td.si { color: var(--green); font-weight: 700; } td.no { color: var(--red); } td.na { color: var(--muted); }
  tr.nosotros td { background: var(--orange-tint); }

  .founder { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: stretch; }
  .perfil { text-align: center; justify-content: center; }
  .perfil h3 { font-size: 26px; }
  .links { color: var(--orange-deep); font-weight: 700; font-size: 13px; }
  .roadmap { display: flex; flex-direction: column; gap: 14px; justify-content: center; }
  .roadmap .tarjeta { flex-direction: row; align-items: center; gap: 18px; padding: 16px 20px; }
  .roadmap .eyebrow { min-width: 72px; }
  .roadmap p { color: var(--ink); }

  .hero { width: 780px; text-align: center; align-items: center; padding: 30px 40px; gap: 12px; }
  .logo-grande { width: 220px; height: 220px; object-fit: contain; }
  .logo-medio { width: 150px; height: 150px; object-fit: contain; }
  .lead { color: var(--muted); font-size: 18px; max-width: 56ch; }
  .lead.ink { color: var(--ink); font-size: 16px; }
  .url { font-family: "Baloo 2", sans-serif; font-size: 30px; font-weight: 800; }
  .meta { font-size: 12.5px; }
  .marcas { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .marcas span { font-weight: 700; color: var(--ink); }
  .marcas .soro svg { height: 22px; width: auto; display: block; filter: invert(1) hue-rotate(180deg); }

  .nav { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)); color: #fff; font-size: 14px; z-index: 10; }
  .nav button { background: rgba(255,255,255,.14); color: #fff; border: 1.5px solid rgba(255,255,255,.4); border-radius: 999px; width: 40px; height: 40px; cursor: pointer; display: grid; place-items: center; font-size: 18px; font-family: inherit; }
  .nav button:hover, .nav button:focus-visible { background: var(--orange); border-color: var(--orange); outline: none; }
  .nav .contador { font-family: "Baloo 2", sans-serif; font-weight: 700; font-variant-numeric: tabular-nums; min-width: 56px; text-align: center; }
  .nav .ayuda { opacity: .6; font-size: 12px; }
  .nav .actual { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; opacity: .75; min-width: 80px; }
  @media (max-width: 720px) { .nav .ayuda { display: none; } }
  .zona { position: fixed; top: 0; bottom: 70px; width: 18%; cursor: pointer; z-index: 5; }
  .zona.izq { left: 0; } .zona.der { right: 0; }
</style>
</head>
<body>
<div class="escenario"><div class="marco" id="marco">
${slides.join("\n")}
</div></div>
<div class="zona izq" id="zonaIzq" aria-hidden="true"></div>
<div class="zona der" id="zonaDer" aria-hidden="true"></div>
<div class="nav">
  <span class="actual" id="actual"></span>
  <button id="prev" type="button" aria-label="Previous">&#8592;</button>
  <span class="contador" id="contador">1 / ${slides.length}</span>
  <button id="next" type="button" aria-label="Next">&#8594;</button>
  <span class="ayuda">arrow keys · click the sides · swipe on mobile</span>
</div>
<script>
(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const marco = document.getElementById('marco');
  const contador = document.getElementById('contador');
  const actual = document.getElementById('actual');
  const nombres = ${JSON.stringify(BLOQUES)};
  const total = slides.length;
  let i = 0;
  function ajustar() {
    const s = Math.min((window.innerWidth - 32) / 1280, (window.innerHeight - 32 - 60) / 720);
    marco.style.transform = 'scale(' + s + ')';
    marco.style.marginBottom = '60px';
  }
  function ir(n) {
    i = Math.max(0, Math.min(total - 1, n));
    slides.forEach((s, k) => s.classList.toggle('activa', k === i));
    contador.textContent = (i + 1) + ' / ' + total;
    const b = slides[i].dataset.bloque;
    actual.textContent = b ? nombres[b] : '';
    try { history.replaceState(null, '', '#s' + (i + 1)); } catch (e) {}
  }
  document.getElementById('prev').addEventListener('click', () => ir(i - 1));
  document.getElementById('next').addEventListener('click', () => ir(i + 1));
  document.getElementById('zonaIzq').addEventListener('click', () => ir(i - 1));
  document.getElementById('zonaDer').addEventListener('click', () => ir(i + 1));
  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); ir(i + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); ir(i - 1); }
    else if (e.key === 'Home') ir(0);
    else if (e.key === 'End') ir(total - 1);
  });
  let x0 = null;
  window.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) ir(dx < 0 ? i + 1 : i - 1);
  }, { passive: true });
  window.addEventListener('resize', ajustar);
  ajustar();
  const h = parseInt((location.hash || '').replace(/^#s?/, ''), 10);
  ir(Number.isFinite(h) ? h - 1 : 0);
})();
</script>
</body>
</html>
`;
  fs.writeFileSync(OUT, html);
  console.log("escrito", OUT, slides.length, "slides,", (fs.statSync(OUT).size / 1024).toFixed(0), "KB");
}

main();
