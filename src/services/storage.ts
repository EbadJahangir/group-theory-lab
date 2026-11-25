import type { AppStats, HistoryItem, ReportSnapshot, ThemeMode } from '../types/symmetry';

const KEYS = {
  THEME: 'grouptheory_lab_theme',
  ENTERED: 'grouptheory_lab_entered',
  STATS: 'grouptheory_lab_stats',
  HISTORY: 'grouptheory_lab_history',
  GUIDED_COMPLETED: 'grouptheory_lab_guided_done',
  LATEST_REPORT: 'grouptheory_lab_latest_report',
};

const MAX_HISTORY = 25;

export const DEFAULT_STATS: AppStats = {
  groupsExplored: 0,
  calculationsPerformed: 0,
  permutationsAnalyzed: 0,
  dihedralExplored: 0,
  elementsAnalyzed: 0,
};

export function loadTheme(): ThemeMode {
  try {
    const val = localStorage.getItem(KEYS.THEME);
    if (val === 'dark' || val === 'light') return val;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function hasEnteredWorkspace(): boolean {
  try {
    return localStorage.getItem(KEYS.ENTERED) === '1';
  } catch {
    return false;
  }
}

export function setEnteredWorkspace(entered: boolean): void {
  try {
    if (entered) {
      localStorage.setItem(KEYS.ENTERED, '1');
    } else {
      localStorage.removeItem(KEYS.ENTERED);
    }
  } catch {
    // ignore
  }
}

export function loadStats(): AppStats {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      groupsExplored: Number(parsed.groupsExplored) || 0,
      calculationsPerformed: Number(parsed.calculationsPerformed) || 0,
      permutationsAnalyzed: Number(parsed.permutationsAnalyzed) || 0,
      dihedralExplored: Number(parsed.dihedralExplored) || 0,
      elementsAnalyzed: Number(parsed.elementsAnalyzed) || 0,
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function incrementStats(delta: Partial<AppStats>): AppStats {
  const current = loadStats();
  const next: AppStats = {
    groupsExplored: current.groupsExplored + (delta.groupsExplored || 0),
    calculationsPerformed: current.calculationsPerformed + (delta.calculationsPerformed || 0),
    permutationsAnalyzed: current.permutationsAnalyzed + (delta.permutationsAnalyzed || 0),
    dihedralExplored: current.dihedralExplored + (delta.dihedralExplored || 0),
    elementsAnalyzed: current.elementsAnalyzed + (delta.elementsAnalyzed || 0),
  };
  try {
    localStorage.setItem(KEYS.STATS, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem[] {
  const current = loadHistory();
  const nextItem: HistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [nextItem, ...current].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function clearHistoryStorage(): void {
  try {
    localStorage.removeItem(KEYS.HISTORY);
    localStorage.setItem(KEYS.STATS, JSON.stringify(DEFAULT_STATS));
  } catch {
    // ignore
  }
}

export function loadGuidedCompleted(): number[] {
  try {
    const raw = localStorage.getItem(KEYS.GUIDED_COMPLETED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

export function markGuidedCompleted(questionId: number): number[] {
  const current = loadGuidedCompleted();
  if (current.includes(questionId)) return current;
  const updated = [...current, questionId].sort((a, b) => a - b);
  try {
    localStorage.setItem(KEYS.GUIDED_COMPLETED, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function loadLatestReport(): ReportSnapshot | null {
  try {
    const raw = localStorage.getItem(KEYS.LATEST_REPORT);
    if (!raw) return null;
    return JSON.parse(raw) as ReportSnapshot;
  } catch {
    return null;
  }
}

export function saveLatestReport(report: ReportSnapshot): void {
  try {
    localStorage.setItem(KEYS.LATEST_REPORT, JSON.stringify(report));
  } catch {
    // ignore
  }
}
