interface RecommendationSectionProps {
  recommendation: {
    text: string | null;
    tips: string[];
  };
}

export function RecommendationSection({ recommendation }: RecommendationSectionProps) {
  const hasTips = recommendation.tips && recommendation.tips.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h5 style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Recommendation
      </h5>
      <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Recommended Fix
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
          {recommendation.text || 'No recommendation available.'}
        </p>
      </div>

      {hasTips && (
        <details style={{ marginTop: '8px' }}>
          <summary style={{ fontSize: '12px', color: 'var(--success)', cursor: 'pointer', fontWeight: '500', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Additional Tips ({recommendation.tips.length})
          </summary>
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', color: 'var(--text)', lineHeight: 1.8 }}>
            {recommendation.tips.map((tip, i) => (
              <li key={i} style={{ marginBottom: '8px', fontSize: '13px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {tip}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}