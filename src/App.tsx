import { useCallback, useEffect, useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { MathText } from './components/MathExpr';
import { Sidebar } from './components/Sidebar';
import { WelcomeView } from './components/WelcomeView';
import { AbelianView } from './components/modules/AbelianView';
import { AnalysisView } from './components/modules/AnalysisView';
import { CayleyView } from './components/modules/CayleyView';
import { DashboardView } from './components/modules/DashboardView';
import { DihedralView } from './components/modules/DihedralView';
import { GeneratorsView } from './components/modules/GeneratorsView';
import { LearningView } from './components/modules/LearningView';
import { PermutationView } from './components/modules/PermutationView';
import { ReportsView } from './components/modules/ReportsView';
import {
  appendHistory,
  clearHistoryStorage,
  hasEnteredWorkspace,
  incrementStats,
  loadGuidedCompleted,
  loadHistory,
  loadLatestReport,
  loadStats,
  loadTheme,
  markGuidedCompleted,
  saveLatestReport,
  saveTheme,
  setEnteredWorkspace,
} from './services/storage';
import type {
  AppStats,
  HistoryItem,
  ModuleId,
  ReportSnapshot,
  ThemeMode,
} from './types/symmetry';

const MODULE_TITLES: Record<ModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview & recent calculations' },
  abelian: { title: 'Abelian Group Explorer', subtitle: 'Cyclic groups, direct products & classification' },
  cayley: { title: 'Cayley Table Generator', subtitle: 'Operation matrices & axiom verification' },
  permutations: { title: 'Permutation Explorer', subtitle: 'Disjoint cycles, parity & alternating groups' },
  dihedral: { title: 'Dihedral Group Explorer', subtitle: 'Regular polygon symmetries & centres' },
  generators: { title: 'Generator & Phi Calculator', subtitle: "Euler's totient φ(n) & cyclic generators" },
  analysis: { title: 'Element Order Analysis', subtitle: 'Order distributions & group comparison' },
  learning: { title: 'Guided Learning', subtitle: 'Algebra II assignment challenges' },
  reports: { title: 'Reports & Verification', subtitle: 'PDF, CSV & print-ready exports' },
};

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [entered, setEntered] = useState<boolean>(() => hasEnteredWorkspace());
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [moduleParams, setModuleParams] = useState<Record<string, unknown> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<AppStats>(() => loadStats());
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [guidedDone, setGuidedDone] = useState<number[]>(() => loadGuidedCompleted());
  const [latestReport, setLatestReport] = useState<ReportSnapshot | null>(() => loadLatestReport());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const handleEnterWorkspace = () => {
    setEnteredWorkspace(true);
    setEntered(true);
  };

  const handleReturnWelcome = () => {
    setEnteredWorkspace(false);
    setEntered(false);
  };

  const handleNavigate = useCallback((module: ModuleId, params?: Record<string, unknown>) => {
    setModuleParams(params ?? null);
    setActiveModule(module);
  }, []);

  const handleRecordActivity = useCallback(
    (opts: {
      module: ModuleId;
      type: string;
      description: string;
      params: Record<string, unknown>;
      statsDelta: Partial<AppStats>;
      report: ReportSnapshot;
    }) => {
      setStats(incrementStats(opts.statsDelta));
      setHistory(
        appendHistory({
          module: opts.module,
          type: opts.type,
          description: opts.description,
          params: opts.params,
        })
      );
      saveLatestReport(opts.report);
      setLatestReport(opts.report);
    },
    []
  );

  const handleClearHistory = useCallback(() => {
    clearHistoryStorage();
    setHistory([]);
    setStats(loadStats());
  }, []);

  const handleMarkGuided = useCallback((questionId: number) => {
    setGuidedDone(markGuidedCompleted(questionId));
  }, []);

  const handleUpdateReport = useCallback((report: ReportSnapshot) => {
    saveLatestReport(report);
    setLatestReport(report);
  }, []);

  if (!entered) {
    return (
      <WelcomeView
        onGetStarted={handleEnterWorkspace}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const currentMeta = MODULE_TITLES[activeModule];

  return (
    <div className="min-h-screen flex bg-[#F3F0E8] dark:bg-[#141815] text-[#373B35] dark:text-[#ECEEE9]">
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(id) => handleNavigate(id)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onReturnWelcome={handleReturnWelcome}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 bg-[#FFFFFF]/95 dark:bg-[#1C221E]/95 backdrop-blur-sm border-b border-[#D8D4C9] dark:border-[#2D3730] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight truncate">
                {currentMeta.title}
              </h1>
              <p className="hidden sm:block text-xs text-[#656B61] dark:text-[#A2ACA0] truncate">
                <MathText text={currentMeta.subtitle} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#C8D3BD]/40 dark:hover:bg-[#2E3A31] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {activeModule === 'dashboard' && (
            <DashboardView
              stats={stats}
              history={history}
              latestReport={latestReport}
              guidedDoneCount={guidedDone.length}
              onNavigate={handleNavigate}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeModule === 'abelian' && (
            <AbelianView
              initialParams={moduleParams}
              onRecordActivity={handleRecordActivity}
              onOpenCayley={(moduli) =>
                handleNavigate('cayley', { group_type: 'abelian', moduli })
              }
            />
          )}

          {activeModule === 'cayley' && (
            <CayleyView
              initialParams={moduleParams}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeModule === 'permutations' && (
            <PermutationView
              initialParams={moduleParams}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeModule === 'dihedral' && (
            <DihedralView
              initialParams={moduleParams}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeModule === 'generators' && (
            <GeneratorsView
              initialParams={moduleParams}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeModule === 'analysis' && (
            <AnalysisView
              initialParams={moduleParams}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeModule === 'learning' && (
            <LearningView
              completedIds={guidedDone}
              onMarkCompleted={handleMarkGuided}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsView
              latestReport={latestReport}
              onUpdateReport={handleUpdateReport}
            />
          )}
        </main>
      </div>
    </div>
  );
}
