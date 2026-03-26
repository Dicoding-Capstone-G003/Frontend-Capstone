import { formatDateTime } from '../utils';

export function MetadataPanel({ forecast }) {
  const items = [
    ['Region', forecast.region_name],
    ['Model version', forecast.model_version],
    ['Generated at', formatDateTime(forecast.generated_at)],
    ['Source weather', forecast.source_weather],
    ['Notes', forecast.notes],
  ];

  return (
    <section className="card metadata-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Metadata</p>
          <h3>Forecast context</h3>
        </div>
      </div>

      <dl className="metadata-list">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
