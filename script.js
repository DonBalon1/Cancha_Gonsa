const ctx = document.getElementById('graficoGoles').getContext('2d');
const grafico = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Don Balón', 'Fedegol', 'Huracan', 'Galva'],
    datasets: [{
      label: 'Goles',
      data: [29, 12, 11, 9],
      backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#e91e63']
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
