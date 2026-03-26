import { formatDateTime } from '../utils';

export function LogsPanel({ logs, selectedRegion, isLoading, error }) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Prediction logs</p>
          <h3>Recent history</h3>
        </div>
        <p className="subtle-text">{selectedRegion ? `Region: ${selectedRegion}` : 'All regions'}</p>
      </div>

      {isLoading ? <div className="panel-state">Memuat riwayat prediksi...</div> : null}
      {!isLoading && error ? <div className="panel-state error">{error}</div> : null}

      {!isLoading && !error && logs.length === 0 ? (
        <div className="panel-state">Belum ada riwayat prediksi untuk ditampilkan.</div>
      ) : null}

      {!isLoading && !error && logs.length > 0 ? (
        <div className="log-list">
          {logs.map((log, index) => (
            <article key={`${log.region_name || 'region'}-${log.generated_at || index}`} className="log-item">
              <div>
                <strong>{log.region_name || selectedRegion || 'Unknown region'}</strong>
                <p>{formatDateTime(log.generated_at || log.created_at)}</p>
              </div>
              <div className="log-item__meta">
                <span>{log.model_version || 'No model info'}</span>
                <span>{log.status || 'recorded'}</span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
