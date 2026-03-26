export const fallbackRegions = [
  'Sumatra',
  'Jawa',
  'Kalimantan',
  'Sulawesi',
  'Nusa Tenggara',
  'Maluku',
  'Papua',
];

export const sampleForecast = {
  region_name: 'Jawa',
  model_version: 'xgboost_models.joblib',
  generated_at: '2026-03-26T08:57:08.663856Z',
  forecast_hours: [
    '2026-03-27T00:00:00',
    '2026-03-27T01:00:00',
    '2026-03-27T02:00:00',
    '2026-03-27T03:00:00',
    '2026-03-27T04:00:00',
    '2026-03-27T05:00:00',
    '2026-03-27T06:00:00',
    '2026-03-27T07:00:00',
    '2026-03-27T08:00:00',
    '2026-03-27T09:00:00',
    '2026-03-27T10:00:00',
    '2026-03-27T11:00:00',
    '2026-03-27T12:00:00',
    '2026-03-27T13:00:00',
    '2026-03-27T14:00:00',
    '2026-03-27T15:00:00',
    '2026-03-27T16:00:00',
    '2026-03-27T17:00:00',
    '2026-03-27T18:00:00',
    '2026-03-27T19:00:00',
    '2026-03-27T20:00:00',
    '2026-03-27T21:00:00',
    '2026-03-27T22:00:00',
    '2026-03-27T23:00:00',
  ],
  model_prediction: [
    0.0, 0.0, 0.0, 0.0, 0.02, 0.08, 0.21, 0.43, 0.61, 0.78, 0.89, 0.96, 0.92,
    0.84, 0.7, 0.55, 0.33, 0.16, 0.05, 0.01, 0.0, 0.0, 0.0, 0.0,
  ],
  openmeteo_reference: [
    0.0, 0.0, 0.0, 0.0, 0.01, 0.06, 0.18, 0.37, 0.56, 0.72, 0.82, 0.88, 0.85,
    0.75, 0.63, 0.49, 0.29, 0.14, 0.04, 0.01, 0.0, 0.0, 0.0, 0.0,
  ],
  source_weather: 'Open-Meteo forecast API',
  notes:
    'MVP backend memakai Open-Meteo sebagai sumber weather forecast dan reference pembanding. Nilai openmeteo_reference bukan ground-truth sensor measurement.',
};

export const sampleLogs = [
  {
    region_name: 'Jawa',
    generated_at: '2026-03-26T08:57:08.663856Z',
    model_version: 'xgboost_models.joblib',
    status: 'success',
  },
  {
    region_name: 'Jawa',
    generated_at: '2026-03-26T07:57:08.663856Z',
    model_version: 'xgboost_models.joblib',
    status: 'success',
  },
];
