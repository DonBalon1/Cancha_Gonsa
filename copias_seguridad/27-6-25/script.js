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
  // Devuelve un span con emoji y color según el resultado
  if (resultado === 'G') return '<span style="color:green;font-size:1.2em;">🟢</span>';
  if (resultado === 'E') return '<span style="color:orange;font-size:1.2em;">🟡</span>';
  if (resultado === 'P') return '<span style="color:red;font-size:1.2em;">🔴</span>';
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
  // Devuelve un span con el número y color según la cantidad de goles
  if (goles === 0) return '<span style="color:red;font-size:1.2em;">● 0</span>';
  if (goles === 1) return '<span style="color:gold;font-size:1.2em;">● 1</span>';
  return `<span style="color:limegreen;font-size:1.2em;">● ${goles}</span>`;
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

function renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles) {
  // Agregar filtro de partidos mínimos si no existe
  let filtroDiv = document.getElementById('filtroPartidosMinimos');
  if (!filtroDiv) {
    filtroDiv = document.createElement('div');
    filtroDiv.id = 'filtroPartidosMinimos';
    filtroDiv.style.marginBottom = '1em';
    const tablaDiv = document.getElementById('tablaPuntosTotales');
    if (tablaDiv && tablaDiv.parentNode) {
      tablaDiv.parentNode.insertBefore(filtroDiv, tablaDiv);
    }
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
    <label for="inputPartidosMinimos"><b>Partidos mínimos jugados:</b></label>
    <input type="number" id="inputPartidosMinimos" min="0" value="${partidosMinimos}" style="width:60px;">
  `;
  const inputMin = filtroDiv.querySelector('#inputPartidosMinimos');
  inputMin.value = partidosMinimos;
  inputMin.oninput = function() {
    renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles);
  };

  const tablaDiv = document.getElementById('tablaPuntosTotales');
  let html = '<table><caption style="caption-side:top;font-size:1.3em;font-weight:bold;margin-bottom:8px;">Tabla general</caption><thead><tr><th></th><th>#</th><th>Jugador</th><th>Puntos Totales</th><th>Goles Totales</th><th>Dif. Gol</th><th>Partidos Jugados</th><th>Ganados</th><th>Empatados</th><th>Perdidos</th><th>% Victorias</th><th>% Presencias</th><th>Prom. Puntos</th><th>Prom. Goles</th><th>Rendimiento</th><th>Goleómetro</th></tr></thead><tbody>';
  // Filtrar por partidos mínimos
  const jugadoresFiltrados = Object.entries(metricasPorJugador).filter(([_, m]) => m.partidos >= partidosMinimos);
  // Ordenar por puntos totales de forma decreciente
  const jugadoresOrdenados = jugadoresFiltrados.sort((a, b) => b[1].puntos - a[1].puntos);
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
    let tendencia = '';
    html += `<tr><td style="text-align:center;">${tendencia}</td><td>${posicion}</td><td>${jugador}</td><td>${m.puntos}</td><td>${m.goles}</td><td>${m.difGol || 0}</td><td>${m.partidos}</td><td>${m.ganados}</td><td>${m.empatados}</td><td>${m.perdidos}</td><td>${porcentajeVictorias}</td><td>${porcentajePresencias}</td><td>${promPuntos}</td><td>${promGoles}</td><td>${rendimiento}</td><td>${goleometro}</td></tr>`;
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
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
  // Agregar filtro de partidos mínimos si no existe
  let filtroDiv = document.getElementById('filtroPartidosMinimosGoleadores');
  if (!filtroDiv) {
    filtroDiv = document.createElement('div');
    filtroDiv.id = 'filtroPartidosMinimosGoleadores';
    filtroDiv.style.marginBottom = '1em';
    if (tablaDiv.parentNode) {
      tablaDiv.parentNode.insertBefore(filtroDiv, tablaDiv);
    }
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
    <label for="inputPartidosMinimosGoleadores"><b>Partidos mínimos jugados:</b></label>
    <input type="number" id="inputPartidosMinimosGoleadores" min="0" value="${partidosMinimos}" style="width:60px;">
  `;
  const inputMin = filtroDiv.querySelector('#inputPartidosMinimosGoleadores');
  inputMin.value = partidosMinimos;
  inputMin.oninput = function() {
    renderTablaGoleadores(metricasPorJugador);
  };

  // Obtener índices y dataRows para el cálculo
  const dataRows = window.dataFiltradaPorAnio || window.dataRowsOriginal;
  const idxFecha = window.idxFecha;
  const idxJugador = window.idxJugador;
  const idxGoles = window.idxGoles;

  let html = '<table><caption style="caption-side:top;font-size:1.2em;font-weight:bold;margin-bottom:8px;">Tabla de Goleadores</caption><thead><tr><th>#</th><th>Jugador</th><th>Partidos Jugados</th><th>Goles por Partido</th><th>Diferencia de Gol</th><th>Veces Goleador del Partido</th><th>Goles Totales</th></tr></thead><tbody>';
  // Filtrar por partidos mínimos
  const jugadoresFiltrados = Object.entries(metricasPorJugador).filter(([_, m]) => m.partidos >= partidosMinimos);
  // Ordenar por goles totales de forma decreciente
  const jugadoresOrdenados = jugadoresFiltrados.sort((a, b) => b[1].goles - a[1].goles);
  let posicion = 1;
  let prevGoles = null;
  let repeticiones = 0;
  jugadoresOrdenados.forEach(([jugador, m], idx) => {
    if (prevGoles !== null && m.goles === prevGoles) {
      // Si hay empate, la posición se mantiene igual
      repeticiones++;
    } else {
      // Si no hay empate, la posición es la anterior + 1
      if (idx !== 0) {
        posicion++;
      }
      repeticiones = 1;
    }
    prevGoles = m.goles;
    const golesPorPartido = m.partidos ? (m.goles / m.partidos).toFixed(1) : '0.0';
    const vecesGoleador = contarVecesGoleadorDelPartido(jugador, dataRows, idxFecha, idxJugador, idxGoles);
    html += `<tr><td>${posicion}</td><td>${jugador}</td><td>${m.partidos}</td><td>${golesPorPartido}</td><td>${m.difGol || 0}</td><td>${vecesGoleador}</td><td>${m.goles}</td></tr>`;
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
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

  // Renderizar la tabla con encabezado de fechas
  let html = '<table><caption style="caption-side:top;font-size:1.2em;font-weight:bold;margin-bottom:8px;">Tribunal de Asistencias</caption>';
  html += '<thead>';
  html += '<tr><th rowspan="2">Jugador</th><th rowspan="2">#</th><th rowspan="2">% Presencias</th>';
  html += `<th colspan="${fechas.length}">Historial de Presencias</th></tr>`;
  // Fila de fechas
  html += '<tr>';
  for (let i = 0; i < 3; i++) html += '<th style="display:none"></th>';
  fechas.forEach(fecha => {
    html += `<th style="font-size:0.9em;white-space:nowrap;writing-mode:vertical-lr;transform:rotate(180deg);padding:2px 0;max-width:1.5em;">${fecha}</th>`;
  });
  html += '</tr>';
  html += '</thead><tbody>';
  jugadoresConAsistencias.forEach(({ jugador, asistencias, total, porcentaje }) => {
    const porcentajeStr = total > 0 ? Math.round(porcentaje * 100) + '%' : '0%';
    html += `<tr><td>${jugador}</td><td>${asistencias} de ${total}</td><td>${porcentajeStr}</td>`;
    fechas.forEach(fecha => {
      if (presenciasPorJugador[jugador].has(fecha)) {
        html += '<td style="text-align:center;"><span style="color:green;font-size:1.2em;">🟢</span></td>';
      } else {
        html += '<td style="text-align:center;"><span style="color:red;font-size:1.2em;">🔴</span></td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
}

function renderHistorialPartidos(dataRows, idxFecha, idxJugador, idxGoles, idxPuntos) {
  const selector = document.getElementById('selectorPartido');
  const detalleDiv = document.getElementById('detallePartido');
  if (!selector || !detalleDiv) return;

  // Agrupar partidos por fecha
  const partidosPorFecha = {};
  dataRows.forEach(cols => {
    const fecha = cols[idxFecha];
    if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
    partidosPorFecha[fecha].push(cols);
  });
  const fechas = Object.keys(partidosPorFecha);

  // Poblar el selector
  selector.innerHTML = '';
  fechas.forEach(fecha => {
    const option = document.createElement('option');
    option.value = fecha;
    option.textContent = fecha;
    selector.appendChild(option);
  });

  // Función para mostrar el detalle de un partido
  function mostrarDetalle(fecha) {
    const partido = partidosPorFecha[fecha];
    if (!partido) { detalleDiv.innerHTML = ''; return; }
    // Separar ganadores y perdedores
    const ganadores = partido.filter(cols => Number(cols[idxPuntos]) === 3);
    const perdedores = partido.filter(cols => Number(cols[idxPuntos]) === 0);
    const empatados = partido.filter(cols => Number(cols[idxPuntos]) === 1);
    // Goles por jugador
    const golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    const golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    const golesEmpatados = empatados.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
    // Renderizado
    let html = '<div class="historial-partido">';
    html += `<div><strong>Fecha:</strong> ${fecha}</div>`;
    if (ganadores.length && perdedores.length) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1em;">';
      html += '<div style="text-align:center;">';
      html += '<span style="color:green;font-weight:bold;font-size:1.3em;">GANADOR</span><ul style="list-style:none;padding:0;">';
      ganadores.forEach(cols => {
        html += `<li>${'⚽'.repeat(Number(cols[idxGoles]))} ${cols[idxJugador]}</li>`;
      });
      html += `</ul><div style="font-size:2em;color:green;font-weight:bold;">${golesGanadores}</div></div>`;
      html += '<div style="flex:1;text-align:center;"><img src="https://img.icons8.com/ios-filled/100/cccccc/soccer-field.png" alt="cancha" style="max-width:100px;"></div>';
      html += '<div style="text-align:center;">';
      html += '<span style="color:#d32f2f;font-weight:bold;font-size:1.3em;">PERDEDOR</span><ul style="list-style:none;padding:0;">';
      perdedores.forEach(cols => {
        html += `<li>${'⚽'.repeat(Number(cols[idxGoles]))} ${cols[idxJugador]}</li>`;
      });
      html += `</ul><div style="font-size:2em;color:#d32f2f;font-weight:bold;">${golesPerdedores}</div></div>`;
      html += '</div>';
    } else if (empatados.length) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1em;">';
      html += '<div style="text-align:center;">';
      html += '<span style="color:orange;font-weight:bold;font-size:1.3em;">EQUIPO 1</span><ul style="list-style:none;padding:0;">';
      empatados.forEach(cols => {
        html += `<li>${'⚽'.repeat(Number(cols[idxGoles]))} ${cols[idxJugador]}</li>`;
      });
      html += `</ul><div style="font-size:2em;color:orange;font-weight:bold;">${golesEmpatados}</div></div>`;
      html += '<div style="flex:1;text-align:center;"><img src="https://img.icons8.com/ios-filled/100/cccccc/soccer-field.png" alt="cancha" style="max-width:100px;"></div>';
      html += '<div style="text-align:center;">';
      html += '<span style="color:orange;font-weight:bold;font-size:1.3em;">EQUIPO 2</span><ul style="list-style:none;padding:0;">';
      empatados.forEach(cols => {
        html += `<li>${'⚽'.repeat(Number(cols[idxGoles]))} ${cols[idxJugador]}</li>`;
      });
      html += `</ul><div style="font-size:2em;color:orange;font-weight:bold;">${golesEmpatados}</div></div>`;
      html += '</div>';
    }
    html += '</div>';
    detalleDiv.innerHTML = html;
  }

  // Mostrar el primer partido por defecto
  if (fechas.length > 0) mostrarDetalle(fechas[0]);

  // Cambiar detalle al seleccionar otra fecha
  selector.onchange = e => mostrarDetalle(e.target.value);
}

// --- COMPARADOR DE JUGADORES ---
function renderComparadorJugadores(metricasPorJugador) {
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
    const colorGoleador1 = vecesGoleador1 > vecesGoleador2 ? 'limegreen' : (vecesGoleador1 < vecesGoleador2 ? '#d32f2f' : 'gray');
    const colorGoleador2 = vecesGoleador2 > vecesGoleador1 ? 'limegreen' : (vecesGoleador2 < vecesGoleador1 ? '#d32f2f' : 'gray');
    // Colores para destacar el mayor
    const colorGoles1 = Number(promGoles1) > Number(promGoles2) ? 'limegreen' : (Number(promGoles1) < Number(promGoles2) ? '#d32f2f' : 'gray');
    const colorGoles2 = Number(promGoles2) > Number(promGoles1) ? 'limegreen' : (Number(promGoles2) < Number(promGoles1) ? '#d32f2f' : 'gray');
    const colorPuntos1 = Number(promPuntos1) > Number(promPuntos2) ? 'limegreen' : (Number(promPuntos1) < Number(promPuntos2) ? '#d32f2f' : 'gray');
    const colorPuntos2 = Number(promPuntos2) > Number(promPuntos1) ? 'limegreen' : (Number(promPuntos2) < Number(promPuntos1) ? '#d32f2f' : 'gray');
    // --- Historial de enfrentamientos directos detallado ---
    // Buscar partidos donde ambos jugaron
    const partidosPorFecha = {};
    dataRows.forEach(cols => {
      const fecha = cols[idxFecha];
      if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
      partidosPorFecha[fecha].push(cols);
    });
    const enfrentamientos = [];
    let victoriasJ1 = 0, victoriasJ2 = 0, empates = 0, mismosEquipo = 0;
    Object.entries(partidosPorFecha).forEach(([fecha, partido]) => {
      const jugadoresEnPartido = partido.map(cols => cols[idxJugador]);
      if (jugadoresEnPartido.includes(j1) && jugadoresEnPartido.includes(j2)) {
        // Buscar info de cada jugador
        const info1 = partido.find(cols => cols[idxJugador] === j1);
        const info2 = partido.find(cols => cols[idxJugador] === j2);
        if (!info1 || !info2) return;
        const puntos1 = Number(info1[window.idxPuntos]);
        const puntos2 = Number(info2[window.idxPuntos]);
        const goles1 = Number(info1[idxGoles]);
        const goles2 = Number(info2[idxGoles]);
        // Determinar si están en el mismo equipo (mismo puntaje)
        let resultado1 = '', resultado2 = '', mismoEquipo = false;
        if (puntos1 === puntos2) {
          mismoEquipo = true;
          resultado1 = resultado2 = 'Mismo equipo';
        } else if (puntos1 > puntos2) {
          resultado1 = 'Victoria'; resultado2 = 'Derrota';
        } else {
          resultado1 = 'Derrota'; resultado2 = 'Victoria';
        }
        // ¿Alguno fue goleador del partido?
        const maxGoles = Math.max(...partido.map(cols => Number(cols[idxGoles]) || 0));
        const esGoleador1 = goles1 === maxGoles && maxGoles > 0;
        const esGoleador2 = goles2 === maxGoles && maxGoles > 0;
        enfrentamientos.push({ fecha, goles1, goles2, resultado1, resultado2, esGoleador1, esGoleador2, mismoEquipo });
        // Para el historial numérico: solo contar si NO están en el mismo equipo
        if (!mismoEquipo) {
          if (puntos1 > puntos2) victoriasJ1++;
          else if (puntos2 > puntos1) victoriasJ2++;
        }
      }
    });
    // Ordenar por fecha ascendente
    enfrentamientos.sort((a, b) => a.fecha.localeCompare(b.fecha));
    // Historial numérico por escrito
    let resumenNumerico = `<div style='margin-bottom:0.5em;font-size:1.1em;'><b>${j1} vs ${j2}:</b> ${victoriasJ1} - ${victoriasJ2}</div>`;
    let historialHTML = '';
    if (enfrentamientos.length > 0) {
      historialHTML += `<div style="margin-top:1.5em;"><b>Historial de enfrentamientos directos:</b></div>`;
      historialHTML += `<table style="margin-top:0.5em;max-width:100%;font-size:0.98em;"><thead><tr><th>Fecha</th><th>Resultado ${j1}</th><th>Resultado ${j2}</th><th>Resultado Global</th></tr></thead><tbody>`;
      enfrentamientos.forEach(e => {
        historialHTML += `<tr>`;
        historialHTML += `<td>${e.fecha}</td>`;
        if (e.mismoEquipo) {
          // Calcular resultado global del equipo
          const partido = partidosPorFecha[e.fecha];
          const puntosEquipo = Number(partido.find(cols => cols[window.idxJugador] === j1)[window.idxPuntos]);
          let texto = 'Empate';
          if (puntosEquipo === 3) { texto = 'Victoria'; }
          else if (puntosEquipo === 0) { texto = 'Derrota'; }
          // Calcular goles totales del equipo
          const golesEquipo = partido.filter(cols => Number(cols[window.idxPuntos]) === puntosEquipo).reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
          // Calcular goles del rival
          const puntosRival = [0,1,3].find(p => p !== puntosEquipo && partido.some(cols => Number(cols[window.idxPuntos]) === p));
          const golesRival = partido.filter(cols => Number(cols[window.idxPuntos]) === puntosRival).reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
          historialHTML += `<td colspan='2' style='color:blue;font-weight:bold;text-align:center;'>Mismo equipo</td>`;
          historialHTML += `<td style='font-weight:bold;text-align:center;'>${texto} (${golesEquipo}-${golesRival})</td>`;
        } else {
          // Calcular goles de cada equipo
          const partido = partidosPorFecha[e.fecha];
          const puntos1 = Number(partido.find(cols => cols[window.idxJugador] === j1)[window.idxPuntos]);
          const puntos2 = Number(partido.find(cols => cols[window.idxJugador] === j2)[window.idxPuntos]);
          const goles1 = partido.filter(cols => Number(cols[window.idxPuntos]) === puntos1).reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
          const goles2 = partido.filter(cols => Number(cols[window.idxPuntos]) === puntos2).reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
          historialHTML += `<td style="color:${e.resultado1==='Victoria'?'green':e.resultado1==='Derrota'?'#d32f2f':'orange'};font-weight:bold;">${e.resultado1}</td>`;
          historialHTML += `<td style="color:${e.resultado2==='Victoria'?'green':e.resultado2==='Derrota'?'#d32f2f':'orange'};font-weight:bold;">${e.resultado2}</td>`;
          historialHTML += `<td style='font-weight:bold;text-align:center;'>${goles1}-${goles2}</td>`;
        }
        historialHTML += `</tr>`;
      });
      historialHTML += `</tbody></table>`;
    } else {
      historialHTML = `<div style="margin-top:1.5em;color:gray;">Nunca jugaron juntos en el mismo partido.</div>`;
    }
    estadisticasDiv.innerHTML = `
      <div style="display:flex;justify-content:center;gap:3em;align-items:center;flex-wrap:wrap;">
        <div style="min-width:180px;text-align:center;">
          <h2 style="color:green;">${j1}</h2>
          <div><b>${m1.partidos}</b> Partidos Jugados</div>
          <div><b>${m1.puntos}</b> Puntos</div>
          <div><b>${m1.goles}</b> Goles</div>
          <div><b>${m1.difGol}</b> Diferencia de Gol</div>
          <div><b>${pctVict1} %</b> % de Victorias</div>
          <div><b>${pctAsist1} %</b> % de Asistencias</div>
          <div style="margin-top:0.7em;"><span style="color:${colorPuntos1};font-weight:bold;">${promPuntos1}</span> <span style="font-size:0.95em;">Prom. Puntos/Partido</span></div>
          <div><span style="color:${colorGoles1};font-weight:bold;">${promGoles1}</span> <span style="font-size:0.95em;">Prom. Goles/Partido</span></div>
          <div style=\"margin-top:0.7em;\"><span style=\"color:${colorGoleador1};font-weight:bold;\">${vecesGoleador1}</span> <span style=\"font-size:0.95em;\">Veces Goleador del Partido</span></div>
          <div><b>${calcularEfectividadGoles(j1, dataRows, idxJugador, idxGoles)}%</b> Efectividad de Goles</div>
          <div><b>${calcularMaximoGoles(j1, dataRows, idxJugador, idxGoles)}</b> Máx. Goles en un Partido</div>
        </div>
        <div style="font-size:2em;font-weight:bold;">VS</div>
        <div style="min-width:180px;text-align:center;">
          <h2 style="color:#d32f2f;">${j2}</h2>
          <div><b>${m2.partidos}</b> Partidos Jugados</div>
          <div><b>${m2.puntos}</b> Puntos</div>
          <div><b>${m2.goles}</b> Goles</div>
          <div><b>${m2.difGol}</b> Diferencia de Gol</div>
          <div><b>${pctVict2} %</b> % de Victorias</div>
          <div><b>${pctAsist2} %</b> % de Asistencias</div>
          <div style=\"margin-top:0.7em;\"><span style=\"color:${colorPuntos2};font-weight:bold;\">${promPuntos2}</span> <span style="font-size:0.95em;\">Prom. Puntos/Partido</span></div>
          <div><span style=\"color:${colorGoles2};font-weight:bold;">${promGoles2}</span> <span style="font-size:0.95em;">Prom. Goles/Partido</span></div>
          <div style=\"margin-top:0.7em;\"><span style=\"color:${colorGoleador2};font-weight:bold;\">${vecesGoleador2}</span> <span style="font-size:0.95em;\">Veces Goleador del Partido</span></div>
          <div><b>${calcularEfectividadGoles(j2, dataRows, idxJugador, idxGoles)}%</b> Efectividad de Goles</div>
          <div><b>${calcularMaximoGoles(j2, dataRows, idxJugador, idxGoles)}</b> Máx. Goles en un Partido</div>
        </div>
      </div>
      ${resumenNumerico}
      ${historialHTML}
    `;
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

// Modificar filtrarYRenderizarPorAnio para aplicar el filtro de fecha clásico
const filtrarYRenderizarPorAnio_original = filtrarYRenderizarPorAnio;
filtrarYRenderizarPorAnio = function() {
  // Usa los datos originales y el año seleccionado para filtrar y renderizar todo
  const idxFecha = window.idxFecha;
  const dataRows = window.dataRowsOriginal;
  const anio = anioSeleccionado;
  let dataFiltrada = filtrarPorAnio(dataRows, idxFecha, anio);
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
}

// Llamar al renderizador del filtro de fecha al cargar
window.addEventListener('DOMContentLoaded', () => {
  renderFiltroFechaTablaGeneral();
});
