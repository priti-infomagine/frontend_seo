export type Severity = 'critical' | 'high' | 'medium' | 'low' | string;
export type Status = 'excellent' | 'good' | 'needs_improvement' | 'poor' | 'critical' | string;
export type SafeStatus = Status | null | undefined;
export type SafeSeverity = Severity | null | undefined;

export function getSeverityColor(severity: SafeSeverity): string {
  const s = (severity ?? '').toLowerCase();
  switch (s) {
    case 'critical':
      return 'var(--danger)';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#fbbf24';
    case 'low':
      return '#3b82f6';
    default:
      return 'var(--text-muted)';
  }
}

export function getSeverityBgColor(severity: SafeSeverity): string {
  const s = (severity ?? '').toLowerCase();
  switch (s) {
    case 'critical':
      return 'rgba(239, 68, 68, 0.15)';
    case 'high':
      return 'rgba(249, 115, 22, 0.15)';
    case 'medium':
      return 'rgba(251, 191, 36, 0.15)';
    case 'low':
      return 'rgba(59, 130, 246, 0.15)';
    default:
      return 'rgba(148, 163, 184, 0.15)';
  }
}

export function getSeverityBorderColor(severity: SafeSeverity): string {
  const s = (severity ?? '').toLowerCase();
  switch (s) {
    case 'critical':
      return 'rgba(239, 68, 68, 0.4)';
    case 'high':
      return 'rgba(249, 115, 22, 0.4)';
    case 'medium':
      return 'rgba(251, 191, 36, 0.4)';
    case 'low':
      return 'rgba(59, 130, 246, 0.4)';
    default:
      return 'var(--border)';
  }
}

export function getStatusColor(status: SafeStatus): string {
  const s = (status ?? '').toLowerCase();
  switch (s) {
    case 'excellent':
      return 'var(--success)';
    case 'good':
      return '#10b981';
    case 'needs_improvement':
      return '#fbbf24';
    case 'poor':
      return '#f97316';
    case 'critical':
      return 'var(--danger)';
    default:
      return 'var(--text-muted)';
  }
}

export function getStatusBgColor(status: SafeStatus): string {
  const s = (status ?? '').toLowerCase();
  switch (s) {
    case 'excellent':
      return 'rgba(34, 197, 94, 0.15)';
    case 'good':
      return 'rgba(16, 185, 129, 0.15)';
    case 'needs_improvement':
      return 'rgba(251, 191, 36, 0.15)';
    case 'poor':
      return 'rgba(249, 115, 22, 0.15)';
    case 'critical':
      return 'rgba(239, 68, 68, 0.15)';
    default:
      return 'rgba(148, 163, 184, 0.15)';
  }
}

export function getStatusBorderColor(status: SafeStatus): string {
  const s = (status ?? '').toLowerCase();
  switch (s) {
    case 'excellent':
      return 'rgba(34, 197, 94, 0.4)';
    case 'good':
      return 'rgba(16, 185, 129, 0.4)';
    case 'needs_improvement':
      return 'rgba(251, 191, 36, 0.4)';
    case 'poor':
      return 'rgba(249, 115, 22, 0.4)';
    case 'critical':
      return 'rgba(239, 68, 68, 0.4)';
    default:
      return 'var(--border)';
  }
}

export function getSeverityLabel(severity: SafeSeverity): string {
  const s = severity ?? '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function getStatusLabel(status: SafeStatus): string {
  const s = status ?? '';
  return s
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}