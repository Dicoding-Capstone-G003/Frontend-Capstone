import { startTransition, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, fetchForecast, fetchHealth, fetchLogs, fetchRegions } from './api';
import { ForecastChart } from './components/ForecastChart';
import { ForecastTable } from './components/ForecastTable';
import { IndonesiaRegionArt } from './components/IndonesiaRegionArt';
import { LogsPanel } from './components/LogsPanel';
import { MetadataPanel } from './components/MetadataPanel';
import { StatusBadge } from './components/StatusBadge';
import { SummaryCards } from './components/SummaryCards';
import { fallbackRegions, sampleForecast, sampleLogs } from './mockData';
import { buildChartData, computeSummary, normalizeLogs, normalizeRegions } from './utils';

function App() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('Jawa');
  const [forecast, setForecast] = useState(null);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState({ state: 'checking', label: 'Checking backend' });
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [bootError, setBootError] = useState('');
  const [forecastError, setForecastError] = useState('');
  const [logsError, setLogsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      setIsBootLoading(true);
      setBootError('');

      const [healthResult, regionsResult, logsResult] = await Promise.allSettled([
        fetchHealth(),
        fetchRegions(),
        fetchLogs(),
      ]);

      if (!isMounted) return;

      if (healthResult.status === 'fulfilled') {
        setHealth({ state: 'healthy', label: 'Backend healthy' });
      } else {
        setHealth({ state: 'degraded', label: 'Backend unavailable' });
      }

      if (regionsResult.status === 'fulfilled') {
        const normalized = normalizeRegions(regionsResult.value);
        setRegions(normalized.length ? normalized : fallbackRegions);
        setSelectedRegion((current) => (normalized.includes(current) ? current : normalized[0] || 'Jawa'));
      } else {
        setRegions(fallbackRegions);
        setBootError(
          'Daftar region dari backend belum bisa diambil. UI tetap siap dipakai dengan region default sementara.',
        );
      }

      if (logsResult.status === 'fulfilled') {
        setLogs(normalizeLogs(logsResult.value));
      } else {
        setLogs(sampleLogs);
        setLogsError('Riwayat prediksi belum tersedia dari backend, jadi tampilan menggunakan contoh data.');
      }

      setIsBootLoading(false);
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshLogs(regionName) {
    setIsLogsLoading(true);
    setLogsError('');

    try {
      const logData = await fetchLogs(regionName);
      setLogs(normalizeLogs(logData));
    } catch (error) {
      setLogs(sampleLogs);
      setLogsError(error.message || 'Riwayat prediksi belum bisa dimuat saat ini.');
    } finally {
      setIsLogsLoading(false);
    }
  }

  async function handleGenerateForecast() {
    setIsForecastLoading(true);
    setForecastError('');

    try {
      const result = await fetchForecast(selectedRegion);
      startTransition(() => {
        setForecast(result);
      });
      refreshLogs(selectedRegion);
    } catch (error) {
      setForecast(null);
      setForecastError(
        error.message ||
          'Forecast gagal dibuat. Pastikan backend FastAPI aktif dan endpoint /forecast dapat diakses.',
      );
    } finally {
      setIsForecastLoading(false);
    }
  }

  const chartData = useMemo(() => buildChartData(forecast), [forecast]);
  const summary = useMemo(() => computeSummary(forecast), [forecast]);
  const hasForecast = Boolean(forecast && chartData.length);

  return (
    <div className="app-shell">
      <div className="background-orb background-orb--sun" />
      <div className="background-orb background-orb--sky" />

      <header className="hero">
        <div className="hero__content">
          <div className="hero__status-row">
            <span className="chip">Solar Irradiance Forecasting MVP</span>
            <StatusBadge status={health.state} label={health.label} />
          </div>

          <h1>Dashboard forecasting solar irradiance per region di Indonesia</h1>
          <p>
            Aplikasi ini membantu menampilkan prediksi irradiance 24 jam ke depan dari model AI regional,
            lengkap dengan Open-Meteo Reference sebagai pembanding forecast untuk kebutuhan MVP.
          </p>

          <div className="hero__meta">
            <span>React + Vite frontend</span>
            <span>FastAPI backend ready</span>
            <span>{API_BASE_URL}</span>
          </div>
        </div>

        <IndonesiaRegionArt selectedRegion={selectedRegion} />
      </header>

      <main className="main-grid">
        <section className="card control-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Forecast generator</p>
              <h2>Pilih region dan jalankan prediksi</h2>
            </div>
          </div>

          <div className="control-panel">
            <label className="field">
              <span>Region</span>
              <select
                value={selectedRegion}
                onChange={(event) => setSelectedRegion(event.target.value)}
                disabled={isBootLoading || isForecastLoading}
              >
                {(regions.length ? regions : fallbackRegions).map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" className="primary-button" onClick={handleGenerateForecast} disabled={isForecastLoading}>
              {isForecastLoading ? 'Generating forecast...' : 'Generate forecast'}
            </button>
          </div>

          {isBootLoading ? <div className="panel-state">Menghubungkan dashboard ke backend...</div> : null}
          {bootError ? <div className="panel-state warning">{bootError}</div> : null}
          {forecastError ? <div className="panel-state error">{forecastError}</div> : null}

          {!isBootLoading && !forecastError && !hasForecast ? (
            <div className="empty-state">
              <div>
                <p className="eyebrow">Ready to predict</p>
                <h3>Dashboard siap menampilkan forecast 24 jam</h3>
                <p>
                  Pilih region lalu tekan tombol generate forecast. Jika backend belum siap, UI ini tetap
                  menunjukkan struktur tampilan yang siap dihubungkan.
                </p>
              </div>

              <div className="empty-state__preview">
                <span>Preview example</span>
                <strong>{sampleForecast.region_name}</strong>
                <p>24 titik data prediksi tersusun untuk memudahkan integrasi backend.</p>
              </div>
            </div>
          ) : null}
        </section>

        {hasForecast ? <SummaryCards summary={summary} /> : null}

        <div className="content-grid">
          <div className="content-grid__main">
            {hasForecast ? <ForecastChart data={chartData} /> : null}
            {hasForecast ? <ForecastTable rows={chartData} /> : null}
          </div>

          <div className="content-grid__side">
            {hasForecast ? <MetadataPanel forecast={forecast} /> : null}
            <LogsPanel logs={logs} selectedRegion={selectedRegion} isLoading={isLogsLoading} error={logsError} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
