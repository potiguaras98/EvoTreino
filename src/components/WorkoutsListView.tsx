import React, { useState } from 'react';
import { useWorkout } from '../WorkoutContext';
import { WORKOUT_PRESETS } from '../presets';
import { 
  Dumbbell, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { Exercise } from '../types';

interface WorkoutsListViewProps {
  onNavigate: (tab: string) => void;
}

export const WorkoutsListView: React.FC<WorkoutsListViewProps> = ({ onNavigate }) => {
  const { startSession, activeSession, history } = useWorkout();
  const [expandedWorkout, setExpandedWorkout] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const toggleExpand = (id: 'A' | 'B' | 'C' | 'D') => {
    setExpandedWorkout(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-emerald-400" />
          Fichas de Treino Ativas
        </h2>
        <p className="text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed font-sans">
          Seus treinos planejados focados em sobressaturar os grupos musculares e permitir uma progressão de carga linear e estruturada.
        </p>
      </div>

      {activeSession && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-display font-bold text-white text-sm">Treino em Andamento Detectado</p>
              <p className="text-zinc-400 leading-relaxed font-sans">Você está atualmente no meio do {activeSession.workoutTitle}. Finalize ou cancele o treino ativo antes de iniciar uma nova ficha.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('active')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase tracking-wider text-xs rounded-xl transition-colors shrink-0 active:scale-95 cursor-pointer"
          >
            Retomar Treino
          </button>
        </div>
      )}

      <div className="space-y-4">
        {WORKOUT_PRESETS.map((workout) => {
          const isExpanded = expandedWorkout === workout.id;
          
          // Find last date trained
          const lastTrained = history.find(s => s.presetId === workout.id);
          let trainedAgo = 'Sessão inédita';
          if (lastTrained) {
            const daysDiff = Math.floor((Date.now() - new Date(lastTrained.date).getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 0) trainedAgo = 'Hoje';
            else if (daysDiff === 1) trainedAgo = 'Ontem';
            else trainedAgo = `${daysDiff}d atrás`;
          }

          // Count exercises in preset
          const count = workout.exercises.length;

          return (
            <div 
              key={workout.id}
              className={`rounded-3xl border transition-colors overflow-hidden ${
                isExpanded 
                  ? 'bg-zinc-900 border-zinc-700 shadow-[0_4px_25px_rgba(16,185,129,0.05)]' 
                  : 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-800'
              }`}
            >
              {/* Header */}
              <div 
                onClick={() => toggleExpand(workout.id)}
                className="p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-lg transition-colors duration-250 ${
                    isExpanded ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-emerald-400 border border-zinc-750'
                  }`}>
                    {workout.id}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-baseline gap-2">
                      {workout.title} <span className="text-xs sm:text-sm font-normal text-zinc-500 font-sans">• {workout.subtitle}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-2.5 mt-1 font-sans">
                      <span className="font-semibold">{count} Exercícios</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span className="text-zinc-500">Último treino: <strong className="text-zinc-350 font-semibold">{trainedAgo}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeSession && activeSession.presetId !== workout.id) {
                        onNavigate('active');
                        return;
                      }
                      startSession(workout.id);
                      onNavigate('active');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-zinc-950 text-zinc-950" /> Entrar
                  </button>
                  <div className="text-zinc-500 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Area */}
              {isExpanded && (
                <div className="border-t border-zinc-800 bg-zinc-900/35 py-5 px-6 space-y-5">
                  {workout.recoveryTip && (
                    <div className="bg-zinc-950/40 p-4.5 rounded-2xl border border-zinc-800 text-xs text-zinc-200 font-sans">
                      <p className="font-display font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 pb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-450" /> Dica de Sobrecarga & Execução
                      </p>
                      <p className="leading-relaxed text-zinc-400 font-sans font-medium">{workout.recoveryTip}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-display font-black uppercase tracking-wider text-zinc-500">Lista de Exercícios</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {workout.exercises.map((ex) => {
                        return (
                          <div 
                            key={ex.id}
                            className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 hover:border-zinc-800 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest bg-zinc-850 px-2 py-0.5 rounded-lg">
                                    {ex.muscleGroup}
                                  </span>
                                  <h5 className="font-display font-bold text-zinc-100 mt-2 text-sm sm:text-base leading-tight">{ex.name}</h5>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-lg shrink-0">
                                  {ex.defaultSets}x {ex.defaultReps}
                                </span>
                              </div>
                              
                              {ex.notes && (
                                <div className="mt-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-850/60 text-xs text-zinc-350 font-sans" id={`instruction-${ex.id}`}>
                                  <strong className="text-[10px] font-display font-black text-emerald-400 uppercase tracking-wider block mb-1">
                                    Instruções de Execução:
                                  </strong>
                                  <p className="leading-relaxed font-sans font-medium">{ex.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
