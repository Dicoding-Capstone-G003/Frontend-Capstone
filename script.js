const DEFAULT_API_BASE_URL = 'https://api.db10-g003.my.id';
const API_BASE_URL = DEFAULT_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 10000;

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
const sunHoursValue = document.getElementById('sun-hours-value');
// const toggleReference = document.getElementById('toggle-reference');
const chartNote = document.getElementById('chart-note');

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

const currentTimeMarkerPlugin = {
  id: 'currentTimeMarker',
  afterDatasetsDraw(chart, _args, pluginOptions) {
    const hours = pluginOptions?.hours || [];
    if (!hours.length) return;

    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    if (!xScale || !yScale) return;

    const points = hours.map((hour) => new Date(hour).getTime()).filter((time) => Number.isFinite(time));
    if (!points.length) return;

    const now = Date.now();
    const first = points[0];
    const last = points[points.length - 1];

    if (now < first || now > last) return;

    let markerX = null;

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];

      if (now >= start && now <= end) {
        const startX = xScale.getPixelForValue(chart.data.labels[index], index);
        const endX = xScale.getPixelForValue(chart.data.labels[index + 1], index + 1);
        const ratio = end === start ? 0 : (now - start) / (end - start);
        markerX = startX + (endX - startX) * ratio;
        break;
      }
    }

    if (markerX === null && now === last) {
      markerX = xScale.getPixelForValue(chart.data.labels[points.length - 1], points.length - 1);
    }

    if (markerX === null) return;

    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(markerX, chartArea.top);
    ctx.lineTo(markerX, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Current time', markerX + 6, chartArea.top + 14);
    ctx.restore();
  },
};

Chart.register(currentTimeMarkerPlugin);

let currentForecast = {
  hours: [],
  modelValues: [],
  referenceValues: [],
};

function getDefaultRegionName() {
  return 'Jawa';
}

function setRegionOptions(regionNames) {
  regionSelect.innerHTML = regionNames.map((region) => `<option value="${region}">${region}</option>`).join('');
}

const chart = new Chart(chartContext, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Model',
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
      {
        label: 'Open-Meteo',
        data: [],
        borderColor: '#0ea5e9',
        borderWidth: 3,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.35,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0ea5e9',
        pointHoverRadius: 6,
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
      currentTimeMarker: {
        hours: [],
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

function formatSunHours(values) {
  if (!Array.isArray(values) || values.length === 0) return '-';
  const positiveCount = values.filter((value) => value > 0).length;
  return `${positiveCount} h`;
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
    sunHoursValue.textContent = '-';
    return;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  peakValue.textContent = formatEnergy(Math.max(...values));
  avgValue.textContent = formatEnergy(total / values.length);
  minValue.textContent = formatEnergy(Math.min(...values));
  sunHoursValue.textContent = formatSunHours(values);
}

function formatHourLabel(hour) {
  return new Date(hour).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function updateChartNote(hours) {
  if (!hours.length) {
    chartNote.textContent = 'Window forecast akan mengikuti timestamp dari API.';
    return;
  }

  const startLabel = formatHourLabel(hours[0]);
  const endLabel = formatHourLabel(hours[hours.length - 1]);
  chartNote.textContent = `Window forecast API: ${startLabel} - ${endLabel}. Garis merah mengikuti waktu browser Anda.`;
}

function renderChart() {
  const { hours, modelValues, referenceValues } = currentForecast;

  chart.data.labels = hours.map((hour) =>
    new Date(hour).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );
  chart.data.datasets[0].data = modelValues;
  chart.data.datasets[0].hidden = false;
  chart.data.datasets[1].data = referenceValues;
  // chart.data.datasets[1].hidden = !toggleReference.checked;
  chart.data.datasets[1].hidden = true;
  chart.options.plugins.currentTimeMarker.hours = hours;
  chart.update();
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

function normalizeRegions(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.regions)
      ? payload.regions
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

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
    const rawReferenceValues = Array.isArray(forecast.openmeteo_reference) ? forecast.openmeteo_reference : [];
    const rawHours = Array.isArray(forecast.forecast_hours) ? forecast.forecast_hours : [];
    const scaledValues = applyCapacity(rawValues);
    const scaledReferenceValues = applyCapacity(rawReferenceValues);
    currentForecast = {
      hours: rawHours,
      modelValues: scaledValues,
      referenceValues: scaledReferenceValues,
    };

    updateMap(regionName);
    renderChart();
    updateChartNote(rawHours);
    updateStats(scaledValues);
    updateStatus(`Forecast ${regionName} berhasil dimuat.`, 'success');
  } catch (error) {
    updateStatus(`Forecast gagal dimuat: ${error.message}`, 'error');
  }
}

async function initializeDashboard() {
  updateStatus('Menghubungkan ke API...', 'info');
  setRegionOptions(Object.keys(fallbackLocations));
  regionSelect.value = getDefaultRegionName();
  updateMap(regionSelect.value);

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

    setRegionOptions(regions.map((region) => region.name));

    const defaultRegion = regions.some((region) => region.name === getDefaultRegionName())
      ? getDefaultRegionName()
      : regions[0].name;
    regionSelect.value = defaultRegion;

    await loadForecast(defaultRegion);
  } catch (error) {
    setRegionOptions(Object.keys(fallbackLocations));
    regionSelect.value = getDefaultRegionName();
    updateMap(regionSelect.value);
    updateStatus(`Gagal mengambil data region: ${error.message}`, 'error');
  }
}

regionSelect.addEventListener('change', () => {
  loadForecast(regionSelect.value);
});

capacitySelect.addEventListener('change', () => {
  loadForecast(regionSelect.value);
});

// if (toggleReference) {
//   toggleReference.addEventListener('change', () => {
//     renderChart();
//   });
// }

setInterval(() => {
  if (currentForecast.hours.length) {
    chart.draw();
  }
}, 60000);

initializeDashboard();
