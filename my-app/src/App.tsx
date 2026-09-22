import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { InputScreen } from './screens/InputScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ResultsDashboard } from './screens/ResultsDashboard';
import { ToolsScreen } from './screens/ToolsScreen';
import { useAuditPolling } from './hooks/useAuditPolling';

function AppContent() {
  const {
    stage,
    statusData,
    resultData,
    error,
    retryCount,
    startAudit,
    cancelAudit,
    reset,
  } = useAuditPolling();

  type View = 'audit' | 'tools';
  const [view, setView] = useState<View>('audit');

  const handleViewChange = (v: string) => {
    if (v === 'audit' || v === 'tools') {
      setView(v);
    } else if (v.startsWith('tools:')) {
      setView('tools');
    }
  };

  const handleNewAudit = () => {
    reset();
  };

  const renderStage = () => {
    switch (stage) {
      case 'idle':
      case 'starting':
        return (
          <InputScreen
            onStartAudit={startAudit}
            isLoading={stage === 'starting'}
            error={error}
          />
        );
      case 'polling':
        return (
          <ProgressScreen
            statusData={statusData}
            onCancel={cancelAudit}
            startedAt={statusData?.audit_id ? new Date().toISOString() : new Date().toISOString()}
          />
        );
      case 'completed':
        return (
          <ResultsDashboard
            result={resultData!}
            onNewAudit={handleNewAudit}
          />
        );
      case 'failed':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px' }}>❌</div>
            <h2 style={{ margin: 0 }}>Audit Failed</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
              {error || 'An unknown error occurred during the audit.'}
            </p>
            {retryCount > 0 && (
              <p style={{ color: '#fbbf24', fontSize: '13px' }}>
                Retried {retryCount} time{retryCount !== 1 ? 's' : ''} before giving up.
              </p>
            )}
            <button
              onClick={handleNewAudit}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page">
      <NavBar activeView={view} onViewChange={handleViewChange} />
      <div className="card" style={{ maxWidth: '1000px', width: '100%' }}>
        {view === 'tools' ? (
          <ToolsScreen />
        ) : (
          renderStage()
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
