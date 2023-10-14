export async function getFiveDayCityForecast(lat, long) {
    var weatherData = await getWeatherData(lat, long);
    var pollutionData = await getPollutionData(lat, long);
    var combinedData = await processData(weatherData, pollutionData);
    return combinedData;
}

async function processData(weatherData, pollutionData) {
    var days = new Array();
    var processedWeather = await processWeatherData(weatherData);
    var processedPollution = await processPollutionData(pollutionData);
    for (let dayNum = 0; dayNum < 5; dayNum++) {
        let day = { avgTemp: 0, rainfall: 0, avgWindSpeed: 0, weatherType: "", itRains: false, dayNum: 0, needMask: false};
        day.avgTemp = processedWeather[dayNum].avgTemp;
        day.rainfall = processedWeather[dayNum].rainfall;
        day.avgWindSpeed = processedWeather[dayNum].avgWindSpeed;
        day.weatherType = processedWeather[dayNum].weatherType;
        day.itRains = processedWeather[dayNum].itRains;
        day.dayNum = days.length + 1;
        day.needMask = processedPollution[dayNum];
        days.push(day);
    }
    console.log("DAYSSSSSSSSSSSS")
    console.log(days)
    return days;
}

async function processWeatherData(weatherData) {
    var days = new Array();
    let dayPeriods = new Array(8);
    for (let period = 0; period < 40; period++) {
        dayPeriods[period % 8] = weatherData[period];
        if (period % 8 == 7) {
            let day = { avgTemp: 0, rainfall: 0, avgWindSpeed: 0, weatherType: "", itRains: false, dayNum: 0 };
            const averageTemp = Math.round(dayPeriods.reduce((accumulator, object) => {
                return accumulator + object.main.temp;
            }, 0) / 8);
            const rain = (dayPeriods.reduce((accumulator, object) => {
                if (object && object.rain && object.rain["3h"] !== undefined) {
                    return accumulator + object.rain["3h"];
                } else {
                    return accumulator;
                }
            }, 0)).toFixed(3);
            const averageWindSpeed = (dayPeriods.reduce((accumulator, object) => {
                if (object && object.rain && object.wind.speed !== undefined) {
                    return accumulator + object.wind.speed;
                } else {
                    return accumulator;
                }
            }, 0) / 8).toFixed(3);
            
            var tempRange = "";

            if (averageTemp < 13) {
                tempRange = "Cold";
            } else if (averageTemp <= 23) {
                tempRange = "Mild";
            } else {
                tempRange = "Hot";
            }

            var itRains = false;
            if (rain > 0) {
                itRains = true;
            }
            day.avgTemp = averageTemp;
            day.rainfall = rain;
            day.avgWindSpeed = averageWindSpeed;
            day.weatherType = tempRange;
            day.itRains = itRains;
            day.dayNum = days.length + 1;
            days.push(day);
        }
    }
    return days;
}

async function processPollutionData(pollutionData) {
    function chunkArray(arr, chunkSize) {
        const chunkedArray = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunkedArray.push(arr.slice(i, i + chunkSize));
        }
        return chunkedArray;
    }
    const chunkedData = chunkArray(pollutionData, 24);
    const highestPm2_5Values = [];
    chunkedData.forEach(chunk => {
        let highestPm2_5 = chunk[0].components.pm2_5;
        chunk.forEach(obj => {
            const pm2_5Value = obj.components.pm2_5;
            if (pm2_5Value > highestPm2_5) {
                highestPm2_5 = pm2_5Value;
            }
        });
        highestPm2_5Values.push(highestPm2_5);
    });

    const needMask = highestPm2_5Values.map(value => value >= 10);
    return needMask;
}


async function getWeatherData(lat, long) {
    var response = await fetch(`/getWeather/${lat}/${long}`)
    var data = await response.json()
    console.log(data);
    return data.list;
}

async function getPollutionData(lat, long) {
    var response = await fetch(`/getPollution/${lat}/${long}`)
    var data = await response.json()
    console.log(data);
    return data.list;
}