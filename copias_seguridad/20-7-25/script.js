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
    html += `<td class=\"${claseTop}\">${posicion}</td><td>${jugador}</td><td class='puntos'>${m.puntos}</td><td class='col-g'>${m.ganados}</td><td class='col-e'>${m.empatados}</td><td class='col-p'>${m.perdidos}</td><td>${m.partidos}</td><td>${m.goles}</td><td class='${claseDifGol(Number(m.difGol||0))}'>${m.difGol || 0}</td><td class='${clasePorcentaje(Number(porcentajeVictorias.replace('%','')))}'>${porcentajeVictorias}</td><td class='${clasePorcentaje(Number(porcentajePresencias.replace('%','')))}'>${porcentajePresencias}</td><td>${promPuntos}</td><td>${promGoles}</td><td>${rendimiento}</td><td>${goleometro}</td></tr>`;
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
    const golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    const golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    const golesEmpatados = empatados.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);

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
      html += `<span style='font-weight:900;color:#ffd700;text-shadow:0 2px 8px #23263a,0 0 8px #ffd70099;'>${golesEmpatados}</span> <span style='color:#ffd700;font-size:1.1em;text-shadow:0 1px 8px #ffd70099;'>-</span> <span style='font-weight:900;color:#ffd700;text-shadow:0 2px 8px #23263a,0 0 8px #ffd70099;'>${golesEmpatados}</span>`;
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
      html += `<div style=\"display:grid;grid-template-columns:1fr 1fr;justify-items:center;align-items:center;gap:0;margin:0.7em 0 0.2em 0;width:100%;max-width:540px;margin-left:auto;margin-right:auto;\">`;
      html += `<span class=\"partido-card-equipo\" style=\"background:none;color:#ffd700;font-size:1.18em;text-align:center;\">EQUIPO 1</span>`;
      html += `<span class=\"partido-card-equipo\" style=\"background:none;color:#ffd700;font-size:1.18em;text-align:center;\">EQUIPO 2</span>`;
      html += `</div>`;
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
      // Empate: mostrar dos columnas iguales
      html += `<div style=\"flex:1;min-width:140px;background:rgba(255,215,0,0.07);border-radius:12px;padding:0.7em 0.5em;margin-bottom:0.5em;box-shadow:0 2px 8px #ffd70020;\">`;
      empatados.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src="${rutaImg}" alt="${nombre}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;
        // Medalla solo si es el goleador absoluto del partido
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
      html += `<div style=\"flex:1;min-width:140px;background:rgba(255,215,0,0.07);border-radius:12px;padding:0.7em 0.5em;margin-bottom:0.5em;box-shadow:0 2px 8px #ffd70020;\">`;
      empatados.forEach(cols => {
        const nombre = cols[idxJugador] ? String(cols[idxJugador]).trim() : '';
        const goles = Number(cols[idxGoles]);
        const nombreNormalizado = normalizarNombreArchivo(nombre);
        const nombreArchivo = 'jugador-' + nombreNormalizado + '.png';
        const rutaImg = `img/jugadores/${nombreArchivo}`;
        const rutaImgVacia = `img/jugadores/jugador-vacio.png`;
        const imgHtml = `<img src="${rutaImg}" alt="${nombre}" onerror="this.onerror=null;this.src='${rutaImgVacia}';" style="width:38px;height:38px;object-fit:cover;border-radius:50%;box-shadow:0 1px 4px #0002;">`;
        html += `<span class=\"partido-card-jugador\" style=\"background:rgba(255,215,0,0.13);color:#ffd700;\">`;
        if (goles > 0) html += `<span class=\"partido-card-goles\" style=\"color:#ffd700;\">${'<span class=\\"icono-gol\\">⚽</span>'.repeat(goles)}</span>`;
        html += `<span class=\"nombre-jugador\">${nombre}</span>`;
        html += imgHtml;
        html += `</span>`;
      });
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

  // Mostrar el primer partido por defecto
  if (fechas.length > 0) mostrarDetalle(fechas[0]);
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
      const mismoEquipo = filaJ1[idxPuntos] === filaJ2[idxPuntos];
      // Calcular goles de cada equipo (equipo de J1 y equipo de J2)
      const equipo1Puntos = filaJ1[idxPuntos];
      const equipo2Puntos = filaJ2[idxPuntos];
      const equipo1Jugadores = partido.filter(cols => cols[idxPuntos] === equipo1Puntos);
      const equipo2Jugadores = partido.filter(cols => cols[idxPuntos] === equipo2Puntos);
      const golesEquipo1 = equipo1Jugadores.reduce((acc, c) => acc + Number(c[idxGoles]), 0);
      const golesEquipo2 = equipo2Jugadores.reduce((acc, c) => acc + Number(c[idxGoles]), 0);
      let global = `${golesEquipo1} - ${golesEquipo2}`;
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
        const goles1 = Number(filaJ1[idxGoles]);
        const goles2 = Number(filaJ2[idxGoles]);
        const puntos1 = Number(filaJ1[idxPuntos]);
        const puntos2 = Number(filaJ2[idxPuntos]);
        let res1 = puntos1 > puntos2 ? 'Victoria' : (puntos1 < puntos2 ? 'Derrota' : 'Empate');
        let res2 = puntos2 > puntos1 ? 'Victoria' : (puntos2 < puntos1 ? 'Derrota' : 'Empate');
        historial.push({ fecha, res1, res2, global, goles1, goles2, mismoEquipo: false });
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
    let ganadosJ1 = 0, ganadosJ2 = 0, empates = 0;
    historial.forEach(e => {
      if (!e.mismoEquipo) {
        if (e.res1 === 'Victoria') ganadosJ1++;
        else if (e.res2 === 'Victoria') ganadosJ2++;
        else empates++;
      }
    });

    // Renderizar marcador protagónico
    let marcadorHTML = '';
    if (ganadosJ1 + ganadosJ2 + empates > 0) {
      marcadorHTML = `
        <div style="display:flex;justify-content:center;align-items:center;margin-bottom:1.2em;margin-top:0.5em;gap:1.2em;">
          <span style="background:#23263a;color:#4fc3f7;font-size:1.25em;font-weight:700;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #4fc3f755;">${j1}</span>
          <span style="background:#218c5f;color:#fff;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #218c5f55;">${ganadosJ1}</span>
          <span style="background:#ffd700;color:#23263a;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #ffd70055;">-</span>
          <span style="background:#a8231a;color:#fff;font-size:1.5em;font-weight:900;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #a8231a55;">${ganadosJ2}</span>
          <span style="background:#23263a;color:#4fc3f7;font-size:1.25em;font-weight:700;padding:0.35em 1.2em;border-radius:12px;box-shadow:0 2px 12px #4fc3f755;">${j2}</span>
        </div>
        <div style="text-align:center;margin-bottom:1.2em;color:#b0b0b0;font-size:1.08em;">
          ${empates > 0 ? `<span style='background:#b0b0b0;color:#23263a;padding:0.18em 0.8em;border-radius:8px;font-weight:600;margin:0 0.5em;'>Empates: ${empates}</span>` : ''}
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
          html += `<td colspan='2' style='color:#4fc3f7;font-weight:bold;text-align:center;'>Mismo equipo</td>`;
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
  const graficosDiv = document.getElementById('dashboardJugadorGraficos');
  if (!select || !resumenDiv || !graficosDiv) return;
  // Poblar selector
  const jugadores = Object.keys(metricasPorJugador);
  const prev = select.value;
  select.innerHTML = '';
  jugadores.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j; opt.textContent = j;
    select.appendChild(opt);
  });
  select.value = (prev && jugadores.includes(prev)) ? prev : jugadores[0];

  function mostrarDashboard() {
    const jugador = select.value;
    if (!jugador) return;
    const m = metricasPorJugador[jugador];
    if (!m) return;
    // Imagen del jugador
    const nombreArchivo = normalizarNombreArchivo(jugador);
    const rutaImg = `img/jugadores/jugador-${nombreArchivo}.png`;
    // Métricas principales
    const pctVict = m.partidos ? Math.round((m.ganados / m.partidos) * 100) : 0;
    const promGoles = m.partidos ? (m.goles / m.partidos).toFixed(2) : '0.00';
    const promPuntos = m.partidos ? (m.puntos / m.partidos).toFixed(2) : '0.00';
    const efectividadGoles = Number(calcularEfectividadGoles(jugador, window.dataFiltradaPorAnio || window.dataRowsOriginal, window.idxJugador, window.idxGoles));
    const maxGoles = Number(calcularMaximoGoles(jugador, window.dataFiltradaPorAnio || window.dataRowsOriginal, window.idxJugador, window.idxGoles));
    // Últimos resultados y goles
    const ultimosRes = window.ultimosResultados && window.ultimosResultados[jugador] ? window.ultimosResultados[jugador] : [];
    const ultimosGoles = window.ultimosGoles && window.ultimosGoles[jugador] ? window.ultimosGoles[jugador] : [];
    // Render resumen
    resumenDiv.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.2em;">
        <img src="${rutaImg}" alt="${jugador}" style="width:120px;height:120px;border-radius:50%;box-shadow:0 2px 12px #ffd70033;object-fit:cover;" onerror="this.onerror=null;this.src='img/jugadores/jugador-vacio.png';" />
        <h2 style="color:#ffd700;text-align:center;margin-bottom:0.2em;">${jugador}</h2>
        <div style="display:flex;gap:2em;flex-wrap:wrap;justify-content:center;">
          <div><b style="color:#ffd700;">Partidos:</b> ${m.partidos}</div>
          <div><b style="color:#ffd700;">Goles:</b> ${m.goles}</div>
          <div><b style="color:#ffd700;">Puntos:</b> ${m.puntos}</div>
          <div><b style="color:#ffd700;">Dif. Gol:</b> ${m.difGol}</div>
        </div>
        <div style="display:flex;gap:2em;flex-wrap:wrap;justify-content:center;">
          <div><b style="color:#ffd700;">% Victorias:</b> ${pctVict}%</div>
          <div><b style="color:#ffd700;">Prom. Goles/Partido:</b> ${promGoles}</div>
          <div><b style="color:#ffd700;">Prom. Puntos/Partido:</b> ${promPuntos}</div>
          <div><b style="color:#ffd700;">Efectividad Goles:</b> ${efectividadGoles}%</div>
          <div><b style="color:#ffd700;">Máx. Goles en un Partido:</b> ${maxGoles}</div>
        </div>
        <div style="margin-top:1em;text-align:center;">
          <b style="color:#ffd700;">Últimos 5 partidos:</b><br>
          ${ultimosRes.map(resultadoAEmoji).join(' ')}
        </div>
        <div style="margin-top:0.5em;text-align:center;">
          <b style="color:#ffd700;">Últimos 5 goles:</b><br>
          ${ultimosGoles.map(golesAColor).join(' ')}
        </div>
      </div>
    `;
    // Gráficos avanzados
    const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
    const idxFecha = window.idxFecha;
    const idxJugador = window.idxJugador;
    const idxGoles = window.idxGoles;
    const idxPuntos = window.idxPuntos;
    const partidosJugador = dataRows.filter(cols => cols[idxJugador] === jugador);
    const fechas = partidosJugador.map(cols => cols[idxFecha]);
    const goles = partidosJugador.map(cols => Number(cols[idxGoles]) || 0);
    // Gráfico de barras (goles por partido)
    // Gráfico de línea (tendencia de goles)
    // Gráfico de torta (distribución de resultados)
    graficosDiv.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:2em;justify-content:center;align-items:flex-start;">
        <div>
          <canvas id="graficoGolesJugador" height="120" style="max-width:320px;"></canvas>
          <div style="text-align:center;color:#ffd700;font-weight:600;margin-top:0.5em;">Goles por partido</div>
        </div>
        <div>
          <canvas id="graficoLineaGolesJugador" height="120" style="max-width:320px;"></canvas>
          <div style="text-align:center;color:#ffd700;font-weight:600;margin-top:0.5em;">Tendencia de goles</div>
        </div>
        <div>
          <canvas id="graficoPieResultadosJugador" height="120" style="max-width:220px;"></canvas>
          <div style="text-align:center;color:#ffd700;font-weight:600;margin-top:0.5em;">Distribución de resultados</div>
        </div>
      </div>
    `;
    // Gráfico de barras
    if (goles.length > 0) {
      const ctxBar = document.getElementById('graficoGolesJugador').getContext('2d');
      new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: fechas,
          datasets: [{
            label: 'Goles por partido',
            data: goles,
            backgroundColor: '#ffd70099',
            borderColor: '#ffd700',
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
    // Gráfico de línea
    if (goles.length > 0) {
      const ctxLinea = document.getElementById('graficoLineaGolesJugador').getContext('2d');
      new Chart(ctxLinea, {
        type: 'line',
        data: {
          labels: fechas,
          datasets: [{
            label: 'Goles',
            data: goles,
            fill: false,
            borderColor: '#ffd700',
            backgroundColor: '#ffd70099',
            tension: 0.2,
            pointRadius: 4,
            pointBackgroundColor: '#ffd700',
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
    // Gráfico de torta/pie
    if (partidosJugador.length > 0) {
      let victorias = 0, empates = 0, derrotas = 0;
      partidosJugador.forEach(cols => {
        const puntos = Number(cols[idxPuntos]);
        if (puntos === 3) victorias++;
        else if (puntos === 1) empates++;
        else if (puntos === 0) derrotas++;
      });
      const ctxPie = document.getElementById('graficoPieResultadosJugador').getContext('2d');
      new Chart(ctxPie, {
        type: 'pie',
        data: {
          labels: ['Victorias', 'Empates', 'Derrotas'],
          datasets: [{
            data: [victorias, empates, derrotas],
            backgroundColor: ['#218c5f', '#ffd700', '#a8231a'],
            borderColor: '#23263a',
            borderWidth: 2,
          }]
        },
        options: {
          plugins: { legend: { labels: { color: '#ffd700', font: { weight: 'bold' } } } }
        }
      });
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
