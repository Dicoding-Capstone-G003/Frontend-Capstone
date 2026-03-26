import { formatDateTime, formatNumber } from '../utils';

export function SummaryCards({ summary }) {
  const items = [
    {
      label: 'Peak irradiance prediction',
      value: formatNumber(summary?.peakPrediction),
      tone: 'gold',
    },
    {
      label: 'Average irradiance prediction',
      value: formatNumber(summary?.averagePrediction),
      tone: 'blue',
    },
    {
      label: 'Peak Open-Meteo Reference',
      value: formatNumber(summary?.peakReference),
      tone: 'sky',
    },
    {
      label: 'Generated time',
      value: formatDateTime(summary?.generatedAt),
      tone: 'slate',
    },
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <article key={item.label} className={`summary-card ${item.tone}`}>
          <p>{item.label}</p>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
