/* globals Chart:false, feather:false */

(function() {
  generateDailyGraph();
}())

function generateDailyGraph() {
  let hourArray = <%- JSON.stringify(hourArray) %>;
  let fishArray = <%- JSON.stringify(fishArray) %>;
  let ctx = document.getElementById('fish-num-chart').getContext('2d');
  let myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      // labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
      //   '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      //   '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
      //   '23:00'
      // ],
      labels: hourArray,
      datasets: [{
        barPercentage: 0.5,
        barThickness: 6,
        maxBarThickness: 8,
        minBarLength: 2,
        backgroundColor: 'rgb(167,222,252)',
        // data: [10, 20, 30, 40, 50, 60, 70, 10, 20, 30, 40, 50, 60, 70, 10, 20, 30, 40, 50, 60, 70, 10, 20, 30],
        data: fishArray,
      }]
    },
    options: {
      legend: {
            display: false,
        },
      title: {
        display: true,
        text: 'Number of Live Fish By Hour'
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Hour'
          },
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Number of Live Fish'
          },
          ticks: {
            min: 0,
          }
        }],
      },
    }
  });
}
