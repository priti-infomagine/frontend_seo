interface IssueInformationProps {
  issue: {
    title: string;
    severity: string;
    description?: string | null;
    why?: string | null;
    what?: string | null;
  };
}

export function IssueInformation({ issue }: IssueInformationProps) {
  const sections = [
    { label: 'Description', content: issue.description },
    { label: 'Why it matters', content: issue.why },
    { label: 'What to check', content: issue.what },
  ].filter((s) => s.content != null && s.content !== '');

  if (sections.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h5 style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Issue Details
      </h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sections.map(({ label, content }) => (
          <div key={label} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {label}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}