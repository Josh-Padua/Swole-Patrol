export interface Exercise {
    id: string;
    name: string;
    force: string | null;
    level: string;
    mechanic: string | null;
    equipment: string | null;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    instructions: string[];
    category: string;
    isCustom: boolean;
}

export interface Set {
    weight: number;
    reps: number;
}

export interface WorkoutExercise {
    id: number;
    name: string;
    exercise: Exercise;
    helpShown: boolean;
    sets: Set[];
}

export interface WorkoutTemplate {
    name: string;
    description: string;
    exercises: ExerciseTemplate[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ExerciseTemplate {
    id: string;
    sets: number;
}