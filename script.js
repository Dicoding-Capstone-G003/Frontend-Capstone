const DEFAULT_API_BASE_URL = 'https://api.db10-g003.my.id';
const API_BASE_URL = DEFAULT_API_BASE_URL;

const fallbackLocations = {
  Papua: [-4.2, 138],
  Maluku: [-3.7, 129],
  'Nusa Tenggara': [-8.5, 119],
  Sulawesi: [-1.5, 120],
  Kalimantan: [0.5, 114],
  Jawa: [-7.5, 110],
  Sumatra: [0, 102],
};

const regionSelect = document.getElementById('region');
const capacitySelect = document.getElementById('capacity');
const statusPanel = document.getElementById('status-panel');
const peakValue = document.getElementById('peak-value');
const avgValue = document.getElementById('avg-value');
const minValue = document.getElementById('min-value');
const probValue = document.getElementById('prob-value');

const indonesiaBounds = L.latLngBounds([-11.0, 94.0], [6.0, 141.0]);

const map = L.map('map', {
  maxBounds: indonesiaBounds,
  maxBoundsViscosity: 1.0,
}).setView([-2.5, 118], 5);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap',
}).addTo(map);

let marker = L.marker([-8.5, 119]).addTo(map);
let regionLocations = { ...fallbackLocations };

const chartContext = document.getElementById('chart').getContext('2d');
const gradient = chartContext.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

const chart = new Chart(chartContext, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Produksi (kWh)',
        data: [],
        borderColor: '#f59e0b',
        borderWidth: 3,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#f59e0b',
        pointHoverRadius: 7,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter' } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } },
      },
    },
  },
});

function formatEnergy(value) {
  if (!Number.isFinite(value)) return '-';
  return `${value.toFixed(2)} kWh`;
}

function formatProbability(values) {
  if (!Array.isArray(values) || values.length === 0) return '-';
  const positiveCount = values.filter((value) => value > 0).length;
  const score = positiveCount / values.length;
  return score.toFixed(2);
}

function updateStatus(message, type = 'info') {
  statusPanel.textContent = message;
  statusPanel.className = `status-panel status-panel--${type}`;
}

function updateMap(regionName) {
  const coordinates = regionLocations[regionName] || fallbackLocations[regionName] || [-2.5, 118];
  const zoomLevel = regionLocations[regionName] ? 6 : 5;
  map.flyTo(coordinates, zoomLevel, { duration: 1.2 });
  marker.setLatLng(coordinates);
}

function applyCapacity(values) {
  const capacity = Number(capacitySelect.value || '1');
  return values.map((value) => Number(value || 0) * capacity);
}

function updateStats(values) {
  if (!values.length) {
    peakValue.textContent = '-';
    avgValue.textContent = '-';
    minValue.textContent = '-';
    probValue.textContent = '-';
    return;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  peakValue.textContent = formatEnergy(Math.max(...values));
  avgValue.textContent = formatEnergy(total / values.length);
  minValue.textContent = formatEnergy(Math.min(...values));
  probValue.textContent = formatProbability(values);
}

function updateChart(hours, values) {
  chart.data.labels = hours.map((hour) =>
    new Date(hour).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );
  chart.data.datasets[0].data = values;
  chart.update();
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

function normalizeRegions(payload) {
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.regions) ? payload.regions : [];

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item, coords: fallbackLocations[item] || null };
      }

      const name = item?.name || item?.region_name;
      if (!name) return null;

      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);
      const coords =
        Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : fallbackLocations[name] || null;

      return { name, coords };
    })
    .filter(Boolean);
}

async function loadForecast(regionName) {
  updateStatus(`Mengambil forecast untuk ${regionName}...`, 'info');

  try {
    const forecast = await request('/forecast', {
      method: 'POST',
      body: JSON.stringify({ region_name: regionName }),
    });

    const rawValues = Array.isArray(forecast.model_prediction) ? forecast.model_prediction : [];
    const rawHours = Array.isArray(forecast.forecast_hours) ? forecast.forecast_hours : [];
    const scaledValues = applyCapacity(rawValues);

    updateMap(regionName);
    updateChart(rawHours, scaledValues);
    updateStats(scaledValues);
    updateStatus(`Forecast ${regionName} berhasil dimuat.`, 'success');
  } catch (error) {
    updateStatus(`Forecast gagal dimuat: ${error.message}`, 'error');
  }
}

async function initializeDashboard() {
  updateStatus('Menghubungkan ke API...', 'info');

  try {
    const regionPayload = await request('/regions');
    const regions = normalizeRegions(regionPayload);

    if (!regions.length) {
      throw new Error('Daftar region kosong');
    }

    regionLocations = regions.reduce((result, region) => {
      if (region.coords) {
        result[region.name] = region.coords;
      }
      return result;
    }, { ...fallbackLocations });

    regionSelect.innerHTML = regions
      .map((region) => `<option value="${region.name}">${region.name}</option>`)
      .join('');

    const defaultRegion = regions.some((region) => region.name === 'Kalimantan') ? 'Kalimantan' : regions[0].name;
    regionSelect.value = defaultRegion;

    await loadForecast(defaultRegion);
  } catch (error) {
    regionSelect.innerHTML = Object.keys(fallbackLocations)
      .map((region) => `<option value="${region}">${region}</option>`)
      .join('');
    regionSelect.value = 'Kalimantan';
    updateMap('Kalimantan');
    updateStatus(`Gagal mengambil data region: ${error.message}`, 'error');
  }
}

regionSelect.addEventListener('change', () => {
  loadForecast(regionSelect.value);
});

capacitySelect.addEventListener('change', () => {
  loadForecast(regionSelect.value);
});

initializeDashboard();
