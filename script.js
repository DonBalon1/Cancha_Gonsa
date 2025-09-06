// --- CONFIGURACIÓN ÚNICA DE MEDALLAS Y REGISTRO ---
// Fuente única de verdad para niveles, nombres e iconos
const medallasConfig = {
  goles: {
    titulo: 'Goles Totales',
    icono: '⚽',
    niveles: [
      { nivel: 1, min: 3,   nombre: 'Madera',           icon: '⚽', colorClass: 'nivel-1' },
      { nivel: 2, min: 15,  nombre: 'Bronce',           icon: '⚽', colorClass: 'nivel-2' },
      { nivel: 3, min: 40,  nombre: 'Hierro',           icon: '⚽', colorClass: 'nivel-3' },
      { nivel: 4, min: 80,  nombre: 'Plata',            icon: '⚽', colorClass: 'nivel-4' },
      { nivel: 5, min: 120, nombre: 'Oro',              icon: '🏆', colorClass: 'nivel-5' },
      { nivel: 6, min: 200, nombre: 'Diamante',         icon: '💎', colorClass: 'nivel-6' },
      { nivel: 7, min: 500, nombre: 'Dios del Futbol',  icon: '⚡', colorClass: 'nivel-7' }
    ]
  },
  partidos: {
    titulo: 'Partidos Jugados',
    icono: '📅',
    niveles: [
      { nivel: 1, min: 5,   nombre: 'Madera',              icon: '🎽', colorClass: 'nivel-1' },
      { nivel: 2, min: 20,  nombre: 'Bronce',              icon: '🎽', colorClass: 'nivel-2' },
      { nivel: 3, min: 50,  nombre: 'Hierro',              icon: '🎽', colorClass: 'nivel-3' },
      { nivel: 4, min: 75,  nombre: 'Plata',               icon: '🎽', colorClass: 'nivel-4' },
      { nivel: 5, min: 100, nombre: 'Oro',                 icon: '🏆', colorClass: 'nivel-5' },
      { nivel: 6, min: 150, nombre: 'Diamante',            icon: '💎', colorClass: 'nivel-6' },
      { nivel: 7, min: 300, nombre: 'Dueño del gimnasio',  icon: '⚡', colorClass: 'nivel-7' }
    ]
  },
  victorias: {
    titulo: 'Victorias Totales',
    icono: '🏆',
    niveles: [
      { nivel: 1, min: 2,   nombre: 'Madera',              icon: '🏅', colorClass: 'nivel-1' },
      { nivel: 2, min: 15,  nombre: 'Bronce',              icon: '🏅', colorClass: 'nivel-2' },
      { nivel: 3, min: 30,  nombre: 'Hierro',              icon: '🏅', colorClass: 'nivel-3' },
      { nivel: 4, min: 60,  nombre: 'Plata',               icon: '🏅', colorClass: 'nivel-4' },
      { nivel: 5, min: 80,  nombre: 'Oro',                 icon: '🏆', colorClass: 'nivel-5' },
      { nivel: 6, min: 100, nombre: 'Diamante',            icon: '💎', colorClass: 'nivel-6' },
      { nivel: 7, min: 250, nombre: 'Máquina de Ganar',    icon: '⚡', colorClass: 'nivel-7' }
    ]
  }
};

// Construye el registro (min/max) a partir de medallasConfig
const registroLogrosConfig = Object.fromEntries(Object.entries(medallasConfig).map(([clave, def]) => {
  const niveles = def.niveles;
  const config = niveles.map((n, i) => ({
    nivel: n.nivel,
    nombre: n.nombre,
    min: n.min,
    max: i < niveles.length - 1 ? niveles[i + 1].min - 1 : Infinity
  }));
  return [clave, config];
}));


function getRegistroJugadoresFromMetricas(metricasPorJugador) {
  // Convierte el objeto metricasPorJugador en el formato esperado
  return Object.entries(metricasPorJugador).map(([nombre, met]) => ({
    nombre,
    goles: met.goles || 0,
    partidos: met.partidos || 0,
    victorias: met.ganados || 0,
    img: getJugadorImg(nombre)
  }));
}

function getJugadorImg(nombre) {
  // Normaliza igual que el resto del sitio: quita espacios, mayúsculas y signos de puntuación
  let nombreArchivo = nombre.trim().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '');
  return `img/jugadores/jugador-${nombreArchivo}.png`;
}


function renderRegistroLogros() {
  const filtroElem = document.getElementById('registroFiltroLogro');
  const filtro = filtroElem ? filtroElem.value : '';
  const cont = document.getElementById('registroMedallasContenedores');
  if (!cont) return;
  if (!filtro) {
    cont.innerHTML = `<div style="background:#23263a;border-radius:12px;padding:2em 1.2em;text-align:center;color:#ffd700b0;font-size:1.15em;">
      <b>Selecciona una medalla para visualizar los logros de los jugadores.</b>
    </div>`;
    return;
  }
  const config = registroLogrosConfig[filtro];
  // Usar los datos reales calculados
  const metricasPorJugador = window.metricasPorJugador || {};
  const registroJugadores = getRegistroJugadoresFromMetricas(metricasPorJugador);
  let html = '';
  // Colores por medalla
  const coloresMedalla = {
    'Madera': {bg: '#8d5524', border: '#a9744f', text: '#fffbe6'},
    'Bronce': {bg: '#cd7f32', border: '#b87333', text: '#fffbe6'},
    'Hierro': {bg: '#b0b0b0', border: '#888', text: '#23263a'},
    'Plata': {bg: '#c0c0c0', border: '#b0b0b0', text: '#23263a'},
    'Oro': {bg: '#ffd700', border: '#e6c200', text: '#23263a'},
    'Diamante': {bg: '#7fdfff', border: '#3ec6e0', text: '#23263a'},
    'Dios del Futbol': {bg: 'linear-gradient(90deg,#ffd700 60%,#a020f0 100%)', border: '#ffd700', text: '#23263a'}
  };
  config.forEach(medalla => {
    const jugadores = registroJugadores.filter(j => {
      const valor = j[filtro];
      return valor >= medalla.min && valor <= medalla.max;
    });
    const color = coloresMedalla[medalla.nombre] || {bg:'#23263a',border:'#ffd700',text:'#ffd700'};
    // Unidad para textos dinámicos
    const unidad = filtro === 'goles' ? 'goles' : (filtro === 'partidos' ? 'partidos' : 'victorias');
    html += `<div style="background:#23263a;border-radius:12px;box-shadow:0 2px 12px ${color.border}55;padding:1em 1.2em;margin-bottom:1.2em;border:2.5px solid ${color.border};">
      <div style="font-size:1.35em;font-weight:900;letter-spacing:0.04em;margin-bottom:0.5em;text-shadow:0 2px 12px ${color.border}99,0 1px 8px #0003;color:${color.border};filter:brightness(1.15);">
        ${medalla.nombre}
      </div>
      <div style="color:#ffd700b0;font-size:1em;margin-bottom:0.5em;display:flex;flex-wrap:wrap;gap:1em;align-items:center;">
        ${jugadores.length ? jugadores.map(j => {
          const valor = j[filtro];
          // Determinar nivel actual y siguiente para progreso
          const niveles = config; // contiene min y max
          let idxNivel = niveles.findIndex(n => valor >= n.min && valor <= n.max);
          if (idxNivel === -1) idxNivel = 0;
          const nivelActual = niveles[idxNivel];
          const nivelSiguiente = niveles[idxNivel + 1] || null;
          const faltan = nivelSiguiente ? (nivelSiguiente.min - valor) : 0;
          let progresoPct = 1;
          if (nivelSiguiente) {
            progresoPct = (valor - nivelActual.min) / (nivelSiguiente.min - nivelActual.min);
            if (progresoPct < 0) progresoPct = 0; if (progresoPct > 1) progresoPct = 1;
          }
          const progresoPctTxt = Math.round(progresoPct * 100);
          const tooltipHtml = `\n${valor} ${unidad} totales\nNivel actual: ${nivelActual.nombre}${nivelSiguiente ? `\nFaltan ${faltan} para ${nivelSiguiente.nombre}` : '\nNivel máximo alcanzado'}\nProgreso: ${progresoPctTxt}%`;
          return `
          <span class="registro-jugador-medalla-item" style="position:relative;display:flex;align-items:center;gap:0.5em;background:#23263a99;padding:0.25em 0.7em;border-radius:8px;box-shadow:0 2px 8px ${color.border}22;">
            <img src="${j.img}" alt="${j.nombre}" onerror="this.onerror=null;this.src='img/jugadores/jugador-vacio.png';" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${color.border};box-shadow:0 1px 6px ${color.border}33;">
            <span style="color:${color.border};font-weight:600;">${j.nombre}</span>
            <div class="registro-jugador-tooltip">
              <div class="registro-jugador-tooltip-line nombre">${j.nombre}</div>
              <div class="registro-jugador-tooltip-line valor"><b>${valor}</b> ${unidad}</div>
              <div class="registro-jugador-tooltip-line nivel">Nivel: <b>${nivelActual.nombre}</b></div>
              ${nivelSiguiente ? `<div class=\"registro-jugador-tooltip-line faltan\">Faltan <b>${faltan}</b> para <b>${nivelSiguiente.nombre}</b></div>` : `<div class=\"registro-jugador-tooltip-line max\">Nivel máximo</div>`}
              <div class="registro-jugador-tooltip-line progreso"><div class="registro-jugador-progreso-bar"><span style="width:${progresoPct*100}%"></span></div><span class="registro-jugador-progreso-text">${progresoPctTxt}%</span></div>
            </div>
          </span>`;
        }).join('') : `<span style=\"color:#ffd70055\">Ningún jugador</span>`}
      </div>
    </div>`;
  });
  cont.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  const filtro = document.getElementById('registroFiltroLogro');
  if (filtro) {
    filtro.onchange = renderRegistroLogros;
    // Por defecto, no seleccionar ninguna opción
    filtro.selectedIndex = 0;
    renderRegistroLogros();
  }
  // Render dinámico de las tarjetas informativas de logros
  renderLogrosInfoTarjetas();
});

// Renderiza las tarjetas de información de logros (niveles) usando medallasConfig
function renderLogrosInfoTarjetas() {
  const contenedor = document.getElementById('logrosInfoTarjetasContainer');
  if (!contenedor) return;
  const colorNombre = {
    'nivel-1': '#7c4a03',
    'nivel-2': '#a97c50',
    'nivel-3': '#bfc1c2',
    'nivel-4': '#e0e0e0',
    'nivel-5': '#ffd700',
    'nivel-6': '#00e6e6',
    'nivel-7': '#ffd700'
  };
  const tarjeta = (clave) => {
    const def = medallasConfig[clave];
    const niveles = def.niveles;
    const iconoTitulo = def.icono;
    const unidad = clave === 'goles' ? 'goles' : (clave === 'partidos' ? 'partidos' : 'victorias');
    const unidadAbrev = clave === 'goles' ? 'G' : (clave === 'partidos' ? 'P' : 'V');
    const subtitulo = clave === 'goles' ? 'Suma todos los goles que hiciste en la historia del torneo.'
                    : clave === 'partidos' ? 'Cuenta todos los partidos en los que participaste, sin importar el resultado.'
                    : 'Acumula todas las victorias que conseguiste a lo largo del torneo.';
    const grid = niveles.map(n => {
      const usarAbrev = ['nivel-5','nivel-6','nivel-7'].includes(n.colorClass);
      const unidadMostrar = usarAbrev ? unidadAbrev : unidad;
      return `
      <div class="dashboard-jugador-medalla logros ${n.colorClass}">
        <span style="font-size:1.3em; margin-top:0.3em;">${n.icon}</span>
        <div class="medalla-nivel-nombre ${n.colorClass}"
             style="font-size:0.5em;line-height:1.3;text-align:center;color:${colorNombre[n.colorClass]};max-width:90px;">
          <span class="medalla-nombre" title="${n.nombre}">${n.nombre}</span>
          <span class="medalla-umbral" style="display:block;font-size:1.0em;color:#ffd700b0;">${n.min} ${unidadMostrar}</span>
        </div>
      </div>
    `;}).join('');
    return `
      <div class="logro-tarjeta" style="background:#23263a;border-radius:14px;box-shadow:0 2px 12px #ffd70022;padding:1.4em 1.3em 5.6em 1.3em;margin-bottom:${clave==='partidos' ? '2.7em' : '0.5em'};">
        <div style="display:flex;align-items:center;gap:1em;margin-bottom:0.7em;">
          <span style="font-size:2.1em;">${iconoTitulo}</span>
          <span style="font-size:1.18em;font-weight:700;color:#ffd700;">${def.titulo}</span>
        </div>
        <div style="color:#ffd700b0;font-size:1em;margin-bottom:1em;">${subtitulo}</div>
        <div style="display:flex;gap:1em;justify-content:center;flex-wrap:wrap;">
          <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:1em;justify-items:center;width:100%;max-width:800px;">
            ${grid}
          </div>
        </div>
      </div>
    `;
  };
  contenedor.innerHTML = `
    ${tarjeta('goles')}
    ${tarjeta('partidos')}
    ${tarjeta('victorias')}
  `;
}
// (Lógica de medallas escalables movida dentro de la función renderDashboardJugador)
// URL del CSV publicado de Google Sheets
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQT1Nu2BTvja759foXvBs5Digg77UesBBgfpaUNVvNW92pQLckEE4Z_HZU5OmDVYvH6_MgeFqq6HRqz/pub?gid=1609934683&single=true&output=csv';

// Parser CSV simple que soporta campos entre comillas y comillas escapadas ""
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const rows = [];
  for (let line of lines) {
    const row = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { // comilla escapada
          cur += '"';
          i++; // saltar la segunda comilla
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

// Cache local (localStorage) para el CSV para mejorar tiempo de carga y evitar sobrecargar Sheets
async function fetchCSVWithCache(url, cacheKey = 'csvCache', ttlMs = 5 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (typeof ts === 'number' && Date.now() - ts < ttlMs && typeof data === 'string' && data.length) {
        return data;
      }
    }
  } catch (_) { /* ignorar problemas de localStorage */ }
  const resp = await fetch(url);
  const text = await resp.text();
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: text }));
  } catch (_) { /* almacenamiento puede fallar (modo privado, cuota, etc.) */ }
  return text;
}

// --- NUEVO: Selector de año global ---
let anioSeleccionado = null;
let aniosDisponibles = [];

function filtrarPorAnio(dataRows, idxFecha, anio) {
  // Si es histórico, no filtrar por año
  if (anio === 'Histórico') return dataRows;
  // Filtra las filas por el año seleccionado
  return dataRows.filter(cols => {
    const fecha = cols[idxFecha];
    if (!fecha) return false;
    // Soporta formatos de fecha tipo '2025-06-01' o '01/06/2025'
    let year = '';
    if (fecha.includes('-')) year = fecha.split('-')[0];
    else if (fecha.includes('/')) year = fecha.split('/').pop();
    else year = fecha.substring(0, 4);
    return year == anio;
  });
}

function renderSelectorAnio(anios) {
  let cont = document.getElementById('selectorAnioContainer');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'selectorAnioContainer';
    cont.style.marginBottom = '1em';
    const parent = document.querySelector('#tab-general');
    if (parent) parent.prepend(cont);
  }
  cont.innerHTML = `<label for="selectorAnio"><b>Año:</b></label> <select id="selectorAnio"></select>`;
  const sel = cont.querySelector('#selectorAnio');
  sel.innerHTML = '';
  // Agregar opción Histórico al principio
  const optHist = document.createElement('option');
  optHist.value = 'Histórico';
  optHist.textContent = 'Histórico';
  sel.appendChild(optHist);
  anios.forEach(anio => {
    const opt = document.createElement('option');
    opt.value = anio;
    opt.textContent = anio;
    sel.appendChild(opt);
  });
  // Seleccionar el año actual o Histórico si estaba seleccionado
  sel.value = anioSeleccionado || anios[0];
  sel.onchange = function() {
    anioSeleccionado = this.value;
    try { localStorage.setItem('anioSeleccionado', anioSeleccionado); } catch(_) {}
    filtrarYRenderizarPorAnio();
  };
}

function filtrarYRenderizarPorAnio() {
  // Usa los datos originales y el año seleccionado para filtrar y renderizar todo
  const idxFecha = window.idxFecha;
  const dataRows = window.dataRowsOriginal;
  const anio = anioSeleccionado;
  let dataFiltrada = filtrarPorAnio(dataRows, idxFecha, anio);
  // Aplicar filtro de fecha clásico si está activo
  if (window.filtroFechaTablaGeneral) {
    const min = window.filtroFechaTablaGeneral.min;
    const max = window.filtroFechaTablaGeneral.max;
    if (min) {
      dataFiltrada = dataFiltrada.filter(cols => {
        const fecha = cols[idxFecha];
        return fecha && fecha >= min;
      });
    }
    if (max) {
      dataFiltrada = dataFiltrada.filter(cols => {
        const fecha = cols[idxFecha];
        return fecha && fecha <= max;
      });
    }
  }
  // NUEVO: Guardar la data filtrada en window para el comparador
  window.dataFiltradaPorAnio = dataFiltrada;
  // Recalcular métricas
  const idxJugador = window.idxJugador;
  const idxPuntos = window.idxPuntos;
  const idxGoles = window.idxGoles;
  const idxAutogoles = window.idxAutogoles; // puede ser -1 si no existe la columna
  const fechasSet = new Set(dataFiltrada.map(cols => cols[idxFecha]));
  const partidosTotales = fechasSet.size;
  // Calcular métricas por jugador único
  const metricasPorJugador = {};
  const partidosPorFecha = {};
  dataFiltrada.forEach(cols => {
    const fecha = cols[idxFecha];
    if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
    partidosPorFecha[fecha].push(cols);
  });
  Object.values(partidosPorFecha).forEach(partido => {
    // Agrupar por puntos (equipos)
    const grupos = {};
    partido.forEach(cols => {
      const key = Number(cols[idxPuntos]);
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(cols);
    });
    const keys = Object.keys(grupos).map(Number);
    if (keys.length === 2) {
      // Partido normal con dos equipos
      const [kA, kB] = keys;
      const equipoA = grupos[kA];
      const equipoB = grupos[kB];
      const golesA = equipoA.reduce((acc,c)=>acc+Number(c[idxGoles]),0);
      const golesB = equipoB.reduce((acc,c)=>acc+Number(c[idxGoles]),0);
      const autoA = idxAutogoles>=0 ? equipoA.reduce((a,c)=>a+Number(c[idxAutogoles]||0),0) : 0;
      const autoB = idxAutogoles>=0 ? equipoB.reduce((a,c)=>a+Number(c[idxAutogoles]||0),0) : 0;
      const marcadorA = golesA + autoB; // autogoles del rival
      const marcadorB = golesB + autoA;
      const diferencia = marcadorA - marcadorB;
      equipoA.forEach(cols => {
        const jugador = cols[idxJugador];
        if (!metricasPorJugador[jugador]) metricasPorJugador[jugador] = { puntos: 0, goles: 0, autogoles:0, golesNetos:0, partidos: 0, ganados: 0, empatados: 0, perdidos: 0, difGol: 0 };
        metricasPorJugador[jugador].difGol += diferencia;
      });
      equipoB.forEach(cols => {
        const jugador = cols[idxJugador];
        if (!metricasPorJugador[jugador]) metricasPorJugador[jugador] = { puntos: 0, goles: 0, autogoles:0, golesNetos:0, partidos: 0, ganados: 0, empatados: 0, perdidos: 0, difGol: 0 };
        metricasPorJugador[jugador].difGol -= diferencia;
      });
    } else {
      // Empate múltiple o estructura distinta: no alterar difGol (queda 0)
    }
  });
  dataFiltrada.forEach(cols => {
    const jugador = cols[idxJugador];
    const puntos = Number(cols[idxPuntos]);
    const goles = Number(cols[idxGoles]);
    const autogoles = idxAutogoles>=0 ? Number(cols[idxAutogoles]) : 0;
    if (jugador) {
      if (!metricasPorJugador[jugador]) {
        metricasPorJugador[jugador] = {
          puntos: 0,
          goles: 0,
          autogoles: 0,
          golesNetos: 0,
          partidos: 0,
          ganados: 0,
          empatados: 0,
          perdidos: 0,
          difGol: 0
        };
      }
      if (!isNaN(puntos)) metricasPorJugador[jugador].puntos += puntos;
      if (!isNaN(goles)) metricasPorJugador[jugador].goles += goles;
      if (!isNaN(autogoles)) metricasPorJugador[jugador].autogoles += autogoles;
      metricasPorJugador[jugador].partidos += 1;
      if (puntos === 3) metricasPorJugador[jugador].ganados += 1;
      else if (puntos === 1) metricasPorJugador[jugador].empatados += 1;
      else if (puntos === 0) metricasPorJugador[jugador].perdidos += 1;
      metricasPorJugador[jugador].golesNetos = metricasPorJugador[jugador].goles - (metricasPorJugador[jugador].autogoles||0);
    }
  });
  const ultimosResultados = getUltimosResultadosPorJugador(dataFiltrada, idxJugador, idxPuntos, 5);
  const ultimosGoles = getUltimosGolesPorJugador(dataFiltrada, idxJugador, idxGoles, 5);
  window.metricasPorJugador = metricasPorJugador;
  window.partidosTotales = partidosTotales;
  window.ultimosResultados = ultimosResultados;
  window.ultimosGoles = ultimosGoles;
  renderPuntosTotales(window.metricasPorJugador, window.partidosTotales, window.ultimosResultados, window.ultimosGoles);
  renderTablaGoleadores(window.metricasPorJugador);
  renderTribunalAsistencias(dataFiltrada, window.idxJugador, window.idxFecha);
  renderHistorialPartidos(dataFiltrada, window.idxFecha, window.idxJugador, window.idxGoles, window.idxPuntos);
  // Render calendario inicial (usa mismo dataFiltrada)
  try { renderHistorialCalendario(dataFiltrada, window.idxFecha); } catch(e) { console.warn('Calendario no disponible aún', e); }
  renderComparadorJugadores(window.metricasPorJugador);
  renderDashboardJugador(window.metricasPorJugador);
}

// Modificar el fetch principal para detectar años y renderizar el selector
fetchCSVWithCache(csvUrl, 'cancha_gonsa_csv_v1', 5 * 60 * 1000)
  .then(csv => {
    const rows = parseCSV(csv.trim());
    const headers = rows[0];
    const dataRows = rows.slice(1);
    // Calcular cantidad de fechas únicas (partidos totales)
    const idxFecha = headers.findIndex(h => h.trim().toLowerCase() === 'fecha');
    // Detectar años disponibles
    const aniosSet = new Set();
    dataRows.forEach(cols => {
      const fecha = cols[idxFecha];
      if (!fecha) return;
      let year = '';
      if (fecha.includes('-')) year = fecha.split('-')[0];
      else if (fecha.includes('/')) year = fecha.split('/').pop();
      else year = fecha.substring(0, 4);
      aniosSet.add(year);
    });
    aniosDisponibles = Array.from(aniosSet).sort();
    // Intentar restaurar selección previa
    const storedAnio = (() => { try { return localStorage.getItem('anioSeleccionado'); } catch(_) { return null; } })();
    if (storedAnio && aniosDisponibles.includes(storedAnio)) {
      anioSeleccionado = storedAnio;
    } else {
      anioSeleccionado = aniosDisponibles[aniosDisponibles.length - 1]; // Por defecto el más reciente
    }
    window.dataRowsOriginal = dataRows;
    window.idxFecha = idxFecha;
    window.idxJugador = headers.findIndex(h => h.trim().toLowerCase() === 'jugador');
    window.idxPuntos = headers.findIndex(h => h.trim().toLowerCase() === 'puntos');
  window.idxGoles = headers.findIndex(h => h.trim().toLowerCase() === 'goles');
  const variantesAutogoles = ['autogoles','autogol','en contra','contra','goles en contra','gol en contra','og'];
  window.idxAutogoles = headers.findIndex(h => variantesAutogoles.includes(h.trim().toLowerCase()));
    renderSelectorAnio(aniosDisponibles);
    filtrarYRenderizarPorAnio();
  });

function renderTable(headers, dataRows) {
  const tablaDiv = document.getElementById('tablaEstadisticas');
  if (!tablaDiv) return; // Si no existe el div, no hacer nada
  let html = '<table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  dataRows.forEach(cols => {
    html += '<tr>';
    cols.forEach(col => html += `<td>${col}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
}

function getUltimosResultadosPorJugador(dataRows, idxJugador, idxPuntos, cantidad = 5) {
  // Agrupa los partidos de cada jugador y devuelve los últimos resultados (G/E/P)
  const partidosPorJugador = {};
  dataRows.forEach(cols => {
    const jugador = cols[idxJugador];
    const puntos = Number(cols[idxPuntos]);
    if (!partidosPorJugador[jugador]) partidosPorJugador[jugador] = [];
    let resultado = '';
    if (puntos === 3) resultado = 'G';
    else if (puntos === 1) resultado = 'E';
    else if (puntos === 0) resultado = 'P';
    partidosPorJugador[jugador].push(resultado);
  });
  // Devuelve los últimos N resultados (más recientes al final)
  const ultimosResultados = {};
  Object.entries(partidosPorJugador).forEach(([jugador, resultados]) => {
    ultimosResultados[jugador] = resultados.slice(-cantidad);
  });
  return ultimosResultados;
}

function resultadoAEmoji(resultado) {
  // Devuelve un span con círculo minimalista y color según el resultado
  if (resultado === 'G') return '<span class="dot dot-green"></span>';
  if (resultado === 'E') return '<span class="dot dot-yellow"></span>';
  if (resultado === 'P') return '<span class="dot dot-red"></span>';
  return '';
}

function getUltimosGolesPorJugador(dataRows, idxJugador, idxGoles, cantidad = 5) {
  // Para cada partido: valor neto = goles a favor - autogoles (puede ser negativo)
  const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
  const golesPorJugador = {};
  dataRows.forEach(cols => {
    const jugador = cols[idxJugador];
    let gf = Number(cols[idxGoles]);
    if (isNaN(gf)) gf = 0;
    let own = 0;
    if (idxAutogoles >= 0) {
      own = Number(cols[idxAutogoles]);
      if (isNaN(own)) own = 0;
    }
    const net = gf - own; // puede ser negativo
    if (!golesPorJugador[jugador]) golesPorJugador[jugador] = [];
    golesPorJugador[jugador].push(net);
  });
  const ultimosGoles = {};
  Object.entries(golesPorJugador).forEach(([jugador, goles]) => {
    ultimosGoles[jugador] = goles.slice(-cantidad);
  });
  return ultimosGoles;
}

function golesAColor(goles) {
  // Valor puede ser negativo (autogoles netos), cero o positivo.
  if (goles < 0) return `<span class="dot dot-red"></span><span class="dot-num" style="color:#d32f2f;">${goles}</span>`; // negativos: rojo estándar
  if (goles === 0) return '<span class="dot dot-gray"></span><span class="dot-num" style="color:#9ea5ad;">0</span>';
  if (goles === 1) return '<span class="dot dot-yellow"></span><span class="dot-num" style="color:#b59f00;">1</span>';
  // 2+ goles
  return `<span class="dot dot-green"></span><span class="dot-num" style="color:#388e3c;">${goles}</span>`;
}

function calcularRanking(metricasPorJugador) {
  // Devuelve un objeto: jugador -> posición (1, 2, ...)
  const jugadoresOrdenados = Object.entries(metricasPorJugador)
    .sort((a, b) => b[1].puntos - a[1].puntos);
  let ranking = {};
  let posicion = 1;
  let prevPuntos = null;
  let repeticiones = 0;
  jugadoresOrdenados.forEach(([jugador, m], idx) => {
    if (prevPuntos !== null && m.puntos === prevPuntos) {
      repeticiones++;
    } else {
      if (idx !== 0) {
        posicion++;
      }
      repeticiones = 1;
    }
    prevPuntos = m.puntos;
    ranking[jugador] = posicion;
  });
  return ranking;
}

function tendenciaRanking(jugador, rankingActual, rankingAnterior) {
  if (!rankingAnterior || !(jugador in rankingAnterior)) return '';
  const actual = rankingActual[jugador];
  const anterior = rankingAnterior[jugador];
  if (actual < anterior) return '<span title="Subió" style="color:green;font-size:2em;">▲</span>';
  if (actual > anterior) return '<span title="Bajó" style="color:red;font-size:2em;">▼</span>';
  return '<span title="Igual" style="color:gray;font-size:2em;">—</span>';
}

// Normaliza el nombre para usarlo como nombre de archivo de imagen
function normalizarNombreArchivo(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

// --- FUNCION AUXILIAR PARA CLASE DE COLOR SEGÚN PERCENTIL ---
function clasePorcentaje(valor) {
  if (valor < 25) return 'pct-rojo';
  if (valor < 50) return 'pct-amarillo';
  if (valor < 75) return 'pct-verde-claro';
  return 'pct-verde';
}

// --- FUNCION AUXILIAR PARA CLASE DE COLOR SEGÚN DIF. GOL ---
function claseDifGol(valor) {
  if (valor < 0) return 'pct-rojo';
  if (valor < 5) return 'pct-amarillo';
  if (valor < 10) return 'pct-verde-claro';
  return 'pct-verde';
}

// --- FUNCION AUXILIAR PARA CLASE DE COLOR SEGÚN GxP ---
function claseGxP(valor) {
  if (valor < 0.5) return 'pct-rojo';
  if (valor < 1) return 'pct-amarillo';
  if (valor < 1.5) return 'pct-verde-claro';
  return 'pct-verde';
}

function renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles) {
  // Contenedor principal
  const tablaDiv = document.getElementById('tablaPuntosTotales');
  if (!tablaDiv) return; // Si no existe el div, no hacer nada

  // Crear o seleccionar el contenedor para el título y filtro
  let contenedorSuperior = document.getElementById('contenedorSuperiorTablaGeneral');
  if (!contenedorSuperior) {
    contenedorSuperior = document.createElement('div');
    contenedorSuperior.id = 'contenedorSuperiorTablaGeneral';
    contenedorSuperior.style.display = 'flex';
    contenedorSuperior.style.flexDirection = 'column';
    contenedorSuperior.style.alignItems = 'center';
    contenedorSuperior.style.marginBottom = '1em';
    tablaDiv.parentNode.insertBefore(contenedorSuperior, tablaDiv);
  }

  // Título principal
  // Título eliminado para evitar duplicado visual, ya está en el HTML principal

  // Filtro de partidos mínimos (centrado debajo del título)
  let filtroDiv = document.getElementById('filtroPartidosMinimos');
  if (!filtroDiv) {
    filtroDiv = document.createElement('div');
    filtroDiv.id = 'filtroPartidosMinimos';
    filtroDiv.style.display = 'flex';
    filtroDiv.style.justifyContent = 'center';
    filtroDiv.style.alignItems = 'center'; // <-- alineación vertical
    filtroDiv.style.margin = '0 0 1em 0';
    contenedorSuperior.appendChild(filtroDiv);
  } else {
    filtroDiv.style.alignItems = 'center'; // <-- asegurar alineación si ya existe
  }
    // Mantener el valor del input entre renderizados
    // Valor por defecto cambiado de 0 a 5
    // Restaurar desde localStorage si existe
    let partidosMinimos = 5;
    try {
      const saved = localStorage.getItem('minPartidosGeneral');
      if (saved !== null && saved !== '' && !Number.isNaN(Number(saved))) partidosMinimos = Number(saved);
    } catch(_) {}
  const inputExistente = filtroDiv.querySelector('#inputPartidosMinimos');
  if (inputExistente) {
    partidosMinimos = Number(inputExistente.value) || 0;
  } else {
  partidosMinimos = 5;
  }
  filtroDiv.innerHTML = `
    <label for=\"inputPartidosMinimos\" style=\"font-size:1.15em;\"><b>Partidos mínimos jugados:</b></label>
    <input type=\"number\" id=\"inputPartidosMinimos\" min=\"0\" value=\"${partidosMinimos}\" style=\"width:60px;margin-left:0.5em;height:2.1em;font-size:1.15em;text-align:center;vertical-align:middle;\">
  `;
  const inputMin = filtroDiv.querySelector('#inputPartidosMinimos');
  inputMin.value = partidosMinimos;
  inputMin.oninput = function() {
  try { localStorage.setItem('minPartidosGeneral', String(this.value)); } catch(_) {}
    renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles);
  };

  // Siempre aplicar modo compacto a la tabla principal
  const tablaCont = tablaDiv.closest('.tabla');
  if (tablaCont && !tablaCont.classList.contains('compact')) {
    tablaCont.classList.add('compact');
  }

  // --- Renderizar la tabla con doble header (grupos + subcolumnas) ---
  let html = `<table class='tabla-general'><thead>
    <tr class='thead-group'>
      <th rowspan="2" class='col-pos'>#</th>
      <th rowspan="2" class='col-avatar'></th>
      <th rowspan="2" class='col-jugador'>Jugador</th>
      <th rowspan="2" class='puntos' title="Puntos Totales">Puntos</th>
      <th colspan="3" class='grp grp-resultados' title="Victorias / Empates / Derrotas">Resultados</th>
      <th rowspan="2" class='col-pj' title="Partidos Jugados">PJ</th>
      <th colspan="3" class='grp grp-produccion' title="Producción ofensiva">Producción</th>
      <th colspan="2" class='grp grp-participacion' title="Participación / Presencia">Participación</th>
      <th colspan="2" class='grp grp-promedios' title="Promedios por Partido">Promedios</th>
      <th rowspan="2" class='col-rend' title="Últimos resultados">Rendimiento</th>
      <th rowspan="2" class='col-goleometro' title="Goles recientes">Goleómetro</th>
    </tr>
    <tr class='thead-sub'>
      <th class='col-g' title='Ganados'>G</th>
      <th class='col-e' title='Empatados'>E</th>
      <th class='col-p' title='Perdidos'>P</th>
      <th class='col-goles' title='Goles Totales'>Goles</th>
      <th class='col-efectgol' title='Efectividad de Gol (partidos con gol / PJ)'>Efect. Gol</th>
      <th class='col-difgol' title='Diferencial de Gol'>Dif. Gol</th>
      <th class='col-pctvic' title='% Victorias'>% Victorias</th>
      <th class='col-pctpres' title='% Presencias'>% Presencias</th>
      <th class='col-pxp' title='Promedio de Puntos por Partido'>PxP</th>
      <th class='col-gxp' title='Promedio de Goles por Partido'>GxP</th>
    </tr>
  </thead><tbody>`;
  // Filtrar por partidos mínimos
  const jugadoresFiltrados = Object.entries(metricasPorJugador).filter(([_, m]) => m.partidos >= partidosMinimos);
  // Ordenar por puntos totales de forma decreciente
  const jugadoresOrdenados = jugadoresFiltrados.sort((a, b) => b[1].puntos - a[1].puntos);

  // --- Calcular top 3 para puntos, goles, partidos (presencias) ---
  function getTop3(metric) {
    // Ordena descendente, devuelve array de nombres de jugadores top 3 (puede haber empates)
    const arr = [...jugadoresFiltrados].sort((a, b) => b[1][metric] - a[1][metric]);
    const top = [];
    let lastValue = null;
    let count = 0;
    for (let i = 0; i < arr.length && count < 3; i++) {
      const val = arr[i][1][metric];
      if (lastValue === null || val !== lastValue) count++;
      if (count > 3) break;
      top.push({ jugador: arr[i][0], value: val, place: count });
      lastValue = val;
    }
    // Devuelve objeto: jugador -> puesto (1,2,3)
    const res = {};
    top.forEach(({jugador, place}) => { if (place <= 3 && res[jugador] === undefined) res[jugador] = place; });
    return res;
  }
  const topPuntos = getTop3('puntos');
  const topGoles = getTop3('goles');
  const topPartidos = getTop3('partidos');
  // Podium emojis removidos de la tabla general
  function podiumEmoji(place) {
    return '';
  }
  let posicion = 1;
  let prevPuntos = null;
  let repeticiones = 0;
  // Calcular máximo y mínimo de puntos para gradiente
  const puntosArray = jugadoresOrdenados.map(([_, m]) => m.puntos);
  const maxPuntos = Math.max(...puntosArray);
  const minPuntos = Math.min(...puntosArray);
  // Precalcular partidos con gol por jugador (evita filtrar por jugador cada vez)
  const dataRowsAll = window.dataRowsOriginal || [];
  const idxJug = window.idxJugador;
  const idxGol = window.idxGoles;
  const partidosConGol = {};
  if (idxJug!=null && idxGol!=null) {
    for (const r of dataRowsAll) {
      const j = r[idxJug];
      const g = Number(r[idxGol])||0;
  if (!partidosConGol[j]) partidosConGol[j] = 0;
  if (g > 0) partidosConGol[j]++;
    }
  }
  jugadoresOrdenados.forEach(([jugador, m], idx) => {
    if (prevPuntos !== null && m.puntos === prevPuntos) {
      repeticiones++;
    } else {
      if (idx !== 0) {
        posicion++;
      }
      repeticiones = 1;
    }
    prevPuntos = m.puntos;
    const promPuntos = m.partidos ? (m.puntos / m.partidos).toFixed(1) : '0.0';
    const promGoles = m.partidos ? (m.goles / m.partidos).toFixed(1) : '0.0';
    const porcentajeVictorias = m.partidos ? Math.round((m.ganados / m.partidos) * 100) + '%' : '0%';
    const porcentajePresencias = partidosTotales ? Math.round((m.partidos / partidosTotales) * 100) + '%' : '0%';
    let rendimiento = '';
    if (ultimosResultados && ultimosResultados[jugador]) {
      rendimiento = ultimosResultados[jugador].map(resultadoAEmoji).join(' ');
    }
    let goleometro = '';
    if (ultimosGoles && ultimosGoles[jugador]) {
      goleometro = ultimosGoles[jugador].map(golesAColor).join(' ');
    }
    let claseTop = '';
    if (posicion === 1) claseTop = 'top1';
    else if (posicion === 2) claseTop = 'top2';
    else if (posicion === 3) claseTop = 'top3';
    const rowDelay = (idx * 0.04).toFixed(2);

    // --- Imagen del jugador ---
    // Formatear nombre: quitar tildes, espacios, pasar a camelCase para el archivo
    function normalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}
    const nombreArchivo = 'jugador-' + normalizarNombre(jugador) + '.png';
    const rutaImg = `img/jugadores/${nombreArchivo}`;
    const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
    // Imagen con fallback
    const imgHtml = `<img src="${rutaImg}" alt="${jugador}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;

  html += `<tr style=\"--row-delay:${rowDelay}s\">`;
  // Posición primero, avatar después
  html += `<td class=\"${claseTop}\">${posicion}</td>`;
  html += `<td style='text-align:center;'>${imgHtml}</td>`;
  html += `<td>${jugador}</td>`;
  // Puntos sin podio
  html += `<td class='puntos'>${m.puntos}</td>`;
    html += `<td class='col-g'>${m.ganados}</td><td class='col-e'>${m.empatados}</td><td class='col-p'>${m.perdidos}</td>`;
  // Partidos (presencias) sin podio
  html += `<td>${m.partidos}</td>`;
  // Goles sin podio
  html += `<td>${m.goles}</td>`;
    // Efectividad de gol: % de partidos en los que marcó >=1 gol
    let efectGolPctNum = 0;
    if (m.partidos>0) {
      const pcg = partidosConGol[jugador]||0;
      efectGolPctNum = Math.round((pcg / m.partidos)*100);
    }
    const efectGolStr = efectGolPctNum + '%';
    html += `<td class='${clasePorcentaje(efectGolPctNum)}' title='Partidos con al menos un gol / Partidos jugados'>${efectGolStr}</td>`;
    html += `<td class='${claseDifGol(Number(m.difGol||0))}'>${m.difGol || 0}</td>`;
    html += `<td class='${clasePorcentaje(Number(porcentajeVictorias.replace('%','')))}'>${porcentajeVictorias}</td>`;
    html += `<td class='${clasePorcentaje(Number(porcentajePresencias.replace('%','')))}'>${porcentajePresencias}</td>`;
    html += `<td>${promPuntos}</td><td>${promGoles}</td><td>${rendimiento}</td><td>${goleometro}</td></tr>`;
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;

  // --- INYECTAR ESTILOS SUTILES PARA COLUMNAS G/E/P Y PORCENTAJES ---
  if (!document.getElementById('estilos-col-g-e-p')) {
    const style = document.createElement('style');
    style.id = 'estilos-col-g-e-p';
    style.textContent = `
      th.col-g, td.col-g { background: rgba(60, 180, 75, 0.08) !important; }
      th.col-e, td.col-e { background: rgba(180, 180, 180, 0.10) !important; }
      th.col-p, td.col-p { background: rgba(220, 50, 50, 0.09) !important; }
      /* Porcentajes solo color de texto, sin fondo */
      td.pct-rojo { background: none !important; color: #b71c1c; font-weight: 600; }
      td.pct-amarillo { background: none !important; color: #b59f00; font-weight: 600; }
      td.pct-verde-claro { background: none !important; color: #388e3c; font-weight: 600; }
      td.pct-verde { background: none !important; color: #1b5e20; font-weight: 700; }
      /* PUNTOS protagonista sutil */
      th.col-puntos, td.col-puntos {
        /* El fondo ahora se setea inline por fila */
        font-weight: 700 !important;
        color: #232323 !important;
        font-size: 1.08em !important;
        border-left: 2px solid #ffe08255 !important;
        transition: background 0.4s;
      }
    `;
    document.head.appendChild(style);
  }
  // --- Agregar estilos sutiles para columnas G, E, P ---
  const styleId = 'tabla-general-colores-gep';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .col-g { background: rgba(60, 180, 75, 0.10) !important; }
      .col-e { background: rgba(180, 180, 180, 0.10) !important; }
      .col-p { background: rgba(220, 50, 50, 0.10) !important; }
      th.col-g { background: rgba(60, 180, 75, 0.18) !important; }
      th.col-e { background: rgba(180, 180, 180, 0.18) !important; }
      th.col-p { background: rgba(220, 50, 50, 0.18) !important; }
    `;
    document.head.appendChild(style);
  }
}

function contarVecesGoleadorDelPartido(jugador, dataRows, idxFecha, idxJugador, idxGoles) {
  // Agrupar partidos por fecha
  const partidosPorFecha = {};
  dataRows.forEach(cols => {
    const fecha = cols[idxFecha];
    if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
    partidosPorFecha[fecha].push(cols);
  });
  let contador = 0;
  Object.values(partidosPorFecha).forEach(partido => {
    // Buscar el máximo de goles en ese partido
    let maxGoles = Math.max(...partido.map(cols => Number(cols[idxGoles]) || 0));
    if (maxGoles === 0) return; // Si nadie hizo goles, no cuenta
    // Ver si el jugador fue uno de los máximos goleadores
    const esGoleador = partido.some(cols => cols[idxJugador] === jugador && Number(cols[idxGoles]) === maxGoles);
    if (esGoleador) contador++;
  });
  return contador;
}

function renderTablaGoleadores(metricasPorJugador) {
  const tablaDiv = document.getElementById('tablaGoleadores');
  if (!tablaDiv) return;

  // Crear o seleccionar el contenedor superior (igual que en Tabla General)
  let contenedorSuperior = document.getElementById('contenedorSuperiorTablaGoleadores');
  if (!contenedorSuperior) {
    contenedorSuperior = document.createElement('div');
    contenedorSuperior.id = 'contenedorSuperiorTablaGoleadores';
    contenedorSuperior.style.display = 'flex';
    contenedorSuperior.style.flexDirection = 'column';
    contenedorSuperior.style.alignItems = 'center';
    contenedorSuperior.style.marginBottom = '1em';
    tablaDiv.parentNode.insertBefore(contenedorSuperior, tablaDiv);
  }

  // --- Eliminado el título duplicado de la tabla de goleadores ---
  // let titulo = document.getElementById('tituloTablaGoleadores');
  // if (!titulo) {
  //   titulo = document.createElement('div');
  //   titulo.id = 'tituloTablaGoleadores';
  //   titulo.innerHTML = '<h2 style="color:#ffd700;text-align:center;margin-bottom:0.5em;">Tabla de Goleadores</h2>';
  //   contenedorSuperior.appendChild(titulo);
  // }

  // Filtro de partidos mínimos (centrado debajo del título)
  let filtroDiv = document.getElementById('filtroPartidosMinimosGoleadores');
  if (!filtroDiv) {
    filtroDiv = document.createElement('div');
    filtroDiv.id = 'filtroPartidosMinimosGoleadores';
    filtroDiv.style.display = 'flex';
    filtroDiv.style.justifyContent = 'center';
    filtroDiv.style.alignItems = 'center';
    filtroDiv.style.margin = '0 0 1em 0';
    contenedorSuperior.appendChild(filtroDiv);
  } else {
    filtroDiv.style.alignItems = 'center';
  }
  // Mantener el valor del input entre renderizados
  // Valor por defecto cambiado de 0 a 5 (goleadores)
  // Restaurar desde localStorage si existe
  let partidosMinimos = 5;
  try {
    const saved = localStorage.getItem('minPartidosGoleadores');
    if (saved !== null && saved !== '' && !Number.isNaN(Number(saved))) partidosMinimos = Number(saved);
  } catch(_) {}
  const inputExistente = filtroDiv.querySelector('#inputPartidosMinimosGoleadores');
  if (inputExistente) {
    partidosMinimos = Number(inputExistente.value) || 0;
  } else {
  partidosMinimos = 5;
  }
  filtroDiv.innerHTML = `
    <label for="inputPartidosMinimosGoleadores" style="font-size:1.15em;"><b>Partidos mínimos jugados:</b></label>
    <input type="number" id="inputPartidosMinimosGoleadores" min="0" value="${partidosMinimos}" style="width:60px;margin-left:0.5em;height:2.1em;font-size:1.15em;text-align:center;vertical-align:middle;">
  `;
  const inputMin = filtroDiv.querySelector('#inputPartidosMinimosGoleadores');
  inputMin.value = partidosMinimos;
  inputMin.oninput = function() {
  try { localStorage.setItem('minPartidosGoleadores', String(this.value)); } catch(_) {}
    renderTablaGoleadores(metricasPorJugador);
  };

  // Siempre aplicar modo compacto a la tabla de goleadores
  const tablaCont = tablaDiv.closest('.tabla');
  if (tablaCont && !tablaCont.classList.contains('compact')) {
    tablaCont.classList.add('compact');
  }

  // Obtener índices y dataRows para el cálculo
  const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
  const idxFecha = window.idxFecha;
  const idxJugador = window.idxJugador;
  const idxGoles = window.idxGoles;

  // Encabezados simplificados, columna Goles con clase especial
  // Reordenado: posición luego avatar
  let html = '<table><thead><tr><th>#</th><th style="width:44px"></th><th>Jugador</th><th class="col-goles">Goles</th><th>PJ</th><th>Veces goleador</th><th>GxP</th><th>Dif. Gol</th><th>Efect. Gol</th></tr></thead><tbody>';
  // Filtrar por partidos mínimos
  const jugadoresFiltrados = Object.entries(metricasPorJugador).filter(([_, m]) => m.partidos >= partidosMinimos);
  // Ordenar por goles totales de forma decreciente
  const jugadoresOrdenados = jugadoresFiltrados.sort((a, b) => b[1].goles - a[1].goles);
  let posicion = 1;
  let prevGoles = null;
  let repeticiones = 0;
  // Calcular máximo de goles para la barra
  const maxGoles = Math.max(...jugadoresOrdenados.map(([_, m]) => m.goles));
  jugadoresOrdenados.forEach(([jugador, m], idx) => {
    if (prevGoles !== null && m.goles === prevGoles) {
      repeticiones++;
    } else {
      if (idx !== 0) {
        posicion++;
      }
      repeticiones = 1;
    }
    prevGoles = m.goles;
    const golesPorPartido = m.partidos ? (m.goles / m.partidos).toFixed(1) : '0.0';
    const vecesGoleador = contarVecesGoleadorDelPartido(jugador, dataRows, idxFecha, idxJugador, idxGoles);
    const efectividadGol = calcularEfectividadGoles(jugador, dataRows, idxJugador, idxGoles);
    const rowDelay = (idx * 0.04).toFixed(2);
    let claseTop = '';
    if (posicion === 1) claseTop = 'top1';
    else if (posicion === 2) claseTop = 'top2';
    else if (posicion === 3) claseTop = 'top3';

    // --- Imagen del jugador (igual que en tabla general) ---
    function normalizarNombre(nombre) {
      return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]/g, '');
    }
    const nombreArchivo = 'jugador-' + normalizarNombre(jugador) + '.png';
    const rutaImg = `img/jugadores/${nombreArchivo}`;
    const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
    const imgHtml = `<img src="${rutaImg}" alt="${jugador}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;

    // Barra horizontal proporcional con número separado (evita superposición)
    const barraWidth = maxGoles > 0 ? Math.round((m.goles / maxGoles) * 100) : 0;
  const GOLES_BAR_MODE = 'outside-left'; // 'inside' o 'outside-left'
    let barraHTML = '';
    if (GOLES_BAR_MODE === 'inside') {
      barraHTML = `
        <div class="goles-bar-wrapper mode-inside" title="${m.goles} goles (máx ${maxGoles})">
          <div class="goles-bar-track">
            <div class="goles-bar-fill" style="width:${barraWidth}%;"></div>
            <span class="goles-bar-num inside">${m.goles}</span>
          </div>
        </div>`;
    } else {
      // outside-left
      barraHTML = `
        <div class="goles-bar-wrapper mode-outside-left" title="${m.goles} goles (máx ${maxGoles})">
          <span class="goles-bar-num static-outside">${m.goles}</span>
          <div class="goles-bar-track">
            <div class="goles-bar-fill" style="width:${barraWidth}%;"></div>
          </div>
        </div>`;
    }
  html += `<tr style=\"--row-delay:${rowDelay}s\">`;
  html += `<td class=\"${claseTop}\">${posicion}</td>`;
  html += `<td style='text-align:center;'>${imgHtml}</td>`;
  html += `<td>${jugador}</td><td class=\"col-goles\">${barraHTML}</td><td>${m.partidos}</td><td>${vecesGoleador}</td><td class='${claseGxP(Number(golesPorPartido))}'>${golesPorPartido}</td><td class='${claseDifGol(Number(m.difGol||0))}'>${m.difGol || 0}</td><td class='${clasePorcentaje(Number(efectividadGol))}'>${efectividadGol}%</td></tr>`;
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;

  // --- INYECTAR ESTILOS PARA LA COLUMNA DE GOLES ---
  const estiloGoles = document.getElementById('estilos-col-goles');
  if (estiloGoles) {
    estiloGoles.remove();
  }
}

function renderTribunalAsistencias(dataRows, idxJugador, idxFecha) {
  const tablaDiv = document.getElementById('tablaTribunalAsistencias');
  if (!tablaDiv) return;

  // --- Contenedor superior (para filtro) ---
  let contenedorSuperior = document.getElementById('contenedorSuperiorPresencias');
  if (!contenedorSuperior) {
    contenedorSuperior = document.createElement('div');
    contenedorSuperior.id = 'contenedorSuperiorPresencias';
    contenedorSuperior.style.display = 'flex';
    contenedorSuperior.style.flexDirection = 'column';
    contenedorSuperior.style.alignItems = 'center';
    contenedorSuperior.style.marginBottom = '1em';
    // Insertar antes de la tabla de presencias
    tablaDiv.parentNode.insertBefore(contenedorSuperior, tablaDiv);
  }

  // --- Filtro de partidos mínimos (presencias) ---
  let filtroDiv = document.getElementById('filtroPartidosMinimosPresencias');
  if (!filtroDiv) {
    filtroDiv = document.createElement('div');
    filtroDiv.id = 'filtroPartidosMinimosPresencias';
    filtroDiv.style.display = 'flex';
    filtroDiv.style.justifyContent = 'center';
    filtroDiv.style.alignItems = 'center';
    filtroDiv.style.margin = '0 0 1em 0';
    contenedorSuperior.appendChild(filtroDiv);
  } else {
    filtroDiv.style.alignItems = 'center';
  }
  let partidosMinimosPres = 5; // valor por defecto 5 (igual que otras pestañas)
  try {
    const saved = localStorage.getItem('minPartidosPresencias');
    if (saved !== null && saved !== '' && !Number.isNaN(Number(saved))) partidosMinimosPres = Number(saved);
  } catch(_) {}
  const inputExistentePres = filtroDiv.querySelector('#inputPartidosMinimosPresencias');
  if (inputExistentePres) {
    partidosMinimosPres = Number(inputExistentePres.value) || 0;
  } else {
    partidosMinimosPres = 5;
  }
  filtroDiv.innerHTML = `
    <label for="inputPartidosMinimosPresencias" style="font-size:1.05em;"><b>Partidos mínimos jugados:</b></label>
    <input type="number" id="inputPartidosMinimosPresencias" min="0" value="${partidosMinimosPres}" style="width:60px;margin-left:0.5em;height:2em;font-size:1.05em;text-align:center;vertical-align:middle;">
  `;
  const inputMinPres = filtroDiv.querySelector('#inputPartidosMinimosPresencias');
  inputMinPres.value = partidosMinimosPres;
  inputMinPres.oninput = () => { try { localStorage.setItem('minPartidosPresencias', String(inputMinPres.value)); } catch(_) {} renderTribunalAsistencias(dataRows, idxJugador, idxFecha); };

  // Obtener todas las fechas únicas y ordenarlas cronológicamente
  const fechas = Array.from(new Set(dataRows.map(cols => cols[idxFecha])));

  // Obtener todos los jugadores únicos
  const jugadores = Array.from(new Set(dataRows.map(cols => cols[idxJugador])));

  // Crear un mapa: jugador -> Set de fechas en las que estuvo presente
  const presenciasPorJugador = {};
  jugadores.forEach(jugador => {
    presenciasPorJugador[jugador] = new Set();
  });
  dataRows.forEach(cols => {
    const jugador = cols[idxJugador];
    const fecha = cols[idxFecha];
    presenciasPorJugador[jugador].add(fecha);
  });

  // Crear un array de objetos para ordenar por % de asistencias
  let jugadoresConAsistencias = jugadores.map(jugador => {
    const asistencias = presenciasPorJugador[jugador].size;
    const total = fechas.length;
    const porcentaje = total > 0 ? (asistencias / total) : 0;
    return { jugador, asistencias, total, porcentaje };
  });

  // Filtrar por partidos mínimos (presencias)
  jugadoresConAsistencias = jugadoresConAsistencias.filter(j => j.asistencias >= partidosMinimosPres);

  // Ordenar de mayor a menor % de asistencias
  jugadoresConAsistencias.sort((a, b) => b.porcentaje - a.porcentaje);

  // Renderizar la tabla con columna de posición a la izquierda
  let html = '<table>';
  html += '<thead>';
  html += '<tr>';
  html += '<th rowspan="2" class="col-pos" title="Ranking">#</th>';
  html += '<th style="width:44px" rowspan="2"></th>';
  html += '<th rowspan="2">Jugador</th>';
  html += '<th rowspan="2" title="Asistencias y porcentaje sobre total">Asist. / %</th>';
  html += `<th colspan="${fechas.length}">Historial de Presencias</th>`;
  html += '</tr>';
  // Fila de fechas (placeholders para las 5 columnas con rowspan)
  html += '<tr>';
  for (let i = 0; i < 5; i++) html += '<th style="display:none"></th>';
  fechas.forEach(fecha => {
    html += `<th style="font-size:0.9em;white-space:nowrap;writing-mode:vertical-lr;transform:rotate(180deg);padding:2px 0;max-width:1.5em;color:var(--color-secundario);">${fecha}</th>`;
  });
  html += '</tr>';
  html += '</thead><tbody>';
  let posicion = 1;
  let prevPorc = null;
  let repeticiones = 0;
  jugadoresConAsistencias.forEach(({ jugador, asistencias, total, porcentaje }, idx) => {
    if (prevPorc !== null && porcentaje === prevPorc) {
      repeticiones++;
    } else {
      if (idx !== 0) {
        posicion++;
      }
      repeticiones = 1;
    }
    prevPorc = porcentaje;
    const porcentajeNum = total > 0 ? Math.round(porcentaje * 100) : 0;
    const porcentajeStr = porcentajeNum + '%';
    const rowDelay = (idx * 0.04).toFixed(2);
    let claseTop = '';
    if (posicion === 1) claseTop = 'top1';
    else if (posicion === 2) claseTop = 'top2';
    else if (posicion === 3) claseTop = 'top3';

    // Imagen del jugador (igual que en las otras tablas)
    function normalizarNombre(nombre) {
      return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]/g, '');
    }
    const nombreArchivo = 'jugador-' + normalizarNombre(jugador) + '.png';
    const rutaImg = `img/jugadores/${nombreArchivo}`;
    const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
    const imgHtml = `<img src="${rutaImg}" alt="${jugador}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;

  html += `<tr style="--row-delay:${rowDelay}s">`;
  html += `<td class="${claseTop}" style='text-align:center;'>${posicion}</td>`;
  html += `<td style='text-align:center;'>${imgHtml}</td>`;
  html += `<td>${jugador}</td>`;
  html += `<td class="${clasePorcentaje(porcentajeNum)}">${asistencias} de ${total} <span style='opacity:.75;font-weight:600;'>(${porcentajeStr})</span></td>`;
    fechas.forEach(fecha => {
      if (presenciasPorJugador[jugador].has(fecha)) {
        html += '<td style="text-align:center;">🟢</td>';
      } else {
        html += '<td style="text-align:center;">🔴</td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
  // Aseguramos que el botón de modo compacto se agregue correctamente después de renderizar la tabla
  setTimeout(() => agregarBotonModoTabla(tablaDiv), 0);
}

function renderHistorialPartidos(dataRows, idxFecha, idxJugador, idxGoles, idxPuntos) {
  const detalleDiv = document.getElementById('detallePartido');
  if (!detalleDiv) return;

  // Agrupar partidos por fecha
  const partidosPorFecha = {};
  dataRows.forEach(cols => {
    const fecha = cols[idxFecha];
    if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
    partidosPorFecha[fecha].push(cols);
  });
  const fechas = Object.keys(partidosPorFecha);

  // Función para crear el selector dinámicamente
  function crearSelector(fechaActual) {
    const select = document.createElement('select');
    select.id = 'selectorPartido';
    fechas.forEach(fecha => {
      const option = document.createElement('option');
      option.value = fecha;
      option.textContent = fecha;
      if (fecha === fechaActual) option.selected = true;
      select.appendChild(option);
    });
    return select;
  }

  // Función para mostrar el detalle de un partido como CARD (inyectando el selector dentro de la tarjeta)
  function mostrarDetalle(fecha) {
    const partido = partidosPorFecha[fecha];
    if (!partido) { detalleDiv.innerHTML = ''; return; }
    // Separar ganadores, perdedores y empatados
    const ganadores = partido.filter(cols => Number(cols[idxPuntos]) === 3);
    const perdedores = partido.filter(cols => Number(cols[idxPuntos]) === 0);
    const empatados = partido.filter(cols => Number(cols[idxPuntos]) === 1);
    // Índice de autogoles (puede ser -1 si no existe la columna)
    const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
    const suma = (arr, idx) => arr.reduce((a,c)=> a + Number(c[idx]||0), 0);
    const sumaAutogoles = (arr) => idxAutogoles>=0 ? arr.reduce((a,c)=> a + Number(c[idxAutogoles]||0), 0) : 0;

    // Cálculo de marcador REAL por equipo incorporando autogoles del rival.
    // Regla: marcadorEquipo = golesPropios + autogolesDelRival
    let golesGanadores = 0, golesPerdedores = 0;
    if (ganadores.length && perdedores.length) {
      const golesPropiosGanador = suma(ganadores, idxGoles);
      const golesPropiosPerdedor = suma(perdedores, idxGoles);
      const autoGanador = sumaAutogoles(ganadores);   // autogoles cometidos por ganadores (suman al perdedor)
      const autoPerdedor = sumaAutogoles(perdedores); // autogoles cometidos por perdedores (suman al ganador)
      golesGanadores = golesPropiosGanador + autoPerdedor;
      golesPerdedores = golesPropiosPerdedor + autoGanador;
    }
    // Empate: dividir en dos equipos artificiales manteniendo la lógica de autogoles cruzados
    let golesEquipo1 = 0, golesEquipo2 = 0;
    if (empatados.length) {
      const mitad = Math.ceil(empatados.length / 2);
      const equipo1 = empatados.slice(0, mitad);
      const equipo2 = empatados.slice(mitad);
      const golesPropiosEq1 = suma(equipo1, idxGoles);
      const golesPropiosEq2 = suma(equipo2, idxGoles);
      const autoEq1 = sumaAutogoles(equipo1);
      const autoEq2 = sumaAutogoles(equipo2);
      golesEquipo1 = golesPropiosEq1 + autoEq2; // autogoles del equipo2 benefician a equipo1
      golesEquipo2 = golesPropiosEq2 + autoEq1; // viceversa
    }

    // Calcular máximo de goles por equipo
    const maxGolesGanador = ganadores.length ? Math.max(...ganadores.map(cols => Number(cols[idxGoles]) || 0)) : 0;
    const maxGolesPerdedor = perdedores.length ? Math.max(...perdedores.map(cols => Number(cols[idxGoles]) || 0)) : 0;
    const maxGolesEmpatado = empatados.length ? Math.max(...empatados.map(cols => Number(cols[idxGoles]) || 0)) : 0;

    // Calcular máximo de goles de todo el partido
    const maxGolesPartido = partido.length ? Math.max(...partido.map(cols => Number(cols[idxGoles]) || 0)) : 0;
    // --- CARD MODERNA Y MINIMALISTA ---
    let html = `<div class="partidos-cards-container" style="display:flex;justify-content:center;align-items:center;">`;
    html += `<div class="partido-card" data-show="true" style="max-width:540px;width:100%;margin:0 auto;">`;
    // Inyectar el selector justo arriba del resultado
    html += `<div style='display:flex;justify-content:center;align-items:center;margin:0.5em 0 0.2em 0;'>`;
    html += `<label for='selectorPartido' style='color:#6cf;font-size:1.08em;margin-right:0.6em;'>Seleccioná una fecha:</label>`;
    html += `<span id='contenedorSelectorPartido'></span>`;
    html += `</div>`;
    html += `<div class="partido-card-header" style="display:flex;justify-content:center;align-items:center;margin-bottom:0.7em;">`;
    html += `<span class=\"partido-card-resultado\" style="
      font-size:2.2em;
      min-width:110px;
      text-align:center;
      display:block;
      margin:0 auto;
      font-weight:800;
      letter-spacing:2px;
      background: linear-gradient(90deg, #23263a 60%, #23263a00 100%);
      border-radius: 1em;
      box-shadow: 0 2px 12px #0003, 0 1px 0 #ffd70033;
      padding: 0.12em 0.5em 0.12em 0.5em;
      color: #fff;
      position:relative;
      z-index:2;
      text-shadow: 0 2px 8px #000a, 0 1px 0 #ffd70033;
      ">`;
    if (ganadores.length && perdedores.length) {
      // Mostrar marcador con tooltip de desglose si hay autogoles
      const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
      let detalleTooltip = '';
      if (idxAutogoles>=0) {
        const autoGanadores = ganadores.reduce((a,c)=> a + Number(c[idxAutogoles]||0), 0);
        const autoPerdedores = perdedores.reduce((a,c)=> a + Number(c[idxAutogoles]||0), 0);
        if (autoGanadores>0 || autoPerdedores>0) {
          detalleTooltip = `title="Desglose marcador: Ganador = Goles propios (${ganadores.reduce((a,c)=>a+Number(c[idxGoles]||0),0)}) + Autogoles rival (${autoPerdedores}) = ${golesGanadores}\nPerdedor = Goles propios (${perdedores.reduce((a,c)=>a+Number(c[idxGoles]||0),0)}) + Autogoles rival (${autoGanadores}) = ${golesPerdedores}"`;
        }
      }
      html += `<span ${detalleTooltip} style='cursor:default;display:inline-block;'>`;
      html += `<span style='font-weight:900;color:#4caf50;text-shadow:0 2px 8px #23263a,0 0 8px #4caf5040;'>${golesGanadores}</span> <span style='color:#ffd700;font-size:1.1em;text-shadow:0 1px 8px #ffd70099;'>-</span> <span style='font-weight:900;color:#d32f2f;text-shadow:0 2px 8px #23263a,0 0 8px #d32f2f40;'>${golesPerdedores}</span>`;
      html += `</span>`;
    } else if (empatados.length) {
      html += `<span style='font-weight:900;color:#ffd700;text-shadow:0 2px 8px #23263a,0 0 8px #ffd70099;'>${golesEquipo1}</span> <span style='color:#ffd700;font-size:1.1em;text-shadow:0 1px 8px #ffd70099;'>-</span> <span style='font-weight:900;color:#ffd700;text-shadow:0 2px 8px #23263a,0 0 8px #ffd70099;'>${golesEquipo2}</span>`;
    } else {
      html += `-`;
    }
    html += `</span>`;
    html += `</div>`;

    // Carteles de ganador/perdedor justo por encima de las tarjetas, sin "VS" ni divisor
    if (ganadores.length && perdedores.length) {
      html += `<div style=\"display:grid;grid-template-columns:1fr 1fr;justify-items:center;align-items:center;gap:0;margin:0.7em 0 0.2em 0;width:100%;max-width:540px;margin-left:auto;margin-right:auto;\">`;
      html += `<span class=\"partido-card-equipo ganador\" style=\"color:#4caf50;font-size:1.18em;font-weight:700;background:none;text-align:center;\">GANADOR</span>`;
      html += `<span class=\"partido-card-equipo\" style=\"color:#d32f2f;font-size:1.18em;font-weight:700;background:none;text-align:center;\">PERDEDOR</span>`;
      html += `</div>`;
    } else if (empatados.length) {
      // No cabecera extra, la fila de títulos irá junto a las columnas
    }
    // Jugadores en columnas separadas y visualmente diferenciadas
    html += `<div style=\"display:flex;gap:1.5em;justify-content:center;align-items:flex-start;flex-wrap:wrap;\">`;
    if (ganadores.length && perdedores.length) {
      // Ganadores
      html += `<div class="equipo-columna equipo-ganador" style="background:rgba(76,175,80,0.07);border-radius:12px;padding:0.7em 0.5em;min-width:140px;box-shadow:0 2px 8px #4caf5020;">`;
      ganadores.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
        const autogoles = idxAutogoles>=0 ? Number(cols[idxAutogoles]||0) : 0;
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src="${rutaImg}" alt="${nombre}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;
        // Medalla solo si es el goleador absoluto del partido
        const esGoleador = goles > 0 && goles === maxGolesPartido;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(76,175,80,0.13);color:#4caf50;display:flex;flex-direction:row;align-items:center;gap:0.5em;width:100%;\">`;
        html += imgHtml;
        // Ajuste: mayor ancho para el nombre y los goles, y permitir wrap
        html += `<span style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;min-width:0;width:100%;text-align:right;">`;
  html += `<span class="nombre-jugador" ${autogoles>0 ? `title="Autogoles: ${autogoles}"` : ''} style="white-space:normal;overflow:visible;text-overflow:unset;max-width:220px;display:block;order:1;text-align:right;font-size:1.08em;">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
        const iconosGoles = goles > 0 ? '<span class=\"icono-gol\" style=\"font-size:1em;\">⚽</span>'.repeat(goles) : '';
  const badgeAuto = autogoles>0 ? `<span class="badge-autogoles-resumen">${'<span class="icono-autogol"></span>'.repeat(autogoles)}</span>` : '';
        html += `<span class="partido-card-goles" style="color:#4caf50;margin-top:2px;display:block;order:2;text-align:right;font-size:1em;white-space:normal;word-break:break-word;">${iconosGoles}${badgeAuto}</span>`;
        html += `</span>`;
        html += `</span>`;
      });
      html += `</div>`;
      // Separador cancha
      html += `<div class=\"separador-vertical\"></div>`;
      // Perdedores
      html += `<div class=\"equipo-columna equipo-perdedor\" style=\"background:rgba(211,47,47,0.07);border-radius:12px;padding:0.7em 0.5em;min-width:140px;box-shadow:0 2px 8px #d32f2f20;\">`;
      perdedores.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
        const autogoles = idxAutogoles>=0 ? Number(cols[idxAutogoles]||0) : 0;
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src="${rutaImg}" alt="${nombre}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;
        // Medalla solo si es el goleador absoluto del partido
        const esGoleador = goles > 0 && goles === maxGolesPartido;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(211,47,47,0.13);color:#d32f2f;display:flex;flex-direction:row;align-items:flex-start;gap:0.5em;width:100%;\">`;
        html += imgHtml;
        html += `<span style=\"display:flex;flex-direction:column;align-items:flex-start;min-width:0;width:100%;\">`;
  html += `<span class="nombre-jugador" ${autogoles>0 ? `title="Autogoles: ${autogoles}"` : ''} style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;display:block;">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
  const iconosGoles = goles > 0 ? '<span class="icono-gol" style="font-size:0.95em;">⚽</span>'.repeat(goles) : '';
  const badgeAuto = autogoles>0 ? `<span class="badge-autogoles-resumen">${'<span class=\"icono-autogol\"></span>'.repeat(autogoles)}</span>` : '';
  if (goles > 0 || autogoles>0) html += `<span class="partido-card-goles" style="color:#d32f2f;margin-top:2px;display:block;font-size:0.95em;white-space:nowrap;">${iconosGoles}${badgeAuto}</span>`;
        html += `</span>`;
        html += `</span>`;
      });
      html += `</div>`;
    } else if (empatados.length) {
      // Empate: dos columnas lado a lado, separador y títulos EMPATE
      const mitad = Math.ceil(empatados.length / 2);
      const equipo1 = empatados.slice(0, mitad);
      const equipo2 = empatados.slice(mitad);
      // Títulos arriba de cada columna
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;justify-items:center;align-items:center;gap:0;margin:0.7em 0 0.2em 0;width:100%;max-width:540px;margin-left:auto;margin-right:auto;">`;
      html += `<span class="partido-card-equipo" style="color:#ffd700;font-size:1.18em;font-weight:700;background:none;text-align:center;">EMPATE</span>`;
      html += `<span class="partido-card-equipo" style="color:#ffd700;font-size:1.18em;font-weight:700;background:none;text-align:center;">EMPATE</span>`;
      html += `</div>`;
      // Columnas y separador
      html += `<div class="partido-card-equipos">`;
      html += `<div class="equipo-columna equipo-empate">`;
      equipo1.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
        const autogoles = idxAutogoles>=0 ? Number(cols[idxAutogoles]||0) : 0;
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src=\"${rutaImg}\" alt=\"${nombre}\" onerror=\"this.onerror=null;this.src='${rutaImgVacia}';\" style=\"width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;\">`;
        const esGoleador = goles > 0 && goles === maxGolesPartido;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(255,215,0,0.13);color:#ffd700;display:flex;flex-direction:row-reverse;align-items:center;gap:0.5em;width:100%;\">`;
        html += imgHtml;
        html += `<span style=\"display:flex;flex-direction:column;align-items:flex-end;justify-content:center;min-width:0;width:100%;text-align:right;\">`;
  html += `<span class="nombre-jugador" ${autogoles>0 ? `title="Autogoles: ${autogoles}"` : ''} style="white-space:normal;overflow:visible;text-overflow:unset;max-width:220px;display:block;order:1;text-align:right;font-size:1.08em;">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
  const iconosGoles = goles > 0 ? '<span class="icono-gol" style="font-size:1em;">⚽</span>'.repeat(goles) : '';
  const badgeAuto = autogoles>0 ? `<span class="badge-autogoles-resumen">${'<span class=\"icono-autogol\"></span>'.repeat(autogoles)}</span>` : '';
  html += `<span class="partido-card-goles" style="color:#ffd700;margin-top:2px;display:block;order:2;text-align:right;font-size:1em;white-space:normal;word-break:break-word;">${iconosGoles}${badgeAuto}</span>`;
        html += `</span>`;
        html += `</span>`;
      });
      html += `</div>`;
      html += `<div class=\"separador-vertical\"></div>`;
      html += `<div class="equipo-columna equipo-empate">`;
      equipo2.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
        const autogoles = idxAutogoles>=0 ? Number(cols[idxAutogoles]||0) : 0;
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src=\"${rutaImg}\" alt=\"${nombre}\" onerror=\"this.onerror=null;this.src='${rutaImgVacia}';\" style=\"width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;\">`;
        const esGoleador = goles > 0 && goles === maxGolesPartido;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(255,215,0,0.13);color:#ffd700;display:flex;align-items:center;gap:0.5em;\">`;
        html += imgHtml;
        html += `<span style=\"display:flex;flex-direction:column;align-items:flex-start;min-width:0;\">`;
  html += `<span class="nombre-jugador" ${autogoles>0 ? `title="Autogoles: ${autogoles}"` : ''} style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;display:block;">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
  const iconosGoles = goles > 0 ? '<span class="icono-gol">⚽</span>'.repeat(goles) : '';
  const badgeAuto = autogoles>0 ? `<span class="badge-autogoles-resumen">${'<span class=\"icono-autogol\"></span>'.repeat(autogoles)}</span>` : '';
  if (goles > 0 || autogoles>0) html += `<span class="partido-card-goles" style="color:#ffd700;margin-top:2px;word-break:break-all;">${iconosGoles}${badgeAuto}</span>`;
        html += `</span>`;
        html += `</span>`;
      });
      html += `</div>`;
      html += `</div>`;
    }
    html += `</div>`; // cierre flex equipos
    html += `</div>`; // .partido-card
    html += `</div>`; // .partidos-cards-container
    detalleDiv.innerHTML = html;
    // Inyectar el selector real en el contenedor
    const contenedorSelector = detalleDiv.querySelector('#contenedorSelectorPartido');
    if (contenedorSelector) {
      const selectorNuevo = crearSelector(fecha);
      contenedorSelector.appendChild(selectorNuevo);
      selectorNuevo.onchange = e => mostrarDetalle(e.target.value);
    }
    // Forzar animación (reflow)
    setTimeout(() => {
      const card = detalleDiv.querySelector('.partido-card');
      if(card) card.setAttribute('data-show','true');
    }, 10);
  }

  // Mostrar el último partido por defecto
  if (fechas.length > 0) mostrarDetalle(fechas[fechas.length - 1]);
}

// === HISTORIAL: CALENDARIO ===
function renderHistorialCalendario(dataRows, idxFecha, navState) {
  const cont = document.getElementById('historialCalendarioContainer');
  if (!cont) return;
  const nav = document.getElementById('historialCalendarioNav');
  // Agrupar por fecha (clave original) y también por fecha normalizada yyyymmdd
  const porFecha = {};
  dataRows.forEach(cols => {
    const f = cols[idxFecha];
    if (!porFecha[f]) porFecha[f] = [];
    porFecha[f].push(cols);
  });
  const fechas = Object.keys(porFecha);
  // Mapear clave normalizada -> filas y mantener clave original para esa normalizada
  function parseFechaGen(f) {
    const d = f.split(/[\/-]/).map(n=>parseInt(n,10)); // dd-mm-yy
    let [dd,mm,yy] = d;
    if (yy < 100) yy = 2000 + yy;
    return new Date(yy, mm-1, dd);
  }
  const porFechaNorm = {};
  const originalKeyForNorm = {};
  fechas.forEach(k => {
    const dt = parseFechaGen(k);
    if (!isNaN(dt)) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth()+1).padStart(2,'0');
      const d = String(dt.getDate()).padStart(2,'0');
      const norm = `${y}${m}${d}`;
      porFechaNorm[norm] = porFecha[k];
      originalKeyForNorm[norm] = k;
    }
  });
  if (fechas.length === 0) {
    if (nav) nav.innerHTML = '';
    cont.innerHTML = '<div style="text-align:center;color:#b0b0b0;">No hay partidos en el período seleccionado.</div>';
    return;
  }
  // Intentar detectar mes/año dominante de las fechas
  // parseFechaGen ya definido arriba
  const fechasDate = fechas.map(parseFechaGen).sort((a,b)=>a-b);
  let base;
  if (navState && typeof navState.year==='number' && typeof navState.month==='number') {
    base = new Date(navState.year, navState.month, 1);
  } else {
    base = fechasDate[fechasDate.length-1]; // mes del último partido por defecto
  }
  const year = base.getFullYear();
  const month = base.getMonth();
  const primerDiaMes = new Date(year, month, 1);
  const ultimoDiaMes = new Date(year, month+1, 0);
  const inicioGrid = new Date(primerDiaMes);
  inicioGrid.setDate(primerDiaMes.getDate() - ((primerDiaMes.getDay()+6)%7)); // semana inicia lunes
  const finGrid = new Date(ultimoDiaMes);
  finGrid.setDate(ultimoDiaMes.getDate() + (6 - ((ultimoDiaMes.getDay()+6)%7)));
  // Cabecera mes
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  // Nav superior
  if (nav) {
    const aniosSet = new Set(fechasDate.map(d=>d.getFullYear()));
    // Asegurar que el año actualmente visualizado exista en el selector
    if (!aniosSet.has(year)) aniosSet.add(year);
    const anios = Array.from(aniosSet).sort((a,b)=>a-b);
    const mesesOpts = meses.map((m,i)=>`<option value="${i}" ${i===month?'selected':''}>${m}</option>`).join('');
    const aniosOpts = anios.map(a=>`<option value="${a}" ${a===year?'selected':''}>${a}</option>`).join('');
    nav.innerHTML = `
      <button id="calPrevBtn">◀</button>
      <select id="calMesSelect">${mesesOpts}</select>
      <select id="calAnioSelect">${aniosOpts}</select>
      <button id="calNextBtn">▶</button>
    `;
    const setState = (y,m)=>renderHistorialCalendario(dataRows, idxFecha, {year:y, month:m});
    document.getElementById('calPrevBtn').onclick = ()=>{
      const d = new Date(year, month-1, 1);
      setState(d.getFullYear(), d.getMonth());
    };
    document.getElementById('calNextBtn').onclick = ()=>{
      const d = new Date(year, month+1, 1);
      setState(d.getFullYear(), d.getMonth());
    };
    document.getElementById('calMesSelect').onchange = (e)=>{
      setState(year, parseInt(e.target.value,10));
    };
    document.getElementById('calAnioSelect').onchange = (e)=>{
      setState(parseInt(e.target.value,10), month);
    };
  }

  let html = '';
  html += `<div class="historial-cal-header"><div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div></div>`;
  html += `<div class="historial-cal-grid">`;
  for (let d = new Date(inicioGrid); d <= finGrid; d.setDate(d.getDate()+1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    const norm = `${yyyy}${mm}${dd}`;
    const filas = porFechaNorm[norm];
    const fueraMes = d.getMonth() !== month;
    const clases = ['historial-cal-day'];
    if (filas && filas.length) clases.push('partido');
    if (fueraMes) clases.push('fuera-mes');
    const originalKey = filas ? (originalKeyForNorm[norm] || '') : '';
    html += `<div class=\"${clases.join(' ')}\" data-fecha=\"${originalKey}\">`;
    html += `<span class="fecha-label">${d.getDate()}</span>`;
    if (filas) {
      // Calcular marcador global con autogoles para mostrar (si hay victoria/empate)
      let marcador = '';
      try {
        const idxPuntos = window.idxPuntos, idxGoles = window.idxGoles, idxAutogoles = typeof window.idxAutogoles==='number'?window.idxAutogoles:-1;
        const ganadores = filas.filter(c=>Number(c[idxPuntos])===3);
        const perdedores = filas.filter(c=>Number(c[idxPuntos])===0);
        const empatados = filas.filter(c=>Number(c[idxPuntos])===1);
        const suma = (arr, idx)=>arr.reduce((a,c)=>a+Number(c[idx]||0),0);
        const sumaAuto = (arr)=> idxAutogoles>=0? arr.reduce((a,c)=>a+Number(c[idxAutogoles]||0),0):0;
        if (ganadores.length && perdedores.length) {
          const gProp = suma(ganadores, idxGoles), pProp = suma(perdedores, idxGoles);
          const gAuto = sumaAuto(ganadores), pAuto = sumaAuto(perdedores);
          const g = gProp + pAuto; const p = pProp + gAuto;
          marcador = `${g}-${p}`;
        } else if (empatados.length) {
          const mitad = Math.ceil(empatados.length/2);
          const eq1 = empatados.slice(0,mitad), eq2 = empatados.slice(mitad);
          const e1 = suma(eq1, idxGoles) + sumaAuto(eq2);
          const e2 = suma(eq2, idxGoles) + sumaAuto(eq1);
          marcador = `${e1}-${e2}`;
        }
      } catch(_) {}
      // Mostrar marcador centrado y lista de ganadores; sin badge de cantidad de jugadores
      if (marcador) html += `<span class=\"cal-res\">${marcador}</span>`;
      // Lista de ganadores (nombres abreviados) si hubo un ganador claro
      try {
        const idxPuntos = window.idxPuntos, idxJugador = window.idxJugador;
        const idxGoles = window.idxGoles, idxAutogoles = typeof window.idxAutogoles==='number'?window.idxAutogoles:-1;
        const ganadores = filas.filter(c=>Number(c[idxPuntos])===3);
        const perdedores = filas.filter(c=>Number(c[idxPuntos])===0);
        const empatados = filas.filter(c=>Number(c[idxPuntos])===1);
        if (ganadores.length && perdedores.length) {
          // Mostrar nombres ordenados por goles desc (propios)
          const jugadoresOrd = [...ganadores].sort((a,b)=>Number(b[idxGoles]||0)-Number(a[idxGoles]||0));
          const nombres = jugadoresOrd.map(r => (r[idxJugador]||'').toString().trim()).filter(Boolean);
          const abreviado = nombres.map(n=> n.length>10? n.slice(0,9)+'…':n).join(' · ');
          if (abreviado) html += `<div class=\"cal-ganadores\" title=\"${nombres.join(', ')}\">${abreviado}</div>`;
        } else if (empatados.length && filas.length>0) {
          // Empate: mostrar top goleadores del empate
          const topG = [...empatados].sort((a,b)=>Number(b[idxGoles]||0)-Number(a[idxGoles]||0)).slice(0,3);
          const nombres = topG.map(r => (r[idxJugador]||'').toString().trim()).filter(Boolean);
          const abreviado = nombres.map(n=> n.length>10? n.slice(0,9)+'…':n).join(' · ');
          if (abreviado) html += `<div class=\"cal-ganadores\" title=\"Máx goleadores: ${nombres.join(', ')}\">${abreviado}</div>`;
        }
      } catch(_) {}
    }
    html += `</div>`;
  }
  html += `</div>`;
  cont.innerHTML = html;
  // Click handlers: cuando hay partido, cambiar a submenú Partidos y mostrar detalle
  cont.querySelectorAll('.historial-cal-day.partido').forEach(el => {
    el.addEventListener('click', () => {
      const fecha = el.getAttribute('data-fecha');
      const btnPart = document.getElementById('historialTabPartidosBtn');
      const btnCal = document.getElementById('historialTabCalendarioBtn');
      const tabPart = document.getElementById('historialTabPartidos');
      const tabCal = document.getElementById('historialTabCalendario');
      if (btnPart && btnCal && tabPart && tabCal) {
        btnPart.classList.add('active');
        btnCal.classList.remove('active');
        tabPart.style.display = 'block';
        tabCal.style.display = 'none';
      }
      // Reutilizar renderHistorialPartidos y seleccionar la fecha clickeada
      const detalleDiv = document.getElementById('detallePartido');
      if (!detalleDiv) return;
      // Simple: disparar un cambio del selector si existe, si no, re-render y luego seleccionar
      const select = document.getElementById('selectorPartido');
      if (select) {
        const opt = Array.from(select.options).find(o => o.value === fecha);
        if (opt) { select.value = fecha; select.dispatchEvent(new Event('change')); }
        else {
          // Re-render para asegurar lista completa y luego seleccionar
          renderHistorialPartidos(dataRows, idxFecha, window.idxJugador, window.idxGoles, window.idxPuntos);
          const select2 = document.getElementById('selectorPartido');
          if (select2) {
            const opt2 = Array.from(select2.options).find(o => o.value === fecha);
            if (opt2) { select2.value = fecha; select2.dispatchEvent(new Event('change')); }
          }
        }
      } else {
        renderHistorialPartidos(dataRows, idxFecha, window.idxJugador, window.idxGoles, window.idxPuntos);
        const select2 = document.getElementById('selectorPartido');
        if (select2) {
          const opt2 = Array.from(select2.options).find(o => o.value === fecha);
          if (opt2) { select2.value = fecha; select2.dispatchEvent(new Event('change')); }
        }
      }
    });
  });
}

// --- COMPARADOR DE JUGADORES ---
function renderComparadorJugadores(metricasPorJugador) {
  // Botón random/sorpresa
  const randomBtn = document.getElementById('comparadorRandomBtn');
  const inputMinComp = document.getElementById('comparadorPartidosMinimos');
  // Default ahora 5
  let partidosMinimosComp = 5;
  if (inputMinComp) {
    // Restaurar preferencia previa si existe
    try {
      const saved = localStorage.getItem('minPartidosComparador');
      if ((inputMinComp.value === '' || Number.isNaN(Number(inputMinComp.value))) && saved !== null) {
        inputMinComp.value = saved;
      }
    } catch(_) {}
    const val = Number(inputMinComp.value);
    if (!isNaN(val) && val >= 0) partidosMinimosComp = val; else partidosMinimosComp = 5;
    // Asignar handler solo una vez (si no existe marca)
    if (!inputMinComp.dataset.handlerAttached) {
      inputMinComp.oninput = () => {
        try { localStorage.setItem('minPartidosComparador', String(inputMinComp.value)); } catch(_) {}
        // Re-render manteniendo (si es posible) selecciones
        renderComparadorJugadores(metricasPorJugador);
        // Si la pestaña de Sinergias está visible, refrescarla también
        const tabSin = document.getElementById('comparadorTabSinergias');
        if (tabSin && tabSin.style.display !== 'none' && typeof window.renderSinergias === 'function') {
          window.renderSinergias();
        }
        // Si la pestaña de Correlación está visible, refrescarla también
        const tabCorr = document.getElementById('comparadorTabCorrelacion');
        if (tabCorr && tabCorr.style.display !== 'none' && typeof window.renderCorrelacionChart === 'function') {
          window.renderCorrelacionChart();
        }
      };
      inputMinComp.dataset.handlerAttached = 'true';
    }
    // Si el input estaba vacío (valor '') establecer 5 visualmente
    if (inputMinComp.value === '' || Number.isNaN(Number(inputMinComp.value))) {
      inputMinComp.value = 5;
    }
  }
  if (randomBtn) {
    randomBtn.onclick = function() {
      if (jugadores.length < 2) return;
      let idx1 = Math.floor(Math.random() * jugadores.length);
      let idx2;
      do { idx2 = Math.floor(Math.random() * jugadores.length); } while (idx2 === idx1);
      select1.value = jugadores[idx1];
      select2.value = jugadores[idx2];
      select1.dispatchEvent(new Event('change'));
      select2.dispatchEvent(new Event('change'));
      randomBtn.blur();
      // --- ANIMACIÓN REBOTE ---
      randomBtn.classList.remove('bounce');
      void randomBtn.offsetWidth; // Forzar reflow para reiniciar animación
      randomBtn.classList.add('bounce');
      setTimeout(() => randomBtn.classList.remove('bounce'), 600);
    };
  }
  const select1 = document.getElementById('comparadorJugador1');
  const select2 = document.getElementById('comparadorJugador2');
  const estadisticasDiv = document.getElementById('comparadorEstadisticas');
  if (!select1 || !select2 || !estadisticasDiv) return;

  // Poblar selects SIEMPRE (no solo si están vacíos)
  const jugadores = Object.entries(metricasPorJugador)
    .filter(([_, m]) => m.partidos >= partidosMinimosComp)
    .map(([j]) => j)
    .sort((a,b)=> a.localeCompare(b,'es'));
  // Guardar selección previa
  let prev1 = select1.value;
  let prev2 = select2.value;
  // Intentar restaurar selección del almacenamiento si no hay valores válidos
  try {
    const saved = JSON.parse(localStorage.getItem('comparadorSeleccion')||'{}');
    if (!prev1 && saved && saved.j1) prev1 = saved.j1;
    if (!prev2 && saved && saved.j2) prev2 = saved.j2;
  } catch(_) {}
  select1.innerHTML = '';
  select2.innerHTML = '';
  jugadores.forEach(j => {
    const opt1 = document.createElement('option');
    opt1.value = j; opt1.textContent = j;
    select1.appendChild(opt1);
    const opt2 = document.createElement('option');
    opt2.value = j; opt2.textContent = j;
    select2.appendChild(opt2);
  });
  // Restaurar selección previa si es válida, si no, elegir dos distintos
  if (jugadores.length > 1) {
    select1.value = (prev1 && jugadores.includes(prev1)) ? prev1 : jugadores[0];
    let segundo = (prev2 && jugadores.includes(prev2) && prev2 !== select1.value) ? prev2 : jugadores.find(j => j !== select1.value);
    select2.value = segundo || jugadores[1];
  } else if (jugadores.length === 1) {
    select1.value = jugadores[0];
    select2.value = jugadores[0];
  }

  function contarVecesGoleadorDelPartido(jugador, dataRows, idxFecha, idxJugador, idxGoles) {
    // Agrupar partidos por fecha
    const partidosPorFecha = {};
    dataRows.forEach(cols => {
      const fecha = cols[idxFecha];
      if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
      partidosPorFecha[fecha].push(cols);
    });
    let contador = 0;
    Object.values(partidosPorFecha).forEach(partido => {
      // Buscar el máximo de goles en ese partido
      let maxGoles = Math.max(...partido.map(cols => Number(cols[idxGoles]) || 0));
      if (maxGoles === 0) return; // Si nadie hizo goles, no cuenta
      // Ver si el jugador fue uno de los máximos goleadores
      const esGoleador = partido.some(cols => cols[idxJugador] === jugador && Number(cols[idxGoles]) === maxGoles);
      if (esGoleador) contador++;
    });
    return contador;
  }
  function mostrarComparacion() {
    const j1 = select1.value;
    const j2 = select2.value;
  try { localStorage.setItem('comparadorSeleccion', JSON.stringify({ j1, j2 })); } catch(_) {}
    // Si hay menos de 2 jugadores disponibles con el filtro, mostrar aviso
    if (jugadores.length < 2) {
      estadisticasDiv.innerHTML = `<p style="color:orange;">Ajusta el filtro de partidos mínimos para comparar (jugadores disponibles: ${jugadores.length}).</p>`;
      if (typeof window.renderComparadorSerieTemporal === 'function') window.renderComparadorSerieTemporal();
      return;
    }
    if (!j1 || !j2 || j1 === j2) {
      estadisticasDiv.innerHTML = '<p style="color:orange;">Selecciona dos jugadores distintos.</p>';
      if (typeof window.renderComparadorSerieTemporal === 'function') window.renderComparadorSerieTemporal();
      return;
    }
    // Solo renderizar la tabla de historial directo
    estadisticasDiv.innerHTML = `<div id="comparadorHistorialDirecto" style="margin-top:2.2em;"></div>`;
    renderHistorialDirectoComparador(j1, j2);
    if (typeof window.renderComparadorSerieTemporal === 'function') window.renderComparadorSerieTemporal();
  }

  // Nueva función: renderiza la tabla de historial directo entre dos jugadores
  function renderHistorialDirectoComparador(j1, j2) {
    const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
    const idxFecha = window.idxFecha;
    const idxJugador = window.idxJugador;
    const idxGoles = window.idxGoles;
    const idxPuntos = window.idxPuntos;
  const idxAutogoles = typeof window.idxAutogoles === 'number' ? window.idxAutogoles : -1;
    const j1Lower = (j1 || '').toLowerCase();
    const j2Lower = (j2 || '').toLowerCase();
    const debugCede = j1Lower === 'cede' || j2Lower === 'cede';
    if (debugCede) {
      console.log('[DEBUG CEDE] Comparador iniciado', { j1, j2, j1Lower, j2Lower });
    }
    // Agrupar partidos por fecha
    const partidosPorFecha = {};
    dataRows.forEach(cols => {
      const fecha = cols[idxFecha];
      if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
      partidosPorFecha[fecha].push(cols);
    });
    // Buscar fechas donde ambos jugadores participaron y NO estaban en el mismo equipo
    const historial = [];
    Object.entries(partidosPorFecha).forEach(([fecha, partido]) => {
      if (debugCede) {
        const lista = partido.map(cols => ({ jugador: cols[idxJugador], puntos: cols[idxPuntos], goles: cols[idxGoles] }));
        const involucraCede = lista.some(r => (r.jugador || '').toLowerCase() === 'cede');
        if (involucraCede) {
          console.log('[DEBUG CEDE] Fecha', fecha, 'partido raw', lista);
        }
      }
  const filaJ1 = partido.find(cols => (cols[idxJugador] || '').toLowerCase() === j1Lower);
  const filaJ2 = partido.find(cols => (cols[idxJugador] || '').toLowerCase() === j2Lower);
      if (!filaJ1 || !filaJ2) return;
      // Detectar empate múltiple: todos los jugadores tienen los mismos puntos
  const puntosUnicos = Array.from(new Set(partido.map(cols => (cols[idxPuntos] || '').toString().trim())));
      const esEmpateMultiple = puntosUnicos.length === 1;
      if (esEmpateMultiple) {
        // Caso especial: todos los jugadores tienen el mismo valor de puntos (o todos NaN)
        // Esto suele deberse a datos incompletos (por ejemplo puntos vacíos -> NaN) o a que no se registró el resultado por equipos.
        // Para evitar falsos "Empate" entre rivales (como el caso reportado con 'cede'), tratamos este partido como NO evaluable en el cara a cara.
        // Decisión: marcar a ambos como "Mismo equipo" (neutral) para que no sume a victorias/derrotas/empates entre rivales.
        // Replicar la heurística del historial general: dividir lista en dos mitades y sumar goles.
        const mitad = Math.ceil(partido.length / 2);
        const equipo1 = partido.slice(0, mitad);
        const equipo2 = partido.slice(mitad);
        // Sumar goles propios
        const golesEquipo1Propios = equipo1.reduce((acc, c) => acc + (Number(c[idxGoles]) || 0), 0);
        const golesEquipo2Propios = equipo2.reduce((acc, c) => acc + (Number(c[idxGoles]) || 0), 0);
        // Añadir autogoles (si existe columna)
        const autogolesEq1 = idxAutogoles >= 0 ? equipo1.reduce((a, c) => a + (Number(c[idxAutogoles]) || 0), 0) : 0;
        const autogolesEq2 = idxAutogoles >= 0 ? equipo2.reduce((a, c) => a + (Number(c[idxAutogoles]) || 0), 0) : 0;
        // Los autogoles de un equipo se cuentan para el rival
        const golesEquipo1 = golesEquipo1Propios + autogolesEq2;
        const golesEquipo2 = golesEquipo2Propios + autogolesEq1;
        // Determinar si ambos jugadores quedaron en el mismo lado o distintos
        const estaJ1EnEquipo1 = equipo1.some(cols => (cols[idxJugador] || '').toLowerCase() === j1Lower);
        const estaJ2EnEquipo1 = equipo1.some(cols => (cols[idxJugador] || '').toLowerCase() === j2Lower);
        const mismoEquipoHeuristico = (estaJ1EnEquipo1 && estaJ2EnEquipo1) || (!estaJ1EnEquipo1 && !estaJ2EnEquipo1);
        const global = `${golesEquipo1} - ${golesEquipo2}`;
        if (mismoEquipoHeuristico) {
          const resultadoEquipo = golesEquipo1 === golesEquipo2 ? 'Empate' : (golesEquipo1 > golesEquipo2 ? 'Victoria' : 'Derrota');
          historial.push({ fecha, res1: 'Mismo equipo', res2: 'Mismo equipo', global, mismoEquipo: true, resultadoEquipo, empateMultiple: true });
        } else {
          // Rivales heurísticos: si la suma de goles (incluyendo autogoles) permite determinar ganador, asignarlo; si no, marcar Empate
          if (golesEquipo1 === golesEquipo2) {
            historial.push({ fecha, res1: 'Empate', res2: 'Empate', global, mismoEquipo: false, empateMultiple: true });
          } else if (golesEquipo1 > golesEquipo2) {
            historial.push({ fecha, res1: 'Victoria', res2: 'Derrota', global, mismoEquipo: false, empateMultiple: true });
          } else {
            historial.push({ fecha, res1: 'Derrota', res2: 'Victoria', global, mismoEquipo: false, empateMultiple: true });
          }
        }
      } else {
        // No es empate múltiple: lógica normal
        // Comparar por valor numérico para evitar falsos negativos por espacios, mayúsculas o formatos distintos
        const puntosBrutosJ1 = filaJ1[idxPuntos];
        const puntosBrutosJ2 = filaJ2[idxPuntos];
        const puntosNumJ1 = Number(puntosBrutosJ1);
        const puntosNumJ2 = Number(puntosBrutosJ2);
  const mismoEquipo = puntosNumJ1 === puntosNumJ2;
        if (!mismoEquipo && puntosNumJ1 === puntosNumJ2) {
          // Caso improbable pero lo dejamos por diagnóstico: strings diferentes que se convierten al mismo número
          console.warn('[HistorialDirecto] Strings puntos distintos pero numéricamente iguales', { j1, j2, fecha, puntosBrutosJ1, puntosBrutosJ2 });
        }
        if (mismoEquipo) {
          // Calcular goles del equipo y del rival correctamente
          const puntosEquipoNum = Number(filaJ1[idxPuntos]);
          const equipoCols = partido.filter(cols => Number(cols[idxPuntos]) === puntosEquipoNum);
          const rivalCols = partido.filter(cols => Number(cols[idxPuntos]) !== puntosEquipoNum);
          const golesEquipoPropios = equipoCols.reduce((acc, c) => acc + Number(c[idxGoles]||0), 0);
          const golesRivalPropios = rivalCols.reduce((acc, c) => acc + Number(c[idxGoles]||0), 0);
          const autogolesEquipo = idxAutogoles>=0 ? equipoCols.reduce((a,c)=> a + Number(c[idxAutogoles]||0),0) : 0;
          const autogolesRival = idxAutogoles>=0 ? rivalCols.reduce((a,c)=> a + Number(c[idxAutogoles]||0),0) : 0;
          const golesEquipo = golesEquipoPropios + autogolesRival;
          const golesRival = golesRivalPropios + autogolesEquipo;
          let resultadoEquipo = '';
          if (golesEquipo > golesRival) resultadoEquipo = 'Victoria';
          else if (golesEquipo < golesRival) resultadoEquipo = 'Derrota';
          else resultadoEquipo = 'Empate';
          let global = `${golesEquipo} - ${golesRival}`;
          historial.push({ fecha, res1: 'Mismo equipo', res2: 'Mismo equipo', global, mismoEquipo: true, resultadoEquipo });
        } else {
          // Resultado individual
          const equipo1PuntosNum = Number(filaJ1[idxPuntos]);
          const equipo2PuntosNum = Number(filaJ2[idxPuntos]);
          const equipo1Jugadores = partido.filter(cols => Number(cols[idxPuntos]) === equipo1PuntosNum);
          const equipo2Jugadores = partido.filter(cols => Number(cols[idxPuntos]) === equipo2PuntosNum);
          const golesEquipo1Propios = equipo1Jugadores.reduce((acc, c) => acc + Number(c[idxGoles]||0), 0);
          const golesEquipo2Propios = equipo2Jugadores.reduce((acc, c) => acc + Number(c[idxGoles]||0), 0);
          const autogolesEq1 = idxAutogoles>=0 ? equipo1Jugadores.reduce((a,c)=> a + Number(c[idxAutogoles]||0),0) : 0;
          const autogolesEq2 = idxAutogoles>=0 ? equipo2Jugadores.reduce((a,c)=> a + Number(c[idxAutogoles]||0),0) : 0;
          const golesEquipo1 = golesEquipo1Propios + autogolesEq2;
          const golesEquipo2 = golesEquipo2Propios + autogolesEq1;
          let global = `${golesEquipo1} - ${golesEquipo2}`;
          const goles1 = Number(filaJ1[idxGoles]||0);
          const goles2 = Number(filaJ2[idxGoles]||0);
          const puntos1 = puntosNumJ1;
          const puntos2 = puntosNumJ2;
          let res1 = puntos1 > puntos2 ? 'Victoria' : (puntos1 < puntos2 ? 'Derrota' : 'Empate');
          let res2 = puntos2 > puntos1 ? 'Victoria' : (puntos2 < puntos1 ? 'Derrota' : 'Empate');
          // Añadir desglose de autogoles para posible tooltip futuro
          historial.push({ fecha, res1, res2, global, goles1, goles2, autogolesEq1: autogolesEq1, autogolesEq2: autogolesEq2, mismoEquipo: false });
        }
      if (debugCede) {
        const last = historial[historial.length - 1];
        if (last && last.fecha === fecha) {
          console.log('[DEBUG CEDE] Registro agregado', last);
        }
      }
      }
    });
    // Ordenar por fecha descendente (más reciente primero), detectando formato
    function parseFecha(fecha) {
      // Soporta formatos: yyyy-mm-dd, dd/mm/yyyy, mm/dd/yyyy
      if (fecha.includes('-')) return new Date(fecha);
      if (fecha.includes('/')) {
        const parts = fecha.split('/');
        if (parts[2] && parts[2].length === 4) {
          // dd/mm/yyyy
          return new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (parts[0].length === 4) {
          // yyyy/mm/dd
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
      }
      return new Date(fecha);
    }
    historial.sort((a, b) => parseFecha(a.fecha) - parseFecha(b.fecha));

    // Calcular historial directo (solo partidos como rivales) — contamos victorias y empates entre rivales
    let ganadosJ1 = 0, ganadosJ2 = 0, empatesRivales = 0;
    historial.forEach(e => {
      if (!e.mismoEquipo) {
        if (e.res1 === 'Victoria') ganadosJ1++;
        else if (e.res2 === 'Victoria') ganadosJ2++;
        else if (e.res1 === 'Empate' && e.res2 === 'Empate') empatesRivales++;
      }
    });

    // Renderizar marcador protagónico
  let marcadorHTML = '';
  if (ganadosJ1 + ganadosJ2 > 0) {
      marcadorHTML = `
        <div style="display:flex;justify-content:center;align-items:center;margin-bottom:1.2em;margin-top:0.5em;gap:1.2em;">
          <span style="background:#23263a;color:#4fc3f7;font-size:1.25em;font-weight:700;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #4fc3f755;">${j1}</span>
          <span style="background:#218c5f;color:#fff;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #218c5f55;">${ganadosJ1}</span>
          <span style="background:#ffd700;color:#23263a;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #ffd70055;">-</span>
          <span style="background:#a8231a;color:#fff;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #a8231a55;">${ganadosJ2}</span>
          <span style="background:#23263a;color:#4fc3f7;font-size:1.25em;font-weight:700;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #4fc3f755;">${j2}</span>
        </div>
      `;
    }

    // Renderizar tabla
    // Mostrar todo el historial (incluyendo empates entre rivales)
    const historialFiltrado = historial;
    let html = '';
    if (historialFiltrado.length === 0) {
      html = `<div style=\"text-align:center;color:#ffd700;font-weight:600;\">No hay partidos con ganador entre estos jugadores.</div>`;
    } else {
      html = `<div style='margin:4em 0 0.5em 0;'></div><h2 class="titulo-comparador" style="margin-top:2.2em;margin-bottom:1.1em;">Historial directo</h2>${marcadorHTML}`;
      html += `<table class=\"tabla-historial-directo\"><thead><tr><th>Fecha</th><th>Resultado ${j1}</th><th>Resultado ${j2}</th><th>Resultado global</th></tr></thead><tbody>`;
      historialFiltrado.forEach(e => {
        html += `<tr>`;
        html += `<td>${e.fecha}</td>`;
        if (e.mismoEquipo) {
          // Empate o no, pero mismo equipo
          let aclaracion = e.resultadoEquipo === 'Empate' ? 'Empate (Mismo equipo)' : 'Mismo equipo';
          html += `<td colspan='2' style='color:#4fc3f7;font-weight:bold;text-align:center;'>${aclaracion}</td>`;
          let color = e.resultadoEquipo === 'Victoria' ? '#218c5f' : (e.resultadoEquipo === 'Derrota' ? '#a8231a' : '#b0b0b0');
          html += `<td style='font-weight:bold;text-align:center;'>${e.global} <span style=\"display:inline-block;margin-left:0.5em;padding:0.15em 0.7em;border-radius:7px;font-size:0.98em;font-weight:600;background:${color};color:#fff;vertical-align:middle;\">${e.resultadoEquipo}</span></td>`;
        } else {
          html += `<td><span class=\"resultado-${e.res1.toLowerCase()}\">${e.res1}</span></td>`;
          html += `<td><span class=\"resultado-${e.res2.toLowerCase()}\">${e.res2}</span></td>`;
          html += `<td>${e.global}</td>`;
        }
        html += `</tr>`;
      });
      html += `</tbody></table>`;
    }
    document.getElementById('comparadorHistorialDirecto').innerHTML = html;
  }
  select1.onchange = mostrarComparacion;
  select2.onchange = mostrarComparacion;
  mostrarComparacion();
  // Intentar actualizar serie temporal (segunda pestaña) si existe función
  if (typeof window.renderComparadorSerieTemporal === 'function') {
    window.renderComparadorSerieTemporal();
  }
}

// Llamar al renderizador del comparador cuando se cargan las métricas
window.addEventListener('DOMContentLoaded', () => {
  if (window.metricasPorJugador) {
    renderComparadorJugadores(window.metricasPorJugador);
  }
  // Lógica de tabs internas del comparador
  const tabHistBtn = document.getElementById('comparadorTabHistorialBtn');
  const tabExtraBtn = document.getElementById('comparadorTabExtraBtn');
  const tabCorrBtn = document.getElementById('comparadorTabCorrelacionBtn');
  const tabSinBtn = document.getElementById('comparadorTabSinergiasBtn');
  const tabHist = document.getElementById('comparadorTabHistorial');
  const tabExtra = document.getElementById('comparadorTabExtra');
  const tabCorr = document.getElementById('comparadorTabCorrelacion');
  const tabSin = document.getElementById('comparadorTabSinergias');
  function activarTab(btnActiva) {
    [tabHistBtn, tabExtraBtn, tabCorrBtn, tabSinBtn].forEach(b => b && b.classList.remove('active'));
    btnActiva.classList.add('active');
    const cont = document.getElementById('comparadorControlesPrincipales');
    if (btnActiva === tabHistBtn) {
      if (tabHist) tabHist.style.display = 'block';
      if (tabExtra) tabExtra.style.display = 'none';
      if (tabCorr) tabCorr.style.display = 'none';
      if (tabSin) tabSin.style.display = 'none';
      if (cont) cont.style.display = 'flex';
    } else if (btnActiva === tabExtraBtn) {
      if (tabHist) tabHist.style.display = 'none';
      if (tabExtra) tabExtra.style.display = 'block';
      if (tabCorr) tabCorr.style.display = 'none';
      if (tabSin) tabSin.style.display = 'none';
      if (cont) cont.style.display = 'none';
      if (typeof window.renderComparadorSerieTemporal === 'function') window.renderComparadorSerieTemporal();
    } else if (btnActiva === tabCorrBtn) {
      if (tabHist) tabHist.style.display = 'none';
      if (tabExtra) tabExtra.style.display = 'none';
      if (tabCorr) tabCorr.style.display = 'block';
      if (tabSin) tabSin.style.display = 'none';
      if (cont) cont.style.display = 'none';
      if (typeof window.renderCorrelacionChart === 'function') window.renderCorrelacionChart();
    } else if (btnActiva === tabSinBtn) {
      if (tabHist) tabHist.style.display = 'none';
      if (tabExtra) tabExtra.style.display = 'none';
      if (tabCorr) tabCorr.style.display = 'none';
      if (tabSin) tabSin.style.display = 'block';
      if (cont) cont.style.display = 'none';
      // Sinergias: establecer por defecto Partidos mínimos = 5 (solo una vez si está vacío/ inválido)
      const inputMinComp = document.getElementById('comparadorPartidosMinimos');
      if (inputMinComp && !inputMinComp.dataset.sinergiasDefaultApplied) {
        const cur = Number(inputMinComp.value);
        if (inputMinComp.value === '' || Number.isNaN(cur)) {
          inputMinComp.value = '5';
          inputMinComp.dispatchEvent(new Event('input'));
        }
        inputMinComp.dataset.sinergiasDefaultApplied = '1';
      }
      if (typeof window.renderSinergias === 'function') window.renderSinergias();
    }
  }
  if (tabHistBtn) tabHistBtn.onclick = () => activarTab(tabHistBtn);
  if (tabExtraBtn) tabExtraBtn.onclick = () => activarTab(tabExtraBtn);
  if (tabCorrBtn) tabCorrBtn.onclick = () => activarTab(tabCorrBtn);
  if (tabSinBtn) tabSinBtn.onclick = () => activarTab(tabSinBtn);
});

// === Serie temporal acumulada (segunda pestaña del comparador) ===
window.renderComparadorSerieTemporal = function() {
  const canvas = document.getElementById('comparadorSerieTemporalCanvas');
  if (!canvas) return; // pestaña no visible aún
  const select1 = document.getElementById('comparadorJugador1');
  const select2 = document.getElementById('comparadorJugador2');
  const metricSel = document.getElementById('comparadorSerieMetric');
  const multiSel = document.getElementById('comparadorSerieJugadoresMulti');
  const panel = document.getElementById('comparadorSerieJugadoresPanel');
  const btnToggle = document.getElementById('comparadorSerieJugadoresBtn');
  const btnCerrar = document.getElementById('comparadorSerieJugadoresCerrar');
  const btnClear = document.getElementById('comparadorSerieJugadoresClear');
  const btnSelectAll = document.getElementById('comparadorSerieJugadoresSelectAll');
  const countBadge = document.getElementById('comparadorSerieJugadoresCount');
  if (!select1 || !select2 || !metricSel) return;
  // Restaurar métrica previa
  try {
    const savedMetric = localStorage.getItem('comparadorSerieMetric');
    if (savedMetric && metricSel.value !== savedMetric) metricSel.value = savedMetric;
  } catch(_) {}
  // Construir opciones del multi-select (filtradas por partidos mínimos) si está vacío o cantidad cambió
  if (multiSel) {
    const inputMinComp = document.getElementById('comparadorPartidosMinimos');
    let partidosMinimosComp = 5;
    if (inputMinComp) {
      const v = Number(inputMinComp.value); if (!isNaN(v) && v>=0) partidosMinimosComp = v;
    }
    const metricas = window.metricasPorJugador || {};
    const jugadoresElegibles = Object.entries(metricas)
      .filter(([_, m]) => m.partidos >= partidosMinimosComp)
      .map(([j])=>j).sort((a,b)=> a.localeCompare(b,'es'));
    const eligiblesHash = jugadoresElegibles.join('|') + '::' + partidosMinimosComp;
    // Solo reconstruir si cambió el conjunto elegible (evita saltos al seleccionar)
    if (multiSel.dataset.eligiblesHash !== eligiblesHash) {
      const prevSeleccion = Array.from(multiSel.selectedOptions).map(o=>o.value);
      const prevScroll = multiSel.scrollTop;
      multiSel.innerHTML='';
      jugadoresElegibles.forEach(j => {
        const opt=document.createElement('option');
        opt.value=j; opt.textContent=j;
        // Intentar restaurar selección almacenada si no hay selección previa
        let shouldSelect = prevSeleccion.includes(j);
        if (!shouldSelect) {
          try {
            const savedSel = JSON.parse(localStorage.getItem('comparadorSerieSel')||'[]');
            if (Array.isArray(savedSel) && savedSel.includes(j)) shouldSelect = true;
          } catch(_) {}
        }
        if (shouldSelect) opt.selected=true;
        multiSel.appendChild(opt);
      });
      multiSel.dataset.eligiblesHash = eligiblesHash;
      // Restaurar scroll al valor previo (clamp automático por el navegador)
      try { multiSel.scrollTop = prevScroll; requestAnimationFrame(() => { multiSel.scrollTop = prevScroll; }); } catch(_){}
    }
  }
  let jugadoresSeleccionados = [];
  if (multiSel) {
    jugadoresSeleccionados = Array.from(multiSel.selectedOptions).map(o=>o.value);
  if (countBadge) countBadge.textContent = jugadoresSeleccionados.length;
  try { localStorage.setItem('comparadorSerieSel', JSON.stringify(jugadoresSeleccionados)); } catch(_) {}
  }
  // Fallback: si no hay selección múltiple, usar los dos selects del comparador
  if (jugadoresSeleccionados.length === 0) {
    jugadoresSeleccionados = [select1.value, select2.value].filter(Boolean);
  }
  // Eliminar duplicados
  jugadoresSeleccionados = Array.from(new Set(jugadoresSeleccionados));
  const j1 = jugadoresSeleccionados[0];
  const j2 = jugadoresSeleccionados[1];
  const infoDiv = document.getElementById('comparadorSerieTemporalInfo');
  const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
  if (!dataRows || !dataRows.length) return;
  const idxFecha = window.idxFecha, idxJugador = window.idxJugador, idxGoles = window.idxGoles, idxPuntos = window.idxPuntos;
  const metric = metricSel.value; // 'goles' | 'puntos'
  // Agrupar por fecha solo filas de los jugadores seleccionados
  const porFecha = {};
  dataRows.forEach(cols => {
    const nombre = cols[idxJugador];
    if (!jugadoresSeleccionados.includes(nombre)) return;
    const fecha = cols[idxFecha];
    if (!porFecha[fecha]) porFecha[fecha] = {};
    const valor = metric === 'goles' ? Number(cols[idxGoles]) || 0 : Number(cols[idxPuntos]) || 0;
    porFecha[fecha][nombre] = (porFecha[fecha][nombre]||0) + valor;
  });
  const fechas = Object.keys(porFecha);
  if (fechas.length === 0) {
    if (infoDiv) infoDiv.innerHTML = '<span style="color:orange;font-weight:600;">No hay partidos compartidos.</span>';
    return;
  }
  // Ordenar fechas ascendente robusto
  function parseFechaGeneric(f) {
    if (f.includes('-')) return new Date(f);
    if (f.includes('/')) {
      const p = f.split('/');
      if (p[2] && p[2].length === 4) return new Date(p[2], p[1]-1, p[0]);
    }
    return new Date(f);
  }
  fechas.sort((a,b)=> parseFechaGeneric(a)-parseFechaGeneric(b));
  const labels = [];
  const acumuladosPorJugador = {}; // nombre -> array
  const totales = {}; // nombre -> total final
  jugadoresSeleccionados.forEach(j => { acumuladosPorJugador[j]=[]; totales[j]=0; });
  fechas.forEach(f => {
    labels.push(f);
    jugadoresSeleccionados.forEach(j => {
      const inc = porFecha[f][j] || 0;
      totales[j] += inc;
      acumuladosPorJugador[j].push(totales[j]);
    });
  });
  // Datos de diferencia sólo si exactamente 2 jugadores
  // Diferencia eliminada: ya no calculamos diffData
  // Destruir instancia previa
  if (window.comparadorSerieTemporalChart) {
    window.comparadorSerieTemporalChart.destroy();
  }
  const showDiff = false; // modo diferencia eliminado
  // Calcular límites Y dinámicos compactos
  let yMin, yMax;
  const todosValores = jugadoresSeleccionados.flatMap(j => acumuladosPorJugador[j]);
  yMax = Math.max(0, ...todosValores);
  const pad = yMax === 0 ? 1 : Math.max(1, Math.ceil(yMax * 0.06));
  yMax += pad;
  yMin = 0;
  if (yMax === 0) yMax = 1; // evitar escala plana
  const ctx = canvas.getContext('2d');
  const palette = ['#4fc3f7','#a8231a','#ffd700','#218c5f','#ff7f50','#ba68c8','#ffb347','#64b5f6','#ef5350','#81c784'];
  let colorIndex = 0;
  window.comparadorSerieTemporalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
  jugadoresSeleccionados.map(j => {
          const baseColor = palette[colorIndex++ % palette.length];
          return {
            label: j,
            data: acumuladosPorJugador[j],
            borderColor: baseColor,
            backgroundColor: baseColor + '55',
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 3,
            fill: false
          };
  })
      ].flat().filter(Boolean)
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { labels: { color: '#ffd700', font: { weight: '600' } } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const idx = ctx.dataIndex;
              const prev = idx>0 ? ctx.dataset.data[idx-1] : 0;
              const inc = ctx.raw - prev;
              return `${ctx.dataset.label}: ${ctx.raw} ( +${inc} )`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#b0b0b0', maxRotation: 50, minRotation: 30 },
          grid: { color: '#2d3042' }
        },
        y: {
          ticks: { color: '#b0b0b0', precision: 0, callback: v => Number.isInteger(v) ? v : '' },
          grid: { color: '#2d3042' },
          min: yMin,
          max: yMax
        }
      }
    }
  });
  if (infoDiv) {
    const resumen = jugadoresSeleccionados.map(j => `${j}: <b>${totales[j]}</b>`).join(' | ');
    infoDiv.innerHTML = `Totales finales - ${resumen}`;
  }
  // Listeners (solo adjuntar una vez)
  if (metricSel && !metricSel.dataset.handlerAttached) {
  metricSel.onchange = () => { try { localStorage.setItem('comparadorSerieMetric', metricSel.value); } catch(_) {} window.renderComparadorSerieTemporal(); };
    metricSel.dataset.handlerAttached = 'true';
  }
  if (multiSel && !multiSel.dataset.handlerAttached) {
    multiSel.onchange = () => window.renderComparadorSerieTemporal();
    multiSel.dataset.handlerAttached = 'true';
    // Permitir toggle con click sin CTRL
  multiSel.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'OPTION') {
    const st = multiSel.scrollTop;
        e.preventDefault();
        const opt = e.target;
        opt.selected = !opt.selected;
        multiSel.dispatchEvent(new Event('change'));
    // Restaurar scroll inmediatamente y en el próximo frame por si hay reflow
    multiSel.scrollTop = st;
    requestAnimationFrame(() => { multiSel.scrollTop = st; });
  // Mantener visible el elemento clickeado sin alterar selección múltiple
  try { opt.scrollIntoView({ block: 'nearest' }); } catch(_){}
      }
    });
  }
  // Botones panel
  if (btnToggle && !btnToggle.dataset.handlerAttached) {
    btnToggle.onclick = () => {
      if (!panel) return;
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };
    btnToggle.dataset.handlerAttached = 'true';
  }
  if (btnCerrar && !btnCerrar.dataset.handlerAttached) {
    btnCerrar.onclick = () => { if(panel) panel.style.display='none'; };
    btnCerrar.dataset.handlerAttached = 'true';
  }
  if (btnClear && !btnClear.dataset.handlerAttached) {
    btnClear.onclick = () => {
      if (!multiSel) return;
      Array.from(multiSel.options).forEach(o => o.selected = false);
      multiSel.dispatchEvent(new Event('change'));
    };
    btnClear.dataset.handlerAttached = 'true';
  }
  if (btnSelectAll && !btnSelectAll.dataset.handlerAttached) {
    btnSelectAll.onclick = () => {
      if (!multiSel) return;
      Array.from(multiSel.options).forEach(o => o.selected = true);
      multiSel.dispatchEvent(new Event('change'));
    };
    btnSelectAll.dataset.handlerAttached = 'true';
  }
  // Cerrar al click fuera
  if (!window._comparadorOutsideClickBound) {
    document.addEventListener('click', (e) => {
      if (!panel || !btnToggle) return;
      if (panel.style.display==='none') return;
      if (panel.contains(e.target) || btnToggle.contains(e.target)) return;
      panel.style.display='none';
    });
    window._comparadorOutsideClickBound = true;
  }
};

// --- FIN COMPARADOR ---
// --- DASHBOARD INDIVIDUAL DE JUGADOR ---
function renderDashboardJugador(metricasPorJugador) {
  const select = document.getElementById('dashboardJugadorSelect');
  const resumenDiv = document.getElementById('dashboardJugadorResumen');
  const graficoBarrasDiv = document.getElementById('dashboardJugadorGraficoBarras');
  const graficoTortaDiv = document.getElementById('dashboardJugadorGraficoTorta');
  const logrosDiv = document.getElementById('dashboardJugadorLogros');
  const tablaAnualDiv = document.getElementById('dashboardJugadorTablaAnual');
  if (!select || !resumenDiv || !graficoBarrasDiv || !graficoTortaDiv || !logrosDiv || !tablaAnualDiv) return;
  // Poblar selector con todos los jugadores históricos
  const dataRowsHistorico = window.dataRowsOriginal;
  const idxJugador = window.idxJugador;
  const jugadoresSet = new Set();
  dataRowsHistorico.forEach(cols => {
    if (cols[idxJugador]) jugadoresSet.add(cols[idxJugador]);
  });
  const jugadores = Array.from(jugadoresSet).sort((a, b) => a.localeCompare(b, 'es'));
  const prev = select.value;
  select.innerHTML = '';
  // Opción inicial vacía
  const optInicial = document.createElement('option');
  optInicial.value = '';
  optInicial.textContent = 'Selecciona un jugador...';
  optInicial.disabled = true;
  optInicial.selected = true;
  select.appendChild(optInicial);
  jugadores.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j; opt.textContent = j;
    select.appendChild(opt);
  });
  // No seleccionar ningún jugador por defecto
  select.value = '';
  // Asegura que el selector actualice el dashboard al cambiar
  select.onchange = mostrarDashboard;

  function mostrarDashboard() {
    // SIEMPRE HISTÓRICO: usar window.dataRowsOriginal para todo
    const dataRowsHistorico = window.dataRowsOriginal;
    const jugador = select.value;
    if (!jugador) {
      resumenDiv.innerHTML = `<div style='text-align:center;padding:2em 0;'>
        <div style='color:#ffd700;font-size:1.2em;'>Selecciona un jugador para ver su información</div>
      </div>`;
      graficoBarrasDiv.innerHTML = '';
      graficoTortaDiv.innerHTML = '';
      logrosDiv.innerHTML = '';
      tablaAnualDiv.innerHTML = '';
      return;
    }
    // Si el jugador no está en metricasPorJugador (por el filtro), crear métricas vacías
    let m = metricasPorJugador[jugador];
    if (!m) {
      // Buscar todas las filas históricas del jugador
      const idxJugador = window.idxJugador;
      const idxPuntos = window.idxPuntos;
      const idxGoles = window.idxGoles;
      const filasJugador = dataRowsHistorico.filter(cols => cols[idxJugador] === jugador);
      let puntos = 0, goles = 0, partidos = 0;
      filasJugador.forEach(cols => {
        puntos += Number(cols[idxPuntos]) || 0;
        goles += Number(cols[idxGoles]) || 0;
        partidos++;
      });
      m = { puntos, goles, partidos };
    }
    // --- TABLA ANUAL DE ESTADÍSTICAS CON PODIUMS ---
    // SIEMPRE HISTÓRICO: usar dataRowsHistorico
    const dataRowsAnual = dataRowsHistorico;
    const idxFechaAnual = window.idxFecha;
    const idxJugadorAnual = window.idxJugador;
    const idxPuntosAnual = window.idxPuntos;
    const idxGolesAnual = window.idxGoles;
    // Agrupar por año y por jugador
    const statsPorAnioYJugador = {};
    dataRowsAnual.forEach(cols => {
      const fecha = cols[idxFechaAnual];
      let year = '';
      if (fecha.includes('-')) year = fecha.split('-')[0];
      else if (fecha.includes('/')) year = fecha.split('/').pop();
      else year = fecha.substring(0, 4);
      const jug = cols[idxJugadorAnual];
      if (!statsPorAnioYJugador[year]) statsPorAnioYJugador[year] = {};
      if (!statsPorAnioYJugador[year][jug]) statsPorAnioYJugador[year][jug] = { puntos: 0, goles: 0, partidos: 0 };
      statsPorAnioYJugador[year][jug].puntos += Number(cols[idxPuntosAnual]) || 0;
      statsPorAnioYJugador[year][jug].goles += Number(cols[idxGolesAnual]) || 0;
      statsPorAnioYJugador[year][jug].partidos += 1;
    });
    // Función para calcular top 3 por métrica en un año
    function getTop3Anual(statsAnio, metric) {
      const arr = Object.entries(statsAnio).map(([jug, s]) => ({jug, value: s[metric]}));
      arr.sort((a, b) => b.value - a.value);
      const top = [];
      let lastValue = null;
      let count = 0;
      for (let i = 0; i < arr.length && count < 3; i++) {
        const val = arr[i].value;
        if (lastValue === null || val !== lastValue) count++;
        if (count > 3) break;
        top.push({jug: arr[i].jug, place: count});
        lastValue = val;
      }
      const res = {};
      top.forEach(({jug, place}) => { if (place <= 3 && res[jug] === undefined) res[jug] = place; });
      return res;
    }
    function podiumEmoji(place) {
      if (place === 1) return '🥇';
      if (place === 2) return '🥈';
      if (place === 3) return '🥉';
      return '';
    }
    // Renderizar tabla con podiums
    let tablaHtml = `<table style="width:100%;border-collapse:collapse;background:#23263a;color:#ffd700;font-size:1.08em;box-shadow:0 2px 12px #ffd70022;border-radius:12px;overflow:hidden;">
      <thead><tr style="background:#ffd70022;"><th style="padding:0.7em 1em;">Año</th><th style="padding:0.7em 1em;">Puntos</th><th style="padding:0.7em 1em;">Goles</th><th style="padding:0.7em 1em;">Partidos Jugados</th></tr></thead><tbody>`;
    const anios = Object.keys(statsPorAnioYJugador).sort();
    anios.forEach(anio => {
      const statsAnio = statsPorAnioYJugador[anio];
      if (!statsAnio[jugador]) return; // Solo mostrar años donde jugó
      const s = statsAnio[jugador];
      // Calcular top 3 para cada métrica en ese año
      const topPuntos = getTop3Anual(statsAnio, 'puntos');
      const topGoles = getTop3Anual(statsAnio, 'goles');
      const topPartidos = getTop3Anual(statsAnio, 'partidos');
      tablaHtml += `<tr><td style="padding:0.6em 1em;text-align:center;">${anio}</td>` +
        `<td style="padding:0.6em 1em;text-align:center;">${podiumEmoji(topPuntos[jugador])}${s.puntos}</td>` +
        `<td style="padding:0.6em 1em;text-align:center;">${podiumEmoji(topGoles[jugador])}${s.goles}</td>` +
        `<td style="padding:0.6em 1em;text-align:center;">${podiumEmoji(topPartidos[jugador])}${s.partidos}</td></tr>`;
    });
    tablaHtml += '</tbody></table>';
    tablaAnualDiv.innerHTML = tablaHtml;
    // Imagen del jugador
    const nombreArchivo = normalizarNombreArchivo(jugador);
    const rutaImg = `img/jugadores/jugador-${nombreArchivo}.png`;
    // Calcular registro histórico: ganados, empatados, perdidos
    const idxJugadorHist = window.idxJugador;
    const idxPuntosHist = window.idxPuntos;
    const filasJugadorHist = dataRowsHistorico.filter(cols => cols[idxJugadorHist] === jugador);
    let ganados = 0, empatados = 0, perdidos = 0;
    filasJugadorHist.forEach(cols => {
      const puntos = Number(cols[idxPuntosHist]);
      if (puntos === 3) ganados++;
      else if (puntos === 1) empatados++;
      else if (puntos === 0) perdidos++;
    });
    // Definir logros/medallas
    const medallas = [];
    // (Eliminados logros de máximo goleador, subcampeón y veterano para dejar solo logros históricos)

    // Medallas escalables por goles totales
    // --- LOGROS HISTÓRICOS: calcular goles y partidos totales históricos ---
    // (ya declarada arriba)
    const idxJugadorLogros = window.idxJugador;
    const idxGolesLogros = window.idxGoles;
    const idxPartidosLogros = window.idxPartidos || null; // por si existe
    // Filtrar todas las filas históricas del jugador
    const filasJugador = dataRowsHistorico.filter(cols => cols[idxJugadorLogros] === jugador);
    // Sumar goles y partidos históricos
    let golesHistoricos = 0;
    let partidosHistoricos = 0;
    filasJugador.forEach(cols => {
      golesHistoricos += Number(cols[idxGolesLogros]) || 0;
      partidosHistoricos += 1;
    });

  // --- Medalla escalable: Goles Totales (histórico) ---
  const golesNiveles = medallasConfig.goles.niveles;
  if (golesHistoricos < golesNiveles[0].min) {
      medallas.push({
        icon: '🔒',
    tooltip: `Logro bloqueado<br>Marca al menos ${golesNiveles[0].min} goles para desbloquear`,
        locked: true,
        colorClass: '',
        cartelProgreso: '<span class="medalla-progreso-cartel locked">Logro bloqueado</span>',
        logroNombre: ''
      });
    } else {
      let nivelGolesIdx = 0;
      for (let i = golesNiveles.length - 1; i >= 0; i--) {
        if (golesHistoricos >= golesNiveles[i].min) {
          nivelGolesIdx = i;
          break;
        }
      }
      const nivelGolesActual = golesNiveles[nivelGolesIdx];
      const siguienteGoles = golesNiveles[nivelGolesIdx + 1];
      let cartelProgresoGoles = '';
      if (siguienteGoles) {
        const faltan = siguienteGoles.min - golesHistoricos;
        cartelProgresoGoles = `<span class=\"medalla-progreso-cartel\">Te faltan <b>${faltan}</b> goles para <b>${siguienteGoles.nombre}</b></span>`;
      } else {
        cartelProgresoGoles = `<span class=\"medalla-progreso-cartel max\">¡Máximo nivel alcanzado!</span>`;
      }
      medallas.push({
        icon: nivelGolesActual.icon,
        tooltip: `${nivelGolesActual.nombre}<br>${nivelGolesActual.min}+ goles`,
        locked: false,
        colorClass: nivelGolesActual.colorClass,
        cartelProgreso: cartelProgresoGoles,
        logroNombre: nivelGolesActual.nombre
      });
    }

    // --- Medalla escalable: Partidos Jugados Totales (histórico) ---
    const partidosNiveles = medallasConfig.partidos.niveles;
    if (partidosHistoricos < partidosNiveles[0].min) {
      medallas.push({
        icon: '🔒',
        tooltip: `Logro bloqueado<br>Juega al menos ${partidosNiveles[0].min} partidos para desbloquear`,
        locked: true,
        colorClass: '',
        cartelProgreso: '<span class="medalla-progreso-cartel locked">Logro bloqueado</span>'
      });
    } else {
      let nivelPartidosIdx = 0;
      for (let i = partidosNiveles.length - 1; i >= 0; i--) {
        if (partidosHistoricos >= partidosNiveles[i].min) {
          nivelPartidosIdx = i;
          break;
        }
      }
      const nivelPartidosActual = partidosNiveles[nivelPartidosIdx];
      const siguientePartidos = partidosNiveles[nivelPartidosIdx + 1];
      let cartelProgresoPartidos = '';
      if (siguientePartidos) {
        const faltan = siguientePartidos.min - partidosHistoricos;
        cartelProgresoPartidos = `<span class=\"medalla-progreso-cartel\">Te faltan <b>${faltan}</b> partidos para <b>${siguientePartidos.nombre}</b></span>`;
      } else {
        cartelProgresoPartidos = `<span class=\"medalla-progreso-cartel max\">¡Máximo nivel alcanzado!</span>`;
      }
      medallas.push({
        icon: nivelPartidosActual.icon,
        tooltip: `${nivelPartidosActual.nombre}<br>${nivelPartidosActual.min}+ partidos`,
        locked: false,
        colorClass: nivelPartidosActual.colorClass,
        cartelProgreso: cartelProgresoPartidos
      });
    }

    // --- Medalla escalable: Victorias Totales (histórico) ---
    // 7 niveles definidos en medallasConfig
    let victoriasHistoricas = 0;
    filasJugador.forEach(cols => {
      // Asume que idxPuntosLogros existe y 3 puntos = victoria
      const puntos = Number(cols[window.idxPuntos]);
      if (puntos === 3) victoriasHistoricas++;
    });
    const victoriasNiveles = medallasConfig.victorias.niveles;
    if (victoriasHistoricas < victoriasNiveles[0].min) {
      medallas.push({
        icon: '🔒',
        tooltip: `Logro bloqueado<br>Gana al menos ${victoriasNiveles[0].min} partidos para desbloquear`,
        locked: true,
        colorClass: '',
        cartelProgreso: '<span class="medalla-progreso-cartel locked">Logro bloqueado</span>'
      });
    } else {
      let nivelVictoriasIdx = 0;
      for (let i = victoriasNiveles.length - 1; i >= 0; i--) {
        if (victoriasHistoricas >= victoriasNiveles[i].min) {
          nivelVictoriasIdx = i;
          break;
        }
      }
      const nivelVictoriasActual = victoriasNiveles[nivelVictoriasIdx];
      const siguienteVictorias = victoriasNiveles[nivelVictoriasIdx + 1];
      let cartelProgresoVictorias = '';
      if (siguienteVictorias) {
        const faltan = siguienteVictorias.min - victoriasHistoricas;
        cartelProgresoVictorias = `<span class=\"medalla-progreso-cartel\">Te faltan <b>${faltan}</b> victorias para <b>${siguienteVictorias.nombre}</b></span>`;
      } else {
        cartelProgresoVictorias = `<span class=\"medalla-progreso-cartel max\">¡Máximo nivel alcanzado!</span>`;
      }
      medallas.push({
        icon: nivelVictoriasActual.icon,
        tooltip: `${nivelVictoriasActual.nombre}<br>${nivelVictoriasActual.min}+ victorias`,
        locked: false,
        colorClass: nivelVictoriasActual.colorClass,
        cartelProgreso: cartelProgresoVictorias
      });
    }

    // 5. Logro oculto (ejemplo: nunca expulsado, aquí como placeholder)
    // (Eliminado logro oculto placeholder)
    // Renderizar medallas (ahora fuera de la tarjeta, en la parte inferior derecha)
    const medallasHtml = `
      <div class="dashboard-jugador-medallas-area" style="width:100%;margin-top:0;margin-bottom:0;justify-content:center;flex-direction:column;gap:0.2em;align-items:center;">
      <div class="dashboard-jugador-medallas-row">
        ${medallas.map((med) => {
        return `
          <div class="dashboard-jugador-medalla${med.locked ? ' locked' : ''} ${med.colorClass || ''}" tabindex="0" style="display:flex;flex-direction:column;align-items:center;">
          <span>${med.icon}</span>
          <div class="medalla-tooltip">
            <span class="medalla-tooltip-nombre ${med.colorClass || ''}">${med.tooltip.split('<br>')[0]}</span><br>
            <span class="medalla-tooltip-desc">${med.tooltip.split('<br>')[1]}</span>
          </div>
          </div>
        `;
        }).join('')}
      </div>
      <div class="dashboard-jugador-medallas-metricas" style="display:flex;gap:1.5em;justify-content:center;margin-top:0.7em;">
        <span class="medalla-metrica-text${medallas[0]?.locked ? ' locked' : (' nivel-' + (medallas[0]?.colorClass?.replace('nivel-','') || '2'))}" style="display:flex;flex-direction:column;align-items:center;font-size:1.18em;line-height:1.1;">
        <span style="font-size:1.2em;font-weight:700;">${golesHistoricos}</span>
        <span style="font-size:0.8em;letter-spacing:0.01em;">Goles</span>
        </span>
        <span class="medalla-metrica-text${medallas[1]?.locked ? ' locked' : (' nivel-' + (medallas[1]?.colorClass?.replace('nivel-','') || '2'))}" style="display:flex;flex-direction:column;align-items:center;font-size:1.18em;line-height:1.1;">
        <span style="font-size:1.2em;font-weight:700;">${partidosHistoricos}</span>
        <span style="font-size:0.8em;letter-spacing:0.01em;">Partidos</span>
        </span>
        <span class="medalla-metrica-text${medallas[2]?.locked ? ' locked' : (' nivel-' + (medallas[2]?.colorClass?.replace('nivel-','') || '2'))}" style="display:flex;flex-direction:column;align-items:center;font-size:1.18em;line-height:1.1;">
        <span style="font-size:1.2em;font-weight:700;">${victoriasHistoricas}</span>
        <span style="font-size:0.8em;letter-spacing:0.01em;">Victorias</span>
        </span>
      </div>
      </div>`;

    resumenDiv.innerHTML = `
      <div class="dashboard-jugador-layout">
        <div class="dashboard-jugador-panel-izq">
          <img src="${rutaImg}" alt="${jugador}" style="width:180px;height:180px;border-radius:50%;box-shadow:0 2px 12px #ffd70033;object-fit:cover;" onerror="this.onerror=null;this.src='img/jugadores/jugador-vacio.png';" />
          <h2>${jugador}</h2>
          <div style="width:100%;margin-top:1.2em;">${medallasHtml}</div>
        </div>
      </div>
    `;
    // Limpiar logros de la derecha
    logrosDiv.innerHTML = "";
    // Renderizar gráficos en los nuevos contenedores del grid
    // Filtro para el gráfico de barras
    let tipoBarra = 'goles';
    let agrupBarra = 'mes';
    let anioBarra = 'Histórico';
    const selectTipo = document.getElementById('dashboardBarChartTipo');
    const selectAgrup = document.getElementById('dashboardBarChartAgrup');
    const selectAnio = document.getElementById('dashboardBarChartAnio');
    // Poblar filtro de año dinámicamente
    if (selectAnio) {
      // Obtener años disponibles de los datos del jugador
      const dataRows = window.dataRowsOriginal.filter(cols => cols[window.idxJugador] === jugador);
      const idxFecha = window.idxFecha;
      const aniosSet = new Set();
      dataRows.forEach(cols => {
        const fecha = cols[idxFecha];
        if (!fecha) return;
        let year = '';
        if (fecha.includes('-')) year = fecha.split('-')[0];
        else if (fecha.includes('/')) year = fecha.split('/').pop();
        else year = fecha.substring(0, 4);
        aniosSet.add(year);
      });
      const anios = Array.from(aniosSet).sort();
      selectAnio.innerHTML = '';
      const optHist = document.createElement('option');
      optHist.value = 'Histórico';
      optHist.textContent = 'Histórico';
      selectAnio.appendChild(optHist);
      anios.forEach(anio => {
        const opt = document.createElement('option');
        opt.value = anio;
        opt.textContent = anio;
        selectAnio.appendChild(opt);
      });
      selectAnio.value = 'Histórico';
      selectAnio.onchange = function() {
        anioBarra = this.value;
        renderBarChartJugador(jugador, graficoBarrasDiv, tipoBarra, agrupBarra, anioBarra);
      };
    }
    if (selectTipo) {
      selectTipo.value = 'goles';
      selectTipo.onchange = function() {
        tipoBarra = this.value;
        renderBarChartJugador(jugador, graficoBarrasDiv, tipoBarra, agrupBarra, anioBarra);
      };
    }
    if (selectAgrup) {
      selectAgrup.value = 'mes';
      selectAgrup.onchange = function() {
        agrupBarra = this.value;
        renderBarChartJugador(jugador, graficoBarrasDiv, tipoBarra, agrupBarra, anioBarra);
      };
    }
    renderBarChartJugador(jugador, graficoBarrasDiv, tipoBarra, agrupBarra, anioBarra);
    renderPieChartJugador(jugador, graficoTortaDiv);
// Helpers para renderizar los gráficos en los nuevos contenedores
function renderBarChartJugador(jugador, container, tipo = 'goles', agrup = 'mes', anio = 'Histórico') {
  if (!container) return;
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  // Dejar que CSS controle el tamaño visual; Chart.js reescala el canvas
  canvas.width = 420; // tamaño base
  canvas.height = 260; // coincide con CSS para evitar deformaciones
  container.appendChild(canvas);
  // Obtener datos
  let dataRows = window.dataRowsOriginal;
  const idxFecha = window.idxFecha;
  const idxJugador = window.idxJugador;
  const idxGoles = window.idxGoles;
  const idxPuntos = window.idxPuntos;
  // Filtrar por año si corresponde
  if (anio && anio !== 'Histórico') {
    dataRows = dataRows.filter(cols => {
      const fecha = cols[idxFecha];
      if (!fecha) return false;
      let year = '';
      if (fecha.includes('-')) year = fecha.split('-')[0];
      else if (fecha.includes('/')) year = fecha.split('/').pop();
      else year = fecha.substring(0, 4);
      return year == anio;
    });
  }
  const partidosJugador = dataRows.filter(cols => cols[idxJugador] === jugador);
  // Agrupar goles o puntos por mes o por día
  const valoresPorAgrup = {};
  partidosJugador.forEach(cols => {
    const fecha = cols[idxFecha];
    const valor = tipo === 'goles' ? (Number(cols[idxGoles]) || 0) : (Number(cols[idxPuntos]) || 0);
    let clave = '';
    if (agrup === 'mes') {
      if (fecha.includes('-')) {
        // Formato YYYY-MM-DD
        const [anio, mesNum] = fecha.split('-');
        clave = `${anio}-${mesNum}`;
      } else if (fecha.includes('/')) {
        // Formato DD/MM/YYYY
        const partes = fecha.split('/');
        clave = `${partes[2]}-${partes[1].padStart(2, '0')}`;
      } else {
        clave = fecha.substring(0, 7);
      }
    } else {
      // Agrupar por día
      if (fecha.includes('-')) {
        // Formato YYYY-MM-DD
        clave = fecha;
      } else if (fecha.includes('/')) {
        // Formato DD/MM/YYYY
        const partes = fecha.split('/');
        clave = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      } else {
        clave = fecha;
      }
    }
    if (!valoresPorAgrup[clave]) valoresPorAgrup[clave] = 0;
    valoresPorAgrup[clave] += valor;
  });
  const claves = Object.keys(valoresPorAgrup).sort();
  let etiquetas = [];
  if (agrup === 'mes') {
    const mesesAbrev = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    etiquetas = claves.map(m => {
      const [anio, mesNum] = m.split('-');
      const mesIdx = parseInt(mesNum, 10) - 1;
      const abrev = mesesAbrev[mesIdx] || mesNum;
      return `${abrev} ${anio.slice(-2)}`;
    });
  } else {
    etiquetas = claves.map(f => {
      // Mostrar solo día y mes abreviado
      if (f.includes('-')) {
        const [anio, mes, dia] = f.split('-');
        return `${dia}/${mes}/${anio.slice(-2)}`;
      }
      return f;
    });
  }
  const valores = claves.map(k => valoresPorAgrup[k]);
  if (valores.length > 0) {
    const ctxBar = canvas.getContext('2d');
    const max = Math.max(...valores);
    const bgColors = valores.map(v => v === max ? '#4fc3f7' : '#ffd70099');
    const borderColors = valores.map(v => v === max ? '#1976d2' : '#ffd700');
  new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: tipo === 'goles'
            ? (agrup === 'mes' ? 'Goles por mes' : 'Goles por día')
            : (agrup === 'mes' ? 'Puntos por mes' : 'Puntos por día'),
          data: valores,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#ffd700' } },
          y: { beginAtZero: true, ticks: { color: '#ffd700' } }
        }
      }
    });
  }
}

function renderPieChartJugador(jugador, container) {
  if (!container) return;
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 220;
  canvas.height = 220;
  container.appendChild(canvas);
  // Obtener datos
  // SIEMPRE HISTÓRICO
  const dataRows = window.dataRowsOriginal;
  const idxJugador = window.idxJugador;
  const idxPuntos = window.idxPuntos;
  const partidosJugador = dataRows.filter(cols => cols[idxJugador] === jugador);
  if (partidosJugador.length > 0) {
    let victorias = 0, empates = 0, derrotas = 0;
    partidosJugador.forEach(cols => {
      const puntos = Number(cols[idxPuntos]);
      if (puntos === 3) victorias++;
      else if (puntos === 1) empates++;
      else if (puntos === 0) derrotas++;
    });
    const ctxPie = canvas.getContext('2d');
    new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: ['', '', ''], // Sin palabras
        datasets: [{
          data: [victorias, empates, derrotas],
          backgroundColor: ['#21c97a', '#ffd700', '#e74a3b'],
          borderColor: '#23263a',
          borderWidth: 2,
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                // Solo mostrar el valor
                return context.parsed;
              }
            }
          }
        }
      }
    });
    // Mostrar los valores debajo del gráfico, alineados con los colores
    const valoresDiv = document.createElement('div');
    valoresDiv.style.display = 'flex';
    valoresDiv.style.justifyContent = 'center';
    valoresDiv.style.gap = '1.5em';
    valoresDiv.style.marginTop = '1em';
    valoresDiv.innerHTML = `
      <span style="font-size:1.3em;font-weight:700;color:#21c97a;">${victorias}</span>
      <span style="font-size:1.3em;font-weight:700;color:#ffd700;">${empates}</span>
      <span style="font-size:1.3em;font-weight:700;color:#e74a3b;">${derrotas}</span>
    `;
    container.appendChild(valoresDiv);
  }
}
  }
  select.onchange = mostrarDashboard;
  mostrarDashboard();
}

// Llamar al renderizador del dashboard cuando se cargan las métricas
window.addEventListener('DOMContentLoaded', () => {
  if (window.metricasPorJugador) {
    renderDashboardJugador(window.metricasPorJugador);
  }
});
// --- FUNCIONES AUXILIARES PARA NUEVAS MÉTRICAS ---
function calcularEfectividadGoles(jugador, dataRows, idxJugador, idxGoles) {
  const partidos = dataRows.filter(cols => cols[idxJugador] === jugador);
  if (partidos.length === 0) return 0;
  const conGol = partidos.filter(cols => Number(cols[idxGoles]) > 0).length;
  return ((conGol / partidos.length) * 100).toFixed(0);
}
function calcularMaximoGoles(jugador, dataRows, idxJugador, idxGoles) {
  const partidos = dataRows.filter(cols => cols[idxJugador] === jugador);
  if (partidos.length === 0) return 0;
  return Math.max(...partidos.map(cols => Number(cols[idxGoles]) || 0));
}

// (Eliminada redefinición duplicada de filtrarYRenderizarPorAnio)

// Llamar al renderizador del filtro de fecha al cargar
window.addEventListener('DOMContentLoaded', () => {
  renderFiltroFechaTablaGeneral();
});

function agregarBotonModoTabla(tablaDiv) {
  // Siempre aplicar modo compacto si se llama esta función
  if (!tablaDiv) return;
  const tablaCont = tablaDiv.closest('.tabla');
  if (tablaCont && !tablaCont.classList.contains('compact')) {
    tablaCont.classList.add('compact');
  }
}

// Devuelve un color de fondo con gradiente de azul claro a dorado según el valor de goles, con más transparencia
function colorFondoGoles(goles, maxGoles) {
  // De 0 a maxGoles, interpolar entre azul claro (#b3e5fc) y dorado suave (#ffe066)
  const t = Math.max(0, Math.min(1, goles / maxGoles));
  const r = Math.round(179 + (255 - 179) * t);
  const g = Math.round(229 + (224 - 229) * t);
  const b = Math.round(252 + (102 - 252) * t);
  return `rgba(${r},${g},${b},0.32)`; // Más transparente
}

window.renderCorrelacionChart = function() {
    const container = document.getElementById('grafico-desempeno');
    if (!container) return;
  // No limpiar los controles, solo el gráfico
  // El mínimo de partidos depende del control de 'comparadorPartidosMinimos'

    // Buscar o crear el canvas
    let canvas = document.getElementById('correlacionChart');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'correlacionChart';
        container.appendChild(canvas);
    }
    // Asegura que el tamaño real del canvas coincida con el CSS para evitar deformaciones
    canvas.width = 1000;
    canvas.height = 500;
    canvas.style.width = '1000px';
    canvas.style.height = '500px';
    canvas.style.maxWidth = '100%';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    // Etiquetas para los ejes y mapeo a propiedades reales
  const etiquetas = {
        partidos_jugados: 'Partidos jugados',
    puntos_totales: 'Puntos',
        goles_totales: 'Goles totales',
        victorias: 'Victorias',
        derrotas: 'Derrotas',
        goles_por_partido: 'Goles por partido',
        diferencia_gol: 'Diferencia de gol',
        puntos_por_partido: 'Puntos por partido'
    };
  const mapeo = {
        partidos_jugados: j => j.partidos,
    puntos_totales: j => j.puntos,
        goles_totales: j => j.goles,
        victorias: j => j.ganados,
        derrotas: j => j.perdidos,
        goles_por_partido: j => j.partidos > 0 ? (j.goles / j.partidos) : 0,
        puntos_por_partido: j => j.partidos > 0 ? (j.puntos / j.partidos) : 0,
        diferencia_gol: j => (typeof j.difGol !== 'undefined' ? j.difGol : 0)
    };

    function renderChart() {
        // Leer SIEMPRE los valores actuales de los dropdowns
  const ejeX = document.getElementById('ejeX') ? document.getElementById('ejeX').value : 'partidos_jugados';
  const ejeY = document.getElementById('ejeY') ? document.getElementById('ejeY').value : 'goles_totales';
  // Leer el filtro global del comparador; default a 0 si no existe
  const inputMinComp = document.getElementById('comparadorPartidosMinimos');
  const minPartidos = inputMinComp ? Math.max(0, Number(inputMinComp.value) || 0) : 0;
        const metricas = window.metricasPorJugador || {};
    const datosReales = Object.entries(metricas)
      .filter(([nombre, j]) => (Number(j.partidos) || 0) >= minPartidos)
            .map(([nombre, j]) => {
                // Usar la clave como nombre principal
                let nombreMostrar = nombre;
                // Si el objeto tiene un campo nombre y es válido, lo usamos para mostrar, pero la clave manda para imagen y tooltip
                if (j.nombre && typeof j.nombre === 'string' && j.nombre.trim()) {
                    nombreMostrar = j.nombre.trim();
                }
                let nombreArchivo = nombre.trim().toLowerCase()
                    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                    .replace(/[^a-z0-9]/g, '');
                const imgPath = `img/jugadores/jugador-${nombreArchivo}.png`;
                return {
                    x: mapeo[ejeX] ? mapeo[ejeX](j) : 0,
                    y: mapeo[ejeY] ? mapeo[ejeY](j) : 0,
                    nombre: nombreMostrar,
                    img: imgPath
                };
            })
            .filter(d => d && d.nombre && d.nombre.trim());
        // Pre-cargar imágenes y luego renderizar el gráfico
        const images = datosReales.map(d => {
            const img = new window.Image();
            img.src = d.img;
            img.onerror = function() { this.src = 'img/jugadores/jugador-vacio.png'; };
            return img;
        });
        // Actualizar badge visual con el mínimo actual
        try {
          const badge = document.getElementById('correlacionMinInfo');
          if (badge) {
            badge.textContent = minPartidos > 0 ? `Jugadores con ${minPartidos}+ partidos` : 'Todos los jugadores';
          }
        } catch(_) {}
        Promise.all(images.map(img => new Promise(res => {
            if (img.complete) res();
            else img.onload = res;
        }))).then(() => {
            const ctx = canvas.getContext('2d');
            if (window.correlacionChartInstance) {
                window.correlacionChartInstance.destroy();
            }
            // Plugin para dibujar líneas de fondo según ejes seleccionados
            const fondoLineasPlugin = {
                id: 'fondoLineas',
                beforeDatasetsDraw(chart) {
                    // Detectar ejes actuales
                    const ejeXVal = ejeX;
                    const ejeYVal = ejeY;
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;
          const xMin = xScale.min, xMax = xScale.max;
          const yMin = yScale.min, yMax = yScale.max;
          // Helper: intersecta y = m*x con el rectángulo visible y devuelve dos puntos dentro [ [x1,y1], [x2,y2] ] o null
          function getVisibleSegment(m) {
            const pts = [];
            // Intersección con x = xMin y x = xMax
            const y_at_xMin = m * xMin; if (y_at_xMin >= yMin && y_at_xMin <= yMax) pts.push([xMin, y_at_xMin]);
            const y_at_xMax = m * xMax; if (y_at_xMax >= yMin && y_at_xMax <= yMax) pts.push([xMax, y_at_xMax]);
            // Intersección con y = yMin y y = yMax
            if (m !== 0) {
              const x_at_yMin = yMin / m; if (x_at_yMin >= xMin && x_at_yMin <= xMax) pts.push([x_at_yMin, yMin]);
              const x_at_yMax = yMax / m; if (x_at_yMax >= xMin && x_at_yMax <= xMax) pts.push([x_at_yMax, yMax]);
            }
            // Quitar duplicados aproximando
            const uniq = [];
            pts.forEach(([x,y]) => {
              const found = uniq.some(([ux,uy]) => Math.abs(ux-x) < 1e-6 && Math.abs(uy-y) < 1e-6);
              if (!found) uniq.push([x,y]);
            });
            if (uniq.length < 2) return null;
            // Elegir dos extremos por x
            uniq.sort((a,b)=>a[0]-b[0]);
            return [uniq[0], uniq[uniq.length-1]];
          }
          // Dibuja una familia de rectas y prepara etiquetas visibles
          function drawFamily(pendientes, colores, labelPrefix) {
            const ctx = chart.ctx;
            const ca = chart.chartArea;
            // 1) Líneas: se dibujan CLIPeadas para no salir del área
            ctx.save();
            ctx.beginPath();
            ctx.rect(ca.left, ca.top, ca.right - ca.left, ca.bottom - ca.top);
            ctx.clip();
            pendientes.forEach((m, idx) => {
              const seg = getVisibleSegment(m);
              if (!seg) return;
              const [[x1,y1],[x2,y2]] = seg;
              ctx.beginPath();
              ctx.moveTo(xScale.getPixelForValue(x1), yScale.getPixelForValue(y1));
              ctx.lineTo(xScale.getPixelForValue(x2), yScale.getPixelForValue(y2));
              ctx.strokeStyle = colores[idx % colores.length];
              ctx.lineWidth = 2;
              ctx.setLineDash([6,6]);
              ctx.globalAlpha = 0.9;
              ctx.stroke();
              ctx.setLineDash([]);
            });
            ctx.restore();

            // 2) Etiquetas: SIN clip, empujadas hacia adentro para ser siempre visibles
            const margin = 10; // margen interior mínimo
            const labels = [];
            pendientes.forEach((m, idx) => {
              const seg = getVisibleSegment(m);
              if (!seg) return;
              const [[,],[x2,y2]] = seg; // extremo derecho (por ordenación previa)
              let xPix = xScale.getPixelForValue(x2);
              let yPix = yScale.getPixelForValue(y2);
              // Empujar hacia adentro del área
              if (xPix > ca.right - margin) xPix = ca.right - margin;
              if (xPix < ca.left + margin)  xPix = ca.left + margin;
              if (yPix > ca.bottom - margin) yPix = ca.bottom - margin;
              if (yPix < ca.top + margin)    yPix = ca.top + margin;
              labels.push({
                text: `${labelPrefix} = ${m}`,
                x: xPix,
                y: yPix,
                color: colores[idx % colores.length]
              });
            });
            chart.$refLabels = (chart.$refLabels || []).concat(labels);
          }
          if (ejeXVal === 'partidos_jugados' && ejeYVal === 'goles_totales') {
            drawFamily([0.5,1,2,3,4], ['#8be9fdcc', '#21c97a88', '#ffd70088', '#e74a3b88', '#4a90e288'], 'GxP');
          } else if (ejeXVal === 'partidos_jugados' && ejeYVal === 'puntos_totales') {
            // Agregamos 0.5 a PxP como referencia adicional
            drawFamily([0.5,1,2,3], ['#8be9fd88', '#8be9fdcc', '#21c97a88', '#ffd70088'], 'PxP');
          }
                },
                afterDraw(chart) {
                  // Dibujar las etiquetas por encima de datasets e imágenes
                  const labels = chart.$refLabels || [];
                  if (!labels.length) return;
                  const ctx = chart.ctx;
                  labels.forEach(({ text, x, y, color }) => {
                    ctx.save();
                    ctx.globalAlpha = 1;
                    ctx.font = '600 14px Segoe UI, Arial, sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    // Texto con el mismo color que la recta y fondo transparente
                    const solid = color.replace('88','ff').replace('cc','ff');
                    // Sombra sutil para legibilidad sobre fondos oscuros
                    ctx.shadowColor = 'rgba(0,0,0,0.55)';
                    ctx.shadowBlur = 2;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1;
                    ctx.fillStyle = solid;
                    ctx.fillText(text, x, y - 2);
                    ctx.restore();
                  });
                  // Limpiar para el siguiente ciclo
                  chart.$refLabels = [];
                }
            };
            // Plugin para dibujar imágenes manualmente, pero después de los tooltips
            const imagePlugin = {
                id: 'playerImages',
                afterDatasetsDraw(chart) {
                    const meta = chart.getDatasetMeta(0);
                    // Obtener el pointRadius actual del dataset (puede ser número o función)
                    const dataset = chart.data.datasets[0];
                    let pointRadius = dataset.pointRadius;
                    if (typeof pointRadius === 'function') {
                        // Si es función, usar el primer punto
                        pointRadius = pointRadius({ dataIndex: 0, dataset, chart });
                    }
                    meta.data.forEach((point, i) => {
                        const img = images[i];
                        if (!img) return;
                        // Usar el pointRadius para el tamaño de la imagen
                        let size = pointRadius * 2;
                        // Si hay pointRadius por punto, intentar usarlo
                        if (Array.isArray(dataset.pointRadius)) {
                            size = (dataset.pointRadius[i] || pointRadius) * 2;
                        }
                        const x = point.x - size/2;
                        const y = point.y - size/2;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, size/2, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, x, y, size, size);
                        ctx.restore();
                        // Opcional: dibujar borde
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, size/2, 0, 2 * Math.PI);
                        ctx.strokeStyle = '#ffd700';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.restore();
                    });
                }
            };
            window.correlacionChartInstance = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: etiquetas[ejeY] + ' vs ' + etiquetas[ejeX],
                        data: datosReales,
                        backgroundColor: 'rgba(0,0,0,0)', // invisible, solo para hitbox
                        borderColor: 'rgba(0,0,0,0)',
                        pointRadius: 24,
                        pointHoverRadius: 30
                    }]
                },
                options: {
                    plugins: {
                        tooltip: {
                            backgroundColor: '#23263aee',
                            borderColor: '#ffd700',
                            borderWidth: 2,
                            titleColor: '#ffd700',
                            bodyColor: '#fff8e1',
                            cornerRadius: 10,
                            caretSize: 8,
                            padding: 14,
                            titleFont: { size: 16, weight: 'bold', family: 'Segoe UI, Arial, sans-serif' },
                            bodyFont: { size: 15, family: 'Segoe UI, Arial, sans-serif' },
                            boxPadding: 8,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    // Mostrar todos los nombres de los jugadores en dorado
                                    return context.map(c => c.raw.nombre);
                                },
                                label: function(context) {
                                    // Solo los valores, sin el nombre
                                    const d = context.raw;
                                    // Mostrar solo 2 decimales si corresponde
                                    let xVal = d.x;
                                    let yVal = d.y;
                                    if (ejeX === 'puntos_por_partido' || ejeX === 'goles_por_partido') xVal = Number(d.x).toFixed(2);
                                    if (ejeY === 'puntos_por_partido' || ejeY === 'goles_por_partido') yVal = Number(d.y).toFixed(2);
                                    return `${etiquetas[ejeX]} = ${xVal}, ${etiquetas[ejeY]} = ${yVal}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: etiquetas[ejeX]
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: etiquetas[ejeY]
                            }
                        }
                    }
                },
                plugins: [fondoLineasPlugin, imagePlugin]
            });
        });
    }

    // Inicializar y listeners
    renderChart();
    // Ya no hay filtro de input, solo renderChart directo
    const ejeXElem = document.getElementById('ejeX');
    const ejeYElem = document.getElementById('ejeY');
    if (ejeXElem) ejeXElem.onchange = renderChart;
    if (ejeYElem) ejeYElem.onchange = renderChart;

    // Los listeners se agregan fuera de esta función para evitar duplicados
// Listeners para los dropdowns de ejes (solo una vez al cargar la página)
document.addEventListener('DOMContentLoaded', function() {
  const ejeXElem = document.getElementById('ejeX');
  const ejeYElem = document.getElementById('ejeY');
  const inputMinComp = document.getElementById('comparadorPartidosMinimos');
  function safeRender() {
    const tabCorr = document.getElementById('comparadorTabCorrelacion');
    if (tabCorr && tabCorr.style.display !== 'none') {
      window.renderCorrelacionChart();
    }
  }
  if (ejeXElem) ejeXElem.onchange = safeRender;
  if (ejeYElem) ejeYElem.onchange = safeRender;
  if (inputMinComp) inputMinComp.addEventListener('input', safeRender);
});
}

// === Sinergias (nuevo submenú) ===
window.renderSinergias = function() {
  const grid = document.getElementById('sinergiasGrid');
  if (!grid) return;
  const multi = document.getElementById('sinJugadoresMulti');
  const count = document.getElementById('sinJugadoresCount');
  const btn = document.getElementById('sinJugadoresBtn');
  const panel = document.getElementById('sinJugadoresPanel');
  const cerrar = document.getElementById('sinJugadoresCerrar');
  const clear = document.getElementById('sinJugadoresClear');
  const selectAll = document.getElementById('sinJugadoresSelectAll');
  const selModo = document.getElementById('sinModo');
  const selMet = document.getElementById('sinMetrica');
  const inputMinComp = document.getElementById('comparadorPartidosMinimos');
  const inputMinDupla = document.getElementById('sinMinPartidosDupla');
  // Estado de zoom (persistencia simple en memoria; se podría llevar a localStorage si querés)
  if (typeof window._sinZoomFactor !== 'number') {
    const z = Number(localStorage.getItem('sinZoomFactor'));
    window._sinZoomFactor = isNaN(z) || z <= 0 ? 1 : z;
  }
  const zoomInBtn = document.getElementById('sinZoomInBtn');
  const zoomOutBtn = document.getElementById('sinZoomOutBtn');
  const zoomResetBtn = document.getElementById('sinZoomResetBtn');
  const zoomLabel = document.getElementById('sinZoomLabel');
  // Helper: construir opciones elegibles según partidos mínimos
  function buildSinergiasEligibleList() {
    if (!multi) return;
    let partidosMinimos = 5;
    if (inputMinComp) {
      const v = Number(inputMinComp.value);
      if (!isNaN(v) && v>=0) partidosMinimos = v;
    }
    let jugadores = [];
    const metricas = window.metricasPorJugador || {};
    if (metricas && Object.keys(metricas).length) {
      jugadores = Object.entries(metricas)
        .filter(([_, m]) => Number(m.partidos||0) >= partidosMinimos)
        .map(([j])=>j);
    } else if (Array.isArray(window.dataRowsOriginal) && typeof window.idxJugador === 'number') {
      jugadores = Array.from(new Set(window.dataRowsOriginal.map(r => String(r[window.idxJugador]).trim())));
    }
    jugadores.sort((a,b)=> a.localeCompare(b,'es'));
    const prevSeleccion = new Set(Array.from(multi.options).filter(o=>o.selected).map(o=>o.value));
    const prevScroll = multi.scrollTop;
    multi.innerHTML = '';
    jugadores.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.text = n; opt.selected = prevSeleccion.has(n);
      multi.appendChild(opt);
    });
    if (count) count.textContent = String(Array.from(multi.options).filter(o=>o.selected).length);
    try { multi.scrollTop = prevScroll; requestAnimationFrame(()=>{ multi.scrollTop = prevScroll; }); } catch(_){}
  }
  // Alinear opciones de "Métrica" con el "Modo" seleccionado
  function updateMetricOptions() {
    if (!selMet) return;
    const prev = selMet.value;
    const modo = selModo ? selModo.value : 'juntos';
    let html = '';
    if (modo === 'vs') {
      html = '<option value="hist">Historial directo</option>' +
             '<option value="pj">Partidos</option>';
    } else {
      html = '<option value="wr">Win rate</option>' +
             '<option value="gd">Dif. de gol (medio)</option>' +
             '<option value="gdt">Dif. de gol (total)</option>' +
             '<option value="pj">Partidos</option>';
    }
    selMet.innerHTML = html;
    // Restaurar selección si sigue siendo válida; si no, elegir por defecto (wr en juntos, pj en vs)
  const allowed = Array.from(selMet.options).map(o=>o.value);
  const target = allowed.includes(prev) ? prev : (modo==='vs' ? 'hist' : 'wr');
    selMet.value = target;
  }
  // Inicializar multiselect elegible según filtro global
  if (multi && multi.options.length === 0) buildSinergiasEligibleList();
  if (count && multi) count.textContent = String(Array.from(multi.options).filter(o=>o.selected).length);
  // Eventos panel
  if (btn && panel && !btn.dataset.sinHandler) { btn.onclick = ()=>{ panel.style.display = panel.style.display==='none'?'block':'none'; }; btn.dataset.sinHandler='1'; }
  if (cerrar && panel && !cerrar.dataset.sinHandler) { cerrar.onclick = ()=>{ panel.style.display = 'none'; }; cerrar.dataset.sinHandler='1'; }
  if (clear && multi && count && !clear.dataset.sinHandler) { clear.onclick = ()=>{
    Array.from(multi.options).forEach(o=>o.selected=false);
    count.textContent = '0';
    dibujar();
  }; clear.dataset.sinHandler='1'; }
  if (selectAll && multi && count && !selectAll.dataset.sinHandler) { selectAll.onclick = ()=>{
    Array.from(multi.options).forEach(o=>o.selected=true);
    count.textContent = String(multi.options.length);
    dibujar();
  }; selectAll.dataset.sinHandler='1'; }
  if (multi && count && !multi.dataset.sinChange) { multi.onchange = ()=>{
    count.textContent = String(Array.from(multi.options).filter(o=>o.selected).length);
    setTimeout(() => dibujar(), 0);
  }; multi.dataset.sinChange='1'; }
  // Toggle selección con click simple (sin CTRL)
  if (multi && !multi.dataset.sinToggle) {
  multi.addEventListener('mousedown', (e) => {
      const target = e.target;
      if (target && target.tagName === 'OPTION') {
  // Guardar y restaurar scroll para evitar que salte al inicio
 const st = multi.scrollTop;
  e.preventDefault();
  target.selected = !target.selected;
  multi.dispatchEvent(new Event('change'));
 // Restaurar scroll inmediatamente y en el próximo frame por si hay reflow
  multi.scrollTop = st;
 requestAnimationFrame(() => { multi.scrollTop = st; });
      }
    });
    multi.dataset.sinToggle = '1';
  }
  // Cerrar panel al hacer click fuera
  if (!window._sinergiasOutsideClickBound && panel && btn) {
    document.addEventListener('click', (e) => {
      if (panel.style.display==='none') return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      panel.style.display = 'none';
    });
    window._sinergiasOutsideClickBound = true;
  }
  // Inicializar opciones de métrica según el modo actual
  updateMetricOptions();
  if (selModo && !selModo.dataset.sinModoHandler) {
    selModo.onchange = () => { updateMetricOptions(); dibujar(); };
    selModo.dataset.sinModoHandler = '1';
  }
  if (selMet && !selMet.dataset.sinMetHandler) {
    selMet.onchange = dibujar;
    selMet.dataset.sinMetHandler = '1';
  }
  if (inputMinDupla && !inputMinDupla.dataset.sinDuplaHandler) {
    // restaurar desde localStorage
    try {
      const sv = localStorage.getItem('sinMinPartidosDupla');
      if (sv!==null && sv!=='' && !isNaN(Number(sv))) inputMinDupla.value = sv;
    } catch(_) {}
    inputMinDupla.addEventListener('input', ()=>{ try { localStorage.setItem('sinMinPartidosDupla', String(inputMinDupla.value)); } catch(_) {} dibujar(); });
    inputMinDupla.dataset.sinDuplaHandler='1';
  }
  // Escuchar cambios del filtro global de mínimos para actualizar la lista y re-dibujar
  if (inputMinComp && !inputMinComp.dataset.sinergiasListener) {
    inputMinComp.addEventListener('input', () => { buildSinergiasEligibleList(); dibujar(); });
    inputMinComp.dataset.sinergiasListener = '1';
  }

  // Listeners de Zoom
  function applyZoomLabel() {
    if (zoomLabel) zoomLabel.textContent = Math.round(window._sinZoomFactor * 100) + '%';
  }
  function clampZoom(z) { return Math.max(0.4, Math.min(2.0, z)); }
  if (zoomInBtn && !zoomInBtn.dataset.zoomHandler) {
  zoomInBtn.addEventListener('click', () => { window._sinZoomFactor = clampZoom(window._sinZoomFactor * 1.15); localStorage.setItem('sinZoomFactor', String(window._sinZoomFactor)); applyZoomLabel(); dibujar(); });
    zoomInBtn.dataset.zoomHandler = '1';
  }
  if (zoomOutBtn && !zoomOutBtn.dataset.zoomHandler) {
  zoomOutBtn.addEventListener('click', () => { window._sinZoomFactor = clampZoom(window._sinZoomFactor / 1.15); localStorage.setItem('sinZoomFactor', String(window._sinZoomFactor)); applyZoomLabel(); dibujar(); });
    zoomOutBtn.dataset.zoomHandler = '1';
  }
  if (zoomResetBtn && !zoomResetBtn.dataset.zoomHandler) {
  zoomResetBtn.addEventListener('click', () => { window._sinZoomFactor = 1; localStorage.setItem('sinZoomFactor', '1'); applyZoomLabel(); dibujar(); });
    zoomResetBtn.dataset.zoomHandler = '1';
  }
  applyZoomLabel();

  function normalizarFecha(f) {
    const parts = f.split(/[\/-]/).map(x=>parseInt(x,10));
    let [dd,mm,yy] = parts;
    if (yy < 100) yy = 2000 + yy;
    return new Date(yy, (mm||1)-1, dd||1);
  }

  function agruparPorFecha(rows, idxFecha) {
    const mapa = new Map();
    for (const r of rows) {
      const f = r[idxFecha];
      if (!mapa.has(f)) mapa.set(f, []);
      mapa.get(f).push(r);
    }
    return mapa;
  }

  function computeSinergias(rows, modo, jugadoresSel, minPJ) {
    const idxFecha = window.idxFecha, idxJugador = window.idxJugador, idxPuntos = window.idxPuntos, idxGoles = window.idxGoles;
    const idxAutogoles = typeof window.idxAutogoles==='number'?window.idxAutogoles:-1;
    if (idxFecha==null || idxJugador==null || idxPuntos==null || idxGoles==null) return { jugadores: [], matriz: new Map(), totales:{} };
    const porFecha = agruparPorFecha(rows, idxFecha);
    const setSel = new Set(jugadoresSel);
    const key = (a,b)=> a < b ? a+"|"+b : b+"|"+a;
    const matriz = new Map(); // clave par -> stats
    const totales = { min: Infinity, max: -Infinity };
    for (const [f, lista] of porFecha.entries()) {
      // separar por puntos
      const eqGan = lista.filter(r=>Number(r[idxPuntos])===3);
      const eqPer = lista.filter(r=>Number(r[idxPuntos])===0);
      const eqEmp = lista.filter(r=>Number(r[idxPuntos])===1);
      // calcular goles netos de equipo
      const suma = (arr, i)=>arr.reduce((a,c)=>a+Number(c[i]||0),0);
      const auto = (arr)=> idxAutogoles>=0? arr.reduce((a,c)=>a+Number(c[idxAutogoles]||0),0):0;
      let teamA=[], teamB=[], gA=0, gB=0, hayEmp=false;
      if (eqGan.length && eqPer.length) {
        // dos equipos claros
        teamA = eqGan; teamB = eqPer;
        const gPropA = suma(teamA, idxGoles), gPropB = suma(teamB, idxGoles);
        const gAutoA = auto(teamA), gAutoB = auto(teamB);
        gA = gPropA + gAutoB; gB = gPropB + gAutoA;
      } else {
        // empate: dividir en dos mitades para GD, pero WR lo excluye
        hayEmp = eqEmp.length>0;
        if (hayEmp) {
          const mitad = Math.ceil(eqEmp.length/2);
          teamA = eqEmp.slice(0,mitad); teamB = eqEmp.slice(mitad);
          const gPropA = suma(teamA, idxGoles), gPropB = suma(teamB, idxGoles);
          const gAutoA = auto(teamA), gAutoB = auto(teamB);
          gA = gPropA + gAutoB; gB = gPropB + gAutoA;
        } else continue;
      }
      const nombresA = teamA.map(r=>String(r[idxJugador]).trim());
      const nombresB = teamB.map(r=>String(r[idxJugador]).trim());
      const selA = nombresA.filter(n=>setSel.has(n));
      const selB = nombresB.filter(n=>setSel.has(n));
      if (modo==='juntos') {
        // dentro de cada equipo
        const act = (a,b,win,emp,gd)=>{
          if (a===b) return;
          const k = key(a,b);
          if (!matriz.has(k)) matriz.set(k,{pj:0,w:0,l:0,e:0,gdAcum:0});
          const s = matriz.get(k);
          s.pj++; s.gdAcum += gd; if (win) s.w++; else if (emp) s.e++; else s.l++;
        };
        const winA = gA>gB, winB = gB>gA, emp = gA===gB;
        for (let i=0;i<selA.length;i++) for (let j=i+1;j<selA.length;j++) act(selA[i], selA[j], winA, emp, gA-gB);
        for (let i=0;i<selB.length;i++) for (let j=i+1;j<selB.length;j++) act(selB[i], selB[j], winB, emp, gB-gA);
      } else {
        // enfrentados: orientación A->B
        for (const a of selA) for (const b of selB) {
          // A -> B (perspectiva de la fila A versus la columna B)
          const k = a+"|"+b;
          if (!matriz.has(k)) matriz.set(k,{pj:0,w:0,l:0,e:0,gdAcum:0});
          const s = matriz.get(k);
          s.pj++; s.gdAcum += (gA-gB);
          if (gA>gB) s.w++; else if (gA<gB) s.l++; else s.e++;
          // B -> A (perspectiva de la fila B versus la columna A)
          const k2 = b+"|"+a;
          if (!matriz.has(k2)) matriz.set(k2,{pj:0,w:0,l:0,e:0,gdAcum:0});
          const s2 = matriz.get(k2);
          s2.pj++; s2.gdAcum += (gB-gA);
          if (gB>gA) s2.w++; else if (gB<gA) s2.l++; else s2.e++;
        }
      }
    }
    // derivar métricas y filtrar por minPJ
    const jugadores = Array.from(new Set(jugadoresSel)).sort();
    const datos = new Map();
    for (const [k,s] of matriz.entries()) {
      if (s.pj < minPJ) continue;
      const denom = Math.max(1, (s.w + s.l)); // empates excluidos del WR
      const wr = (s.w/denom)*100;
      const gdMed = s.gdAcum / s.pj;
      datos.set(k, { ...s, wr, gdMed, gdTot: s.gdAcum });
      if (wr<totales.min) totales.min = wr; if (wr>totales.max) totales.max = wr;
    }
    return { jugadores, datos };
  }

  function colorWR(p) {
    // 0=rojo, 50=ámbar, 100=verde
    const clamp = (x,min,max)=>Math.max(min,Math.min(max,x));
    const t = clamp(p,0,100)/100;
    // interp entre rojo(168,35,26) -> ámbar(191,174,90) -> verde(33,140,95)
    let r,g,b;
    if (t<0.5) {
      const u = t/0.5; r = 168 + (191-168)*u; g = 35 + (174-35)*u; b = 26 + (90-26)*u;
    } else {
      const u = (t-0.5)/0.5; r = 191 + (33-191)*u; g = 174 + (140-174)*u; b = 90 + (95-90)*u;
    }
    return `rgb(${r|0},${g|0},${b|0})`;
  }

  function dibujar() {
    const modo = selModo ? selModo.value : 'juntos';
    const met = selMet ? selMet.value : 'wr';
    const minDupla = inputMinDupla ? Math.max(0, Number(inputMinDupla.value)||0) : 0;
  // Ajustar estilo del grid: en 'vs' solo para 'hist' activamos espaciado especial y visuales
  const isVsHist = (modo==='vs' && met==='hist');
  if (grid) {
    grid.classList.toggle('vs-mode', isVsHist);
    grid.dataset.vsActive = isVsHist ? '1' : '0';
  }
  const infoEl = document.getElementById('sinergiasInfo');
  // Ya no filtramos por mínimos en datos; solo en la lista de jugadores
  const min = 0;
    const jugadoresSel = multi ? Array.from(multi.options).filter(o=>o.selected).map(o=>o.value) : [];
    const rowsSrc = window.dataRowsOriginal || [];
    const idxFecha = window.idxFecha;
    let rows = rowsSrc;
    try { rows = filtrarPorAnio(rowsSrc, idxFecha, anioSeleccionado||'Histórico'); } catch(_){}
  // Guardar scroll del multiselect para no perder posición tras re-render
  const prevScroll = multi ? multi.scrollTop : 0;
  const { jugadores, datos } = computeSinergias(rows, modo, jugadoresSel, min);
    if (!jugadores.length) {
      grid.innerHTML = '<div style="text-align:center;color:#b0b0b0;">Seleccioná jugadores con el botón “Jugadores”.</div>';
      return;
    }
    // Actualizar leyenda corta
    if (infoEl) {
      if (isVsHist) infoEl.textContent = 'En enfrentados: leé por filas. El color aplica al jugador de la fila vs el de la columna.';
      else infoEl.textContent = (met==='wr') ? 'WR excluye empates. Pasá el mouse por cada celda para detalles.' : 'Pasá el mouse por cada celda para detalles.';
    }
    // Rango dinámico para DG total: escala simétrica alrededor de 0 en función del máximo absoluto actual
    let maxAbsGdTot = 0;
    if (met === 'gdt') {
      for (const s of datos.values()) {
        const a = Math.abs(s.gdTot || 0);
        if (a > maxAbsGdTot) maxAbsGdTot = a;
      }
      if (maxAbsGdTot === 0) maxAbsGdTot = 1; // evitar división por cero; 0 -> ámbar (50%)
    }
  // construir grid headers
    const n = jugadores.length;
    // Ajuste adaptativo de tipografía/alto de celda según cantidad de jugadores
    // Objetivo: con pocos jugadores, letras más grandes; a medida que crece n, reducir hasta un mínimo.
    // Cuando alcanza el mínimo, el contenedor ya usa scroll por overflow.
    // Parámetros de escala (pueden ajustarse tras probar):
  const baseFontEm = 0.95;   // em base
  const minFontEm = 0.66;    // límite inferior (un poco más pequeño)
  const baseMinH = 42;       // px base alto mínimo de celda
  const minMinH = 28;        // px límite inferior (un poco más pequeño)
    // Niveles donde empezamos a reducir tipografía: a partir de 8 jugadores suavemente, llegando al mínimo en ~22
    const startShrinkN = 8;
    const endShrinkN = 22;
    let scaleT = 0;
    if (n > startShrinkN) {
      scaleT = Math.min(1, (n - startShrinkN) / Math.max(1, (endShrinkN - startShrinkN)));
    }
  // Aplicar zoom global multiplicativo sobre la escala adaptativa
  const fontEm = (baseFontEm - (baseFontEm - minFontEm) * scaleT) * window._sinZoomFactor;
  const minH = Math.round((baseMinH - (baseMinH - minMinH) * scaleT) * window._sinZoomFactor);
    // Aplicar como variables CSS al grid
    grid.style.setProperty('--sin-font', fontEm + 'em');
    grid.style.setProperty('--sin-minh', minH + 'px');
    grid.style.display = 'grid';
    // Añadir columna de resumen (W/Total) solo en vs+hist
    // También ajustar mínimas de columnas un poco con la escala: bajarlas cuando la fuente es más chica
  let colMin = Math.max(44, Math.round(72 - 24 * scaleT)); // de 72px a 44px
  colMin = Math.max(28, Math.round(colMin * window._sinZoomFactor)); // también afectado por zoom, con piso 28px
    // Escalar columnas fijas (nombre y G/T) con el zoom
  const firstCol = Math.max(72, Math.round(140 * window._sinZoomFactor));
  const sumCol = Math.max(36, Math.round(60 * window._sinZoomFactor));
    if (isVsHist) {
      grid.style.gridTemplateColumns = `${firstCol}px ${sumCol}px repeat(${n}, minmax(${colMin}px, 1fr))`;
    } else {
      grid.style.gridTemplateColumns = `${firstCol}px repeat(${n}, minmax(${colMin}px, 1fr))`;
    }
    // Ajustar offset pegajoso izquierdo (coincide con la primera columna fija)
    const leftSticky = firstCol;
    grid.style.setProperty('--sin-left-sticky', leftSticky + 'px');
    let html = '';
  // fila header
  html += `<div class="sinergias-cell sinergias-row-header sinergias-col-header" style="background:#23263a;"></div>`;
  if (isVsHist) html += `<div class="sinergias-cell gt-summary sinergias-col-header" style="font-weight:700;background:#23263a;">G/T</div>`;
  // Header de columnas: usar abreviatura si es muy largo (máx 8-10 caracteres), conservar nombre completo en title
  for (let j=0;j<n;j++) {
    const full = jugadores[j];
    let short = full;
    if (full.length > 10) short = full.split(' ').map(p=>p[0]).join('').slice(0,4) + ' ' + full.split(' ').slice(-1)[0].slice(0,6);
    if (short.length > 10) short = short.slice(0,9) + '…';
    html += `<div class="sinergias-cell sinergias-col-header" title="${full.replace(/\"/g,'&quot;')}" style="font-weight:700;background:#23263a;">${short}</div>`;
  }
    for (let i=0;i<n;i++) {
      const bandClass = isVsHist ? (i % 2 === 0 ? ' vs-band-even' : ' vs-band-odd') : '';
      const sepClass = (isVsHist && i>0) ? ' vs-row-sep' : '';
      // header columna izquierda
  const rowHeaderAttrs = isVsHist ? ` data-row="${i}" class="sinergias-cell vs-row-header sinergias-row-header${bandClass}${sepClass}"` : ` class="sinergias-cell sinergias-row-header"`;
      {
        const full = jugadores[i];
        let short = full;
        if (full.length > 14) short = full.split(' ').map(p=>p[0]).join('').slice(0,4) + ' ' + full.split(' ').slice(-1)[0].slice(0,8);
        if (short.length > 14) short = short.slice(0,13) + '…';
        html += `<div${rowHeaderAttrs} title="${full.replace(/\"/g,'&quot;')}" style="font-weight:700;background:#23263a;">${short}</div>`;
      }
      // columna resumen G/Total a la derecha del nombre (solo vs+hist)
      if (isVsHist) {
        let tot = 0, wins = 0;
        for (let j=0;j<n;j++) {
          if (j===i) continue;
          const kSum = jugadores[i]+"|"+jugadores[j];
          const sSum = datos.get(kSum);
          if (sSum) {
            tot++;
            if (sSum.w > sSum.l) wins++;
          }
        }
        const pct = tot ? Math.round((wins / tot) * 100) : 0;
        // Mapear porcentaje a color (0-25 rojo, 25-50 amarillo, 50-75 verde claro, 75-100 verde oscuro)
        let pctColor = '#a8231a'; // rojo
        if (pct >= 75) pctColor = '#1f8057'; // verde oscuro
        else if (pct >= 50) pctColor = '#33b976'; // verde claro
        else if (pct >= 25) pctColor = '#d2b531'; // amarillo
        const sumAttrs = ` data-row="${i}" class="sinergias-cell vs-cell gt-summary${bandClass}${sepClass}"`;
        html += `<div${sumAttrs} title="Ganados/Total respecto a rivales visibles" style="background:#23263a;">
          <div class="gt-top" style="color:${pctColor};">${wins}/${tot}</div>
          <div class="gt-sub" style="color:${pctColor};">${pct}%</div>
        </div>`;
      }
      for (let j=0;j<n;j++) {
        if (i===j) { html += `<div class="sinergias-cell disabled">—</div>`; continue; }
        const k = (modo==='juntos')? (jugadores[i] < jugadores[j] ? jugadores[i]+"|"+jugadores[j] : jugadores[j]+"|"+jugadores[i]) : (jugadores[i]+"|"+jugadores[j]);
        const s = datos.get(k);
        if (!s) { html += `<div class="sinergias-cell" style="opacity:.25;">·</div>`; continue; }
        const insuf = s.pj < minDupla;
  let valText = '', bg = '#1e2232', title='';
  if (met==='wr') {
    valText = `${s.wr.toFixed(0)}%`;
    bg = colorWR(s.wr);
  } else if (met==='hist') {
    // Historial desde la perspectiva de la FILA contra la COLUMNA
    const a = jugadores[i], b = jugadores[j];
    const ganador = (s.w > s.l) ? a : (s.w < s.l ? b : 'Empate');
    const denom = (s.w + s.l);
    const p = denom === 0 ? 50 : (s.w / denom) * 100; // color respecto a la fila
    bg = colorWR(p);
  // No mostrar empates en el valor: solo W-L
  valText = `<div class="sinergias-hist"><div class="hist-val">${s.w}-${s.l}</div><div class="hist-winner">${ganador}</div></div>`;
  } else if (met==='gd') {
    valText = (s.gdMed>=0?'+':'')+s.gdMed.toFixed(2);
    const scaled = Math.max(-3, Math.min(3, s.gdMed));
    const p = (scaled+3)/6*100;
    bg = colorWR(p);
  } else if (met==='gdt') {
    valText = (s.gdTot>=0?'+':'')+s.gdTot;
    const p = ((s.gdTot / maxAbsGdTot) + 1) * 50;
    bg = colorWR(p);
  } else {
    // Partidos (pj)
    valText = `${s.pj}`;
    const p = Math.min(1, s.pj/10)*100;
    bg = colorWR(p);
  }
  // Tooltips
  if (modo==='juntos') {
    title = `${jugadores[i]} + ${jugadores[j]}\nPJ ${s.pj} | W ${s.w} · E ${s.e} · L ${s.l}\nWR ${s.wr.toFixed(1)}%\nDG total ${(s.gdTot>=0?'+':'')+s.gdTot} | DG medio ${(s.gdMed>=0?'+':'')+s.gdMed.toFixed(2)}`;
  } else {
    if (met === 'hist') {
      const a = jugadores[i], b = jugadores[j];
      const ganador = (s.w > s.l) ? a : (s.w < s.l ? b : 'Empate en historial');
      const perdedor = (s.w > s.l) ? b : (s.w < s.l ? a : '—');
  // No mostrar empates en el tooltip: solo W y L
  title = `${a} vs ${b}\nPartidos: ${s.pj}\nHistorial: ${s.w} W · ${s.l} L\n${ganador==='Empate en historial' ? 'Historial: Empate' : `Ganador: ${ganador}\nPerdedor: ${perdedor}`}`;
    } else {
      title = `${jugadores[i]} vs ${jugadores[j]}\nPF ${s.pj} | W ${s.w} · E ${s.e} · L ${s.l}\nWR ${s.wr.toFixed(1)}%\nDG total ${(s.gdTot>=0?'+':'')+s.gdTot} | DG medio ${(s.gdMed>=0?'+':'')+s.gdMed.toFixed(2)}`;
    }
  }
        // Dataset para tooltip custom
  const ds = ` data-a="${jugadores[i]}" data-b="${jugadores[j]}" data-pj="${s.pj}" data-w="${s.w}" data-e="${s.e}" data-l="${s.l}" data-wr="${s.wr.toFixed(1)}" data-gdtot="${(s.gdTot>=0?'+':'')+s.gdTot}" data-gdmed="${(s.gdMed>=0?'+':'')+s.gdMed.toFixed(2)}" data-met="${met}" data-modo="${modo}" data-insuf="${insuf? '1':'0'}"`;
  const cellAttrs = isVsHist ? ` data-row="${i}" class="sinergias-cell vs-cell${bandClass}${sepClass}${insuf?' insuf':''}"` : ` class="sinergias-cell${insuf?' insuf':''}"`;
  const styleExtra = insuf? 'opacity:.35;filter:grayscale(0.35) brightness(0.85);' : '';
  const badge = insuf? `<span style='position:absolute;top:2px;right:4px;font-size:0.55em;font-weight:700;color:#000;background:#ffd700cc;padding:1px 4px;border-radius:4px;'>${s.pj}</span>`:'';
  html += `<div${cellAttrs}${ds} title="${title.replace(/\"/g,'&quot;')}" style="background:${bg};color:#000;box-shadow:inset 0 0 0 1px #0002;position:relative;${styleExtra}">${valText}${badge}</div>`;
      }
    }
  grid.innerHTML = html;
  // Quitar title nativo de celdas de datos (no headers) para evitar doble tooltip
  grid.querySelectorAll('.sinergias-cell:not(.sinergias-col-header)[title]').forEach(el=>{
    el.setAttribute('aria-label', el.getAttribute('title')||''); // accesibilidad
    el.removeAttribute('title');
  });
  // === Tooltip custom (evita fallos del title nativo en algunos navegadores) ===
  if (!document.getElementById('sinergiasTooltip')) {
    const tip = document.createElement('div');
    tip.id = 'sinergiasTooltip';
    tip.style.position = 'fixed';
    tip.style.pointerEvents = 'none';
    tip.style.zIndex = '1000';
    tip.style.background = '#161a24';
    tip.style.color = '#ffd700';
    tip.style.padding = '6px 8px';
    tip.style.border = '1px solid #ffd70055';
    tip.style.borderRadius = '8px';
    tip.style.fontSize = '12px';
    tip.style.fontWeight = '600';
    tip.style.boxShadow = '0 2px 8px #000a, 0 0 0 1px #0006';
    tip.style.maxWidth = '260px';
    tip.style.lineHeight = '1.25';
    tip.style.display = 'none';
    document.body.appendChild(tip);
  }
  const tipEl = document.getElementById('sinergiasTooltip');
  // Delegado de eventos (una sola vez)
  if (!grid.dataset.tooltipBound) {
    grid.addEventListener('mousemove', (e)=>{
      const cell = e.target.closest('.sinergias-cell');
      if (!cell || !grid.contains(cell) || cell.classList.contains('disabled')) { tipEl.style.display='none'; return; }
      // Construir contenido según data
      const a = cell.dataset.a, b = cell.dataset.b;
      if (!a || !b) { tipEl.style.display='none'; return; }
      const pj = cell.dataset.pj, w = cell.dataset.w, l = cell.dataset.l, emp = cell.dataset.e;
      const wr = cell.dataset.wr, gdTot = cell.dataset.gdtot, gdMed = cell.dataset.gdmed;
      const modoC = cell.dataset.modo, metC = cell.dataset.met;
      let lines = [];
      if (modoC === 'juntos') {
        lines.push(`<strong>${a} + ${b}</strong>`);
        lines.push(`PJ ${pj} | W ${w} · E ${emp} · L ${l}`);
        lines.push(`WR ${wr}%`);
        lines.push(`DG total ${gdTot} | DG medio ${gdMed}`);
      } else if (metC === 'hist') {
        lines.push(`<strong>${a} vs ${b}</strong>`);
        lines.push(`PJ ${pj} | W ${w} · L ${l}`);
        const ganador = (Number(w)>Number(l))?a: (Number(l)>Number(w)? b: 'Empate');
        if (ganador==='Empate') lines.push('Historial: Empate'); else lines.push(`Ganador: ${ganador}`);
      } else {
        lines.push(`<strong>${a} vs ${b}</strong>`);
        lines.push(`PJ ${pj} | W ${w} · E ${emp} · L ${l}`);
        lines.push(`WR ${wr}%`);
        lines.push(`DG total ${gdTot} | DG medio ${gdMed}`);
      }
      tipEl.innerHTML = lines.join('<br>');
      const margin = 14;
      let x = e.clientX + margin;
      let y = e.clientY + margin;
      const vw = window.innerWidth, vh = window.innerHeight;
      const rect = tipEl.getBoundingClientRect();
      // Ajustar si se sale
      if (x + rect.width + 8 > vw) x = e.clientX - rect.width - margin;
      if (y + rect.height + 8 > vh) y = e.clientY - rect.height - margin;
      tipEl.style.left = x + 'px';
      tipEl.style.top = y + 'px';
      tipEl.style.display = 'block';
    });
    grid.addEventListener('mouseleave', ()=>{ tipEl.style.display='none'; });
    grid.dataset.tooltipBound = '1';
  }
  // Agregar o limpiar líneas separadoras entre filas sólo en vs+hist
  // Limpiar líneas anteriores por si re-renderiza
  grid.querySelectorAll('.vs-row-line').forEach(n=>n.remove());
  if (isVsHist) {
    const headers = Array.from(grid.querySelectorAll('.vs-row-header'));
    const rectGrid = grid.getBoundingClientRect();
    for (let idx = 1; idx < headers.length; idx++) {
      const prev = headers[idx-1].getBoundingClientRect();
      const curr = headers[idx].getBoundingClientRect();
      const prevBottom = prev.bottom - rectGrid.top;
      const currTop = curr.top - rectGrid.top;
      const mid = (prevBottom + currTop) / 2; // punto medio entre filas
      const line = document.createElement('div');
      line.className = 'vs-row-line';
      line.style.top = `${mid - 1.5}px`; // centrar línea de 3px
      // Ajuste ancho inicial (lo sobreescribimos luego para cubrir scrollWidth)
      grid.appendChild(line);
    }
    const adjustVsRowLines = () => {
      const sw = grid.scrollWidth; // ancho total desplazable
      const w = Math.max(sw - 12, 0); // restar márgenes left/right simulados (6px c/u)
      grid.querySelectorAll('.vs-row-line').forEach(line => {
        line.style.right = 'auto';
        line.style.left = '6px';
        line.style.width = w + 'px';
      });
    };
    adjustVsRowLines();
    // Ajustar nuevamente tras el frame (por si fuentes/zoom cambian medidas)
    requestAnimationFrame(adjustVsRowLines);
    // Refuerzo: asegurar que headers (nombre + G/T) mantengan sticky left
    const enforceStickyCols = () => {
      const leftSticky = parseFloat(getComputedStyle(grid).getPropertyValue('--sin-left-sticky')) || 0;
      grid.querySelectorAll('.sinergias-row-header').forEach(h => {
        h.style.position = 'sticky';
        h.style.left = '0px';
      });
      grid.querySelectorAll('.gt-summary').forEach(g => {
        g.style.position = 'sticky';
        g.style.left = leftSticky + 'px';
      });
    };
    enforceStickyCols();
    requestAnimationFrame(enforceStickyCols);
    // Vincular a resize una sola vez por sesión
    if (!grid.dataset.vsLinesResizeBound) {
      window.addEventListener('resize', () => { adjustVsRowLines(); enforceStickyCols(); });
      grid.addEventListener('scroll', () => { /* no cambia scrollWidth, pero si zoom dinámico forzara re-render no necesitamos aquí */ });
      grid.dataset.vsLinesResizeBound = '1';
    }
  }
  // En modo vs, resaltar banda de fila al pasar el mouse
  if (!grid.dataset.vsHoverBound) {
    const clearHL = ()=>{
      const prev = grid.dataset.activeRow;
      if (prev!=null) {
        grid.querySelectorAll(`[data-row="${prev}"]`).forEach(el=>el.classList.remove('row-hl'));
        delete grid.dataset.activeRow;
      }
    };
    grid.addEventListener('mouseleave', () => { if (grid.dataset.vsActive==='1') clearHL(); else clearHL(); });
    grid.addEventListener('mouseover', (e) => {
      if (grid.dataset.vsActive!=='1') return;
      const cell = e.target.closest('.sinergias-cell');
      if (!cell) return;
      const r = cell.getAttribute('data-row');
      if (r==null) return;
      const prev = grid.dataset.activeRow;
      if (prev===r) return;
      if (prev!=null) grid.querySelectorAll(`[data-row="${prev}"]`).forEach(el=>el.classList.remove('row-hl'));
      grid.querySelectorAll(`[data-row="${r}"]`).forEach(el=>el.classList.add('row-hl'));
      grid.dataset.activeRow = r;
    });
    grid.dataset.vsHoverBound = '1';
  }
  // Si no está activo vs+hist, asegurarse de limpiar cualquier resalto previo
  if (!isVsHist) {
    const prev = grid.dataset.activeRow;
    if (prev!=null) {
      grid.querySelectorAll(`[data-row="${prev}"]`).forEach(el=>el.classList.remove('row-hl'));
      delete grid.dataset.activeRow;
    }
  }
  // Restaurar scroll del multiselect si aplica
  if (multi) { try { multi.scrollTop = prevScroll; requestAnimationFrame(() => { multi.scrollTop = prevScroll; }); } catch(_){} }
  }
  // primera pintura
  // Si es la primera vez que entramos a Sinergias en la sesión, seleccionar todos por defecto
  if (!window._sinergiasFirstInit) {
    if (multi) Array.from(multi.options).forEach(o=>o.selected=true);
    if (count && multi) count.textContent = String(multi.options.length);
    window._sinergiasFirstInit = true;
  }
  dibujar();
}