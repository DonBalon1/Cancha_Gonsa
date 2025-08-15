// --- REGISTRO DE LOGROS POR JUGADOR ---
// Configuración de medallas por logro
const registroLogrosConfig = {
  goles: [
    { nivel: 1, nombre: 'Madera', min: 3, max: 14 },
    { nivel: 2, nombre: 'Bronce', min: 15, max: 39 },
    { nivel: 3, nombre: 'Hierro', min: 40, max: 79 },
    { nivel: 4, nombre: 'Plata', min: 80, max: 149 },
    { nivel: 5, nombre: 'Oro', min: 150, max: 299 },
    { nivel: 6, nombre: 'Diamante', min: 300, max: 599 },
    { nivel: 7, nombre: 'Dios del Futbol', min: 600, max: Infinity }
  ],
  partidos: [
    { nivel: 1, nombre: 'Madera', min: 5, max: 19 },
    { nivel: 2, nombre: 'Bronce', min: 20, max: 49 },
    { nivel: 3, nombre: 'Hierro', min: 50, max: 74 },
    { nivel: 4, nombre: 'Plata', min: 75, max: 99 },
    { nivel: 5, nombre: 'Oro', min: 100, max: 149 },
    { nivel: 6, nombre: 'Diamante', min: 150, max: 299 },
    { nivel: 7, nombre: 'Dueño del gimnasio', min: 300, max: Infinity }
  ],
  victorias: [
    { nivel: 1, nombre: 'Madera', min: 2, max: 14 },
    { nivel: 2, nombre: 'Bronce', min: 15, max: 29 },
    { nivel: 3, nombre: 'Hierro', min: 30, max: 59 },
    { nivel: 4, nombre: 'Plata', min: 60, max: 79 },
    { nivel: 5, nombre: 'Oro', min: 80, max: 99 },
    { nivel: 6, nombre: 'Diamante', min: 100, max: 249 },
    { nivel: 7, nombre: 'Máquina de Ganar', min: 250, max: Infinity }
  ]
};


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
    html += `<div style="background:#23263a;border-radius:12px;box-shadow:0 2px 12px ${color.border}55;padding:1em 1.2em;margin-bottom:1.2em;border:2.5px solid ${color.border};">
      <div style="font-size:1.35em;font-weight:900;letter-spacing:0.04em;margin-bottom:0.5em;text-shadow:0 2px 12px ${color.border}99,0 1px 8px #0003;color:${color.border};filter:brightness(1.15);">
        ${medalla.nombre}
      </div>
      <div style="color:#ffd700b0;font-size:1em;margin-bottom:0.5em;display:flex;flex-wrap:wrap;gap:1em;align-items:center;">
        ${jugadores.length ? jugadores.map(j => `
          <span style="display:flex;align-items:center;gap:0.5em;background:#23263a99;padding:0.25em 0.7em;border-radius:8px;box-shadow:0 2px 8px ${color.border}22;">
            <img src="${j.img}" alt="${j.nombre}" onerror="this.onerror=null;this.src='img/jugadores/jugador-vacio.png';" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${color.border};box-shadow:0 1px 6px ${color.border}33;">
            <span style="color:${color.border};font-weight:600;">${j.nombre}</span>
          </span>
        `).join('') : `<span style=\"color:#ffd70055\">Ningún jugador</span>`}
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
});
// (Lógica de medallas escalables movida dentro de la función renderDashboardJugador)
// URL del CSV publicado de Google Sheets
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQT1Nu2BTvja759foXvBs5Digg77UesBBgfpaUNVvNW92pQLckEE4Z_HZU5OmDVYvH6_MgeFqq6HRqz/pub?gid=1609934683&single=true&output=csv';

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
    const ganadores = partido.filter(cols => Number(cols[idxPuntos]) === 3);
    const perdedores = partido.filter(cols => Number(cols[idxPuntos]) === 0);
    const golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    const golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    const diferencia = golesGanadores - golesPerdedores;
    ganadores.forEach(cols => {
      const jugador = cols[idxJugador];
      if (!metricasPorJugador[jugador]) metricasPorJugador[jugador] = { puntos: 0, goles: 0, partidos: 0, ganados: 0, empatados: 0, perdidos: 0, difGol: 0 };
      metricasPorJugador[jugador].difGol = (metricasPorJugador[jugador].difGol || 0) + diferencia;
    });
    perdedores.forEach(cols => {
      const jugador = cols[idxJugador];
      if (!metricasPorJugador[jugador]) metricasPorJugador[jugador] = { puntos: 0, goles: 0, partidos: 0, ganados: 0, empatados: 0, perdidos: 0, difGol: 0 };
      metricasPorJugador[jugador].difGol = (metricasPorJugador[jugador].difGol || 0) - diferencia;
    });
  });
  dataFiltrada.forEach(cols => {
    const jugador = cols[idxJugador];
    const puntos = Number(cols[idxPuntos]);
    const goles = Number(cols[idxGoles]);
    if (jugador) {
      if (!metricasPorJugador[jugador]) {
        metricasPorJugador[jugador] = {
          puntos: 0,
          goles: 0,
          partidos: 0,
          ganados: 0,
          empatados: 0,
          perdidos: 0,
          difGol: 0
        };
      }
      if (!isNaN(puntos)) metricasPorJugador[jugador].puntos += puntos;
      if (!isNaN(goles)) metricasPorJugador[jugador].goles += goles;
      metricasPorJugador[jugador].partidos += 1;
      if (puntos === 3) metricasPorJugador[jugador].ganados += 1;
      else if (puntos === 1) metricasPorJugador[jugador].empatados += 1;
      else if (puntos === 0) metricasPorJugador[jugador].perdidos += 1;
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
  renderComparadorJugadores(window.metricasPorJugador);
  renderDashboardJugador(window.metricasPorJugador);
}

// Modificar el fetch principal para detectar años y renderizar el selector
fetch(csvUrl)
  .then(response => response.text())
  .then(csv => {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',');
    const dataRows = rows.slice(1).map(row => row.split(','));
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
    anioSeleccionado = aniosDisponibles[aniosDisponibles.length - 1]; // Por defecto el más reciente
    window.dataRowsOriginal = dataRows;
    window.idxFecha = idxFecha;
    window.idxJugador = headers.findIndex(h => h.trim().toLowerCase() === 'jugador');
    window.idxPuntos = headers.findIndex(h => h.trim().toLowerCase() === 'puntos');
    window.idxGoles = headers.findIndex(h => h.trim().toLowerCase() === 'goles');
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
  // Agrupa los partidos de cada jugador y devuelve los últimos goles
  const golesPorJugador = {};
  dataRows.forEach(cols => {
    const jugador = cols[idxJugador];
    const goles = Number(cols[idxGoles]);
    if (!golesPorJugador[jugador]) golesPorJugador[jugador] = [];
    golesPorJugador[jugador].push(isNaN(goles) ? 0 : goles);
  });
  // Devuelve los últimos N goles (más recientes al final)
  const ultimosGoles = {};
  Object.entries(golesPorJugador).forEach(([jugador, goles]) => {
    ultimosGoles[jugador] = goles.slice(-cantidad);
  });
  return ultimosGoles;
}

function golesAColor(goles) {
  // Devuelve un span con círculo y número minimalista según la cantidad de goles
  if (goles === 0) return '<span class="dot dot-red"></span><span class="dot-num" style="color:#d32f2f;">0</span>';
  if (goles === 1) return '<span class="dot dot-yellow"></span><span class="dot-num" style="color:#b59f00;">1</span>';
  if (goles >= 2) return `<span class="dot dot-green"></span><span class="dot-num" style="color:#388e3c;">${goles}</span>`;
  return '';
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
  let partidosMinimos = 0;
  const inputExistente = filtroDiv.querySelector('#inputPartidosMinimos');
  if (inputExistente) {
    partidosMinimos = Number(inputExistente.value) || 0;
  } else {
    partidosMinimos = 0;
  }
  filtroDiv.innerHTML = `
    <label for=\"inputPartidosMinimos\" style=\"font-size:1.15em;\"><b>Partidos mínimos jugados:</b></label>
    <input type=\"number\" id=\"inputPartidosMinimos\" min=\"0\" value=\"${partidosMinimos}\" style=\"width:60px;margin-left:0.5em;height:2.1em;font-size:1.15em;text-align:center;vertical-align:middle;\">
  `;
  const inputMin = filtroDiv.querySelector('#inputPartidosMinimos');
  inputMin.value = partidosMinimos;
  inputMin.oninput = function() {
    renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles);
  };

  // Siempre aplicar modo compacto a la tabla principal
  const tablaCont = tablaDiv.closest('.tabla');
  if (tablaCont && !tablaCont.classList.contains('compact')) {
    tablaCont.classList.add('compact');
  }

  // --- Renderizar la tabla (sin caption) ---
  let html = `<table><thead><tr><th style='width:44px'></th><th>#</th><th>Jugador</th><th class='puntos'>Puntos</th><th class='col-g'>G</th><th class='col-e'>E</th><th class='col-p'>P</th><th>PJ</th><th>Goles</th><th>Dif. Gol</th><th>% Victorias</th><th>% Presencias</th><th>PxP</th><th>GxP</th><th>Rendimiento</th><th>Goleómetro</th></tr></thead><tbody>`;
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
    html += `<td style='text-align:center;'>${imgHtml}</td>`;
    html += `<td class=\"${claseTop}\">${posicion}</td><td>${jugador}</td>`;
  // Puntos sin podio
  html += `<td class='puntos'>${m.puntos}</td>`;
    html += `<td class='col-g'>${m.ganados}</td><td class='col-e'>${m.empatados}</td><td class='col-p'>${m.perdidos}</td>`;
  // Partidos (presencias) sin podio
  html += `<td>${m.partidos}</td>`;
  // Goles sin podio
  html += `<td>${m.goles}</td>`;
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
  let partidosMinimos = 0;
  const inputExistente = filtroDiv.querySelector('#inputPartidosMinimosGoleadores');
  if (inputExistente) {
    partidosMinimos = Number(inputExistente.value) || 0;
  } else {
    partidosMinimos = 0;
  }
  filtroDiv.innerHTML = `
    <label for="inputPartidosMinimosGoleadores" style="font-size:1.15em;"><b>Partidos mínimos jugados:</b></label>
    <input type="number" id="inputPartidosMinimosGoleadores" min="0" value="${partidosMinimos}" style="width:60px;margin-left:0.5em;height:2.1em;font-size:1.15em;text-align:center;vertical-align:middle;">
  `;
  const inputMin = filtroDiv.querySelector('#inputPartidosMinimosGoleadores');
  inputMin.value = partidosMinimos;
  inputMin.oninput = function() {
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
  let html = '<table><thead><tr><th style="width:44px"></th><th>#</th><th>Jugador</th><th class="col-goles">Goles</th><th>PJ</th><th>Veces goleador</th><th>GxP</th><th>Dif. Gol</th><th>Efect. Gol</th></tr></thead><tbody>';
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

    // Barra horizontal proporcional
    const barraWidth = maxGoles > 0 ? Math.round((m.goles / maxGoles) * 100) : 0;
    const barraColor = '#ffd700'; // amarillo
    const barraBg = '#23263a44';
    const colorTexto = '#fff';
    const textShadow = '0 1px 4px #23263a, 0 0 2px #000';
    const barraHTML = `<div style=\"background:${barraBg};border-radius:6px;height:1.1em;width:100%;position:relative;\"><div style=\"background:${barraColor};height:100%;width:${barraWidth}%;border-radius:6px;opacity:0.92;\"></div><span class='goles-barra-num' style=\"position:absolute;left:50%;top:0;width:100%;text-align:center;font-weight:700;color:${colorTexto};font-size:1em;transform:translateX(-50%);z-index:2;text-shadow:${textShadow};\">${m.goles}</span></div>`;
    html += `<tr style=\"--row-delay:${rowDelay}s\">`;
    html += `<td style='text-align:center;'>${imgHtml}</td>`;
    html += `<td class=\"${claseTop}\">${posicion}</td><td>${jugador}</td><td class=\"col-goles\">${barraHTML}</td><td>${m.partidos}</td><td>${vecesGoleador}</td><td class='${claseGxP(Number(golesPorPartido))}'>${golesPorPartido}</td><td class='${claseDifGol(Number(m.difGol||0))}'>${m.difGol || 0}</td><td class='${clasePorcentaje(Number(efectividadGol))}'>${efectividadGol}%</td></tr>`;
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
  const jugadoresConAsistencias = jugadores.map(jugador => {
    const asistencias = presenciasPorJugador[jugador].size;
    const total = fechas.length;
    const porcentaje = total > 0 ? (asistencias / total) : 0;
    return { jugador, asistencias, total, porcentaje };
  });

  // Ordenar de mayor a menor % de asistencias
  jugadoresConAsistencias.sort((a, b) => b.porcentaje - a.porcentaje);

  // Renderizar la tabla con columna de imagen y encabezado de fechas
  let html = '<table>';
  html += '<thead>';
  html += '<tr>';
  html += '<th style="width:44px" rowspan="2"></th>';
  html += '<th rowspan="2">Jugador</th>';
  html += '<th rowspan="2" style="text-align:center;">#</th>';
  html += '<th rowspan="2">% Presencias</th>';
  html += `<th colspan="${fechas.length}">Historial de Presencias</th>`;
  html += '</tr>';
  // Fila de fechas
  html += '<tr>';
  for (let i = 0; i < 4; i++) html += '<th style="display:none"></th>';
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
    html += `<td style='text-align:center;'>${imgHtml}</td>`;
    html += `<td>${jugador}</td><td class="${claseTop}">${asistencias} de ${total}</td><td class="${clasePorcentaje(porcentajeNum)}">${porcentajeStr}</td>`;
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
    // Goles por equipo
    let golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    let golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    let golesEmpatados = empatados.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    // Si es empate, segmentar goles por equipo
    let golesEquipo1 = 0, golesEquipo2 = 0;
    if (empatados.length) {
      const mitad = Math.ceil(empatados.length / 2);
      const equipo1 = empatados.slice(0, mitad);
      const equipo2 = empatados.slice(mitad);
      golesEquipo1 = equipo1.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
      golesEquipo2 = equipo2.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
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
      html += `<span style='font-weight:900;color:#4caf50;text-shadow:0 2px 8px #23263a,0 0 8px #4caf5040;'>${golesGanadores}</span> <span style='color:#ffd700;font-size:1.1em;text-shadow:0 1px 8px #ffd70099;'>-</span> <span style='font-weight:900;color:#d32f2f;text-shadow:0 2px 8px #23263a,0 0 8px #d32f2f40;'>${golesPerdedores}</span>`;
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
        html += `<span class="nombre-jugador" style="white-space:normal;overflow:visible;text-overflow:unset;max-width:220px;display:block;order:1;text-align:right;font-size:1.08em;">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
        html += `<span class="partido-card-goles" style="color:#4caf50;margin-top:2px;display:block;order:2;text-align:right;font-size:1em;white-space:normal;word-break:break-word;">${goles > 0 ? '<span class=\"icono-gol\" style=\"font-size:1em;\">⚽</span>'.repeat(goles) : ''}</span>`;
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
        html += `<span class=\"nombre-jugador\" style=\"white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;display:block;\">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
        if (goles > 0) html += `<span class=\"partido-card-goles\" style=\"color:#d32f2f;margin-top:2px;display:block;font-size:0.95em;white-space:nowrap;\">${'<span class=\\"icono-gol\\" style=\\"font-size:0.95em;\">⚽</span>'.repeat(goles)}</span>`;
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
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src=\"${rutaImg}\" alt=\"${nombre}\" onerror=\"this.onerror=null;this.src='${rutaImgVacia}';\" style=\"width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;\">`;
        const esGoleador = goles > 0 && goles === maxGolesPartido;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(255,215,0,0.13);color:#ffd700;display:flex;flex-direction:row-reverse;align-items:center;gap:0.5em;width:100%;\">`;
        html += imgHtml;
        html += `<span style=\"display:flex;flex-direction:column;align-items:flex-end;justify-content:center;min-width:0;width:100%;text-align:right;\">`;
        html += `<span class=\"nombre-jugador\" style=\"white-space:normal;overflow:visible;text-overflow:unset;max-width:220px;display:block;order:1;text-align:right;font-size:1.08em;\">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
        html += `<span class=\"partido-card-goles\" style=\"color:#ffd700;margin-top:2px;display:block;order:2;text-align:right;font-size:1em;white-space:normal;word-break:break-word;\">${goles > 0 ? '<span class=\\"icono-gol\\" style=\\"font-size:1em;\">⚽</span>'.repeat(goles) : ''}</span>`;
        html += `</span>`;
        html += `</span>`;
      });
      html += `</div>`;
      html += `<div class=\"separador-vertical\"></div>`;
      html += `<div class="equipo-columna equipo-empate">`;
      equipo2.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src=\"${rutaImg}\" alt=\"${nombre}\" onerror=\"this.onerror=null;this.src='${rutaImgVacia}';\" style=\"width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;\">`;
        const esGoleador = goles > 0 && goles === maxGolesPartido;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(255,215,0,0.13);color:#ffd700;display:flex;align-items:center;gap:0.5em;\">`;
        html += imgHtml;
        html += `<span style=\"display:flex;flex-direction:column;align-items:flex-start;min-width:0;\">`;
        html += `<span class=\"nombre-jugador\" style=\"white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;display:block;\">${nombre}${esGoleador ? ' 🥇' : ''}</span>`;
        if (goles > 0) html += `<span class=\"partido-card-goles\" style=\"color:#ffd700;margin-top:2px;word-break:break-all;\">${'<span class=\\"icono-gol\\">⚽</span>'.repeat(goles)}</span>`;
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

// --- COMPARADOR DE JUGADORES ---
function renderComparadorJugadores(metricasPorJugador) {
  // Botón random/sorpresa
  const randomBtn = document.getElementById('comparadorRandomBtn');
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
  const jugadores = Object.keys(metricasPorJugador);
  // Guardar selección previa
  const prev1 = select1.value;
  const prev2 = select2.value;
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
    if (!j1 || !j2 || j1 === j2) {
      estadisticasDiv.innerHTML = '<p style="color:orange;">Selecciona dos jugadores distintos.</p>';
      return;
    }
    const m1 = metricasPorJugador[j1];
    const m2 = metricasPorJugador[j2];
    if (!m1 || !m2) return;
    // Calcular % victorias y % asistencias
    const totalFechas = window.partidosTotales || 0;
    const pctVict1 = m1.partidos ? Math.round((m1.ganados / m1.partidos) * 100) : 0;
    const pctVict2 = m2.partidos ? Math.round((m2.ganados / m2.partidos) * 100) : 0;
    const pctAsist1 = totalFechas ? Math.round((m1.partidos / totalFechas) * 100) : 0;
    const pctAsist2 = totalFechas ? Math.round((m2.partidos / totalFechas) * 100) : 0;
    // Promedios
    const promGoles1 = m1.partidos ? (m1.goles / m1.partidos).toFixed(2) : '0.00';
    const promGoles2 = m2.partidos ? (m2.goles / m2.partidos).toFixed(2) : '0.00';
    const promPuntos1 = m1.partidos ? (m1.puntos / m1.partidos).toFixed(2) : '0.00';
    const promPuntos2 = m2.partidos ? (m2.puntos / m2.partidos).toFixed(2) : '0.00';
    // Goleador del partido
    const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
    const idxFecha = window.idxFecha;
    const idxJugador = window.idxJugador;
    const idxGoles = window.idxGoles;
    const vecesGoleador1 = contarVecesGoleadorDelPartido(j1, dataRows, idxFecha, idxJugador, idxGoles);
    const vecesGoleador2 = contarVecesGoleadorDelPartido(j2, dataRows, idxFecha, idxJugador, idxGoles);

    // Efectividad de goles y máximo de goles
    const efectividadGoles1 = Number(calcularEfectividadGoles(j1, dataRows, idxJugador, idxGoles));
    const efectividadGoles2 = Number(calcularEfectividadGoles(j2, dataRows, idxJugador, idxGoles));
    const maxGoles1 = Number(calcularMaximoGoles(j1, dataRows, idxJugador, idxGoles));
    const maxGoles2 = Number(calcularMaximoGoles(j2, dataRows, idxJugador, idxGoles));

    // Función para color comparativo
    function colorComparativo(val1, val2) {
      if (val1 > val2) return 'limegreen';
      if (val1 < val2) return '#d32f2f';
      return 'gray';
    }

    // Colores para todas las métricas
    const colorPartidos1 = colorComparativo(m1.partidos, m2.partidos);
    const colorPartidos2 = colorComparativo(m2.partidos, m1.partidos);
    const colorPuntos1 = colorComparativo(m1.puntos, m2.puntos);
    const colorPuntos2 = colorComparativo(m2.puntos, m1.puntos);
    const colorGoles1 = colorComparativo(m1.goles, m2.goles);
    const colorGoles2 = colorComparativo(m2.goles, m1.goles);
    const colorDifGol1 = colorComparativo(m1.difGol, m2.difGol);
    const colorDifGol2 = colorComparativo(m2.difGol, m1.difGol);
    const colorPctVict1 = colorComparativo(pctVict1, pctVict2);
    const colorPctVict2 = colorComparativo(pctVict2, pctVict1);
    const colorPctAsist1 = colorComparativo(pctAsist1, pctAsist2);
    const colorPctAsist2 = colorComparativo(pctAsist2, pctAsist1);
    const colorPromPuntos1 = colorComparativo(promPuntos1, promPuntos2);
    const colorPromPuntos2 = colorComparativo(promPuntos2, promPuntos1);
    const colorPromGoles1 = colorComparativo(promGoles1, promGoles2);
    const colorPromGoles2 = colorComparativo(promGoles2, promGoles1);
    const colorGoleador1 = colorComparativo(vecesGoleador1, vecesGoleador2);
    const colorGoleador2 = colorComparativo(vecesGoleador2, vecesGoleador1);
    const colorEfectividad1 = colorComparativo(efectividadGoles1, efectividadGoles2);
    const colorEfectividad2 = colorComparativo(efectividadGoles2, efectividadGoles1);
    const colorMaxGoles1 = colorComparativo(maxGoles1, maxGoles2);
    const colorMaxGoles2 = colorComparativo(maxGoles2, maxGoles1);

    // Contar cuántas métricas gana cada jugador
    const metricas = [
      colorPartidos1, colorPuntos1, colorGoles1, colorDifGol1, colorPctVict1, colorPctAsist1,
      colorPromPuntos1, colorPromGoles1, colorGoleador1, colorEfectividad1, colorMaxGoles1
    ];
    const metricas2 = [
      colorPartidos2, colorPuntos2, colorGoles2, colorDifGol2, colorPctVict2, colorPctAsist2,
      colorPromPuntos2, colorPromGoles2, colorGoleador2, colorEfectividad2, colorMaxGoles2
    ];
    const ganadas1 = metricas.filter(c => c === 'limegreen').length;
    const ganadas2 = metricas2.filter(c => c === 'limegreen').length;
    // Estadísticas en lista
    function estadisticasLista(m, colores, nombre, vecesGoleador, efectividad, maxGoles, pctVict, pctAsist, promPuntos, promGoles) {
      // Helper para clase de fondo
      function bgClass(color) {
        if (color === 'limegreen') return 'bg-mayor';
        if (color === '#d32f2f') return 'bg-menor';
        return 'bg-igual';
      }
      // Tooltips para cada métrica
      const tooltips = {
        'Partidos Jugados': 'Cantidad total de partidos jugados por el jugador.',
        'Puntos': 'Puntos totales obtenidos (3 por victoria, 1 por empate).',
        'Goles': 'Cantidad total de goles anotados.',
        'Diferencia de Gol': 'Goles a favor menos goles en contra.',
        '% Victorias': 'Porcentaje de partidos ganados sobre el total jugado.',
        '% Asistencias': 'Porcentaje de partidos jugados respecto al total de fechas.',
        'Prom. Puntos/Partido': 'Promedio de puntos obtenidos por partido jugado.',
        'Prom. Goles/Partido': 'Promedio de goles anotados por partido jugado.',
        'Veces Goleador del Partido': 'Cantidad de veces que fue el máximo goleador en un partido.',
        'Efectividad de Goles': 'Porcentaje de partidos en los que anotó al menos un gol.',
        'Máx. Goles en un Partido': 'Mayor cantidad de goles anotados en un solo partido.'
      };
      // Fila visual de ganados, empatados, perdidos SIN iconos
      const resultadosRow = `<div class="comparador-resultados-row">
        <span class="comparador-resultado-badge comparador-resultado-ganado" title="Ganados">${m.ganados}</span>
        <span class="comparador-resultado-badge comparador-resultado-empatado" title="Empatados">${m.empatados}</span>
        <span class="comparador-resultado-badge comparador-resultado-perdido" title="Perdidos">${m.perdidos}</span>
      </div>`;
      return resultadosRow + `<div class='comparador-estadisticas-lista'>
        <div class='comparador-estadistica-item ${bgClass(colores.partidos)}' title="${tooltips['Partidos Jugados']}"><span>Partidos Jugados</span><span><b style='color:${colores.partidos};'>${m.partidos}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.puntos)}' title="${tooltips['Puntos']}"><span>Puntos</span><span><b style='color:${colores.puntos};'>${m.puntos}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.goles)}' title="${tooltips['Goles']}"><span>Goles</span><span><b style='color:${colores.goles};'>${m.goles}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.difGol)}' title="${tooltips['Diferencia de Gol']}"><span>Diferencia de Gol</span><span><b style='color:${colores.difGol};'>${m.difGol}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.pctVict)}' title="${tooltips['% Victorias']}"><span>% Victorias</span><span><b style='color:${colores.pctVict};'>${pctVict}%</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.pctAsist)}' title="${tooltips['% Asistencias']}"><span>% Asistencias</span><span><b style='color:${colores.pctAsist};'>${pctAsist}%</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.promPuntos)}' title="${tooltips['Prom. Puntos/Partido']}"><span>Prom. Puntos/Partido</span><span><b style='color:${colores.promPuntos};'>${promPuntos}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.promGoles)}' title="${tooltips['Prom. Goles/Partido']}"><span>Prom. Goles/Partido</span><span><b style='color:${colores.promGoles};'>${promGoles}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.goleador)}' title="${tooltips['Veces Goleador del Partido']}"><span>Veces Goleador del Partido</span><span><b style='color:${colores.goleador};'>${vecesGoleador}</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.efectividad)}' title="${tooltips['Efectividad de Goles']}"><span>Efectividad de Goles</span><span><b style='color:${colores.efectividad};'>${efectividad}%</b></span></div>
        <div class='comparador-estadistica-item ${bgClass(colores.maxGoles)}' title="${tooltips['Máx. Goles en un Partido']}"><span>Máx. Goles en un Partido</span><span><b style='color:${colores.maxGoles};'>${maxGoles}</b></span></div>
      </div>`;
    }
    // Para reiniciar animación, forzamos reflow
    estadisticasDiv.innerHTML = '';
    void estadisticasDiv.offsetWidth;
    estadisticasDiv.innerHTML = `
      <div class='comparador-container' style='margin-bottom:0;'>
        <div class='comparador-card selected${ganadas1 > ganadas2 ? ' comparador-card-ganador' : ''}'>
          <div class='comparador-jugador-img-nombre'>
            <img class='comparador-jugador-img' id='comparadorImg1' src="img/jugadores/jugador-${j1.toLowerCase().replace(/ /g, '').replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n')}.png" alt="${j1}" onerror="this.onerror=null;this.src='img/jugadores/jugador-vacio.png';" />
            <span class='comparador-jugador-nombre'>${j1}</span>
          </div>
          ${estadisticasLista(m1, {
            partidos: colorPartidos1,
            puntos: colorPuntos1,
            goles: colorGoles1,
            difGol: colorDifGol1,
            pctVict: colorPctVict1,
            pctAsist: colorPctAsist1,
            promPuntos: colorPromPuntos1,
            promGoles: colorPromGoles1,
            goleador: colorGoleador1,
            efectividad: colorEfectividad1,
            maxGoles: colorMaxGoles1
          }, j1, vecesGoleador1, efectividadGoles1, maxGoles1, pctVict1, pctAsist1, promPuntos1, promGoles1)}
        </div>
        <div class='comparador-vs'>VS</div>
        <div class='comparador-card selected${ganadas2 > ganadas1 ? ' comparador-card-ganador' : ''}'>
          <div class='comparador-jugador-img-nombre'>
            <img class='comparador-jugador-img' id='comparadorImg2' src="img/jugadores/jugador-${j2.toLowerCase().replace(/ /g, '').replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n')}.png" alt="${j2}" onerror="this.onerror=null;this.src='img/jugadores/jugador-vacio.png';" />
            <span class='comparador-jugador-nombre'>${j2}</span>
          </div>
          ${estadisticasLista(m2, {
            partidos: colorPartidos2,
            puntos: colorPuntos2,
            goles: colorGoles2,
            difGol: colorDifGol2,
            pctVict: colorPctVict2,
            pctAsist: colorPctAsist2,
            promPuntos: colorPromPuntos2,
            promGoles: colorPromGoles2,
            goleador: colorGoleador2,
            efectividad: colorEfectividad2,
            maxGoles: colorMaxGoles2
          }, j2, vecesGoleador2, efectividadGoles2, maxGoles2, pctVict2, pctAsist2, promPuntos2, promGoles2)}
        </div>
      </div>
      <div id="comparadorHistorialDirecto" style="margin-top:2.2em;"></div>
    `;

    // Transición de imágenes: fade-in/zoom al cargar/cambiar
    const img1 = document.getElementById('comparadorImg1');
    const img2 = document.getElementById('comparadorImg2');
    [img1, img2].forEach(img => {
      if (img) {
        img.classList.remove('loaded');
        img.onload = function() {
          img.classList.add('loaded');
        };
        // Si la imagen ya está en caché, forzar el efecto
        if (img.complete && img.naturalWidth > 0) {
          setTimeout(() => img.classList.add('loaded'), 10);
        }
      }
    });

    // --- Renderizar tabla de historial directo ---
    renderHistorialDirectoComparador(j1, j2);
  }

  // Nueva función: renderiza la tabla de historial directo entre dos jugadores
  function renderHistorialDirectoComparador(j1, j2) {
    const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
    const idxFecha = window.idxFecha;
    const idxJugador = window.idxJugador;
    const idxGoles = window.idxGoles;
    const idxPuntos = window.idxPuntos;
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
      const filaJ1 = partido.find(cols => cols[idxJugador] === j1);
      const filaJ2 = partido.find(cols => cols[idxJugador] === j2);
      if (!filaJ1 || !filaJ2) return;
      // Detectar empate múltiple: todos los jugadores tienen los mismos puntos
      const puntosUnicos = Array.from(new Set(partido.map(cols => cols[idxPuntos])));
      const esEmpateMultiple = puntosUnicos.length === 1;
      if (esEmpateMultiple) {
        // Siempre dividir mitad y mitad, como en el historial de partidos
        const mitad = Math.ceil(partido.length / 2);
        const equipo1 = partido.slice(0, mitad);
        const equipo2 = partido.slice(mitad);
        // Determinar en qué equipo está cada jugador
        const estaJ1EnEquipo1 = equipo1.some(cols => cols[idxJugador] === j1);
        const estaJ2EnEquipo1 = equipo1.some(cols => cols[idxJugador] === j2);
        let mismoEquipo = (estaJ1EnEquipo1 && estaJ2EnEquipo1) || (!estaJ1EnEquipo1 && !estaJ2EnEquipo1);
        const golesEquipo1 = equipo1.reduce((acc, c) => acc + Number(c[idxGoles]), 0);
        const golesEquipo2 = equipo2.reduce((acc, c) => acc + Number(c[idxGoles]), 0);
        let global = `${golesEquipo1} - ${golesEquipo2}`;
        if (mismoEquipo) {
          // Ambos en el mismo equipo
          historial.push({ fecha, res1: 'Mismo equipo', res2: 'Mismo equipo', global, mismoEquipo: true, resultadoEquipo: 'Empate' });
        } else {
          // Rivales
          historial.push({ fecha, res1: 'Empate', res2: 'Empate', global, mismoEquipo: false });
        }
      } else {
        // No es empate múltiple: lógica normal
        const mismoEquipo = filaJ1[idxPuntos] === filaJ2[idxPuntos];
        if (mismoEquipo) {
          // Calcular goles del equipo y del rival correctamente
          const puntosEquipo = filaJ1[idxPuntos];
          const golesEquipo = partido.filter(cols => cols[idxPuntos] === puntosEquipo).reduce((acc, c) => acc + Number(c[idxGoles]), 0);
          const golesRival = partido.filter(cols => cols[idxPuntos] !== puntosEquipo).reduce((acc, c) => acc + Number(c[idxGoles]), 0);
          let resultadoEquipo = '';
          if (golesEquipo > golesRival) resultadoEquipo = 'Victoria';
          else if (golesEquipo < golesRival) resultadoEquipo = 'Derrota';
          else resultadoEquipo = 'Empate';
          let global = `${golesEquipo} - ${golesRival}`;
          historial.push({ fecha, res1: 'Mismo equipo', res2: 'Mismo equipo', global, mismoEquipo: true, resultadoEquipo });
        } else {
          // Resultado individual
          const equipo1Puntos = filaJ1[idxPuntos];
          const equipo2Puntos = filaJ2[idxPuntos];
          const equipo1Jugadores = partido.filter(cols => cols[idxPuntos] === equipo1Puntos);
          const equipo2Jugadores = partido.filter(cols => cols[idxPuntos] === equipo2Puntos);
          const golesEquipo1 = equipo1Jugadores.reduce((acc, c) => acc + Number(c[idxGoles]), 0);
          const golesEquipo2 = equipo2Jugadores.reduce((acc, c) => acc + Number(c[idxGoles]), 0);
          let global = `${golesEquipo1} - ${golesEquipo2}`;
          const goles1 = Number(filaJ1[idxGoles]);
          const goles2 = Number(filaJ2[idxGoles]);
          const puntos1 = Number(filaJ1[idxPuntos]);
          const puntos2 = Number(filaJ2[idxPuntos]);
          let res1 = puntos1 > puntos2 ? 'Victoria' : (puntos1 < puntos2 ? 'Derrota' : 'Empate');
          let res2 = puntos2 > puntos1 ? 'Victoria' : (puntos2 < puntos1 ? 'Derrota' : 'Empate');
          historial.push({ fecha, res1, res2, global, goles1, goles2, mismoEquipo: false });
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

    // Calcular historial directo (solo partidos como rivales)
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
    if (ganadosJ1 + ganadosJ2 + empatesRivales > 0) {
      marcadorHTML = `
        <div style="display:flex;justify-content:center;align-items:center;margin-bottom:1.2em;margin-top:0.5em;gap:1.2em;">
          <span style="background:#23263a;color:#4fc3f7;font-size:1.25em;font-weight:700;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #4fc3f755;">${j1}</span>
          <span style="background:#218c5f;color:#fff;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #218c5f55;">${ganadosJ1}</span>
          <span style="background:#ffd700;color:#23263a;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #ffd70055;">-</span>
          <span style="background:#a8231a;color:#fff;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #a8231a55;">${ganadosJ2}</span>
          <span style="background:#23263a;color:#4fc3f7;font-size:1.25em;font-weight:700;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #4fc3f755;">${j2}</span>
        </div>
        <div style=\"text-align:center;margin-bottom:1.2em;color:#b0b0b0;font-size:1.08em;\">
          ${empatesRivales > 0 ? `<span style='background:#b0b0b0;color:#23263a;padding:0.18em 0.8em;border-radius:8px;font-weight:600;margin:0 0.5em;'>Empates: ${empatesRivales}</span>` : ''}
        </div>
      `;
    }

    // Renderizar tabla
    let html = '';
    if (historial.length === 0) {
      html = `<div style=\"text-align:center;color:#ffd700;font-weight:600;\">No hay partidos donde hayan coincidido estos jugadores.</div>`;
    } else {
      html = `<div style='margin:4em 0 0.5em 0;'></div><h2 class="titulo-comparador" style="margin-top:2.2em;margin-bottom:1.1em;">Historial directo</h2>${marcadorHTML}`;
      html += `<table class=\"tabla-historial-directo\"><thead><tr><th>Fecha</th><th>Resultado ${j1}</th><th>Resultado ${j2}</th><th>Resultado global</th></tr></thead><tbody>`;
      historial.forEach(e => {
        html += `<tr>`;
        html += `<td>${e.fecha}</td>`;
        if (e.mismoEquipo) {
          // Empate o no, pero mismo equipo
          let aclaracion = e.resultadoEquipo === 'Empate' ? 'Empate (Mismo equipo)' : 'Mismo equipo';
          html += `<td colspan='2' style='color:#4fc3f7;font-weight:bold;text-align:center;'>${aclaracion}</td>`;
          let color = e.resultadoEquipo === 'Victoria' ? '#218c5f' : (e.resultadoEquipo === 'Derrota' ? '#a8231a' : '#b0b0b0');
          html += `<td style='font-weight:bold;text-align:center;'>${e.global} <span style=\"display:inline-block;margin-left:0.5em;padding:0.15em 0.7em;border-radius:7px;font-size:0.98em;font-weight:600;background:${color};color:#fff;vertical-align:middle;\">${e.resultadoEquipo}</span></td>`;
        } else {
          // Si es empate y no mismo equipo, aclarar que fue "Empate (Rivales)"
          let res1 = e.res1;
          let res2 = e.res2;
          if (e.res1 === 'Empate' && e.res2 === 'Empate') {
            res1 = 'Empate (Rivales)';
            res2 = 'Empate (Rivales)';
          }
          html += `<td><span class=\"resultado-${e.res1.toLowerCase()}\">${res1}</span></td>`;
          html += `<td><span class=\"resultado-${e.res2.toLowerCase()}\">${res2}</span></td>`;
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
}

// Llamar al renderizador del comparador cuando se cargan las métricas
window.addEventListener('DOMContentLoaded', () => {
  if (window.metricasPorJugador) {
    renderComparadorJugadores(window.metricasPorJugador);
  }
});

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
    // 7 niveles: Madera, Bronce, Hierro, Plata, Oro, Diamante, Dios del Futbol
    const golesNiveles = [
      { min: 3,   icon: '⚽', nombre: 'Madera',           colorClass: 'nivel-1' },
      { min: 15,  icon: '⚽', nombre: 'Bronce',           colorClass: 'nivel-2' },
      { min: 40,  icon: '⚽', nombre: 'Hierro',           colorClass: 'nivel-3' },
      { min: 80,  icon: '⚽', nombre: 'Plata',            colorClass: 'nivel-4' },
      { min: 150, icon: '🏆', nombre: 'Oro',              colorClass: 'nivel-5' },
      { min: 300, icon: '💎', nombre: 'Diamante',         colorClass: 'nivel-6' },
      { min: 600, icon: '⚡', nombre: 'Dios del Futbol',  colorClass: 'nivel-7' }
    ];
    if (golesHistoricos < 3) {
      medallas.push({
        icon: '🔒',
        tooltip: 'Logro bloqueado<br>Marca al menos 3 goles para desbloquear',
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
    // 7 niveles: Madera, Bronce, Hierro, Plata, Oro, Diamante, Dueño del gimnasio
    const partidosNiveles = [
      { min: 5,   icon: '🎽', nombre: 'Madera',              colorClass: 'nivel-1' },
      { min: 20,  icon: '🎽', nombre: 'Bronce',              colorClass: 'nivel-2' },
      { min: 50,  icon: '🎽', nombre: 'Hierro',              colorClass: 'nivel-3' },
      { min: 75,  icon: '🎽', nombre: 'Plata',               colorClass: 'nivel-4' },
      { min: 100, icon: '🏆', nombre: 'Oro',                 colorClass: 'nivel-5' },
      { min: 150, icon: '💎', nombre: 'Diamante',            colorClass: 'nivel-6' },
      { min: 300, icon: '⚡', nombre: 'Dueño del gimnasio', colorClass: 'nivel-7' }
    ];
    if (partidosHistoricos < 5) {
      medallas.push({
        icon: '🔒',
        tooltip: 'Logro bloqueado<br>Juega al menos 5 partidos para desbloquear',
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
    // 7 niveles: Madera, Bronce, Hierro, Plata, Oro, Diamante, Dueño del gimnasio
    let victoriasHistoricas = 0;
    filasJugador.forEach(cols => {
      // Asume que idxPuntosLogros existe y 3 puntos = victoria
      const puntos = Number(cols[window.idxPuntos]);
      if (puntos === 3) victoriasHistoricas++;
    });
    const victoriasNiveles = [
      { min: 2,   icon: '🏅', nombre: 'Madera',              colorClass: 'nivel-1' },
      { min: 15,  icon: '🏅', nombre: 'Bronce',              colorClass: 'nivel-2' },
      { min: 30,  icon: '🏅', nombre: 'Hierro',              colorClass: 'nivel-3' },
      { min: 60,  icon: '🏅', nombre: 'Plata',               colorClass: 'nivel-4' },
      { min: 80,  icon: '🏆', nombre: 'Oro',                 colorClass: 'nivel-5' },
      { min: 100, icon: '💎', nombre: 'Diamante',            colorClass: 'nivel-6' },
      { min: 250, icon: '⚡', nombre: 'Máquina de Ganar', colorClass: 'nivel-7' }
    ];
    if (victoriasHistoricas < 2) {
      medallas.push({
        icon: '🔒',
        tooltip: 'Logro bloqueado<br>Gana al menos 2 partidos para desbloquear',
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
  canvas.width = 420;
  canvas.height = 220;
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
    // El filtro de partidos mínimos se elimina, el mínimo es fijo (4)

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
        goles_totales: 'Goles totales',
        victorias: 'Victorias',
        derrotas: 'Derrotas',
        goles_por_partido: 'Goles por partido',
        puntos_por_partido: 'Puntos por partido'
    };
    const mapeo = {
        partidos_jugados: j => j.partidos,
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
        const minPartidos = 4;
        const metricas = window.metricasPorJugador || {};
        const datosReales = Object.entries(metricas)
            .filter(([nombre, j]) => j.partidos >= minPartidos)
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
                    if (ejeXVal === 'partidos_jugados' && ejeYVal === 'goles_totales') {
                        const ctx = chart.ctx;
                        const xScale = chart.scales.x;
                        const yScale = chart.scales.y;
                        const pendientes = [0.5, 1, 2, 3, 4];
                        const colores = ['#8be9fdcc', '#21c97a88', '#ffd70088', '#e74a3b88', '#4a90e288'];
                        const xMin = xScale.min;
                        const xMax = xScale.max;
                        ctx.save();
                        pendientes.forEach((m, idx) => {
                            // Para cada pendiente, calcular dos puntos: (xMin, m*xMin) y (xMax, m*xMax)
                            const y1 = m * xMin;
                            const y2 = m * xMax;
                            // Dibujar la línea
                            ctx.beginPath();
                            ctx.moveTo(xScale.getPixelForValue(xMin), yScale.getPixelForValue(y1));
                            ctx.lineTo(xScale.getPixelForValue(xMax), yScale.getPixelForValue(y2));
                            ctx.strokeStyle = colores[idx % colores.length];
                            ctx.lineWidth = 2;
                            ctx.setLineDash([6, 6]);
                            ctx.globalAlpha = 0.7;
                            ctx.stroke();
                            ctx.setLineDash([]);
                            // Etiqueta de texto sobre la recta (cerca del extremo derecho)
                            const label = `GxP = ${m}`;
                            const xLabel = xScale.getPixelForValue(xMax) - 10;
                            const yLabel = yScale.getPixelForValue(m * xMax) - 8;
                            ctx.save();
                            ctx.globalAlpha = 0.95;
                            ctx.font = 'bold 15px Segoe UI, Arial, sans-serif';
                            ctx.textAlign = 'right';
                            ctx.textBaseline = 'bottom';
                            // Fondo oscuro para el texto
                            const textWidth = ctx.measureText(label).width;
                            ctx.fillStyle = '#23263acc';
                            ctx.fillRect(xLabel - textWidth - 8, yLabel - 18, textWidth + 12, 22);
                            // Texto
                            ctx.fillStyle = colores[idx % colores.length].replace('88', 'ff').replace('cc','ff');
                            ctx.fillText(label, xLabel, yLabel);
                            ctx.restore();
                        });
                        ctx.restore();
                    }
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
                                    return `${etiquetas[ejeX]} = ${d.x}, ${etiquetas[ejeY]} = ${d.y}`;
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
  if (ejeXElem) ejeXElem.onchange = () => window.renderCorrelacionChart();
  if (ejeYElem) ejeYElem.onchange = () => window.renderCorrelacionChart();
});
}