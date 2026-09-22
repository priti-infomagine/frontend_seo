import { useState } from 'react';
import { ToolCard } from '../components/tools/ToolCard';
import { PageSpeedTool } from '../components/tools/PageSpeedTool';
import { RobotsTxtTool } from '../components/tools/RobotsTxtTool';
import { SitemapTool } from '../components/tools/SitemapTool';

interface ToolsScreenProps {
  onViewChange?: (view: string) => void;
}

interface ToolConfig {
  id: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'pagespeed',
    icon: '⚡',
    title: 'PageSpeed',
    desc: 'Analyze page performance, Core Web Vitals, and get optimization suggestions for any URL.',
    color: 'var(--primary)',
  },
  {
    id: 'robots',
    icon: '🤖',
    title: 'robots.txt',
    desc: 'Fetch and inspect robots.txt to understand crawling rules and disallowed paths.',
    color: '#3b82f6',
  },
  {
    id: 'sitemap',
    icon: '🗺️',
    title: 'Sitemap',
    desc: 'Fetch and parse sitemap.xml to discover all indexed URLs on a website.',
    color: '#8b5cf6',
  },
];

export function ToolsScreen({}: ToolsScreenProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleBack = () => {
    setActiveTool(null);
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'pagespeed':
        return <PageSpeedTool onBack={handleBack} />;
      case 'robots':
        return <RobotsTxtTool onBack={handleBack} />;
      case 'sitemap':
        return <SitemapTool onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="tools-page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {activeTool ? (
        renderTool()
      ) : (
        <>
          <header className="tools-section-header">
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
              Tools
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Standalone SEO tools for deep analysis
            </p>
          </header>

          <div className="tools-grid">
            {TOOLS.map((tool) => (
              <ToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                desc={tool.desc}
                color={tool.color}
                onClick={() => handleToolClick(tool.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
