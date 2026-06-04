export type MuscleGroup =
  | 'Peito'
  | 'Ombro'
  | 'Quadríceps'
  | 'Posterior de Coxa'
  | 'Costas'
  | 'Posterior de Ombro'
  | 'Panturrilha'
  | 'Abdômen'
  | 'Bíceps'
  | 'Tríceps'
  | 'Antebraço';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: string;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutPreset {
  id: 'A' | 'B' | 'C' | 'D';
  title: string;
  subtitle: string;
  exercises: Exercise[];
  recoveryTip?: string;
}

export interface SetLog {
  setNumber: number;
  weight: number; // in kg
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string; // unique identifier (uuid or timestamp)
  presetId: 'A' | 'B' | 'C' | 'D';
  workoutTitle: string;
  date: string; // ISO date string (YYYY-MM-DDTHH:MM:SS)
  durationSeconds: number;
  exercises: ExerciseLog[];
  photoUrl?: string; // Base64 data-URI of the progress photo
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface MuscleRecovery {
  group: MuscleGroup;
  lastTrained: string | null; // ISO date string
  recoveryProgress: number; // 0 to 100
  status: 'Recuperado' | 'Em Recuperação' | 'Fadigado';
}

export interface WorkoutReminder {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  time: string; // "HH:MM"
  active: boolean;
}
