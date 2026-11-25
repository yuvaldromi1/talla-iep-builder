// src/features/students/studentsSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Student, StudentsState } from '../models/types';
import { getAllStudents, saveStudent, deleteStudent } from '../utils/studentUtils';

const initialState: StudentsState = {
    allStudents: [],
    selectedStudentId: null,
    isLoading: false,
    error: null,
};

const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        loadStudents: (state) => {
            state.isLoading = true;
            state.error = null;
            try {
                state.allStudents = getAllStudents();
                state.isLoading = false;
            } catch {
                state.error = 'שגיאה בטעינת רשימת התלמידים';
                state.isLoading = false;
            }
        },

        addStudent: (state, action: PayloadAction<{ name: string; id?: string }>) => {
            const newStudent: Student = {
                id: action.payload.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: action.payload.name,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                isCompleted: false,
                progress: 0,
            };

            try {
                saveStudent(newStudent);
                state.allStudents.push(newStudent);
                state.selectedStudentId = newStudent.id;
                state.error = null;
            } catch {
                state.error = 'שגיאה בהוספת תלמיד חדש';
            }
        },

        selectStudent: (state, action: PayloadAction<string>) => {
            state.selectedStudentId = action.payload;
            state.error = null;
        },

        updateStudent: (state, action: PayloadAction<Student>) => {
            const index = state.allStudents.findIndex(student => student.id === action.payload.id);
            if (index >= 0) {
                try {
                    const updatedStudent = { ...action.payload, lastModified: new Date().toISOString() };
                    saveStudent(updatedStudent);
                    state.allStudents[index] = updatedStudent;
                    state.error = null;
                } catch {
                    state.error = 'שגיאה בעדכון פרטי התלמיד';
                }
            }
        },

        removeStudent: (state, action: PayloadAction<string>) => {
            try {
                deleteStudent(action.payload);
                state.allStudents = state.allStudents.filter(student => student.id !== action.payload);
                if (state.selectedStudentId === action.payload) {
                    state.selectedStudentId = null;
                }
                state.error = null;
            } catch {
                state.error = 'שגיאה במחיקת התלמיד';
            }
        },

        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    loadStudents,
    addStudent,
    selectStudent,
    updateStudent,
    removeStudent,
    clearError,
} = studentsSlice.actions;

export default studentsSlice.reducer;