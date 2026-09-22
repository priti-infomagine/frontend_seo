import type { Summary } from '../../types/audit';
import { getSeverityColor, getSeverityBgColor, getSeverityBorderColor } from '../../utils/colors';

interface SeverityStripProps {
  summary: Summary;
  selectedSeverity: string | null;
  onSelectSeverity: (severity: string | null) => void;
}

export function SeverityStrip({ summary, selectedSeverity, onSelectSeverity }: SeverityStripProps) {
  const severityData = [
    { key: 'critical', count: summary.issues.critical, label: 'Critical' },
    { key: 'high', count: summary.issues.high, label: 'High' },
    { key: 'medium', count: summary.issues.medium, label: 'Medium' },
    { key: 'low', count: summary.issues.low, label: 'Low' },
    { key: 'total', count: summary.issues.total, label: 'Total' },
  ];

  return (
    <div
      className="severity-strip"
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px',
        padding: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
      }}
      role="tablist"
      aria-label="Issue severity filters"
    >
      {severityData.map(({ key, count, label }) => {
        const isSelected = selectedSeverity === key;
        const isTotal = key === 'total';
        const color = isTotal ? 'var(--primary)' : getSeverityColor(key);
        const bgColor = isTotal ? 'rgba(37, 99, 235, 0.15)' : getSeverityBgColor(key);
        const borderColor = isTotal ? 'rgba(37, 99, 235, 0.4)' : getSeverityBorderColor(key);

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`issues-panel-${key}`}
            id={`severity-tab-${key}`}
            onClick={() => onSelectSeverity(isSelected ? null : key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '12px 16px',
              background: isSelected ? color : bgColor,
              border: `2px solid ${isSelected ? color : borderColor}`,
              borderRadius: '10px',
              color: isSelected ? '#fff' : color,
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = isTotal ? 'rgba(37, 99, 235, 0.25)' : getSeverityBgColor(key).replace('0.15', '0.25');
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = bgColor;
              }
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '20px', lineHeight: 1 }}>{count}</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: isSelected ? 0.9 : 1 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}