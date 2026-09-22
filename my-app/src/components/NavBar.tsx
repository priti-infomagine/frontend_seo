import { useState } from 'react';

interface ToolItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'pagespeed',
    label: 'PageSpeed',
    icon: '⚡',
    desc: 'Analyze page performance and Core Web Vitals',
    color: 'var(--primary)',
  },
  {
    id: 'robots',
    label: 'robots.txt',
    icon: '🤖',
    desc: 'View and analyze robots.txt configuration',
    color: '#3b82f6',
  },
  {
    id: 'sitemap',
    label: 'Sitemap',
    icon: '🗺️',
    desc: 'Fetch and parse sitemap.xml URLs',
    color: '#8b5cf6',
  },
];

interface NavBarProps {
  activeView: 'audit' | 'tools';
  onViewChange: (view: string) => void;
}

export function NavBar({ activeView, onViewChange }: NavBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clickAnim, setClickAnim] = useState<string | null>(null);

  const handleClick = (view: string) => {
    setClickAnim(view);
    setTimeout(() => setClickAnim(null), 600);
    onViewChange(view);
    setDropdownOpen(false);
  };

  const handleToolClick = (toolId: string) => {
    handleClick(`tools:${toolId}`);
  };

  return (
    <nav className="nav-bar">
      <div className="nav-links">
        <div
          className={`nav-link ${activeView === 'audit' ? 'active' : ''} ${clickAnim === 'audit' ? 'click-anim' : ''}`}
          onClick={() => handleClick('audit')}
        >
          <span style={{ fontSize: '16px', marginRight: '6px' }}>📊</span>
          Audit
        </div>

        <div
          className={`nav-link ${activeView === 'tools' ? 'active' : ''} ${clickAnim === 'tools' ? 'click-anim' : ''}`}
          onClick={() => handleClick('tools')}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '16px', marginRight: '6px' }}>🛠️</span>
          Tools
          <span style={{ marginLeft: '4px', fontSize: '11px' }}>▼</span>

          {dropdownOpen && (
            <div
              className="dropdown-panel"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <span
                    className="dropdown-item-icon"
                    style={{
                      background: `${tool.color}15`,
                      color: tool.color,
                    }}
                  >
                    {tool.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div className="dropdown-item-label" style={{ color: tool.color }}>
                      {tool.label}
                    </div>
                    <div className="dropdown-item-desc">{tool.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
