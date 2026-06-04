import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkoutSession, WorkoutReminder, ExerciseLog, SetLog, MuscleGroup, MuscleRecovery, UserProfile } from './types';
import { WORKOUT_PRESETS } from './presets';

interface WorkoutContextType {
  history: WorkoutSession[];
  activeSession: WorkoutSession | null;
  activeSessionStartTime: number | null; // Unix timestamp
  reminders: WorkoutReminder[];
  addSession: (session: WorkoutSession) => void;
  deleteSession: (id: string) => void;
  startSession: (presetId: 'A' | 'B' | 'C' | 'D') => void;
  updateSetLog: (exerciseId: string, setNumber: number, updates: Partial<SetLog>) => void;
  addSetToActiveExercise: (exerciseId: string) => void;
  removeLastSetFromActiveExercise: (exerciseId: string) => void;
  finishSession: (photoUrl?: string) => void;
  cancelSession: () => void;
  getMuscleRecoveryStatus: () => MuscleRecovery[];
  getExerciseHistory: (exerciseId: string) => { date: string; maxWeight: number; volume: number }[];
  remindersEnabled: boolean;
  setRemindersEnabled: (enabled: boolean) => void;
  updateReminder: (id: string, updates: Partial<WorkoutReminder>) => void;
  generateSampleHistory: () => void;
  clearAllData: () => void;
  
  // Auth Integration
  currentUser: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: (name: string, email: string, googleId: string, photoUrl?: string) => Promise<boolean>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Initial notifications
const DEFAULT_REMINDERS: WorkoutReminder[] = [
  { id: '1', dayOfWeek: 1, time: '18:00', active: true }, // Monday (Trineo A)
  { id: '2', dayOfWeek: 2, time: '18:00', active: true }, // Tuesday (Treino B)
  { id: '3', dayOfWeek: 4, time: '18:00', active: true }, // Thursday (Treino C)
  { id: '4', dayOfWeek: 5, time: '18:00', active: true }, // Friday (Treino D)
];

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('evo_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing current user', e);
      }
    }
    return null;
  });

  // Unique keys generator per user
  const getHistoryKey = (user: UserProfile | null) => user ? `evo_workout_history_${user.id}` : 'evo_workout_history_guest';
  const getActiveSessionKey = (user: UserProfile | null) => user ? `evo_active_session_${user.id}` : 'evo_active_session_guest';
  const getActiveStartTimeKey = (user: UserProfile | null) => user ? `evo_active_start_time_${user.id}` : 'evo_active_start_time_guest';
  const getRemindersKey = (user: UserProfile | null) => user ? `evo_workout_reminders_${user.id}` : 'evo_workout_reminders_guest';
  const getRemindersEnabledKey = (user: UserProfile | null) => user ? `evo_reminders_enabled_${user.id}` : 'evo_reminders_enabled_guest';

  // Base Workout states (dynamically re-linked when currentUser changes)
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeSessionStartTime, setActiveSessionStartTime] = useState<number | null>(null);
  const [reminders, setReminders] = useState<WorkoutReminder[]>(DEFAULT_REMINDERS);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);

  // Load from local storage dynamically when current user loads/changes
  useEffect(() => {
    const historyKey = getHistoryKey(currentUser);
    const activeSessionKey = getActiveSessionKey(currentUser);
    const activeStartTimeKey = getActiveStartTimeKey(currentUser);
    const remindersKey = getRemindersKey(currentUser);
    const remindersEnabledKey = getRemindersEnabledKey(currentUser);

    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { setHistory([]); }
    } else {
      setHistory([]);
    }

    const savedActive = localStorage.getItem(activeSessionKey);
    if (savedActive) {
      try { setActiveSession(JSON.parse(savedActive)); } catch (e) { setActiveSession(null); }
    } else {
      setActiveSession(null);
    }

    const savedStartTime = localStorage.getItem(activeStartTimeKey);
    setActiveSessionStartTime(savedStartTime ? Number(savedStartTime) : null);

    const savedReminders = localStorage.getItem(remindersKey);
    if (savedReminders) {
      try { setReminders(JSON.parse(savedReminders)); } catch (e) { setReminders(DEFAULT_REMINDERS); }
    } else {
      setReminders(DEFAULT_REMINDERS);
    }

    const savedRemindersEnabled = localStorage.getItem(remindersEnabledKey);
    setRemindersEnabled(savedRemindersEnabled === 'true');
  }, [currentUser]);

  // Sync state modifications dynamically to current user keys
  useEffect(() => {
    localStorage.setItem(getHistoryKey(currentUser), JSON.stringify(history));
  }, [history, currentUser]);

  useEffect(() => {
    const activeKey = getActiveSessionKey(currentUser);
    const startKey = getActiveStartTimeKey(currentUser);
    if (activeSession) {
      localStorage.setItem(activeKey, JSON.stringify(activeSession));
      localStorage.setItem(startKey, String(activeSessionStartTime));
    } else {
      localStorage.removeItem(activeKey);
      localStorage.removeItem(startKey);
    }
  }, [activeSession, activeSessionStartTime, currentUser]);

  useEffect(() => {
    localStorage.setItem(getRemindersKey(currentUser), JSON.stringify(reminders));
  }, [reminders, currentUser]);

  useEffect(() => {
    localStorage.setItem(getRemindersEnabledKey(currentUser), String(remindersEnabled));
  }, [remindersEnabled, currentUser]);

  // Authentication logic
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const savedUsersList = localStorage.getItem('evo_users');
    const users = savedUsersList ? JSON.parse(savedUsersList) : [];
    
    const emailLower = email.toLowerCase().trim();
    if (users.some((u: any) => u.email === emailLower)) {
      throw new Error('E-mail já cadastrado.');
    }

    const newUser = {
      id: 'u_' + Date.now().toString(),
      name: name.trim(),
      email: emailLower,
      password: password
    };

    users.push(newUser);
    localStorage.setItem('evo_users', JSON.stringify(users));

    const profile: UserProfile = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem('evo_current_user', JSON.stringify(profile));
    setCurrentUser(profile);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const savedUsersList = localStorage.getItem('evo_users');
    const users = savedUsersList ? JSON.parse(savedUsersList) : [];
    
    const emailLower = email.toLowerCase().trim();
    const matched = users.find((u: any) => u.email === emailLower && u.password === password);
    
    if (!matched) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const profile: UserProfile = { id: matched.id, name: matched.name, email: matched.email };
    localStorage.setItem('evo_current_user', JSON.stringify(profile));
    setCurrentUser(profile);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('evo_current_user');
    setCurrentUser(null);
  };

  const loginWithGoogle = async (name: string, email: string, googleId: string, photoUrl?: string): Promise<boolean> => {
    const savedUsersList = localStorage.getItem('evo_users');
    const users = savedUsersList ? JSON.parse(savedUsersList) : [];
    
    const emailLower = email.toLowerCase().trim();
    let matched = users.find((u: any) => u.email === emailLower || u.googleId === googleId);
    
    if (!matched) {
      // Create new user for Google login
      matched = {
        id: 'u_g_' + googleId,
        name: name.trim(),
        email: emailLower,
        googleId,
        photoUrl
      };
      users.push(matched);
      localStorage.setItem('evo_users', JSON.stringify(users));
    } else {
      // Update existing user with Google details
      matched.name = name.trim();
      if (photoUrl) matched.photoUrl = photoUrl;
      if (!matched.googleId) matched.googleId = googleId;
      localStorage.setItem('evo_users', JSON.stringify(users));
    }

    const profile: UserProfile = { 
      id: matched.id, 
      name: matched.name, 
      email: matched.email,
      photoUrl: matched.photoUrl
    };
    
    localStorage.setItem('evo_current_user', JSON.stringify(profile));
    setCurrentUser(profile);
    return true;
  };

  // Start a new session
  const startSession = (presetId: 'A' | 'B' | 'C' | 'D') => {
    const preset = WORKOUT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Retrieve previous logs for training to suggest initial weights (Progressive Overload!)
    const lastSessionOfThisPreset = [...history]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find(h => h.presetId === presetId);

    const initialExercises: ExerciseLog[] = preset.exercises.map(ex => {
      // Try to find previous logs for this exact exercise
      let previousExerciseLog: ExerciseLog | undefined;
      
      // Look back in history for the most recent log of this specific exercise
      const mostRecentSessionWithThisExercise = [...history]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find(session => session.exercises.some(e => e.exerciseId === ex.id));

      if (mostRecentSessionWithThisExercise) {
        previousExerciseLog = mostRecentSessionWithThisExercise.exercises.find(e => e.exerciseId === ex.id);
      }

      const sets: SetLog[] = [];
      const setLength = previousExerciseLog ? previousExerciseLog.sets.length : ex.defaultSets;

      for (let i = 1; i <= setLength; i++) {
        // Pre-fill with previous completed weight/reps as guide, or default to some starting values (e.g. 10kg)
        let prevWeight = 10;
        let prevReps = 10;

        if (previousExerciseLog && previousExerciseLog.sets[i - 1]) {
          prevWeight = previousExerciseLog.sets[i - 1].weight;
          prevReps = previousExerciseLog.sets[i - 1].reps;
        } else if (previousExerciseLog && previousExerciseLog.sets.length > 0) {
          // Fallback to last available set of the previous session
          prevWeight = previousExerciseLog.sets[previousExerciseLog.sets.length - 1].weight;
          prevReps = previousExerciseLog.sets[previousExerciseLog.sets.length - 1].reps;
        } else {
          // Initial safe sensible default
          prevWeight = ex.muscleGroup === 'Quadríceps' || ex.muscleGroup === 'Costas' || ex.muscleGroup === 'Peito' ? 20 : 10;
          const matchReps = ex.defaultReps.match(/\d+/);
          prevReps = matchReps ? parseInt(matchReps[0]) : 10;
        }

        sets.push({
          setNumber: i,
          weight: prevWeight,
          reps: prevReps,
          completed: false, // Start uncompleted
        });
      }

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets,
      };
    });

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      presetId,
      workoutTitle: preset.title,
      date: new Date().toISOString(),
      durationSeconds: 0,
      exercises: initialExercises,
    };

    setActiveSession(newSession);
    setActiveSessionStartTime(Date.now());
  };

  // Update a specific set log in active session
  const updateSetLog = (exerciseId: string, setNumber: number, updates: Partial<SetLog>) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;

      const updatedSets = ex.sets.map(set => {
        if (set.setNumber !== setNumber) return set;
        return { ...set, ...updates };
      });

      return { ...ex, sets: updatedSets };
    });

    setActiveSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  // Add a set dynamically to active exercise
  const addSetToActiveExercise = (exerciseId: string) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;

      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = ex.sets.length + 1;
      const newSet: SetLog = {
        setNumber: newSetNumber,
        weight: lastSet ? lastSet.weight : 10,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      };

      return { ...ex, sets: [...ex.sets, newSet] };
    });

    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  // Remove last set dynamically
  const removeLastSetFromActiveExercise = (exerciseId: string) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.exerciseId !== exerciseId || ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.slice(0, -1) };
    });

    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  // Finish active session and save to history
  const finishSession = (photoUrl?: string) => {
    if (!activeSession || !activeSessionStartTime) return;

    const durationSeconds = Math.round((Date.now() - activeSessionStartTime) / 1000);
    const finalSession: WorkoutSession = {
      ...activeSession,
      durationSeconds,
      date: new Date().toISOString(), // finalize date/time to now
      photoUrl, // store base64 progress picture
    };

    // Filter out exercises that have absolutely zero completed sets
    const filteredExercises = finalSession.exercises.map(ex => {
      return {
        ...ex,
        // keep all sets, but perhaps we should flag if some are uncompleted.
        // It's fine to keep them, but let's count only completed sets for metrics
      };
    });

    const isAnySetCompleted = finalSession.exercises.some(ex => ex.sets.some(s => s.completed));
    if (!isAnySetCompleted) {
      // Prompt warning or auto-mark all as completed if nothing was checked?
      // Better: complete any sets that have inputs but aren't checked, or just save them.
      // We will auto-complete any sets that have positive weights/reps, or just save anyway.
    }

    setHistory(prev => [finalSession, ...prev]);
    setActiveSession(null);
    setActiveSessionStartTime(null);
  };

  // Cancel active session
  const cancelSession = () => {
    setActiveSession(null);
    setActiveSessionStartTime(null);
  };

  // Delete a session from history
  const deleteSession = (id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id));
  };

  // Add historical session
  const addSession = (session: WorkoutSession) => {
    setHistory(prev => [session, ...prev]);
  };

  // Update a reminder setting
  const updateReminder = (id: string, updates: Partial<WorkoutReminder>) => {
    setReminders(prev =>
      prev.map(rem => (rem.id === id ? { ...rem, ...updates } : rem))
    );
  };

  // Calculate Muscle Recovery Status
  const getMuscleRecoveryStatus = (): MuscleRecovery[] => {
    const muscleGroups: MuscleGroup[] = [
      'Peito',
      'Ombro',
      'Quadríceps',
      'Posterior de Coxa',
      'Costas',
      'Posterior de Ombro',
      'Panturrilha',
      'Abdômen',
      'Bíceps',
      'Tríceps',
      'Antebraço',
    ];

    const now = new Date().getTime();
    const COOLDOWN_HOURS = 48; // Standard 48 hours for muscle recovery

    return muscleGroups.map(group => {
      // Find the last completed workout that trained this group
      let lastTrainedTime: number | null = null;
      let lastTrainedDateISO: string | null = null;

      // Scan history sorted by date
      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (const session of sortedHistory) {
        // Find if this session includes this muscle group with completed sets
        const trainedGroup = session.exercises.some(ex => {
          // Find preset exercise definition to get muscle group
          const presetEx = WORKOUT_PRESETS.flatMap(p => p.exercises).find(pe => pe.id === ex.exerciseId);
          const mg = presetEx?.muscleGroup || ex.sets[0] ? group : null; // fallback check
          return presetEx?.muscleGroup === group && ex.sets.some(s => s.completed);
        });

        if (trainedGroup) {
          lastTrainedTime = new Date(session.date).getTime();
          lastTrainedDateISO = session.date;
          break;
        }
      }

      if (!lastTrainedTime) {
        return {
          group,
          lastTrained: null,
          recoveryProgress: 100,
          status: 'Recuperado',
        };
      }

      const hoursSinceTrained = (now - lastTrainedTime) / (1000 * 60 * 60);
      const progress = Math.min(100, Math.round((hoursSinceTrained / COOLDOWN_HOURS) * 100));

      let status: 'Recuperado' | 'Em Recuperação' | 'Fadigado' = 'Recuperado';
      if (progress < 40) {
        status = 'Fadigado';
      } else if (progress < 90) {
        status = 'Em Recuperação';
      }

      return {
        group,
        lastTrained: lastTrainedDateISO,
        recoveryProgress: progress,
        status,
      };
    });
  };

  // Get progressive history for a specific exercise (load tracking!)
  const getExerciseHistory = (exerciseId: string) => {
    const data: { date: string; maxWeight: number; volume: number }[] = [];

    // Filter history containing this exercise
    const sortedHistoryAsc = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedHistoryAsc.forEach(session => {
      const exLog = session.exercises.find(e => e.exerciseId === exerciseId);
      if (exLog) {
        const completedSets = exLog.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map(s => s.weight));
          const volume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
          
          const dateObj = new Date(session.date);
          const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

          data.push({
            date: formattedDate,
            maxWeight,
            volume,
          });
        }
      }
    });

    return data;
  };

  // Clear data
  const clearAllData = () => {
    setHistory([]);
    setActiveSession(null);
    setActiveSessionStartTime(null);
    setReminders(DEFAULT_REMINDERS);
    setRemindersEnabled(false);
    localStorage.removeItem('evo_workout_history');
    localStorage.removeItem('evo_active_session');
    localStorage.removeItem('evo_active_start_time');
    localStorage.removeItem('evo_workout_reminders');
    localStorage.removeItem('evo_reminders_enabled');
  };

  // Generate Sample History for charts & stats preview
  const generateSampleHistory = () => {
    const sampleHistory: WorkoutSession[] = [];
    const now = new Date();

    // Generate 4 weeks of training
    // 4 weeks ago to today
    // Sessions A, B, C, D completed regularly with progressive loads
    
    interface PresetWeights {
      [exerciseId: string]: { baseWeight: number; weightIncrementPerWeek: number; reps: number };
    }

    const exerciseConfig: PresetWeights = {
      // Treino A
      supino_reto_barra: { baseWeight: 60, weightIncrementPerWeek: 2.5, reps: 8 },
      supino_inclinado_halteres: { baseWeight: 20, weightIncrementPerWeek: 1, reps: 10 },
      crossover_polia_media: { baseWeight: 15, weightIncrementPerWeek: 1, reps: 12 },
      desenvolvimento_halteres: { baseWeight: 16, weightIncrementPerWeek: 1, reps: 10 },
      elevacao_lateral_halteres: { baseWeight: 10, weightIncrementPerWeek: 0.5, reps: 12 },
      elevacao_lateral_polia_unilateral: { baseWeight: 7.5, weightIncrementPerWeek: 0.5, reps: 12 },
      // Treino B
      agachamento_livre: { baseWeight: 70, weightIncrementPerWeek: 5, reps: 8 },
      leg_press_45: { baseWeight: 160, weightIncrementPerWeek: 10, reps: 10 },
      passada_halteres: { baseWeight: 14, weightIncrementPerWeek: 1, reps: 10 },
      cadeira_extensora: { baseWeight: 45, weightIncrementPerWeek: 2.5, reps: 12 },
      stiff_barra_halteres: { baseWeight: 50, weightIncrementPerWeek: 2.5, reps: 10 },
      mesa_flexora: { baseWeight: 35, weightIncrementPerWeek: 1.5, reps: 10 },
      // Treino C
      puxada_frontal_aberta: { baseWeight: 50, weightIncrementPerWeek: 2.5, reps: 10 },
      remada_curvada_barra: { baseWeight: 45, weightIncrementPerWeek: 2.5, reps: 8 },
      remada_baixa_triangulo: { baseWeight: 40, weightIncrementPerWeek: 2, reps: 10 },
      remada_unilateral_serrote: { baseWeight: 22, weightIncrementPerWeek: 1, reps: 10 },
      pulldown_corda: { baseWeight: 17.5, weightIncrementPerWeek: 0.5, reps: 12 },
      crucifixo_invertido_maquina: { baseWeight: 30, weightIncrementPerWeek: 1.5, reps: 12 },
      face_pull_polia_alta: { baseWeight: 12.5, weightIncrementPerWeek: 0.5, reps: 12 },
      gemeos_sentado: { baseWeight: 30, weightIncrementPerWeek: 2, reps: 15 },
      gemeos_em_pe: { baseWeight: 40, weightIncrementPerWeek: 2.5, reps: 15 },
      abdominal_supra_solo: { baseWeight: 0, weightIncrementPerWeek: 0, reps: 20 },
      abdominal_infra_elevacao: { baseWeight: 0, weightIncrementPerWeek: 0, reps: 15 },
      prancha_isometrica: { baseWeight: 0, weightIncrementPerWeek: 0, reps: 60 },
      // Treino D
      rosca_direta_barra: { baseWeight: 24, weightIncrementPerWeek: 1, reps: 8 },
      rosca_alternada_halteres: { baseWeight: 12, weightIncrementPerWeek: 0.5, reps: 10 },
      rosca_scott: { baseWeight: 20, weightIncrementPerWeek: 1, reps: 10 },
      tricepes_polia_barra: { baseWeight: 25, weightIncrementPerWeek: 1.25, reps: 10 },
      tricepes_testa_barra_w: { baseWeight: 18, weightIncrementPerWeek: 1, reps: 10 },
      tricepes_corda: { baseWeight: 15, weightIncrementPerWeek: 0.5, reps: 12 },
      rosca_inversa: { baseWeight: 12.5, weightIncrementPerWeek: 0.5, reps: 12 },
      flexao_punho: { baseWeight: 15, weightIncrementPerWeek: 1, reps: 15 }
    };

    // Construct sessions over past 4 weeks (28 days)
    // Week 1 (Day -28 to -22)
    // Week 2 (Day -21 to -15)
    // Week 3 (Day -14 to -8)
    // Week 4 (Day -7 to -1)

    const schedule = [
      { offsetDays: 25, presetId: 'A' }, // 25 days ago
      { offsetDays: 24, presetId: 'B' },
      { offsetDays: 22, presetId: 'C' },
      { offsetDays: 21, presetId: 'D' },

      { offsetDays: 18, presetId: 'A' }, // 18 days ago
      { offsetDays: 17, presetId: 'B' },
      { offsetDays: 15, presetId: 'C' },
      { offsetDays: 14, presetId: 'D' },

      { offsetDays: 11, presetId: 'A' }, // 11 days ago
      { offsetDays: 10, presetId: 'B' },
      { offsetDays: 8, presetId: 'C' },
      { offsetDays: 7, presetId: 'D' },

      { offsetDays: 4, presetId: 'A' }, // 4 days ago
      { offsetDays: 3, presetId: 'B' },
      { offsetDays: 1, presetId: 'C' }  // yesterday
    ] as const;

    schedule.forEach((sched) => {
      const preset = WORKOUT_PRESETS.find(p => p.id === sched.presetId);
      if (!preset) return;

      const weekNumber = 4 - Math.floor(sched.offsetDays / 7); // Week 1, 2, 3 or 4
      const sessionDate = new Date();
      sessionDate.setDate(now.getDate() - sched.offsetDays);
      sessionDate.setHours(18, 0, 0, 0);

      const exercises: ExerciseLog[] = preset.exercises.map(ex => {
        const config = exerciseConfig[ex.id] || { baseWeight: 15, weightIncrementPerWeek: 1, reps: 10 };
        // compute progressive weight
        const progressWeight = config.baseWeight + (weekNumber - 1) * config.weightIncrementPerWeek;
        
        // build sets
        const sets: SetLog[] = [];
        for (let s = 1; s <= ex.defaultSets; s++) {
          sets.push({
            setNumber: s,
            // add subtle variation to set weights (pyramid or fatigue)
            weight: progressWeight + (s > 2 ? -2.5 : 0),
            reps: config.reps + (s > 2 ? -1 : 0),
            completed: true
          });
        }

        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets
        };
      });

      sampleHistory.push({
        id: `sample_${sched.presetId}_${sched.offsetDays}`,
        presetId: sched.presetId,
        workoutTitle: preset.title,
        date: sessionDate.toISOString(),
        durationSeconds: 2700 + Math.floor(Math.random() * 900), // ~45 to 60 mins
        exercises
      });
    });

    // Sort descending (latest first)
    sampleHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(sampleHistory);
  };

  return (
    <WorkoutContext.Provider
      value={{
        history,
        activeSession,
        activeSessionStartTime,
        reminders,
        addSession,
        deleteSession,
        startSession,
        updateSetLog,
        addSetToActiveExercise,
        removeLastSetFromActiveExercise,
        finishSession,
        cancelSession,
        getMuscleRecoveryStatus,
        getExerciseHistory,
        remindersEnabled,
        setRemindersEnabled,
        updateReminder,
        generateSampleHistory,
        clearAllData,
        currentUser,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
