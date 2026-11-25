// src/features/students/types.ts

export interface Student {
    id: string;
    name: string;
    createdAt: string;
    lastModified: string;
    isCompleted: boolean;
    progress: number; // 0-100
}

export interface StudentsState {
    allStudents: Student[];
    selectedStudentId: string | null;
    isLoading: boolean;
    error: string | null;
}

export type StudentStatus = 'not-started' | 'in-progress' | 'completed' | 'has-results';