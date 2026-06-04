import React, { useState, useEffect, useRef } from 'react';
import { useWorkout } from '../WorkoutContext';
import { WORKOUT_PRESETS } from '../presets';
import { 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Flame, 
  ChevronDown, 
  ChevronUp,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Exercise } from '../types';

interface ActiveWorkoutViewProps {
  onNavigate: (tab: string) => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({ onNavigate }) => {
  const { 
    activeSession, 
    activeSessionStartTime, 
    updateSetLog, 
    addSetToActiveExercise, 
    removeLastSetFromActiveExercise,
    finishSession, 
    cancelSession,
    history
  } = useWorkout();

  const [totalTime, setTotalTime] = useState('00:00');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState<{ [id: string]: boolean }>({});
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Photo & Finish Integration state
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setPhotoDataUrl(base64);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar a imagem. Tente novamente.');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  // Rest Timer State
  const [restDuration, setRestDuration] = useState(60); // default 60s
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [restTotal, setRestTotal] = useState(60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total session stopwatch
  useEffect(() => {
    if (!activeSessionStartTime) return;

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - activeSessionStartTime;
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const secs = (totalSeconds % 60).toString().padStart(2, '0');
      setTotalTime(`${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessionStartTime]);

  // Rest Timer countdown
  useEffect(() => {
    if (restActive && restTimeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (restActive && restTimeLeft === 0) {
      setRestActive(false);
      triggerRestEndAlarm();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restActive, restTimeLeft]);

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-zinc-900 border border-zinc-850 rounded-3xl min-h-[350px] space-y-5">
        <div className="w-16 h-16 bg-zinc-800 border border-zinc-750 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
          <Clock className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Nenhum treino ativo</h3>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed font-sans">
            Sua planilha de exercícios personalizada está pronta. Aperte o botão abaixo, selecione um treino e comece a registrar seu progresso hoje.
          </p>
        </div>
        <button
          onClick={() => onNavigate('workouts')}
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Fichas de Treino
        </button>
      </div>
    );
  }

  // Play HTML5 synthesizer beep when timer ends
  const triggerRestEndAlarm = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play 3 successive sweet acoustic pings
      const playBeep = (delay: number, frequency: number, duration: number) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
          
          gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration - 0.05);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        }, delay);
      };

      playBeep(0, 880, 0.2);     // A5
      playBeep(250, 880, 0.2);   // A5
      playBeep(500, 1174.66, 0.4); // D6 (high resolution resolution ping)

    } catch (e) {
      console.warn('Audio synthesis failed, context forbidden by browser settings.', e);
    }
  };

  const startRestTimer = (seconds: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRestTotal(seconds);
    setRestTimeLeft(seconds);
    setRestActive(true);
  };

  const handleSetCheckToggle = (exerciseId: string, setNumber: number, currentlyCompleted: boolean) => {
    const isNowCompleted = !currentlyCompleted;
    updateSetLog(exerciseId, setNumber, { completed: isNowCompleted });

    // If marked as completed, trigger rest advice automatically
    if (isNowCompleted) {
      startRestTimer(restDuration);
    }
  };

  const toggleCollapseExercise = (id: string) => {
    setCollapsedExercises(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activePreset = WORKOUT_PRESETS.find(p => p.id === activeSession.presetId);

  // Check previous maximum logged weights for advice representation
  const getPrevLogsForExercise = (exerciseId: string) => {
    // Find sessions in history containing this exercise (excluding current active)
    const sessionsWithEx = history.filter(s => s.exercises.some(e => e.exerciseId === exerciseId));
    if (sessionsWithEx.length === 0) return null;
    
    // Sort and grab latest
    const latest = [...sessionsWithEx].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const exLog = latest.exercises.find(e => e.exerciseId === exerciseId);
    if (!exLog) return null;

    const completedSets = exLog.sets.filter(s => s.completed);
    if (completedSets.length === 0) return null;

    const weightsText = completedSets.map(s => `${s.weight}kg`).slice(0, 4).join(' / ');
    const maxWeight = Math.max(...completedSets.map(s => s.weight));

    return {
      weightsText,
      maxWeight,
      date: new Date(latest.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    };
  };

  return (
    <div className="space-y-6 relative pb-28">
      {/* Active Workout Info Floating Panel */}
      <div className="rounded-3xl border border-zinc-805 bg-zinc-900/90 p-5 sticky top-2 z-25 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg shadow-black/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 font-display font-black text-xl">
            {activeSession.presetId}
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-455 text-emerald-400">Treinando Ativamente</div>
            <h3 className="font-display font-bold text-white text-base">
              {activeSession.workoutTitle} <span className="font-sans font-medium text-zinc-500">• {activePreset?.subtitle}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold text-zinc-250 text-zinc-300">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{totalTime}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 bg-zinc-800 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 font-bold text-xs rounded-xl transition-colors border border-zinc-750 hover:border-red-500/10 active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setPhotoDataUrl(null);
                setShowFinishModal(true);
              }}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl transition-colors active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Finalizar
            </button>
          </div>
        </div>
      </div>

      {/* Warning Tip for Treino B Perna Completo */}
      {activeSession.presetId === 'B' && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-xs text-amber-200 leading-relaxed flex gap-3 font-sans">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <p className="font-sans font-medium">
            <strong>Dica de Preservação:</strong> Este treino gera bastante microlesão muscular de quadríceps e isquiotibiais. Evite qualquer tipo de corrida de tiro ou corridas longas hoje ou amanhã para colher os benefícios da sobrecarga e estabilização articular.
          </p>
        </div>
      )}

      {/* Main Exercise Block List */}
      <div className="space-y-4">
        {activeSession.exercises.map((exLog) => {
          const isCollapsed = !!collapsedExercises[exLog.exerciseId];
          const presetEx = activePreset?.exercises.find(e => e.id === exLog.exerciseId);
          const prevLog = getPrevLogsForExercise(exLog.exerciseId);

          const completedSets = exLog.sets.filter(s => s.completed).length;
          const totalSets = exLog.sets.length;

          return (
            <div 
              key={exLog.exerciseId}
              className={`rounded-3xl border border-zinc-850 bg-zinc-900 overflow-hidden transition-all duration-200 ${
                completedSets === totalSets ? 'opacity-70 border-zinc-900 bg-zinc-900/60' : ''
              }`}
            >
              {/* Exercise Header Accordion */}
              <div 
                onClick={() => toggleCollapseExercise(exLog.exerciseId)}
                className="p-5 border-b border-zinc-850/60 flex justify-between items-center cursor-pointer hover:bg-zinc-850/20 transition-all select-none"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md tracking-wider uppercase">
                      {presetEx?.muscleGroup}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {completedSets} de {totalSets} feitas
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-white text-base sm:text-lg mt-1.5 truncate">
                    {exLog.exerciseName}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-450 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                     Meta: {presetEx?.defaultSets}x{presetEx?.defaultReps}
                  </span>
                  <div className="text-zinc-500">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Area */}
              {!isCollapsed && (
                <div className="p-5 space-y-4">
                  {/* Previous Weight Recommendation Guideline (Progressive Overload) */}
                  {prevLog ? (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between text-xs font-sans">
                      <span className="text-zinc-400 flex items-center gap-1 font-medium font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Histórico de Carga ({prevLog.date}):
                      </span>
                      <strong className="text-emerald-400 font-mono">
                        {prevLog.weightsText} ({prevLog.maxWeight}kg máx)
                      </strong>
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-2xl text-[11px] text-zinc-500 flex items-center gap-1.5 font-sans">
                      <Flame className="w-3.5 h-3.5 text-zinc-650" />
                      Iniciando este exercício. Defina uma carga confortável e procure anotar abaixo.
                    </div>
                  )}

                  {/* Sets Register Matrix */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-center text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-2 pb-1 border-b border-zinc-850">
                      <span className="col-span-2 text-left">Série</span>
                      <span className="col-span-4">Carga (kg)</span>
                      <span className="col-span-4">Reps Feitas</span>
                      <span className="col-span-2">Feito</span>
                    </div>

                    <div className="space-y-2">
                      {exLog.sets.map((set, sIdx) => {
                        return (
                          <div 
                            key={set.setNumber}
                            className={`grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-2xl transition-all ${
                              set.completed 
                                ? 'bg-emerald-500/5 border border-emerald-500/10' 
                                : 'hover:bg-zinc-950/20 border border-transparent'
                            }`}
                          >
                            <span className="col-span-2 text-xs font-mono font-bold text-zinc-300 pl-2">
                              {set.setNumber}º
                            </span>
                            
                            {/* Load / Weight Input */}
                            <div className="col-span-4 flex items-center justify-center">
                              <input 
                                type="number" 
                                value={set.weight || ''}
                                placeholder="0"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  updateSetLog(exLog.exerciseId, set.setNumber, { weight: val });
                                }}
                                disabled={set.completed}
                                className="w-full max-w-[80px] bg-zinc-950 text-center py-1.5 rounded-xl border border-zinc-800 text-sm font-semibold font-mono text-white disabled:opacity-60 disabled:bg-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Reps Input */}
                            <div className="col-span-4 flex items-center justify-center">
                              <input 
                                type="number" 
                                value={set.reps || ''}
                                placeholder="0"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  updateSetLog(exLog.exerciseId, set.setNumber, { reps: val });
                                }}
                                disabled={set.completed}
                                className="w-full max-w-[80px] bg-zinc-950 text-center py-1.5 rounded-xl border border-zinc-800 text-sm font-semibold font-mono text-white disabled:opacity-60 disabled:bg-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Done Checkbox */}
                            <div className="col-span-2 flex items-center justify-center">
                              <button
                                onClick={() => handleSetCheckToggle(exLog.exerciseId, set.setNumber, set.completed)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                                  set.completed
                                    ? 'bg-emerald-500 border-emerald-450 text-zinc-950 shadow shadow-emerald-500/20'
                                    : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950'
                                }`}
                              >
                                {set.completed && <Check className="w-4 h-4 stroke-[3.5]" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Delete Dynamic Sets */}
                  <div className="flex gap-2.5 justify-end pt-1">
                    <button
                      onClick={() => removeLastSetFromActiveExercise(exLog.exerciseId)}
                      disabled={exLog.sets.length <= 1}
                      className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-red-400 disabled:opacity-40 disabled:hover:text-zinc-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-zinc-750 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" /> Remover Série
                    </button>
                    <button
                      onClick={() => addSetToActiveExercise(exLog.exerciseId)}
                      className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-zinc-750 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Série
                    </button>
                  </div>

                  {presetEx?.notes && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-350 font-sans" id={`instruction-active-${exLog.exerciseId}`}>
                      <strong className="text-[10px] font-display font-black text-emerald-400 uppercase tracking-wider block mb-1">
                        Instruções de Execução:
                      </strong>
                      <p className="leading-relaxed font-sans font-medium">{presetEx.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Rest Timer HUD at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent backdrop-blur-[2px] z-30">
        <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              restActive ? 'bg-orange-500 text-zinc-950 animate-pulse' : 'bg-zinc-800 text-zinc-500'
            }`}>
              <Clock className="w-5 h-5" />
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Tempo de Descanso Ativo</div>
              <div className="text-xs text-zinc-300 font-sans">
                {restActive ? (
                  <span className="font-semibold text-orange-450 font-sans">
                    Descansando... <strong className="font-mono text-sm">{restTimeLeft}s</strong> restantes
                  </span>
                ) : (
                  <span className="font-medium font-sans">Aguardando você finalizar uma série...</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Rest Adjusters */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 gap-1">
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setRestDuration(sec);
                    if (restActive) {
                      startRestTimer(sec);
                    }
                  }}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg cursor-pointer ${
                    restDuration === sec
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              {restActive ? (
                <button
                  onClick={() => setRestActive(false)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 font-bold text-[10px] uppercase rounded-xl tracking-wider cursor-pointer"
                >
                  Zerar
                </button>
              ) : (
                <button
                  onClick={() => startRestTimer(restDuration)}
                  className="px-4 py-2 bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase rounded-xl tracking-wider hover:bg-emerald-400 cursor-pointer border-transparent"
                >
                  Regen
                </button>
              )}

              {/* Sound toggle button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Silenciar Beep' : 'Ativar Beep'}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  soundEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-zinc-800 border-zinc-750 text-zinc-600'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Workout Dialog Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-white text-base">Descartar Treino?</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                  Seus dados registrados nesta sessão em andamento serão perdidos de forma irreversível. Deseja mesmo cancelar?
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-zinc-805 text-zinc-350 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750/80 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  cancelSession();
                  onNavigate('dashboard');
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs tracking-wide rounded-xl transition-all cursor-pointer border-transparent"
                id="active-cancel-confirm-btn"
              >
                Sim, Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Registration & Finished Session Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-45">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex gap-4 items-center">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
                <Camera className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-display font-bold text-white text-lg">Treino Concluído! 🔥</h4>
                <p className="text-xs text-zinc-400 font-sans font-medium">Registre uma foto do seu pump ou do seu treino para salvar em sua galeria de evolução!</p>
              </div>
            </div>

            {/* Drag and Drop Area */}
            {!photoDataUrl ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-zinc-800 hover:border-zinc-720 bg-zinc-950/30 hover:bg-zinc-950/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handlePhotoFile(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
                
                <Upload className="w-8 h-8 text-zinc-500 mb-3 stroke-[1.5]" />
                <p className="text-xs font-bold text-zinc-300 font-sans">
                  Arraste sua foto aqui ou clique para selecionar
                </p>
                <p className="text-[10px] text-zinc-500 mt-1.5 font-sans font-medium">
                  Dica: No celular, as opções "Câmera" ou "Fototeca" funcionarão imediatamente!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative group rounded-2xl overflow-hidden border border-zinc-750 shadow-lg">
                  <img 
                    src={photoDataUrl} 
                    alt="Evolução" 
                    className="w-full max-h-64 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-4">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Foto Selecionada</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/10 text-red-400 rounded-xl text-xs font-bold transition-all w-full flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover e Selecionar Outra
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setShowFinishModal(false)}
                className="w-full sm:w-auto px-4 py-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-750 font-bold text-xs rounded-xl transition-colors cursor-pointer text-zinc-400 hover:text-zinc-200"
              >
                Voltar
              </button>
              
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    finishSession(undefined);
                    setShowFinishModal(false);
                    onNavigate('dashboard');
                  }}
                  className="w-full py-3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 font-bold uppercase text-[10px] tracking-wider rounded-xl text-zinc-350 hover:text-white transition-all cursor-pointer text-center"
                >
                  Salvar sem Foto
                </button>
                <button
                  onClick={() => {
                    if (!photoDataUrl) {
                      alert('Por favor, carregue uma imagem ou clique em "Salvar sem Foto"');
                      return;
                    }
                    finishSession(photoDataUrl);
                    setShowFinishModal(false);
                    onNavigate('dashboard');
                  }}
                  disabled={!photoDataUrl}
                  className={`w-full py-3 font-black uppercase text-[11px] tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                    photoDataUrl 
                      ? 'bg-emerald-500 hover:bg-emerald-450 text-zinc-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)]' 
                      : 'bg-zinc-850 text-zinc-650 border border-zinc-850 cursor-not-allowed opacity-40'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Registrar com Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
