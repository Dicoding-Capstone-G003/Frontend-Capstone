export function formatDateTime(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatHour(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';

  return value.toFixed(3);
}

export function computeSummary(forecast) {
  if (!forecast) return null;

  const modelValues = forecast.model_prediction || [];
  const referenceValues = forecast.openmeteo_reference || [];
  const sum = modelValues.reduce((total, value) => total + value, 0);

  return {
    peakPrediction: modelValues.length ? Math.max(...modelValues) : 0,
    averagePrediction: modelValues.length ? sum / modelValues.length : 0,
    peakReference: referenceValues.length ? Math.max(...referenceValues) : 0,
    generatedAt: forecast.generated_at,
  };
}

export function buildChartData(forecast) {
  if (!forecast) return [];

  return (forecast.forecast_hours || []).map((hour, index) => ({
    hour,
    label: formatHour(hour),
    model_prediction: forecast.model_prediction?.[index] ?? 0,
    openmeteo_reference: forecast.openmeteo_reference?.[index] ?? 0,
  }));
}

export function normalizeRegions(payload) {
  const regionList = Array.isArray(payload) ? payload : Array.isArray(payload?.regions) ? payload.regions : [];

  return regionList
    .map((region) => {
      if (typeof region === 'string') return region;
      if (typeof region?.name === 'string') return region.name;
      if (typeof region?.region_name === 'string') return region.region_name;
      return null;
    })
    .filter((regionName) => typeof regionName === 'string' && regionName.trim().length > 0);
}

export function normalizeLogs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.logs)) return payload.logs;
  return [];
}
