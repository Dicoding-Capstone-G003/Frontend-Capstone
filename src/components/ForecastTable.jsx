import { formatHour, formatNumber } from '../utils';

export function ForecastTable({ rows }) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Hourly details</p>
          <h3>Forecast table</h3>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Model Prediction</th>
              <th>Open-Meteo Reference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.hour}>
                <td>{formatHour(row.hour)}</td>
                <td>{formatNumber(row.model_prediction)}</td>
                <td>{formatNumber(row.openmeteo_reference)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
