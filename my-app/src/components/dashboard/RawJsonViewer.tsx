import { useRef, useEffect, useState } from 'react';
import { safeJson } from '../../utils/format';

interface RawJsonViewerProps {
  data: unknown;
}

export function RawJsonViewer({ data }: RawJsonViewerProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const handleToggle = () => setIsOpen(details.open);
    details.addEventListener('toggle', handleToggle);
    return () => details.removeEventListener('toggle', handleToggle);
  }, []);

  return (
    <details
      ref={detailsRef}
      className="raw-json-viewer"
      style={{ marginTop: '24px' }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--text-muted)',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          userSelect: 'none',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        View Raw JSON Response
      </summary>
      {isOpen && (
        <div style={{ marginTop: '12px' }}>
          <pre className="json-viewer" style={{ maxHeight: '600px', overflow: 'auto' }}>
            {safeJson(data)}
          </pre>
        </div>
      )}
    </details>
  );
}