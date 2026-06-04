import React from 'react';
import { useWorkout } from '../WorkoutContext';
import { WORKOUT_PRESETS } from '../presets';
import { 
  Flame, 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Zap, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { history, getMuscleRecoveryStatus, startSession, activeSession, generateSampleHistory, currentUser } = useWorkout();

  const muscleRecovery = getMuscleRecoveryStatus();
  const recentWorkouts = history.slice(0, 3);
  
  // Calculate stats
  const totalWorkouts = history.length;
  
  // Stats over last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const workoutsThisWeek = history.filter(
    s => new Date(s.date) >= sevenDaysAgo
  ).length;

  // Find if Legs (Treino B) was done recently (< 36 hours)
  const isLegRecoveryActive = () => {
    const legSessions = history.filter(s => s.presetId === 'B');
    if (legSessions.length === 0) return false;
    
    const lastLegDate = new Date(legSessions[0].date).getTime();
    const hoursSinceLastLeg = (Date.now() - lastLegDate) / (1000 * 60 * 60);
    return hoursSinceLastLeg < 36; // True if leg day took place in the last 36 hours
  };

  const showLegWarning = isLegRecoveryActive();

  // Get current streak (days trained consecutively)
  const calculateStreak = () => {
    if (history.length === 0) return 0;
    
    // Sort unique training dates descending
    const dates = (Array.from(new Set(history.map(s => s.date.split('T')[0]))) as string[])
      .map(dStr => new Date(dStr))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    
    // Check if user trained today or yesterday to continue streak
    const firstDate = dates[0];
    const diffDaysFromLatest = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDaysFromLatest > 1) {
      return 0; // Streak broken
    }

    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const diffDays = Math.floor((checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (diffDays === 1) {
        // Gap of exactly 1 day (e.g. checked today, training was yesterday, count it!)
        streak++;
        checkDate = new Date(d);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }
    return streak;
  };

  const streakValue = calculateStreak();

  return (
    <div className="space-y-6">
      {/* Hero Welcome / Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Foco em Hipertrofia e Carga
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white uppercase font-sans">
              {currentUser ? `Olá, ${currentUser.name}` : 'EVOLUÇÃO'} <span className="text-emerald-500">PRO</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl font-medium tracking-wide">
              {currentUser 
                ? 'Seu progresso de cargas e fotos de evolução física estão sincronizados e salvos com sucesso na sua conta.' 
                : 'Bem-vindo ao seu painel de treino. Conecte sua conta para sincronizar cargas e fotos de evolução física de forma definitiva.'}
            </p>
          </div>
          
          {activeSession ? (
            <button
              onClick={() => onNavigate('active')}
              className="px-6 py-4 rounded-2xl bg-amber-500 text-zinc-950 font-black tracking-widest uppercase text-xs hover:bg-amber-600 transition-all duration-350 shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 animate-pulse cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Retomar Treino Ativo
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {totalWorkouts === 0 && (
                <button
                  onClick={generateSampleHistory}
                  className="px-4 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 font-bold tracking-wide text-xs hover:bg-zinc-850 hover:border-zinc-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Gerar Histórico de Exemplo
                </button>
              )}
              <button
                onClick={() => onNavigate('workouts')}
                className="px-6 py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black tracking-widest uppercase text-xs hover:bg-emerald-400 hover:shadow-emerald-500/10 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                Começar Novo Treino
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning/Alert for Post-Leg Workout (Running recommendation) */}
      {showLegWarning && (
        <div className="flex bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 text-amber-200 gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-amber-450 text-xs tracking-wider uppercase text-amber-400">Sugestão de Repouso</h4>
            <p className="font-display font-bold text-lg text-white">Treino B (Pernas) Recente</p>
            <p className="text-xs text-zinc-400 leading-relaxed pr-2">
              Sua musculatura inferior foi intensamente demandada recentemente. Para otimizar a hipertrofia e manter a segurança do SNC, <strong>evite treinos de corrida, explosão ou pista nas próximas 24 horas</strong>. Mantenha repouso ou caminhadas leves.
            </p>
            <div className="mt-3.5 flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-amber-500/15 rounded-full overflow-hidden">
                <div className="w-[50%] h-full bg-amber-500"></div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">50% Recuperado</span>
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid Stats */}
      <h2 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" /> Métricas e Indicadores
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-850 flex flex-col justify-between h-28 relative group overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-display font-black tracking-wider text-zinc-500 uppercase">Total Treinos</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white transition-transform group-hover:scale-105 duration-300">{totalWorkouts}</div>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Sessões feitas</p>
          </div>
        </div>
        
        {/* Stat 2 */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-850 flex flex-col justify-between h-28 relative group overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-display font-black tracking-wider text-zinc-500 uppercase">Esta Semana</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white transition-transform group-hover:scale-105 duration-300">{workoutsThisWeek}</div>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Treinos / 7 dias</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-850 flex flex-col justify-between h-28 relative group overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-display font-black tracking-wider text-zinc-500 uppercase">Sequência Ativa</span>
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white transition-transform group-hover:scale-105 duration-300">{streakValue}</div>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Dias Seguidos</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-850 flex flex-col justify-between h-28 relative group overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-display font-black tracking-wider text-zinc-500 uppercase">Força Geral</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-emerald-400 transition-transform group-hover:scale-105 duration-300">
              {totalWorkouts > 0 ? `${Math.min(100, Math.round(50 + totalWorkouts * 2.5))}%` : '0%'}
            </div>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Fidelidade ao treino</p>
          </div>
        </div>
      </div>

      {/* Main Area: Quick Start Workouts (Left), Muscle Recovery Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Start Workouts presets */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase">Escolha o seu Treino</h3>
            <button 
              onClick={() => onNavigate('workouts')}
              className="text-xs text-emerald-400 font-bold hover:underline transition-colors"
            >
              Fichas Completas →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WORKOUT_PRESETS.map((p) => {
              // Check last training of this preset
              const lastTrained = history.find(s => s.presetId === p.id);
              let trainedAgo = 'Não executado';
              if (lastTrained) {
                const diffTime = Math.abs(Date.now() - new Date(lastTrained.date).getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 0) trainedAgo = 'Treinado Hoje';
                else if (diffDays === 1) trainedAgo = 'Treinado Ontem';
                else trainedAgo = `${diffDays}d atrás`;
              }

              return (
                <div 
                  key={p.id}
                  className="group bg-zinc-900/45 p-6 rounded-3xl border border-zinc-850 hover:border-emerald-500/40 transition-colors flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                         Letra {p.id}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {trainedAgo}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium opacity-80 mt-0.5">
                        {p.subtitle}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1.5 font-mono">
                      {p.exercises.length} Exercícios • {p.exercises.map(e => e.name).slice(0, 2).join(', ')}...
                    </p>
                  </div>

                  <div className="pt-4 flex justify-between items-center relative z-10">
                    <button
                      onClick={() => {
                        startSession(p.id);
                        onNavigate('active');
                      }}
                      className="text-xs bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 font-black px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Iniciar
                    </button>
                    <span className="text-[10px] text-zinc-500 font-bold tracking-wide group-hover:text-emerald-400/80 transition-colors cursor-pointer" onClick={() => onNavigate('workouts')}>
                      ver fichas +
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent History Widget */}
          <div className="space-y-4 pt-3">
            <h3 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase">Atividades Recentes</h3>
            {recentWorkouts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-zinc-900/20 border border-dashed border-zinc-850/80 text-center text-zinc-500 text-xs">
                Nenhum treino no seu histórico ainda. Comece hoje!
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((s) => {
                  const dateStr = new Date(s.date).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Calculate total sets log completed
                  const completedSetsCount = s.exercises.reduce((acc, currentEx) => 
                    acc + currentEx.sets.filter(st => st.completed).length, 
                    0
                  );

                  return (
                    <div 
                      key={s.id}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-850/80 hover:border-zinc-800 flex justify-between items-center text-xs group transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-800 group-hover:border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
                          {s.presetId}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 tracking-wide">{s.workoutTitle}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{dateStr}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-white">{completedSetsCount} Séries</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{Math.round(s.durationSeconds / 60)} min duração</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Muscle Recovery Map */}
        <div className="space-y-5">
          <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase">Fibras e Recuperação</h3>
            <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider">Janela 48h</span>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-850/80 space-y-4">
            <div className="text-xs text-zinc-400 leading-relaxed pb-3 border-b border-zinc-800/60 font-medium font-sans">
              Músculos abaixo de 50% necessitam de repouso ou intensidade reduzida para evitar lesões e fadiga severa.
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {muscleRecovery.map((recovery) => {
                let colorClass = 'bg-emerald-500';
                let textClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                
                if (recovery.status === 'Fadigado') {
                  colorClass = 'bg-red-500';
                  textClass = 'text-red-400 bg-red-500/10 border-red-500/20';
                } else if (recovery.status === 'Em Recuperação') {
                  colorClass = 'bg-amber-500';
                  textClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                }

                return (
                  <div key={recovery.group} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-200">{recovery.group}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${textClass}`}>
                        {recovery.recoveryProgress}% • {recovery.status}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClass} transition-all duration-500`}
                        style={{ width: `${recovery.recoveryProgress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General recovery hints */}
            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 font-sans">
              <h5 className="text-[11px] font-display font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> Diretrizes de Recuperação:
              </h5>
              <ul className="list-disc pl-4 text-[10px] text-zinc-400 space-y-1 mt-1 leading-relaxed font-sans font-medium">
                <li>Durma de 7 a 9 horas para manter picos de síntese de GH.</li>
                <li>Consuma quantidade correta de água (<span className="text-zinc-250 text-zinc-200 font-bold">35ml/kg</span>).</li>
                <li>Estiramentos e liberação ajudam no fluxo sanguíneo.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
