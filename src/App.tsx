import { useState } from 'react';
import { WorkoutProvider, useWorkout } from './WorkoutContext';
import { DashboardView } from './components/DashboardView';
import { WorkoutsListView } from './components/WorkoutsListView';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { ProgressChartsView } from './components/ProgressChartsView';
import { GalleryView } from './components/GalleryView';
import { HistoryView } from './components/HistoryView';
import { RemindersView } from './components/RemindersView';
import { AuthGateway } from './components/AuthGateway';

import { 
  LayoutDashboard, 
  Dumbbell, 
  Clock, 
  TrendingUp, 
  History, 
  Bell,
  Heart,
  Sparkles,
  Camera,
  LogOut,
  User,
  LogIn
} from 'lucide-react';

function DashboardShell() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showAuthGateway, setShowAuthGateway] = useState<boolean>(false);
  const { activeSession, currentUser, logout } = useWorkout();

  // Navigation Items for Desktop
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'workouts', label: 'Fichas', icon: Dumbbell },
    { id: 'active', label: 'Treinando', icon: Clock, highlight: !!activeSession },
    { id: 'progress', label: 'Evolução', icon: TrendingUp },
    { id: 'gallery', label: 'Galeria', icon: Camera },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reminders', label: 'Avisos', icon: Bell },
  ];

  // Compact bottom nav bar items for Mobile (6 items fit perfectly in width)
  const mobileNavItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'workouts', label: 'Fichas', icon: Dumbbell },
    { id: 'active', label: 'Treinando', icon: Clock, highlight: !!activeSession },
    { id: 'gallery', label: 'Galeria', icon: Camera },
    { id: 'progress', label: 'Evolução', icon: TrendingUp },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'workouts':
        return <WorkoutsListView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'active':
        return <ActiveWorkoutView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'progress':
        return <ProgressChartsView />;
      case 'gallery':
        return <GalleryView />;
      case 'history':
        return <HistoryView />;
      case 'reminders':
        return <RemindersView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Desktop Left Sidebar Banner */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex-shrink-0 z-10 sticky top-0 h-screen justify-between">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Dumbbell className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg tracking-tight text-white leading-none uppercase">EVOTREINO</h1>
              <p className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest uppercase mt-1 leading-none">PROGRESSÃO DE CARGA</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-250 ${
                    isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-white'}`} />
                    <span className="font-sans font-semibold tracking-wide">{item.label}</span>
                  </div>

                  {item.highlight && (
                    <span className={`w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ${
                      isActive ? 'ring-emerald-500' : 'ring-zinc-900'
                    }`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Auth Indicator Area */}
        <div className="border-t border-zinc-850 pt-4 mt-auto pb-4 font-sans shrink-0">
          {currentUser ? (
            <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-zinc-200 truncate leading-snug">{currentUser.name}</p>
                  <p className="text-[9px] text-zinc-500 truncate leading-none font-medium">Perfil Sincronizado</p>
                </div>
              </div>
              <button 
                onClick={logout}
                title="Desconectar"
                className="p-1.5 hover:bg-red-500/10 text-zinc-550 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-zinc-950/20 border border-zinc-850 border-dashed rounded-2xl flex flex-col gap-2">
              <div className="space-y-0.5 text-left">
                <p className="text-[10px] font-bold text-zinc-400">Perfil Local</p>
                <p className="text-[9px] text-zinc-500 leading-normal font-sans font-medium">Seus dados estão em navegação anônima.</p>
              </div>
              <button
                onClick={() => setShowAuthGateway(true)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
              >
                <LogIn className="w-3 h-3 stroke-[2.5]" /> Conectar Conta
              </button>
            </div>
          )}
        </div>

        {/* Minimal Footer Signature line */}
        <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 leading-snug space-y-1">
          <p className="font-bold text-zinc-400 flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" /> Corpo Forte, Mente Sã
          </p>
          <p className="font-mono">Seu assistente de carga.</p>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-25 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-extrabold">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display font-black text-[14px] tracking-tight uppercase leading-none text-white">EVOTREINO</h1>
            <p className="text-[8px] text-emerald-450 font-mono font-bold leading-none tracking-wider mt-0.5">PROGRESSÃO</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-sans shrink-0">
          {activeSession && (
            <button 
              onClick={() => setActiveTab('active')}
              className="flex items-center gap-1 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] uppercase font-bold text-amber-400 animate-pulse cursor-pointer shrink-0"
            >
              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Treinando</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={logout}
              title="Sair da conta"
              className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-800 border border-zinc-750 hover:bg-red-950/20 hover:text-red-405 text-zinc-350 rounded-xl text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer shrink-0"
            >
              <span className="w-4 h-4 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold uppercase border border-emerald-500/20">{currentUser.name.charAt(0)}</span>
              <LogOut className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthGateway(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 text-zinc-950 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none shrink-0"
            >
              <LogIn className="w-3 h-3 stroke-[3.5] shrink-0" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </header>

      {/* Master Main Panel Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 max-w-7xl mx-auto w-full mb-16 lg:mb-0">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation Menu */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 border-t border-zinc-800 py-1.5 px-2 z-35 backdrop-blur-md">
        <nav className="grid grid-cols-6 text-center">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center py-1.5 h-12 relative text-zinc-400 hover:text-white"
              >
                <div className={`relative p-1 rounded-md transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-zinc-400'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                  
                  {item.highlight && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-550 bg-amber-500 ring-2 ring-zinc-900" />
                  )}
                </div>
                <span className={`text-[9px] font-semibold leading-none mt-0.5 tracking-wide ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </footer>

      {/* Auth Gateway Overlay Dialog */}
      {showAuthGateway && (
        <AuthGateway onDismiss={() => setShowAuthGateway(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <DashboardShell />
    </WorkoutProvider>
  );
}
