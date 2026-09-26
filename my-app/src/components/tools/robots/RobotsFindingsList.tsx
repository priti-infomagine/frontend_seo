import React, { useState } from 'react';
import type { RobotsFindingItem } from '../../../types/robots';

interface RobotsFindingsListProps {
  findings: RobotsFindingItem[];
  syntaxWarnings?: string[];
}

export const RobotsFindingsList: React.FC<RobotsFindingsListProps> = ({
  findings,
  syntaxWarnings = [],
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const all = findings.reduce((acc, _, idx) => {
      acc[idx] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  const totalIssues = (findings?.length || 0) + (syntaxWarnings?.length || 0);

  if (totalIssues === 0) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#4ade80',
        }}
      >
        <span style={{ fontSize: '20px' }}></span>
        <div>
          <strong style={{ fontSize: '14px', display: 'block' }}>No Findings or Syntax Issues</strong>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            The robots.txt file conforms to robots exclusion standards without syntax errors or blocking warnings.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderBottom: isOpen ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            ▶
          </span>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍 Findings & Syntax Warnings</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {totalIssues}
            </span>
          </h3>
        </div>

        {isOpen && findings.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={expandAll}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Syntax warnings banner if any */}
          {syntaxWarnings && syntaxWarnings.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <strong style={{ color: '#fbbf24', fontSize: '13px' }}>
                ⚠️ Syntax Warnings ({syntaxWarnings.length}):
              </strong>
              {syntaxWarnings.map((warn, wIdx) => (
                <div key={wIdx} style={{ fontSize: '12px', color: 'var(--text)' }}>
                  • {warn}
                </div>
              ))}
            </div>
          )}

          {/* Structured Findings */}
          {findings.map((item, idx) => {
            const isExpanded = !!expandedIndices[idx];
            const severity = item.severity?.toLowerCase() || 'medium';
            const severityColor =
              severity === 'critical'
                ? '#f43f5e'
                : severity === 'high'
                ? '#f87171'
                : severity === 'medium'
                ? '#fbbf24'
                : '#60a5fa';

            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.3)',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => toggleItem(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                      }}
                    >
                      ▶
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text)' }}>
                      {item.message || item.code || `Finding #${idx + 1}`}
                    </span>
                    {item.code && (
                      <code
                        style={{
                          fontSize: '11px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.code}
                      </code>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${severityColor}20`,
                      color: severityColor,
                      border: `1px solid ${severityColor}40`,
                    }}
                  >
                    {item.severity || item.status || 'Warning'}
                  </span>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: '12px 16px 16px 36px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {item.message && (
                      <div style={{ color: 'var(--text)', lineHeight: 1.5 }}>{item.message}</div>
                    )}
                    {item.evidence && (
                      <div
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: '#e2e8f0',
                        }}
                      >
                        <strong>Evidence: </strong>
                        {item.evidence}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
