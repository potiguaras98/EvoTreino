import React, { useState } from 'react';
import { useWorkout } from '../WorkoutContext';
import { WORKOUT_PRESETS } from '../presets';
import { 
  History, 
  Trash, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, deleteSession } = useWorkout();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  const getPresetSubtitle = (presetId: 'A' | 'B' | 'C' | 'D') => {
    return WORKOUT_PRESETS.find(p => p.id === presetId)?.subtitle || '';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2">
        <div>
          <h2 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Histórico de Treinos
          </h2>
          <p className="text-sm font-medium text-zinc-400 max-w-xl leading-relaxed font-sans">
            Sua linha do tempo muscular. Acompanhe os registros passados de carga, volume e séries executadas.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-300">
          {history.length} Sessões Realizadas
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-zinc-900 border border-zinc-850 rounded-3xl min-h-[300px] space-y-4">
          <div className="w-14 h-14 bg-zinc-800 border border-zinc-750 text-zinc-500 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-sans font-medium">
            Seu histórico de exercícios está vazio atualmente. Complete os treinos na aba "Fichas" ou clique em "Gerar Histórico de Exemplo" na Dashboard para começar a visualizar dados realistas de exemplo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            
            // Format datetime nicely
            const sessionDate = new Date(session.date);
            const formattedDate = sessionDate.toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            const formattedTime = sessionDate.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            const formattedDuration = `${Math.floor(session.durationSeconds / 60)}m ${session.durationSeconds % 60}s`;

            // Calculate metrics
            const completedSetsCount = session.exercises.reduce((total, ex) => 
              total + ex.sets.filter(s => s.completed).length, 0
            );

            const totalLoadLifted = session.exercises.reduce((total, ex) => 
              total + ex.sets.filter(s => s.completed).reduce((exSum, s) => exSum + s.weight * s.reps, 0), 0
            );

            return (
              <div 
                key={session.id}
                className={`rounded-3xl border transition-all ${
                  isExpanded 
                    ? 'border-zinc-700 bg-zinc-900 shadow-md' 
                    : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-800'
                }`}
              >
                {/* Session Summary Card */}
                <div 
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-display font-black text-xl flex items-center justify-center">
                      {session.presetId}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base">
                        {session.workoutTitle} <span className="font-sans font-medium text-zinc-500 text-xs sm:text-sm">• {getPresetSubtitle(session.presetId)}</span>
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[10px] font-sans font-medium text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-600" /> {formattedDate} às {formattedTime}
                        </span>
                        <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-zinc-650" /> Duração: {formattedDuration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="text-right sm:pr-2">
                      <p className="text-xs font-mono font-bold text-emerald-450">{completedSetsCount} SÉRIES</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{totalLoadLifted > 0 ? `${totalLoadLifted}kg volume total` : ''}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      {/* Delete button (stop event propagation) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Deseja mesmo excluir este registro do seu histórico?')) {
                            deleteSession(session.id);
                          }
                        }}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                        title="Deletar este treino"
                        id={`delete-btn-${session.id}`}
                      >
                        <Trash className="w-4 h-4" />
                      </button>

                      <div className="text-zinc-500 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded sets details table */}
                {isExpanded && (
                  <div className="border-t border-zinc-850 bg-zinc-950/20 py-5 px-6 space-y-4">
                    <div className="text-[10px] uppercase font-display font-black tracking-widest text-zinc-500 pb-1 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-600" /> Detalhes de Carga do Exercício
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {session.exercises.map((ex) => {
                        const completedSets = ex.sets.filter(s => s.completed);
                        if (completedSets.length === 0) return null;

                        return (
                          <div 
                            key={ex.exerciseId}
                            className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850/80"
                          >
                            <h4 className="text-xs font-display font-bold text-zinc-300 mb-2 truncate">
                              {ex.exerciseName}
                            </h4>

                            <div className="space-y-1 font-mono text-[10px] text-zinc-400">
                              {completedSets.map((set, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-zinc-950/30 py-1.5 px-3 rounded-lg">
                                  <span>Série {set.setNumber}º</span>
                                  <span className="font-mono font-bold text-emerald-400">
                                    {set.weight}kg <span className="font-normal text-zinc-650">x</span> {set.reps} reps
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
