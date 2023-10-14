import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const port = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath, { extensions: ['html', 'js'] }));

const apiKeyWeather = process.env.VUE_APP_OPENWEATHERMAP_API_KEY;
const apiKeyGoogle = process.env.VUE_APP_GOOGLE_API_KEY;

app.get('/getPlacePredictions/:input', async (req, res) => {
    const input = req.params.input;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKeyGoogle}&input=${input}&types=(cities)`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

app.get('/getPlaceDetails/:place_id', async (req, res) => {
    const placeId = req.params.place_id;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKeyGoogle}&placeid=${placeId}&type=locality`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data.result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch place details' });
    }
});

app.get('/getWeather/:lat/:long', async (req, res) => {
    const lat = req.params.lat;
    const long = req.params.long;

    const url = `https://api.openweathermap.org/data/2.5/forecast?&cnt=40&lat=${lat}&lon=${long}&units=metric&appid=${apiKeyWeather}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch weather details' });
    }
});

app.get('/getPollution/:lat/:long', async (req, res) => {
    const lat = req.params.lat;
    const long = req.params.long;

    const currentDate = new Date();
    const startDate = Math.floor(currentDate.setHours(0, 0, 0, 0) / 1000) + 86400;
    const endDate = startDate + (86400 * 5);

    const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?&lat=${lat}&lon=${long}&start=${startDate}&end=${endDate}&appid=${apiKeyWeather}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pollution data' });
    }
});

app.get('/getMap/', (req, res) => {
    const url = `https://maps.googleapis.com/maps/api/js?key=${apiKeyGoogle}&callback=initMap`;
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        (function() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = "${url}";
            document.head.appendChild(script);
        })();
    `);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
