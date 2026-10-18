# Weather Dashboard

A simple weather dashboard built with Node.js + Express that fetches live weather data from OpenWeatherMap and displays:
- current weather
- humidity, wind, pressure
- 5-day forecast

## Requirements
- Node.js 18+
- An OpenWeatherMap API key

## Setup
1. Copy `.env.example` to `.env`
2. Add your API key:
   ```bash
   OPENWEATHER_API_KEY=your_key_here
   PORT=3000
   CACHE_TTL_SECONDS=600
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm start
   ```
5. Open: http://localhost:3000

## Notes
- The app caches weather requests to reduce API calls.
- `.env` is intentionally not committed to Git.
