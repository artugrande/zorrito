// Genera el pitch (public/deck.html, servido en /deck) como 8 diapositivas
// 16:9 que contestan cuatro preguntas: problema, producto, negocio y técnica.
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
  const BLOQUES = { problema: "Problema", producto: "Producto", negocio: "Negocio", tecnica: "Técnica" };

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
        <h1>Lotería sin pérdida</h1>
        <p class="lead">Depositás dinero en un pozo. El pozo genera rendimientos en Blend. Cada semana, uno se lleva el rendimiento. Nadie pierde su capital inicial.</p>
        <p class="meta">Arturo Grande, founder · Argentina Builder Challenge, BAF × Stellar · Septiembre 2026</p>
      </div>
    </section>`,

    // 2 Problema
    slide("problema", "Ahorrar no motiva. La lotería destruye capital.", `
      <div class="dos">
        <div class="tarjeta"><div class="ic">${ico("FaPiggyBank")}</div><div class="grande">2 USD</div><p>Es lo que gana en un año quien ahorra 50 USD al 4 %. No cambia nada y no motiva a nadie.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaDice")}</div><div class="grande">0 USD</div><p>Es lo que le queda a casi todos los que juegan a la lotería. Motiva muchísimo, y la plata no vuelve.</p></div>
      </div>
      <div class="stats">
        ${stat("1956", "Premium Bonds del Reino Unido: un pozo sin pérdida estatal, 22 M de participantes")}
        ${stat("812 → 0", "proyectos relevados en el ecosistema Stellar; ninguno hace ahorro premiado")}
      </div>`),

    // 3 Cómo funciona
    slide("producto", "Juntar las dos cosas y sacarles lo malo", `
      <div class="pasos">
        ${paso(1, "FaCoins", "Depositás", "USDC, o XLM y USDT0 que se cambian en la puerta. Va directo a Blend.")}
        ${paso(2, "FaChartLine", "El pozo genera", "El interés de Blend se acumula como premio, y crece en vivo.")}
        ${paso(3, "FaRandom", "Termina el contador", "Al cumplirse la semana, el sorteo se dispara solo. drand da el número y el contrato lo verifica.")}
        ${paso(4, "FaTrophy", "Uno cobra", "El premio entero a un ganador. Los demás siguen con lo que pusieron.")}
      </div>
      <p class="cierre-slide verde">Retirás cuando quieras: sin penalidad, sin esperar el sorteo, sin permiso.</p>`),

    // 4 Producto en mainnet
    slide("producto", "En mainnet, con plata real", `
      <div class="producto">
        <div class="tarjeta mock">
          <div class="eyebrow">Premio en juego</div>
          <div class="premio"><span class="cifra">12.3456789</span> <span class="unidad">USDC</span></div>
          <div class="envivo"><i></i> En vivo</div>
          <div class="countdown"><small>Se sortea en</small><b>6d 23:59:58</b></div>
          <p class="mini">Números ilustrativos</p>
        </div>
        <div class="feats">
          ${feat("FaWallet", "Entrás con lo que tengas", "USDC, XLM o USDT0. La app cotiza Soroswap y el DEX de Stellar y cambia por el que más da.")}
          ${feat("FaFire", "Racha y referidos", "Siete días de “ahorré hoy” duplican tus chances. Cada referido suma el 10 % de su capital a tu peso.")}
          ${feat("FaCheckCircle", "Probado de punta a punta", "Cambio, depósito en Blend y retiro con plata real desde la app. Freighter, Cosmos, xBull y Lobstr.")}
        </div>
      </div>
      <div class="stats">${stat("15/09", "en mainnet")}${stat("3 días", "de la idea a mainnet")}${stat("60", "tests de contratos")}${stat("5.000", "USDC de tope hasta la auditoría")}</div>`),

    // 5 Negocio
    slide("negocio", `Cómo gana plata <span class="tenue">(propuesto)</span>`, `
      <div class="dos">
        <div class="tarjeta"><div class="ic">${ico("FaPercent")}</div><h3>Comisión sobre el premio</h3><p>5 a 10 % del rendimiento sorteado en cada ronda. Nunca sobre el capital. Fijada en el contrato, sin admin.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaStore")}</div><h3>Pozos para comunidades</h3><p>Un pozo con la marca de una wallet, una fintech o un club: mismo contrato, otro token o ritmo. La fee se comparte.</p></div>
      </div>
      <div class="stats">${stat("1 M USDC", "en el pozo al 8 % anual")}${stat("80.000 USD", "al año en premios")}${stat("8.000 USD", "al año para Zorrito con 10 %, sin custodiar nada")}</div>
      <table>
        <thead><tr><th></th><th>Motiva</th><th>Capital seguro</th><th>Azar verificable</th><th>En Stellar</th></tr></thead>
        <tbody>
          <tr><td>Lotería</td><td class="si">Sí</td><td class="no">No</td><td class="no">No</td><td class="no">No</td></tr>
          <tr><td>Blend directo</td><td class="no">No</td><td class="si">Sí</td><td class="na">n/a</td><td class="si">Sí</td></tr>
          <tr><td>PoolTogether</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td><td class="no">No</td></tr>
          <tr class="nosotros"><td>Zorrito</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td></tr>
        </tbody>
      </table>`),

    // 6 Técnica
    slide("tecnica", "Por qué Stellar, y por qué confiar", `
      <div class="tres">
        <div class="tarjeta"><div class="ic">${ico("FaChartLine")}</div><h3>Rendimiento real</h3><p>Blend v2, posición de Supply sin colateral: genera interés y no puede liquidarse. USDC paga ~8 % anual.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaRandom")}</div><h3>Azar verificable</h3><p>drand firma un número que no existía al cerrar. El contrato lo verifica con BLS12-381 del Protocolo 22. Nadie lo sesga.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaBolt")}</div><h3>Sorteo automático y barato</h3><p>Al vencer el contador un keeper dispara el sorteo por fracciones de centavo. Si falla, la app lo reintenta sola.</p></div>
      </div>
      <div class="stats">${stat("0", "roles: sin admin, sin pausa, nadie toca fondos")}${stat("2^20", "cuentas en un Fenwick tree; ~21 escrituras por operación")}${stat("60", "tests, incluido Blend real y firmas BLS")}${stat("Rust", "Soroban SDK 27 · Next.js 16 · stellar-sdk 17")}</div>`),

    // 7 Founder y roadmap
    `<section class="slide">
      <header><img src="${LOGO}" alt=""><h2>Quién está atrás, y qué sigue</h2></header>
      <div class="cuerpo">
        <div class="founder">
          <div class="tarjeta perfil">
            ${FOTO ? `<img class="foto" src="${FOTO}" alt="Arturo Grande">` : `<div class="ic xl">${ico("FaUserAstronaut", 56)}</div>`}
            <h3>Arturo Grande</h3>
            <p class="links">arturogrande.com · @ArtuGrande</p>
            <p>Product builder, emprendedor y educador. Founder de Desafiatech, DevRel en Celo, SpaceXAI Ambassador, host de Builders OFF the Record (275 K+ vistas). Salta, Argentina.</p>
          </div>
          <div class="roadmap">
            <div class="tarjeta hecho"><div class="eyebrow">Hoy</div><p>Mainnet con USDC en Blend · entrada con XLM y USDT0 · racha y referidos · Freighter, Cosmos, xBull y Lobstr</p></div>
            <div class="tarjeta"><div class="eyebrow">Q4 2026</div><p>Auditoría y subida del tope · comisión sobre el premio en el contrato · distribución en comunidades</p></div>
            <div class="tarjeta"><div class="eyebrow">2027</div><p>Pozos por comunidad con marca propia · pozo de USDT0 · app móvil y avisos del sorteo</p></div>
          </div>
        </div>
      </div>
    </section>`,

    // 8 Cierre
    `<section class="slide portada" style="background-image:url('${BG}')">
      <div class="tarjeta hero">
        <img src="${LOGO}" alt="Zorrito" class="logo-medio">
        <h1>Probalo en mainnet</h1>
        <p class="url">stellar.zorrito.app</p>
        <p class="lead ink">Buscamos una auditoría para subir el tope y distribución con wallets y comunidades de América Latina.</p>
        <p class="meta">github.com/artugrande/zorrito · stellar.zorrito.app/docs</p>
        <div class="marcas">Powered by <span>Blend</span> · <span class="soro">${soroswap}</span> · <span>Stellar</span></div>
      </div>
    </section>`,
  ];

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Pitch de Zorrito: lotería sin pérdida en Stellar.">
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
  <button id="prev" type="button" aria-label="Anterior">&#8592;</button>
  <span class="contador" id="contador">1 / ${slides.length}</span>
  <button id="next" type="button" aria-label="Siguiente">&#8594;</button>
  <span class="ayuda">flechas del teclado · click a los costados · deslizá en el celular</span>
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
