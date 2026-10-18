require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);

if (!API_KEY) {
  console.error('ERROR: OPENWEATHER_API_KEY not set in .env');
  process.exit(1);
}

const cache = new NodeCache({ stdTTL: CACHE_TTL });

app.use(express.static(path.join(__dirname, 'public')));

async function getCached(url, cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upstream error ${res.status}: ${txt}`);
  }

  const data = await res.json();
  cache.set(cacheKey, data);
  return data;
}

app.get('/api/weather', async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) {
    return res.status(400).json({ error: 'Missing city parameter' });
  }

  try {
    const q = encodeURIComponent(city);
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&units=metric&appid=${API_KEY}`;

    const [current, forecast] = await Promise.all([
      getCached(currentUrl, `current:${city.toLowerCase()}`),
      getCached(forecastUrl, `forecast:${city.toLowerCase()}`)
    ]);

    const result = {
      city: {
        name: current.name,
        country: current.sys && current.sys.country
      },
      current: {
        temp: current.main.temp,
        feels_like: current.main.feels_like,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        wind_speed: current.wind && current.wind.speed,
        wind_deg: current.wind && current.wind.deg,
        weather: current.weather && current.weather[0] ? {
          main: current.weather[0].main,
          description: current.weather[0].description,
          icon: current.weather[0].icon
        } : null,
        dt: current.dt
      },
      forecast: forecast.list || []
    };

    res.json(result);
  } catch (err) {
    console.error('API error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch weather', details: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Weather dashboard running at http://localhost:${PORT}`);
});
