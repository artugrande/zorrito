// Genera el pitch (public/deck.html, servido en /deck) como diapositivas 16:9,
// organizadas en cuatro bloques: Problema, Producto, Negocio, Técnica.
// Uso: node scripts/deck.mjs   (regenera public/deck.html)
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Fa from "react-icons/fa";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const ASSETS = path.join(AQUI, "..", "public", "assets");
const OUT = process.argv[2] || path.join(AQUI, "..", "public", "deck.html");


const ico = (n, size = 22) => renderToStaticMarkup(React.createElement(Fa[n], { size }));

async function main() {
  const soroswap = fs.readFileSync(`${ASSETS}/soroswap.svg`, "utf8").replace(/<\?xml[^>]*>/, "");
  const BG = "/assets/bg.png";
  const LOGO = "/assets/zorritofinallogo.png";

  const BLOQUES = { problema: "Problema", producto: "Producto", negocio: "Negocio", tecnica: "Técnica" };

  // Un slide de contenido: cabecera con logo, título y etiqueta del bloque.
  const slide = (bloque, titulo, cuerpo, clase = "") => `
    <section class="slide ${clase}" data-bloque="${bloque}">
      <header>
        <img src="${LOGO}" alt="">
        <h2>${titulo}</h2>
        <span class="bloque b-${bloque}">${BLOQUES[bloque]}</span>
      </header>
      ${cuerpo}
    </section>`;

  const paso = (n, icon, t, d) => `
    <div class="paso"><div class="paso-num">${n}</div><div class="ic">${ico(icon)}</div><h3>${t}</h3><p>${d}</p></div>`;
  const feat = (icon, t, d) => `
    <div class="feat"><div class="ic">${ico(icon)}</div><div><h3>${t}</h3><p>${d}</p></div></div>`;
  const caja = (t, sub, verde = false) => `<div class="caja${verde ? " verde" : ""}"><b>${t}</b><span>${sub}</span></div>`;
  const flecha = `<div class="flecha">${ico("FaArrowRight")}</div>`;

  const slides = [
    // 1 Portada
    `<section class="slide portada" style="background-image:url('${BG}')">
      <div class="tarjeta hero">
        <img src="${LOGO}" alt="Zorrito" class="logo-grande">
        <h1>Ahorro premiado sin pérdida de capital</h1>
        <p class="lead">Ponés plata en un pozo. El pozo genera en Blend. Cada semana, uno se lleva el rendimiento de todos. Nadie pierde lo que puso.</p>
        <p class="meta">Arturo Grande, founder · Argentina Builder Challenge, BAF × Stellar · Track Genesis · Septiembre 2026</p>
      </div>
    </section>`,

    // 2 Las cuatro preguntas
    `<section class="slide">
      <header><img src="${LOGO}" alt=""><h2>Cuatro preguntas, cuatro bloques</h2></header>
      <p class="sub">Lo que este deck contesta, en el orden en que va.</p>
      <div class="cuatro">
        <div class="tarjeta pregunta"><span class="bloque b-problema">Problema</span><h3>¿Qué duele?</h3><p>Ahorrar no motiva y la lotería destruye capital. En Stellar nadie junta las dos cosas.</p><small>Slides 3 y 4</small></div>
        <div class="tarjeta pregunta"><span class="bloque b-producto">Producto</span><h3>¿Qué construimos?</h3><p>Un pozo semanal en USDC sobre Blend, con sorteo verificable. Ya en mainnet con plata real.</p><small>Slides 5 a 7</small></div>
        <div class="tarjeta pregunta"><span class="bloque b-negocio">Negocio</span><h3>¿Cómo gana plata?</h3><p>Comisión sobre el premio, nunca sobre el capital. Pozos de marca para comunidades y wallets.</p><small>Slides 8 a 10</small></div>
        <div class="tarjeta pregunta"><span class="bloque b-tecnica">Técnica</span><h3>¿Por qué confiar?</h3><p>Sin roles, azar de drand verificado on-chain, Fenwick tree para un millón de cuentas, 60 tests.</p><small>Slides 11 a 13</small></div>
      </div>
    </section>`,

    // 3 Problema
    slide("problema", "Ahorrar no motiva, y la lotería destruye capital", `
      <div class="dos">
        <div class="tarjeta">
          <div class="ic">${ico("FaPiggyBank")}</div>
          <h3>Ahorrar es aburrido</h3>
          <p>50 USD al 4 % anual son 2 USD al año. No cambia nada y no motiva a nadie.</p>
          <div class="grande">2 USD</div>
          <p class="mini">lo que gana en un año quien ahorra 50 USD</p>
        </div>
        <div class="tarjeta">
          <div class="ic">${ico("FaDice")}</div>
          <h3>La lotería motiva de más</h3>
          <p>Millones juegan cada semana. Motiva muchísimo, y la plata que entra no vuelve.</p>
          <div class="grande">0 USD</div>
          <p class="mini">lo que le queda a casi todos los que juegan</p>
        </div>
      </div>
      <p class="cierre-slide">Resultado: la mayoría no ahorra, y la plata que sí llega a DeFi va a rendimientos que el usuario no siente.</p>`),

    // 4 Mercado
    slide("problema", "Un modelo probado, un hueco vacío", `
      <div class="dos">
        <div class="tarjeta">
          <h3>El pozo sin pérdida funciona hace décadas</h3>
          <div class="grande">22 M+</div>
          <p>participantes en los Premium Bonds del Reino Unido, un pozo sin pérdida estatal que existe desde 1956.</p>
          <p>PoolTogether llevó el mismo modelo a Ethereum. En DeFi el producto ya está validado; lo que faltaba era una red con rendimiento real, azar verificable y fees baratas.</p>
        </div>
        <div class="tarjeta">
          <h3>En Stellar no había ninguno</h3>
          <div class="grande">812 → 0</div>
          <p>proyectos del ecosistema relevados antes de escribir una línea. Cero hacen ahorro premiado.</p>
          <p>Y el público está: Stellar es la red de pagos de las stablecoins en América Latina, África y Asia, con USDC, EURC y ahora USDT0. Gente que ya ahorra en dólares digitales y a la que un 4 % no le cambia nada.</p>
        </div>
      </div>`),

    // 5 Solución
    slide("producto", "Juntar las dos cosas y sacarles lo malo", `
      <p class="sub">Depositás, el pozo genera, una semana después uno se lleva el rendimiento de todos. Tu capital queda intacto y lo retirás cuando quieras.</p>
      <div class="pasos">
        ${paso(1, "FaCoins", "Depositás", "USDC, o XLM y USDT0 que se cambian en la puerta. Va directo a Blend.")}
        ${paso(2, "FaChartLine", "El pozo genera", "El capital de todos se presta en Blend. El interés se acumula como premio.")}
        ${paso(3, "FaLock", "La ronda cierra", "Una semana. Cualquiera la cierra. Premio y chances quedan congelados.")}
        ${paso(4, "FaRandom", "drand decide", "Un número que no existía al cerrar. El contrato verifica la firma on-chain.")}
        ${paso(5, "FaTrophy", "Uno cobra, nadie pierde", "El premio entero a un ganador. Los demás retiran su capital cuando quieran.")}
      </div>
      <p class="cierre-slide verde">Retirar funciona siempre: sin penalidad, sin esperar el sorteo, sin permiso.</p>`),

    // 6 Producto
    slide("producto", "El producto, como lo ve el usuario", `
      <div class="producto">
        <div class="tarjeta mock">
          <div class="eyebrow">Premio en juego</div>
          <div class="premio"><span class="cifra">12.3456789</span> <span class="unidad">USDC</span></div>
          <div class="envivo"><i></i> En vivo · crece segundo a segundo con el interés de Blend</div>
          <div class="countdown"><small>Se sortea en</small><b>6d 23:59:58</b></div>
          <p class="mini">Ronda 3 en curso · APY de Blend 7,7 % · tus chances aparecen cuando entrás</p>
          <p class="mini cursiva">Números ilustrativos</p>
        </div>
        <div class="feats">
          ${feat("FaWallet", "Entrás con lo que tengas", "USDC directo, o XLM y USDT0: la app cotiza Soroswap y el DEX de Stellar a la vez y cambia por el que más da, en tu wallet.")}
          ${feat("FaFire", "Racha diaria", "Marcar “ahorré hoy” siete días seguidos duplica tus chances. Sin poner más plata.")}
          ${feat("FaUsers", "Referidos", "Cada amigo que entra con tu link suma el 10 % de su capital a tu peso.")}
          ${feat("FaShieldAlt", "Sin sorpresas", "Trustline con un botón, mensajes en lenguaje normal, link a cada transacción. Freighter, Cosmos Wallet, xBull, Lobstr.")}
        </div>
      </div>`),

    // 7 Tracción
    slide("producto", "En mainnet, con plata real", `
      <div class="stats">
        <div class="stat"><b>mainnet</b><span>vivo desde el 15/09, USDC en Blend</span></div>
        <div class="stat"><b>3 días</b><span>de la idea a mainnet</span></div>
        <div class="stat"><b>74</b><span>commits, todos con contexto</span></div>
        <div class="stat"><b>60</b><span>tests de contratos</span></div>
      </div>
      <div class="check"><div class="ic verde">${ico("FaCheckCircle")}</div><h3>Probado de punta a punta desde la app con Freighter</h3></div>
      <ul class="lista">
        <li>Cambio de XLM a USDC por Soroswap y por el DEX clásico, depósito en Blend y retiro completo, con plata real.</li>
        <li>Más de 20 sorteos consecutivos en testnet con firmas reales de drand verificadas on-chain.</li>
        <li>Pozo de prueba público con rondas de 10 minutos, para que cualquiera vea el ciclo entero: <b>stellar.zorrito.app/test</b></li>
        <li>Tope de capital de 5.000 USDC fijo en el contrato hasta la auditoría.</li>
      </ul>
      <p class="mini">Transacción de ejemplo: stellar.expert/explorer/public/tx/f1a4be3a…</p>`),

    // 8 Modelo de negocio
    slide("negocio", `Cómo gana plata <span class="tenue">(propuesto)</span>`, `
      <p class="sub">Zorrito nunca toca el capital. Cobra solo sobre lo que el pozo generó.</p>
      <div class="filas">
        ${feat("FaPercent", "Comisión sobre el premio", "Entre 5 % y 10 % del rendimiento sorteado en cada ronda. El ganador se lleva el resto; los demás no pagan nada. Va en el contrato, sin admin: el porcentaje es una constante del deploy.")}
        ${feat("FaStore", "Pozos para comunidades", "Un pozo propio para una wallet, una fintech o un club: mismo contrato, otro token o ritmo, con la marca de ellos. La fee se comparte.")}
        ${feat("FaLayerGroup", "Escala con el capital", "Con 1 M USDC en el pozo al 8 % anual, el pozo reparte 80.000 USD al año en premios. Con 10 % de comisión, 8.000 USD al año por millón depositado, sin custodiar nada.")}
      </div>`),

    // 9 Competencia
    slide("negocio", "Frente a las alternativas", `
      <div class="tabla-wrap"><table>
        <thead><tr><th></th><th>Motiva</th><th>Capital seguro</th><th>Azar verificable</th><th>En Stellar</th><th>Sin custodia</th></tr></thead>
        <tbody>
          <tr><td>Lotería</td><td class="si">Sí</td><td class="no">No</td><td class="no">No</td><td class="no">No</td><td class="no">No</td></tr>
          <tr><td>Cuenta remunerada / Blend directo</td><td class="no">No</td><td class="si">Sí</td><td class="na">n/a</td><td class="si">Sí</td><td class="si">Sí</td></tr>
          <tr><td>PoolTogether (Ethereum)</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td><td class="no">No</td><td class="si">Sí</td></tr>
          <tr class="nosotros"><td>Zorrito</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td><td class="si">Sí</td></tr>
        </tbody>
      </table></div>
      <ul class="lista">
        <li>Frente a Blend directo, la diferencia es el motivo para entrar: el mismo rendimiento, convertido en un premio que se siente.</li>
        <li>Frente a PoolTogether, la diferencia es la red: Stellar tiene el público de stablecoins en mercados emergentes, fees de centavos y on/off-ramps en 170+ países.</li>
        <li>El azar no depende ni de nosotros ni de un validador: drand + BLS12-381 verificado en el contrato.</li>
      </ul>`),

    // 10 Roadmap
    slide("negocio", "Roadmap", `
      <div class="tres">
        <div class="tarjeta hecho"><div class="eyebrow">Hoy</div><h3>Hecho</h3><ul><li>Mainnet con USDC en Blend</li><li>Entrada con XLM y USDT0</li><li>Racha y referidos en el contrato</li><li>Cosmos, Freighter, xBull, Lobstr</li></ul></div>
        <div class="tarjeta"><div class="eyebrow">Q4 2026</div><h3>Confianza</h3><ul><li>Auditoría del contrato y subida del tope</li><li>Renta de storage automática en el keeper</li><li>Comisión sobre el premio en el contrato</li><li>Video y distribución en comunidades</li></ul></div>
        <div class="tarjeta"><div class="eyebrow">2027</div><h3>Escala</h3><ul><li>Pozo de USDT0 cuando Blend lo preste</li><li>Pozos por comunidad con marca propia</li><li>App móvil y avisos del sorteo</li><li>Otros tokens y ritmos (diario, mensual)</li></ul></div>
      </div>`),

    // 11 Por qué Stellar
    slide("tecnica", "Por qué Stellar, por qué ahora", `
      <div class="tres">
        <div class="tarjeta"><div class="ic">${ico("FaChartLine")}</div><h3>Rendimiento real y componible</h3><p>Blend, el mercado de crédito de Stellar. Una posición de Supply sin colateral genera interés y no puede liquidarse. La reserva de USDC del pool Fixed paga ~8 % anual.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaRandom")}</div><h3>Azar verificable on-chain</h3><p>Desde el Protocolo 22 el host tiene BLS12-381. El contrato verifica adentro la firma de drand, un beacon de ~20 organizaciones. Nadie puede sesgar el sorteo.</p></div>
        <div class="tarjeta"><div class="ic">${ico("FaBolt")}</div><h3>Fees de fracciones de centavo</h3><p>Cerrar y sortear cuesta casi nada, así que cualquiera puede hacerlo y el sistema no depende de nadie. Sin admin, sin keeper de confianza.</p></div>
      </div>
      <div class="nota">Y el momento: <b>USDT0</b>, el USDT de Tether, llegó a Stellar en septiembre de 2026. Stellar es hoy una red de miles de millones en stablecoins, con on/off-ramps en 170+ países. Zorrito ya acepta USDT0 como moneda de entrada.</div>`),

    // 12 Por dentro
    slide("tecnica", "Cómo funciona por dentro", `
      <div class="eyebrow">La plata</div>
      <div class="flujo">
        ${caja("Usuario", "USDC en su wallet")}${flecha}${caja("Pozo", "contrato Soroban")}${flecha}${caja("Adapter", "una posición, sin admin")}${flecha}${caja("Blend", "Supply", true)}
      </div>
      <div class="eyebrow">El azar</div>
      <div class="flujo">
        ${caja("Cierre", "fija una ronda futura de drand")}${flecha}${caja("drand publica", "3 s por ronda, ~20 operadores")}${flecha}${caja("El contrato verifica", "BLS12-381 on-chain y elige al ganador", true)}
      </div>
      <ul class="lista">
        <li><b>Fenwick tree sobre storage:</b> 2^20 cuentas. Depositar y sortear tocan ~21 entradas con 2 o con 1.000.000 de participantes.</li>
        <li><b>Peso = depósito × tiempo</b>, por linealidad (a·T − b). Cerrar no copia nada: versionado perezoso.</li>
        <li><b>Stack:</b> Rust / Soroban SDK 27, Next.js 16, stellar-sdk 17, Stellar Wallets Kit, keeper serverless en Vercel disparado por cron y por cada visita.</li>
        <li><b>60 tests</b>, incluida la verificación BLS con claves propias y el pozo operando contra el bytecode real de Blend.</li>
      </ul>`),

    // 13 Seguridad y riesgos
    slide("tecnica", "Por qué confiar, y qué puede salir mal", `
      <div class="dos arriba">
        <div class="tarjeta hecho">
          <div class="ic verde">${ico("FaShieldAlt")}</div>
          <h3>Lo que no puede pasar</h3>
          <ul>
            <li><b>Nadie toca los fondos.</b> Sin admin, sin pausa, sin clave privilegiada. Solo cada usuario retira lo suyo.</li>
            <li><b>Nadie elige al ganador.</b> Nada del ledger se usa como semilla. Sesgar el sorteo exige corromper a la mayoría de drand.</li>
            <li><b>Nadie traba el pozo.</b> Cerrar y sortear son permissionless; la app lo hace sola en cada visita.</li>
            <li><b>Retirar siempre funciona</b>, incluso a mitad del sorteo.</li>
          </ul>
        </div>
        <div class="tarjeta">
          <div class="ic">${ico("FaExclamationTriangle")}</div>
          <h3>Riesgos, dichos</h3>
          <table class="riesgos">
            <tr><td>Liquidez de Blend</td><td class="medio">medio</td><td>Un retiro puede esperar si el pool está al tope. No se pierde capital.</td></tr>
            <tr><td>Protocolo Blend</td><td class="medio">medio</td><td>Un bug en Blend afecta como a cualquier prestamista. v2 auditado.</td></tr>
            <tr><td>Sin auditoría propia</td><td class="medio">medio</td><td>Por eso el tope de 5.000 USDC fijo en el contrato.</td></tr>
            <tr><td>drand se detiene</td><td class="bajo">bajo</td><td>No hay sorteo hasta que vuelva. El capital se retira igual.</td></tr>
            <tr><td>Keeper caído</td><td class="bajo">bajo</td><td>Cualquiera cierra y sortea desde la app.</td></tr>
          </table>
        </div>
      </div>`),

    // 14 Founder
    `<section class="slide">
      <header><img src="${LOGO}" alt=""><h2>Quién está atrás</h2></header>
      <div class="founder">
        <div class="tarjeta perfil">
          <div class="ic xl">${ico("FaUserAstronaut", 60)}</div>
          <h3>Arturo Grande</h3>
          <p class="mini">Founder · Salta, Argentina</p>
          <p class="links">arturogrande.com · x.com/ArtuGrande</p>
          <p class="cursiva">Product builder, emprendedor y educador. Triatleta.</p>
        </div>
        <div class="feats">
          ${feat("FaRocket", "Founder de Desafiatech", "Construye productos y forma builders en el ecosistema tech de Argentina.")}
          ${feat("FaCode", "DevRel en Celo", "Relación con desarrolladores en un ecosistema de blockchain para pagos y mercados emergentes.")}
          ${feat("FaMicrophone", "Builders OFF the Record", "Podcast y canal de streaming sobre construir en tecnología, con más de 275.000 vistas.")}
          ${feat("FaRobot", "Zorrito, en tres días", "Diseño, contratos, app, deploy y pruebas en mainnet con plata real, con Claude Code como par de programación.")}
        </div>
      </div>
    </section>`,

    // 15 Cierre
    `<section class="slide portada" style="background-image:url('${BG}')">
      <div class="tarjeta hero">
        <img src="${LOGO}" alt="Zorrito" class="logo-medio">
        <h1>Probalo ahora</h1>
        <p class="url">stellar.zorrito.app</p>
        <p class="lead">El pozo de prueba en <b>/test</b> sortea cada 10 minutos: se ve el ciclo entero sin esperar una semana.</p>
        <p class="lead ink">Lo que buscamos: una auditoría para subir el tope, distribución con wallets y comunidades de América Latina, y el feedback del jurado.</p>
        <p class="meta">github.com/artugrande/zorrito · stellar.zorrito.app/docs · arturogrande.com</p>
        <div class="marcas">Powered by <span>Blend</span> · <span class="soro">${soroswap}</span> · <span>Stellar</span></div>
      </div>
    </section>`,
  ];

  const html = `<title>Zorrito Pitch</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@600&display=swap">
<style>
  /* Un solo look, a propósito: las diapositivas son crema sobre un escenario oscuro. */
  :root {
    --paper: #fff9f2; --surface: #ffffff; --ink: #221b14; --muted: #6b6259; --line: #ead9c4;
    --orange: #fd840e; --orange-deep: #c25a00; --orange-tint: #fff1e2;
    --green: #1a9960; --green-tint: #e7f5ee; --green-line: #9fd6b8;
    --red: #b23a3a; --stage: #1c1410;
    --W: 1280px; --H: 720px;
  }
  html, body { height: 100%; }
  body { margin: 0; background: var(--stage); color: var(--ink); font-family: "Nunito Sans", "Segoe UI", system-ui, sans-serif; overflow: hidden; }
  .escenario { position: fixed; inset: 0; display: grid; place-items: center; padding: 16px; }
  .marco { position: relative; width: var(--W); height: var(--H); transform-origin: center center; }
  .slide {
    position: absolute; inset: 0; width: var(--W); height: var(--H); box-sizing: border-box;
    background: var(--paper); border-radius: 22px; overflow: hidden; padding: 40px 56px 48px;
    opacity: 0; visibility: hidden; transition: opacity .28s ease; display: flex; flex-direction: column; gap: 16px;
  }
  .slide.activa { opacity: 1; visibility: visible; }
  @media (prefers-reduced-motion: reduce) { .slide { transition: none; } .envivo i { animation: none; } }
  .slide.portada { background-size: cover; background-position: center; align-items: center; justify-content: center; }

  h1, h2, h3 { font-family: "Baloo 2", "Nunito Sans", sans-serif; margin: 0; line-height: 1.12; text-wrap: balance; }
  h1 { font-size: 40px; font-weight: 800; color: var(--orange-deep); }
  h2 { font-size: 32px; font-weight: 800; color: var(--ink); flex: 1; }
  h3 { font-size: 19px; font-weight: 700; }
  p { margin: 0; line-height: 1.45; }
  header { display: flex; align-items: center; gap: 14px; }
  header img { width: 52px; height: 52px; object-fit: contain; }
  .tenue { color: var(--muted); font-weight: 600; font-size: 22px; }
  .sub { color: var(--muted); font-size: 16px; max-width: 80ch; }
  .mini { color: var(--muted); font-size: 12.5px; }
  .cursiva { font-style: italic; }
  .eyebrow { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--orange-deep); font-weight: 600; }

  /* Etiqueta del bloque al que responde cada slide */
  .bloque { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; font-weight: 600; padding: 6px 12px; border-radius: 999px; white-space: nowrap; align-self: flex-start; }
  .b-problema { background: #fde5e5; color: #8f2a2a; }
  .b-producto { background: var(--orange-tint); color: var(--orange-deep); }
  .b-negocio { background: var(--green-tint); color: #146e46; }
  .b-tecnica { background: #e6eef8; color: #274b7a; }

  .tarjeta { background: var(--surface); border: 2px solid var(--orange); border-radius: 20px; padding: 22px 24px;
    box-shadow: 4px 5px 0 rgba(200,86,0,.18), 0 8px 24px rgba(253,132,14,.09); display: flex; flex-direction: column; gap: 10px; }
  .tarjeta.hecho { background: var(--green-tint); border-color: var(--green-line); }
  .tarjeta ul { margin: 6px 0 0; padding-left: 18px; font-size: 14.5px; line-height: 1.5; }
  .tarjeta p { font-size: 14.5px; color: var(--muted); }
  .grande { font-family: "Baloo 2", sans-serif; font-size: 56px; font-weight: 800; color: var(--orange-deep); line-height: 1; margin-top: 6px; font-variant-numeric: tabular-nums; }
  .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; }
  .dos.arriba { align-items: start; }
  .tres { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; flex: 1; }
  .cuatro { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; flex: 0 0 auto; }
  .pregunta { gap: 8px; }
  .pregunta h3 { font-size: 22px; margin-top: 6px; }
  .pregunta p { flex: 1; }
  .pregunta small { color: var(--muted); font-size: 12px; }
  .cierre-slide { text-align: center; font-size: 17px; font-style: italic; }
  .cierre-slide.verde { color: var(--green); font-weight: 700; font-style: normal; }

  .ic { width: 44px; height: 44px; border-radius: 50%; background: var(--orange-tint); color: var(--orange-deep); display: grid; place-items: center; flex: none; }
  .ic.verde { background: var(--green-tint); color: var(--green); }
  .ic.xl { width: 120px; height: 120px; margin: 8px auto 4px; }

  .pasos { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; flex: 1; }
  .paso { position: relative; background: var(--surface); border: 2px solid var(--orange); border-radius: 18px; padding: 18px 14px; text-align: center; box-shadow: 4px 5px 0 rgba(200,86,0,.18); display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .paso-num { position: absolute; left: 12px; top: 10px; font-family: "Baloo 2", sans-serif; font-weight: 800; color: var(--orange); }
  .paso h3 { font-size: 17px; }
  .paso p { font-size: 13px; color: var(--muted); }

  .producto { display: grid; grid-template-columns: 440px 1fr; gap: 28px; flex: 1; align-items: center; }
  .mock { gap: 8px; }
  .premio .cifra { font-family: "Baloo 2", sans-serif; font-size: 54px; font-weight: 800; color: var(--orange-deep); line-height: 1; font-variant-numeric: tabular-nums; }
  .premio .unidad { font-weight: 700; color: var(--muted); }
  .envivo { color: var(--green); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; display: flex; align-items: center; gap: 6px; }
  .envivo i { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; animation: pulso 1.6s ease-in-out infinite; }
  @keyframes pulso { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .4; transform: scale(1.4);} }
  .countdown { background: linear-gradient(145deg, #fff9f2, #fff4e6); border: 2px solid rgba(253,132,14,.28); border-radius: 16px; padding: 12px; text-align: center; margin-top: 6px; }
  .countdown small { display: block; font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); }
  .countdown b { font-family: "Baloo 2", sans-serif; font-size: 40px; color: var(--orange-deep); font-variant-numeric: tabular-nums; }
  .feats, .filas { display: flex; flex-direction: column; gap: 14px; justify-content: center; flex: 1; }
  .feat { display: flex; gap: 14px; align-items: flex-start; }
  .feat p { font-size: 14px; color: var(--muted); }
  .filas .feat { background: var(--surface); border: 2px solid var(--orange); border-radius: 16px; padding: 14px 18px; box-shadow: 4px 5px 0 rgba(200,86,0,.18); }

  .nota { background: var(--green-tint); border: 2px solid var(--green-line); border-radius: 16px; padding: 14px 18px; font-size: 15px; }
  .flujo { display: flex; align-items: center; gap: 10px; }
  .caja { flex: 1; background: var(--surface); border: 2px solid var(--orange); border-radius: 14px; padding: 10px 12px; text-align: center; box-shadow: 3px 4px 0 rgba(200,86,0,.16); }
  .caja.verde { background: var(--green-tint); border-color: var(--green-line); }
  .caja b { display: block; font-family: "Baloo 2", sans-serif; font-size: 17px; }
  .caja span { font-size: 12px; color: var(--muted); }
  .flecha { color: var(--orange); flex: none; display: grid; place-items: center; }
  .lista { margin: 4px 0 0; padding-left: 20px; font-size: 15px; line-height: 1.5; display: flex; flex-direction: column; gap: 6px; }

  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .stat { background: var(--surface); border: 2px solid var(--orange); border-radius: 16px; padding: 16px; text-align: center; box-shadow: 4px 5px 0 rgba(200,86,0,.18); }
  .stat b { display: block; font-family: "Baloo 2", sans-serif; font-size: 40px; font-weight: 800; color: var(--orange-deep); line-height: 1.05; }
  .stat span { font-size: 13px; color: var(--muted); }
  .check { display: flex; align-items: center; gap: 12px; }

  .tabla-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--surface); border: 2px solid var(--orange); border-radius: 16px; overflow: hidden; font-size: 15px; }
  th { background: var(--orange); color: #fff; font-family: "Baloo 2", sans-serif; padding: 10px 12px; font-size: 14px; }
  td { padding: 10px 12px; border-top: 1px solid var(--line); text-align: center; }
  td:first-child { text-align: left; font-weight: 700; }
  td.si { color: var(--green); font-weight: 700; } td.no { color: var(--red); } td.na { color: var(--muted); }
  tr.nosotros td { background: var(--orange-tint); }
  table.riesgos { border: 0; background: transparent; font-size: 13.5px; border-radius: 0; }
  table.riesgos td { text-align: left; padding: 7px 8px; vertical-align: top; color: var(--muted); }
  table.riesgos td:first-child { color: var(--ink); white-space: nowrap; }
  table.riesgos tr:first-child td { border-top: 0; }
  td.medio { color: var(--orange-deep); font-weight: 700; } td.bajo { color: var(--green); font-weight: 700; }

  .founder { display: grid; grid-template-columns: 360px 1fr; gap: 28px; flex: 1; align-items: center; }
  .perfil { text-align: center; justify-content: center; }
  .perfil h3 { font-size: 26px; }
  .links { color: var(--orange-deep); font-weight: 700; font-size: 13px; }

  .hero { width: 780px; text-align: center; align-items: center; padding: 30px 40px; gap: 12px; }
  .logo-grande { width: 220px; height: 220px; object-fit: contain; }
  .logo-medio { width: 150px; height: 150px; object-fit: contain; }
  .lead { color: var(--muted); font-size: 16px; max-width: 60ch; }
  .lead.ink { color: var(--ink); }
  .url { font-family: "Baloo 2", sans-serif; font-size: 26px; font-weight: 800; }
  .meta { font-size: 12.5px; color: var(--ink); }
  .marcas { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .marcas span { font-weight: 700; color: var(--ink); }
  .marcas .soro svg { height: 22px; width: auto; display: block; filter: invert(1) hue-rotate(180deg); }

  /* Navegación */
  .nav { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)); color: #fff; font-size: 14px; z-index: 10; }
  .nav button { background: rgba(255,255,255,.14); color: #fff; border: 1.5px solid rgba(255,255,255,.4); border-radius: 999px; width: 40px; height: 40px; cursor: pointer; display: grid; place-items: center; font-size: 18px; font-family: inherit; }
  .nav button:hover, .nav button:focus-visible { background: var(--orange); border-color: var(--orange); outline: none; }
  .nav .contador { font-family: "Baloo 2", sans-serif; font-weight: 700; font-variant-numeric: tabular-nums; min-width: 64px; text-align: center; }
  .nav .ayuda { opacity: .6; font-size: 12px; }
  .nav .actual { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; opacity: .75; min-width: 80px; }
  @media (max-width: 720px) { .nav .ayuda { display: none; } }
  .zona { position: fixed; top: 0; bottom: 70px; width: 18%; cursor: pointer; z-index: 5; }
  .zona.izq { left: 0; } .zona.der { right: 0; }
</style>

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
`;
  const cabecera = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Pitch de Zorrito: ahorro premiado sin pérdida de capital en Stellar.">
<link rel="icon" href="/icon.png">
`;
  const salida = cabecera + html.replace("<title>Zorrito Pitch</title>", "<title>Zorrito · Pitch</title>").replace("</style>", "</style>\n</head>\n<body>") + "</body>\n</html>\n";
  fs.writeFileSync(OUT, salida);
  console.log("escrito", OUT, slides.length, "slides,", (fs.statSync(OUT).size / 1024).toFixed(0), "KB");
}

main().catch((e) => { console.error(e); process.exit(1); });
