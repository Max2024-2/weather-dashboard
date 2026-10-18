const $ = (id) => document.getElementById(id);
const status = $('status');
const searchBtn = $('search-btn');
const cityInput = $('city-input');
const currentSection = $('current');
const forecastSection = $('forecast');

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    showStatus('Please enter a city', true);
    return;
  }
  fetchWeather(city);
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

function showStatus(msg, isError = false) {
  status.textContent = msg;
  status.style.color = isError ? '#b00' : '#222';
}

function clearStatus() {
  status.textContent = '';
}

async function fetchWeather(city) {
  clearStatus();
  showStatus('Loading...');
  hideSections();

  try {
    const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.error || `Server returned ${resp.status}`);
    }

    const data = await resp.json();
    renderCurrent(data);
    renderForecast(data);
    clearStatus();
  } catch (err) {
    showStatus('Error: ' + err.message, true);
    console.error(err);
  }
}

function hideSections() {
  currentSection.classList.add('hidden');
  forecastSection.classList.add('hidden');
}

function renderCurrent(data) {
  const cur = data.current;
  $('current-city').textContent = `${data.city.name || ''}${data.city.country ? ', ' + data.city.country : ''}`;
  $('current-temp').textContent = `${Math.round(cur.temp)}°C`;
  $('current-desc').textContent = cur.weather ? cur.weather.description : '';
  $('current-feels').textContent = cur.feels_like ? `${Math.round(cur.feels_like)}°C` : 'N/A';
  $('current-humidity').textContent = cur.humidity ?? 'N/A';
  $('current-wind').textContent = cur.wind_speed ?? 'N/A';
  $('current-pressure').textContent = cur.pressure ?? 'N/A';

  if (cur.weather && cur.weather.icon) {
    $('current-icon').src = `https://openweathermap.org/img/wn/${cur.weather.icon}@2x.png`;
    $('current-icon').alt = cur.weather.description || 'weather icon';
  } else {
    $('current-icon').src = '';
    $('current-icon').alt = '';
  }

  currentSection.classList.remove('hidden');
}

function renderForecast(data) {
  const list = data.forecast || [];
  const container = $('forecast-list');
  container.innerHTML = '';

  if (!list.length) {
    forecastSection.classList.add('hidden');
    return;
  }

  const itemsToShow = Math.min(list.length, 16);
  for (let i = 0; i < itemsToShow; i++) {
    const it = list[i];
    const dt = new Date(it.dt * 1000);
    const card = document.createElement('div');
    card.className = 'forecast-item';

    const timeStr = dt.toLocaleString([], {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const icon = it.weather && it.weather[0] ? it.weather[0].icon : '';
    const desc = it.weather && it.weather[0] ? it.weather[0].description : '';

    card.innerHTML = `
      <div class="f-time">${timeStr}</div>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
      <div class="f-temp"><strong>${Math.round(it.main.temp)}°C</strong></div>
      <div class="f-desc" style="text-transform:capitalize">${desc}</div>
    `;

    container.appendChild(card);
  }

  forecastSection.classList.remove('hidden');
}

const defaultCity = 'London';
cityInput.value = defaultCity;
fetchWeather(defaultCity);
