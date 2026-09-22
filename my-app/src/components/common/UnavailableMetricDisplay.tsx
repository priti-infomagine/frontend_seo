import type { UnavailableMetric } from '../../types/audit';

interface UnavailableMetricDisplayProps {
  metric: UnavailableMetric<unknown>;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function UnavailableMetricDisplay({
  metric,
  label,
  showValue = true,
  className = '',
}: UnavailableMetricDisplayProps) {
  if (!metric) {
    return (
      <span className={`metric-unavailable ${className}`} style={{ color: 'var(--text-muted)' }}>
        {label ? `${label}: ` : ''}—
      </span>
    );
  }

  if (!metric.available) {
    return (
      <span
        className={`metric-unavailable ${className}`}
        style={{ color: 'var(--text-muted)', cursor: 'help' }}
        title={metric.reason || 'Not available'}
      >
        {label ? `${label}: ` : ''}Not available
      </span>
    );
  }

  if (metric.value === null || metric.value === undefined) {
    return (
      <span className={`metric-null ${className}`} style={{ color: 'var(--text-muted)' }}>
        {label ? `${label}: ` : ''}—
      </span>
    );
  }

  const displayValue = typeof metric.value === 'object' ? JSON.stringify(metric.value) : String(metric.value);

  return (
    <span className={`metric-available ${className}`}>
      {label ? `${label}: ` : ''}
      {showValue && <span style={{ color: 'var(--text)' }}>{displayValue}</span>}
    </span>
  );
}

export function UnavailableMetricInline({ metric, label }: { metric: UnavailableMetric<unknown>; label?: string }) {
  return <UnavailableMetricDisplay metric={metric} label={label} showValue={true} />;
}