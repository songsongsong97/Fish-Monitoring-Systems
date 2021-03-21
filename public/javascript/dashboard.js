/* globals Chart:false, feather:false */

(function() {
  let dataX_fish = [];
  let dataY_fish = [];
  let frameWidth = 0;
  let frameHeight = 0;
  let fishCount = 0;
  let medianX_fish = 0;
  let medianY_fish = 0;
  let currentDate;
  let fishArray = new Array(24).fill(0); //numoffish eveyy hour in a day

  // generate fish location graph every 0.3 second
  setInterval(function() {
    currentDate = new Date();
    let currentTime = currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();
    document.getElementById("currentTime").innerHTML = currentTime;
    //get query result
    // let url = "http://localhost:2020/send/front";
    let url = <%= url %>;
    fetch(url).then(response => response.json())
      .then((result) => {
        let webcam = document.getElementById('webcam');
        //set image url to decoded base64 image
        webcam.src = 'data:image/jpg;base64,' + result.screenshotBuffer;
        let numDeadFish = result.deadFishCount;
        let numLiveFish = result.liveFishCount;
        fishCount = numDeadFish + numLiveFish;

        document.getElementById('total-fish').innerHTML = fishCount;
        document.getElementById('alive-fish').innerHTML = numLiveFish;
        document.getElementById('dead-fish').innerHTML = numDeadFish;
        document.getElementById('fish-status').innerHTML = result.status;
        frameWidth = result.frameWidth;
        frameHeight = result.frameHeight;
        fishCenters = result.fishCenters;
        medianX_fish = result.fishMedian[0];
        medianY_fish = result.fishMedian[1];
      })
      .catch(error => console.log('error:', error));
    // generateFishGraph(fishCenters, frameWidth, frameHeight);

  }, 300);

  // generate median grafh every 5 seconds
  setInterval(function(){
    //array of median and datetime
    dataX_fish.push({
      "x": currentDate,
      "y": medianX_fish
    });
    dataY_fish.push({
      "x": currentDate,
      "y": medianY_fish
    });
    //clear all cached data every 3 hours
    if (currentDate.getHours() % 3 === 0 && currentDate.getMinutes() === 0 ) { //&& d.getSeconds() === 0
      dataX_fish = [];
      dataY_fish = [];
    }
    //generate median of fish location graph by x and y axis
    generateMedianGraph('x-chart', 'X-axis', frameWidth, dataX_fish);
    generateMedianGraph('y-chart', 'Y-axis', frameHeight, dataY_fish);
  }, 5000);

  //generate number of fish graphs every hour on report page
  setInterval(function(){
    //if (d.getMinutes() === 0 && d.getSeconds() === 0){
    currentHour = currentDate.getHours();
    fishArray[currentHour] = fishCount;
    console.log(fishArray);
    console.log('FishCount = ' + fishCount);
    //}
    // generateNumFishGraph(fishArray);
  },60 * 60 * 1000);
}())

function generateMedianGraph(chartName, axis, ymaxValue, fishData) {
  let timectx = document.getElementById(chartName).getContext('2d');
  let timeChart = new Chart(timectx, {
    type: 'line',
    data: {
      datasets: [{
          data: fishData,
          borderColor: '#00CED1',
          label: 'Fish( ' + axis + ')'
        },

      ]
    },
    options: {
      title: {
        display: true,
        text: 'Median fish position (' + axis + ')'
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Time'
          },
          type: 'time',
          time: {
            displayFormats: {
              minute: 'h:mm'
            }
          },
          ticks: {
            max: new Date(new Date().setHours(23, 59, 59, 999)),
            min: new Date(new Date().setHours(0, 0, 0, 0)),
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Median Fish Position'
          },
          ticks: {
            max: ymaxValue,
            min: 0,
            stepSize: 100
          }
        }],
      },
      animation: false
    }
  });
}

function generateFishGraph(fish_plots, frameWidth, frameHeight) {
  let ctx = document.getElementById('position-chart').getContext('2d');
  let minWidth = frameWidth * 1 / 4;
  let maxWidth = frameWidth * 3 / 4;
  let minHeight = frameHeight * 1 / 4;
  let maxHeight = frameHeight * 3 / 4;
  let scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
          label: 'Fish',
          data: fish_plots,
          backgroundColor: '#00CED1',
        },
        {
          label: 'Border',
          type: 'line',
          data: [{
            x: minWidth,
            y: minHeight
          }, {
            x: minWidth,
            y: maxHeight
          }, {
            x: maxWidth,
            y: maxHeight
          }, {
            x: maxWidth,
            y: minHeight
          }],
          borderColor: 'rgba(255, 99, 132, 0.8)',
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Real-time Distribution of Fish'
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'X-axis'
          },
          type: 'linear',
          position: 'bottom',
          ticks: {
            max: frameWidth,
            min: 0,
            stepSize: 100
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Y-axis'
          },
          ticks: {
            max: frameHeight,
            min: 0,
            stepSize: 100
          }
        }],
      },
      animation: false
    },
    plugins: {
      filler: {
        propagate: true
      }
    },
  });

}

function generateNumFishGraph(fishArray) {
  let hourArray = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
    '23:00'];
  let ctx = document.getElementById('fish-num-chart').getContext('2d');
  let myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hourArray,
      datasets: [{
        barPercentage: 0.5,
        barThickness: 6,
        maxBarThickness: 8,
        minBarLength: 2,
        backgroundColor: 'rgb(167,222,252)',
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
