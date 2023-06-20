const request = require('request');
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const { log } = require('console');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

const firstTicker = ""; // You must add the ticker of parity here
const secondTicker = ""; // You must add second ticker of parity here 
const binanceUrl = 'https://api.binance.com/api/v3/ticker/price?symbol=' + firstTicker; 
const correlatedBinanceUrl = 'https://api.binance.com/api/v3/ticker/price?symbol=' + secondTicker;
const jsonFilePath = 'first_price.json';
const jsonSecondFilePath = 'second_prices.json';

let firstPrices = [0, 0]; // initialize with 0

// function to fetch first coin price from Binance API
function fetchFirstPrice() {
  request(binanceUrl, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      const price = parseFloat(data.price);
      firstPrices[0] = firstPrices[1];
      firstPrices[1] = price;
      console.log(`first coin's price: ${price}`);
      fetchSecondPrice();
      writeJsonFile();
      comparePrices(); 
    } else {
      console.log(`Error fetching first coin's price: ${error}`);
    }
  });
}

let secondPrices = [0, 0]; // initialize with 0

// function to fetch second coin price from Binance API
function fetchSecondPrice() {
  request(correlatedBinanceUrl, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const secondData = JSON.parse(body);
      const secondPrice = parseFloat(secondData.price);
      secondPrices[0] = secondPrices[1];
      secondPrices[1] = secondPrice;
      console.log(`Second coin's price: ${secondPrice}`);
      writeSecondJsonFile();
    } else {
      console.log(`Error fetching second coin's price: ${error}`);
    }
  });
}

// function to write first coin's prices array to JSON file
function writeJsonFile() {
  const jsonData = JSON.stringify({ prices: firstPrices});
  fs.writeFile(jsonFilePath, jsonData, (error) => {
    if (error) {
      console.log(`Error writing to JSON file: ${error}`);
    }
  });
}

// function to write second coin's prices array to JSON file
function writeSecondJsonFile() {
  const jsonSecondData = JSON.stringify({ prices: secondPrices });
  fs.writeFile(jsonSecondFilePath, jsonSecondData, (error) => {
    if (error) {
      console.log(`Error writing to JSON file: ${error}`);
    }
  });
}

// call fetchFirstPrice() every minute
setInterval(fetchFirstPrice, 60 * 1000);

// date variables
let now = new Date();
let nowTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

//function to compare coins' two prices
function comparePrices(){
    const gapfirstPercentage = (firstPrices[1] - firstPrices[0])/firstPrices[0];
    const gapSecondPercentage = (secondPrices[1] - secondPrices[0])/secondPrices[0];

    if((gapfirstPercentage >= 0.02) ^ (gapSecondPercentage >= 0.02)){
        message1 = `${firstTicker} ${gapfirstPercentage} yükseldi.
        Korele pairi: ${secondTicker}
        ${firstTicker} fiyatı: ${firstPrices[1]}`;
        const channel = client.channels.cache.get(channelId);
        channel.send(message1);
    }
}



setInterval(comparePrices, 60.00000001 * 1000);



const channelId = 'your channel ID'; // enter your channel ID

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login('your token'); // enter your token 

