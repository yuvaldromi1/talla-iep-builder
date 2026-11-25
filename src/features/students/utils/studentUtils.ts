// src/features/students/studentUtils.ts

import type { Student } from '../models/types';
import type { AssessmentResultsByDomain } from '../../assessment/models/types';

const STUDENTS_KEY = 'talla-students';
const FORM_PREFIX = 'form_';

// ניהול רשימת תלמידים
export const getAllStudents = (): Student[] => {
    try {
        const studentsData = localStorage.getItem(STUDENTS_KEY);
        const students = studentsData ? JSON.parse(studentsData) : [];
        return students;
    } catch (error) {
        console.error('Error loading students:', error);
        return [];
    }
};

export const saveStudent = (student: Student): void => {
    try {
        const students = getAllStudents();
        const existingIndex = students.findIndex(existingStudent => existingStudent.id === student.id);

        if (existingIndex >= 0) {
            students[existingIndex] = { ...student, lastModified: new Date().toISOString() };
        } else {
            students.push(student);
        }

        localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (error) {
        console.error('Error saving student:', error);
    }
};

export const deleteStudent = (studentId: string): void => {
    try {
        const students = getAllStudents().filter(student => student.id !== studentId);
        localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

        // מחיקת נתוני הטופס
        localStorage.removeItem(`${FORM_PREFIX}${studentId}`);
    } catch (error) {
        console.error('Error deleting student:', error);
    }
};

// ניהול נתוני טופס
export const getFormDataForStudent = (studentId: string): AssessmentResultsByDomain => {
    try {
        const formKey = `${FORM_PREFIX}${studentId}`;
        const formData = localStorage.getItem(formKey);
        const parsedData = formData ? JSON.parse(formData) : {};
        
        if (import.meta.env.MODE === "development") {
            console.log(`📂 Loading form data for student ${studentId}:`, parsedData);
        }
        
        return parsedData;
    } catch (error) {
        console.error('Error loading form data:', error);
        return {};
    }
};

export const saveFormDataForStudent = (
    studentId: string,
    formData: AssessmentResultsByDomain
): void => {
    try {
        const formKey = `${FORM_PREFIX}${studentId}`;
        localStorage.setItem(formKey, JSON.stringify(formData));

        if (import.meta.env.MODE === "development") {
            console.log(`✅ Saved form data for student ${studentId}:`, formData);
        }

        // עדכון progress של התלמיד
        updateStudentProgress(studentId, calculateProgress(formData));
    } catch (error) {
        console.error('Error saving form data:', error);
    }
};

// חישוב אחוז השלמה
const calculateProgress = (formData: AssessmentResultsByDomain): number => {
    const totalDomains = 10; // מספר תחומים בטופס
    const completedDomains = Object.keys(formData).length;
    return Math.round((completedDomains / totalDomains) * 100);
};

// עדכון progress
const updateStudentProgress = (studentId: string, progress: number): void => {
    const students = getAllStudents();
    const studentIndex = students.findIndex(student => student.id === studentId);

    if (studentIndex >= 0) {
        students[studentIndex].progress = progress;
        students[studentIndex].isCompleted = progress === 100;
        students[studentIndex].lastModified = new Date().toISOString();

        localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    }
};

// יצירת ID ייחודי לתלמיד
export const generateStudentId = (): string => {
    return `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// בדיקת סטטוס תלמיד
export const getStudentStatus = (student: Student): 'not-started' | 'in-progress' | 'completed' => {
    if (student.progress === 0) return 'not-started';
    if (student.progress === 100) return 'completed';
    return 'in-progress';
};