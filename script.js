// URL del CSV publicado de Google Sheets
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQT1Nu2BTvja759foXvBs5Digg77UesBBgfpaUNVvNW92pQLckEE4Z_HZU5OmDVYvH6_MgeFqq6HRqz/pub?gid=1609934683&single=true&output=csv';

fetch(csvUrl)
  .then(response => response.text())
  .then(csv => {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',');
    const dataRows = rows.slice(1).map(row => row.split(','));

    // Calcular cantidad de fechas únicas (partidos totales)
    const idxFecha = headers.findIndex(h => h.trim().toLowerCase() === 'fecha');
    const fechasSet = new Set(dataRows.map(cols => cols[idxFecha]));
    const partidosTotales = fechasSet.size;

    // Para la tabla completa
    renderTable(headers, dataRows);

    // Buscar los índices correctos de las columnas
    const idxJugador = headers.findIndex(h => h.trim().toLowerCase() === 'jugador');
    const idxPuntos = headers.findIndex(h => h.trim().toLowerCase() === 'puntos');
    const idxGoles = headers.findIndex(h => h.trim().toLowerCase() === 'goles');

    // Calcular métricas por jugador único
    const metricasPorJugador = {};
    // Agrupar filas por fecha
    const partidosPorFecha = {};
    dataRows.forEach(cols => {
      const fecha = cols[idxFecha];
      if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
      partidosPorFecha[fecha].push(cols);
    });
    // Calcular diferencia de gol por jugador
    Object.values(partidosPorFecha).forEach(partido => {
      // Separar ganadores y perdedores
      const ganadores = partido.filter(cols => Number(cols[idxPuntos]) === 3);
      const perdedores = partido.filter(cols => Number(cols[idxPuntos]) === 0);
      // Sumar goles
      const golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
      const golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
      const diferencia = golesGanadores - golesPerdedores;
      // Asignar diferencia a cada jugador
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
      // Empatados no suman diferencia
    });
    // Calcular el resto de métricas
    dataRows.forEach(cols => {
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
        // Contar ganados, empatados, perdidos
        if (puntos === 3) metricasPorJugador[jugador].ganados += 1;
        else if (puntos === 1) metricasPorJugador[jugador].empatados += 1;
        else if (puntos === 0) metricasPorJugador[jugador].perdidos += 1;
      }
    });
    // Calcular últimos 5 resultados de cada jugador
    const ultimosResultados = getUltimosResultadosPorJugador(dataRows, idxJugador, idxPuntos, 5);
    // Calcular últimos 5 goles de cada jugador
    const ultimosGoles = getUltimosGolesPorJugador(dataRows, idxJugador, idxGoles, 5);
    window.metricasPorJugador = metricasPorJugador;
    window.partidosTotales = partidosTotales;
    window.ultimosResultados = ultimosResultados;
    window.ultimosGoles = ultimosGoles;
    renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles);
    renderTablaGoleadores(metricasPorJugador);
    renderTribunalAsistencias(dataRows, idxJugador, idxFecha);
    renderHistorialPartidos(dataRows, idxFecha, idxJugador, idxGoles, idxPuntos);
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

let minPartidos = 1;
let fechaSlicerIdx = null; // índice de la fecha máxima seleccionada
let fechasOrdenadas = [];

function renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles) {
  const tablaDiv = document.getElementById('tablaPuntosTotales');
  let html = '<table><caption style="caption-side:top;font-size:1.3em;font-weight:bold;margin-bottom:8px;">Tabla general</caption><thead><tr><th>#</th><th>Jugador</th><th>Puntos Totales</th><th>Goles Totales</th><th>Dif. Gol</th><th>Partidos Jugados</th><th>Ganados</th><th>Empatados</th><th>Perdidos</th><th>% Victorias</th><th>% Presencias</th><th>Prom. Puntos</th><th>Prom. Goles</th><th>Rendimiento</th><th>Goleómetro</th></tr></thead><tbody>';
  // Filtrar por partidos mínimos
  const jugadoresFiltrados = Object.entries(metricasPorJugador).filter(([_, m]) => m.partidos >= minPartidos);
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
    const porcentajePresencias = window.fechasFiltradas ? Math.round((m.partidos / window.fechasFiltradas.length) * 100) + '%' : '0%';
    let rendimiento = '';
    if (ultimosResultados && ultimosResultados[jugador]) {
      rendimiento = ultimosResultados[jugador].map(resultadoAEmoji).join(' ');
    }
    let goleometro = '';
    if (ultimosGoles && ultimosGoles[jugador]) {
      goleometro = ultimosGoles[jugador].map(golesAColor).join(' ');
    }
    html += `<tr><td>${posicion}</td><td>${jugador}</td><td>${m.puntos}</td><td>${m.goles}</td><td>${m.difGol || 0}</td><td>${m.partidos}</td><td>${m.ganados}</td><td>${m.empatados}</td><td>${m.perdidos}</td><td>${porcentajeVictorias}</td><td>${porcentajePresencias}</td><td>${promPuntos}</td><td>${promGoles}</td><td>${rendimiento}</td><td>${goleometro}</td></tr>`;
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
}

function renderTablaGoleadores(metricasPorJugador) {
  const tablaDiv = document.getElementById('tablaGoleadores');
  if (!tablaDiv) return;
  let html = '<table><caption style="caption-side:top;font-size:1.2em;font-weight:bold;margin-bottom:8px;">Tabla de Goleadores</caption><thead><tr><th>#</th><th>Jugador</th><th>Partidos Jugados</th><th>Goles por Partido</th><th>Diferencia de Gol</th><th>Goles Totales</th></tr></thead><tbody>';
  const jugadoresOrdenados = Object.entries(metricasPorJugador).sort((a, b) => b[1].goles - a[1].goles);
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
    html += `<tr><td>${posicion}</td><td>${jugador}</td><td>${m.partidos}</td><td>${golesPorPartido}</td><td>${m.difGol || 0}</td><td>${m.goles}</td></tr>`;
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

  // Renderizar la tabla
  let html = '<table><caption style="caption-side:top;font-size:1.2em;font-weight:bold;margin-bottom:8px;">Tribunal de Asistencias</caption>';
  html += '<thead><tr><th>Jugador</th><th>#</th><th>% Presencias</th><th>Historial de Presencias</th></tr></thead><tbody>';
  jugadoresConAsistencias.forEach(({ jugador, asistencias, total, porcentaje }) => {
    const porcentajeStr = total > 0 ? Math.round(porcentaje * 100) + '%' : '0%';
    html += `<tr><td>${jugador}</td><td>${asistencias} de ${total}</td><td>${porcentajeStr}</td><td>`;
    fechas.forEach(fecha => {
      if (presenciasPorJugador[jugador].has(fecha)) {
        html += '<span style="color:green;font-size:1.2em;">🟢</span>';
      } else {
        html += '<span style="color:red;font-size:1.2em;">🔴</span>';
      }
    });
    html += '</td></tr>';
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

// Agregar evento al input de partidos mínimos
window.addEventListener('DOMContentLoaded', () => {
  const minPartidosInput = document.getElementById('minPartidosInput');
  const minPartidosValue = document.getElementById('minPartidosValue');
  const fechaSlicer = document.getElementById('fechaSlicer');
  const fechaSlicerValue = document.getElementById('fechaSlicerValue');
  if (minPartidosInput && minPartidosValue) {
    if (window.partidosTotales) {
      minPartidosInput.max = window.partidosTotales;
    }
    minPartidosInput.addEventListener('input', function() {
      minPartidos = Number(this.value) || 1;
      minPartidosValue.textContent = this.value;
      // Usar el filtro de fecha si está activo
      if (fechaSlicer && fechaSlicer.value && window.fechasOrdenadas) {
        filtrarYRenderizarPorFecha();
      } else if (window.metricasPorJugador && window.partidosTotales && window.ultimosResultados && window.ultimosGoles) {
        renderPuntosTotales(window.metricasPorJugador, window.partidosTotales, window.ultimosResultados, window.ultimosGoles);
      }
    });
    minPartidosValue.textContent = minPartidosInput.value;
  }
  if (fechaSlicer && fechaSlicerValue) {
    // Esperar a que window.fechasOrdenadas esté disponible
    const esperarFechas = setInterval(() => {
      if (window.fechasOrdenadas && window.fechasOrdenadas.length > 0) {
        fechaSlicer.max = window.fechasOrdenadas.length;
        fechaSlicer.value = window.fechasOrdenadas.length;
        fechaSlicerValue.textContent = window.fechasOrdenadas[window.fechasOrdenadas.length - 1] || '';
        fechaSlicerIdx = window.fechasOrdenadas.length;
        clearInterval(esperarFechas);
      }
    }, 100);
    fechaSlicer.addEventListener('input', function() {
      fechaSlicerIdx = Number(this.value);
      fechaSlicerValue.textContent = window.fechasOrdenadas[fechaSlicerIdx - 1] || '';
      filtrarYRenderizarPorFecha();
    });
  }
});

function filtrarYRenderizarPorFecha() {
  // Filtrar dataRows hasta la fecha seleccionada
  const idx = fechaSlicerIdx || window.fechasOrdenadas.length;
  window.fechasFiltradas = window.fechasOrdenadas.slice(0, idx);
  const dataFiltrada = window.dataRowsOriginal.filter(cols => window.fechasFiltradas.includes(cols[window.idxFecha]));
  // Recalcular métricas
  const metricasPorJugador = {};
  const partidosPorFecha = {};
  dataFiltrada.forEach(cols => {
    const fecha = cols[window.idxFecha];
    if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
    partidosPorFecha[fecha].push(cols);
  });
  Object.values(partidosPorFecha).forEach(partido => {
    const ganadores = partido.filter(cols => Number(cols[window.idxPuntos]) === 3);
    const perdedores = partido.filter(cols => Number(cols[window.idxPuntos]) === 0);
    const golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[window.idxGoles]), 0);
    const golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[window.idxGoles]), 0);
    const diferencia = golesGanadores - golesPerdedores;
    ganadores.forEach(cols => {
      const jugador = cols[window.idxJugador];
      if (!metricasPorJugador[jugador]) metricasPorJugador[jugador] = { puntos: 0, goles: 0, partidos: 0, ganados: 0, empatados: 0, perdidos: 0, difGol: 0 };
      metricasPorJugador[jugador].difGol = (metricasPorJugador[jugador].difGol || 0) + diferencia;
    });
    perdedores.forEach(cols => {
      const jugador = cols[window.idxJugador];
      if (!metricasPorJugador[jugador]) metricasPorJugador[jugador] = { puntos: 0, goles: 0, partidos: 0, ganados: 0, empatados: 0, perdidos: 0, difGol: 0 };
      metricasPorJugador[jugador].difGol = (metricasPorJugador[jugador].difGol || 0) - diferencia;
    });
  });
  dataFiltrada.forEach(cols => {
    const jugador = cols[window.idxJugador];
    const puntos = Number(cols[window.idxPuntos]);
    const goles = Number(cols[window.idxGoles]);
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
  const ultimosResultados = getUltimosResultadosPorJugador(dataFiltrada, window.idxJugador, window.idxPuntos, 5);
  const ultimosGoles = getUltimosGolesPorJugador(dataFiltrada, window.idxJugador, window.idxGoles, 5);
  window.metricasPorJugador = metricasPorJugador;
  window.partidosTotales = window.fechasFiltradas.length;
  window.ultimosResultados = ultimosResultados;
  window.ultimosGoles = ultimosGoles;
  renderPuntosTotales(metricasPorJugador, window.partidosTotales, ultimosResultados, ultimosGoles);
}

// Guardar métricas globalmente para el filtro
fetch(csvUrl)
  .then(response => response.text())
  .then(csv => {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',');
    const dataRows = rows.slice(1).map(row => row.split(','));

    // Calcular cantidad de fechas únicas (partidos totales)
    const idxFecha = headers.findIndex(h => h.trim().toLowerCase() === 'fecha');
    const fechasSet = new Set(dataRows.map(cols => cols[idxFecha]));
    const partidosTotales = fechasSet.size;

    // Para la tabla completa
    renderTable(headers, dataRows);

    // Buscar los índices correctos de las columnas
    const idxJugador = headers.findIndex(h => h.trim().toLowerCase() === 'jugador');
    const idxPuntos = headers.findIndex(h => h.trim().toLowerCase() === 'puntos');
    const idxGoles = headers.findIndex(h => h.trim().toLowerCase() === 'goles');

    // Calcular métricas por jugador único
    const metricasPorJugador = {};
    // Agrupar filas por fecha
    const partidosPorFecha = {};
    dataRows.forEach(cols => {
      const fecha = cols[idxFecha];
      if (!partidosPorFecha[fecha]) partidosPorFecha[fecha] = [];
      partidosPorFecha[fecha].push(cols);
    });
    // Calcular diferencia de gol por jugador
    Object.values(partidosPorFecha).forEach(partido => {
      // Separar ganadores y perdedores
      const ganadores = partido.filter(cols => Number(cols[idxPuntos]) === 3);
      const perdedores = partido.filter(cols => Number(cols[idxPuntos]) === 0);
      // Sumar goles
      const golesGanadores = ganadores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
      const golesPerdedores = perdedores.reduce((acc, cols) => acc + Number(cols[idxGoles]), 0);
      const diferencia = golesGanadores - golesPerdedores;
      // Asignar diferencia a cada jugador
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
      // Empatados no suman diferencia
    });
    // Calcular el resto de métricas
    dataRows.forEach(cols => {
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
        // Contar ganados, empatados, perdidos
        if (puntos === 3) metricasPorJugador[jugador].ganados += 1;
        else if (puntos === 1) metricasPorJugador[jugador].empatados += 1;
        else if (puntos === 0) metricasPorJugador[jugador].perdidos += 1;
      }
    });
    // Calcular últimos 5 resultados de cada jugador
    const ultimosResultados = getUltimosResultadosPorJugador(dataRows, idxJugador, idxPuntos, 5);
    // Calcular últimos 5 goles de cada jugador
    const ultimosGoles = getUltimosGolesPorJugador(dataRows, idxJugador, idxGoles, 5);
    window.dataRowsOriginal = dataRows;
    window.idxFecha = idxFecha;
    window.idxJugador = idxJugador;
    window.idxPuntos = idxPuntos;
    window.idxGoles = idxGoles;
    fechasOrdenadas = Array.from(fechasSet).sort();
    window.fechasOrdenadas = fechasOrdenadas;
    window.fechasFiltradas = fechasOrdenadas;
    renderPuntosTotales(metricasPorJugador, partidosTotales, ultimosResultados, ultimosGoles);
    renderTablaGoleadores(metricasPorJugador);
    renderTribunalAsistencias(dataRows, idxJugador, idxFecha);
    renderHistorialPartidos(dataRows, idxFecha, idxJugador, idxGoles, idxPuntos);
    renderComparadorJugadores(metricasPorJugador);
  });

// --- COMPARADOR DE JUGADORES ---
function renderComparadorJugadores(metricasPorJugador) {
  const select1 = document.getElementById('comparadorJugador1');
  const select2 = document.getElementById('comparadorJugador2');
  const estadisticasDiv = document.getElementById('comparadorEstadisticas');
  if (!select1 || !select2 || !estadisticasDiv) return;

  // Poblar selects si están vacíos
  if (select1.options.length === 0 || select2.options.length === 0) {
    const jugadores = Object.keys(metricasPorJugador);
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
    // Por defecto, selecciona los dos primeros distintos
    if (jugadores.length > 1) {
      select1.value = jugadores[0];
      select2.value = jugadores[1];
    }
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
    const pctVict1 = m1.partidos ? Math.round((m1.ganados / m1.partidos) * 100) : 0;
    const pctVict2 = m2.partidos ? Math.round((m2.ganados / m2.partidos) * 100) : 0;
    const pctAsist1 = window.fechasFiltradas ? Math.round((m1.partidos / window.fechasFiltradas.length) * 100) : 0;
    const pctAsist2 = window.fechasFiltradas ? Math.round((m2.partidos / window.fechasFiltradas.length) * 100) : 0;
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
        </div>
      </div>
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
