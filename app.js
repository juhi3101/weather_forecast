const weatherCodes = {
    0: { icon: '☀️', text: 'Clear sky' },
    1: { icon: '🌤️', text: 'Mainly clear' },
    2: { icon: '⛅', text: 'Partly cloudy' },
    3: { icon: '☁️', text: 'Overcast' },
    45: { icon: '🌫️', text: 'Fog' },
    51: { icon: '🌦️', text: 'Light drizzle' },
    61: { icon: '🌧️', text: 'Rain' },
    80: { icon: '🌦️', text: 'Showers' },
    95: { icon: '⛈️', text: 'Thunderstorm' }
};

async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        if (!response.ok) throw new Error('Weather data unavailable');
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        alert(error.message);
    }
}

function updateUI(data) {
    const current = data.current;
    const daily = data.daily;

    document.getElementById('location').textContent = `${data.latitude.toFixed(2)}°N, ${data.longitude.toFixed(2)}°E`;
    document.getElementById('currentTemp').textContent = `${current.temperature_2m}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById('apparentTemp').textContent = `${current.apparent_temperature}°C`;

    const weatherCode = current.weather_code;
    document.getElementById('currentIcon').textContent = weatherCodes[weatherCode]?.icon || '';
    document.getElementById('conditions').textContent = weatherCodes[weatherCode]?.text || '';

    // Forecast
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    daily.time.forEach((date, idx) => {
        const code = daily.weather_code[idx];
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
            <div class="weather-icon">${weatherCodes[code]?.icon || ''}</div>
            <div>${new Date(date).toLocaleDateString('en', { weekday: 'short' })}</div>
            <div>${daily.temperature_2m_max[idx]}° / ${daily.temperature_2m_min[idx]}°</div>
        `;
        forecastContainer.appendChild(card);
    });
}

async function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;
    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        const geoData = await geoResponse.json();
        if (!geoData.results) throw new Error('City not found');
        const { latitude, longitude } = geoData.results[0];
        fetchWeather(latitude, longitude);
    } catch (error) {
        alert(error.message);
    }
}

function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => alert("Unable to retrieve your location")
    );
}

document.getElementById('searchBtn').addEventListener('click', searchWeather);
document.getElementById('geoBtn').addEventListener('click', getLocation);

// Initial load with a default location (e.g., New Delhi)
fetchWeather(28.61, 77.23);
