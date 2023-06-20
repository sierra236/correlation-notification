const axios = require('axios');
const Chart = require('chart.js');
const { createCanvas } = require('canvas');
const fs = require('fs');

const binanceEndpoint = 'https://api.binance.com';
const binanceSymbol = 'BTCUSDT';
const binanceInterval = '1m';
const chartWidth = 800;
const chartHeight = 400;

// initialize empty arrays for chart data
let chartLabels = [];
let chartData = [];

// create chart canvas
const canvas = createCanvas(chartWidth, chartHeight);
const ctx = canvas.getContext('2d');

// set chart options
const chartOptions = {
  responsive: false,
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 10,
      },
    },
  },
};

// update chart data every minute
setInterval(() => {
  axios.get(`${binanceEndpoint}/api/v3/klines`, {
    params: {
      symbol: binanceSymbol,
      interval: binanceInterval,
      limit: 1,
    },
  })
  .then(response => {
    const kline = response.data[0];
    const timestamp = kline[0];
    const openPrice = parseFloat(kline[1]);
    const closePrice = parseFloat(kline[4]);

    // add new data to chart arrays
    chartLabels.push(new Date(timestamp).toLocaleTimeString());
    chartData.push(closePrice);

    // remove oldest data from chart arrays if length > 10
    if (chartLabels.length > 10) {
      chartLabels.shift();
      chartData.shift();
    }

    // create new chart
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'BTC/USDT',
          data: chartData,
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
        }],
      },
      options: chartOptions,
    });

    // save chart to file
    const chartImage = canvas.toBuffer();
    fs.writeFileSync('btc-chart.png', chartImage);
  })
  .catch(error => {
    console.error(error);
  });
}, 60 * 1000);
