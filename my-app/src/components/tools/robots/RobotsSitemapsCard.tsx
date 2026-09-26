import React, { useState } from 'react';
import type { SitemapReachabilityItem } from '../../../types/robots';

interface RobotsSitemapsCardProps {
  sitemapsDeclared: string[];
  sitemapReachability: SitemapReachabilityItem[];
}

export const RobotsSitemapsCard: React.FC<RobotsSitemapsCardProps> = ({
  sitemapsDeclared,
  sitemapReachability,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const totalCount = sitemapsDeclared?.length || 0;

  if (totalCount === 0 && (!sitemapReachability || sitemapReachability.length === 0)) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '4px' }}>
          Sitemap Declarations
        </strong>
        No <code>Sitemap:</code> directives were declared in this robots.txt file.
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
            <span>🗺️ Declared Sitemaps</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {totalCount}
            </span>
          </h3>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sitemapReachability && sitemapReachability.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>Sitemap URL</th>
                    <th style={{ padding: '8px 12px', width: '120px' }}>HTTP Status</th>
                    <th style={{ padding: '8px 12px', width: '140px' }}>Reachability</th>
                  </tr>
                </thead>
                <tbody>
                  {sitemapReachability.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < sitemapReachability.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}
                        >
                          {item.url}
                        </a>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: item.status_code === 200 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: item.status_code === 200 ? '#4ade80' : '#f87171',
                          }}
                        >
                          {item.status_code || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {item.reachable ? (
                          <span style={{ color: '#4ade80', fontWeight: '600', fontSize: '12px' }}>
                            ✓ Reachable
                          </span>
                        ) : (
                          <span style={{ color: '#f87171', fontWeight: '600', fontSize: '12px' }}>
                            ✕ Unreachable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sitemapsDeclared.map((sitemapUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <a
                    href={sitemapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {sitemapUrl}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
