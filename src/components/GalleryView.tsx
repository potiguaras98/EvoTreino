import React, { useState } from 'react';
import { useWorkout } from '../WorkoutContext';
import { WorkoutSession } from '../types';
import { 
  Calendar, 
  Dumbbell, 
  Clock, 
  X, 
  ChevronRight, 
  Sparkles, 
  Camera, 
  Trash2,
  ListCollapse
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { history, deleteSession } = useWorkout();
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  // Filter sessions that contain a progress photo
  const photoSessions = history.filter(session => !!session.photoUrl);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Data indisponível';
    }
  };

  const getDayOfWeek = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      return day.charAt(0).toUpperCase() + day.slice(1);
    } catch (e) {
      return '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with high-contrast typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Minha Evolução Física
          </div>
          <h2 className="font-display font-medium text-white text-3xl tracking-tight">
            Galeria de Progressos
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-lg font-sans">
            Guarde lembranças visuais de cada esforço e veja como seu corpo se transforma ao longo do tempo.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-2xl w-fit">
          <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="font-mono text-xs text-zinc-300">
            Registros salvos: <strong className="text-emerald-400">{photoSessions.length}</strong>
          </div>
        </div>
      </div>

      {photoSessions.length === 0 ? (
        /* Unsolicited minimalist empty state empty matching cosmic aesthetic */
        <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-5 animate-scale-up">
          <div className="w-16 h-16 bg-zinc-800/40 rounded-2xl flex items-center justify-center mx-auto border border-zinc-750">
            <Camera className="w-7 h-7 text-zinc-500" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-white text-lg">Sua galeria está vazia</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-sm mx-auto font-medium">
              Ao treinar e clicar em <strong className="text-zinc-200">Finalizar</strong>, nosso app lhe dará a opção de anexar uma foto. Comece seu próximo treino hoje e faça seu primeiro registro!
            </p>
          </div>
        </div>
      ) : (
        /* Visual Photo Bento / Grid list */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoSessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="group cursor-pointer bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden shadow-md hover:border-zinc-700/50 hover:shadow-emerald-500/5 transition-all text-left"
              id={`gallery-item-${session.id}`}
            >
              {/* Photo component */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
                <img 
                  referrerPolicy="no-referrer"
                  src={session.photoUrl} 
                  alt={session.workoutTitle}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay with workout short title */}
                <div className="absolute top-2 w-full px-2 flex justify-between items-center pointer-events-none">
                  <span className="px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    {session.workoutTitle.split(' ')[1] || 'Treino'}
                  </span>
                  
                  <span className="px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md rounded-lg text-[8px] font-mono font-bold text-zinc-400">
                    {formatDuration(session.durationSeconds)}
                  </span>
                </div>

                {/* Dark fog fade at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                
                {/* Date overlay at bottom */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                  <p className="text-[10px] font-bold tracking-tight text-white mb-0.5 truncate">
                    {getDayOfWeek(session.date)}
                  </p>
                  <p className="text-[8px] font-mono text-zinc-400">
                    {formatDate(session.date).split(' de ')[0]} {formatDate(session.date).split(' de ')[1]?.slice(0, 3)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Photo & Session Summary Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-4xl w-full flex flex-col md:flex-row gap-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Left side: Pure clean full image frame */}
            <div className="flex-1 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 aspect-[4/5] max-h-[60vh] md:max-h-[500px]">
              <img 
                referrerPolicy="no-referrer"
                src={selectedSession.photoUrl} 
                alt={selectedSession.workoutTitle}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right side: Session specs and workout results summary */}
            <div className="w-full md:w-[350px] flex flex-col justify-between shrink-0 space-y-6">
              <div className="space-y-5">
                {/* Modal Title bar */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest border border-emerald-900">
                      Progresso Registrado
                    </span>
                    <h3 className="font-display font-bold text-white text-xl tracking-tight pt-1.5 leading-snug">
                      {selectedSession.workoutTitle}
                    </h3>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Workout Time & Calendar tags */}
                <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-300">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="font-sans font-medium">
                      <span className="text-zinc-400 text-[11px] block uppercase font-mono font-bold tracking-wider">Data do Registro</span>
                      <strong>{getDayOfWeek(selectedSession.date)}, {formatDate(selectedSession.date)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-300">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="font-sans font-medium">
                      <span className="text-zinc-400 text-[11px] block uppercase font-mono font-bold tracking-wider">Duração do Treino</span>
                      <strong>{formatDuration(selectedSession.durationSeconds)} de foco total</strong>
                    </div>
                  </div>
                </div>

                {/* Exercises logged details sheet matching requirements */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 uppercase tracking-widest font-mono font-black">
                    <ListCollapse className="w-4 h-4 text-emerald-400" />
                    <span>Detalhes das Cargas</span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {selectedSession.exercises.map((exec_ex, idx) => {
                      // count completed sets
                      const completedSets = exec_ex.sets.filter(s => s.completed);
                      if (completedSets.length === 0) return null;
                      
                      // extract maximum weight
                      const maxWeight = Math.max(...completedSets.map(s => s.weight || 0), 0);

                      return (
                        <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-zinc-950 rounded-xl border border-zinc-850">
                          <div className="truncate shrink max-w-[180px]">
                            <p className="font-medium text-zinc-200 truncate">{exec_ex.exerciseName}</p>
                            <p className="text-[10px] text-zinc-500 font-sans font-medium">
                              {completedSets.length} {completedSets.length === 1 ? 'série concluída' : 'séries concluídas'}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-950">
                              {maxWeight > 0 ? `${maxWeight}kg` : 'Peso livre'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {selectedSession.exercises.filter(ex => ex.sets.some(s => s.completed)).length === 0 && (
                      <p className="text-[11px] text-zinc-500 font-sans italic">Nenhum exercício registrado nesta sessão.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Back out command actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    if (confirm('Deseja realmente apagar o registro deste treino? Os dados e a foto serão perdidos permanentemente.')) {
                      deleteSession(selectedSession.id);
                      setSelectedSession(null);
                    }
                  }}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/10 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Excluir Registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
