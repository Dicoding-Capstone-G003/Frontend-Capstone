import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '../utils';

export function ForecastChart({ data }) {
  return (
    <section className="card chart-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">24-hour outlook</p>
          <h3>Forecast comparison chart</h3>
        </div>
        <p className="subtle-text">Model prediction dibandingkan dengan Open-Meteo Reference.</p>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid stroke="#d9e7f4" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#49627a', fontSize: 12 }}
              tickMargin={10}
              minTickGap={18}
            />
            <YAxis
              tick={{ fill: '#49627a', fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value)}
              width={60}
            />
            <Tooltip
              formatter={(value) => formatNumber(Number(value))}
              labelFormatter={(label) => `Jam ${label}`}
              contentStyle={{
                borderRadius: 16,
                border: '1px solid #d9e7f4',
                backgroundColor: '#ffffff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="model_prediction"
              name="Model Prediction"
              stroke="#ff8c42"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="openmeteo_reference"
              name="Open-Meteo Reference"
              stroke="#2474ff"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-footnote">
        Open-Meteo Reference digunakan sebagai pembanding forecast pada MVP, bukan sensor ground-truth.
      </p>
    </section>
  );
}
