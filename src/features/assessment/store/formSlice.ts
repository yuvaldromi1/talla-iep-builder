import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AssessmentResultsByDomain } from "../models/types";
import formData from "../data/formData.json";

// בונה שלד ריק לכל הדומיינים
function buildEmptySelections(): AssessmentResultsByDomain {
    const selections: AssessmentResultsByDomain = {};

    formData.forEach(domain => {
        selections[domain.id] = {};

        // צור מבנה לכל sub-domain
        domain.subDomains.forEach(subDomain => {
            selections[domain.id][subDomain.id] = {
                strengths: [],
                weaknesses: []
            };
        });
    });

    return selections;
}

interface FormState {
    domainIndex: number; // באיזה תחום-על אנחנו נמצאים כרגע
    selections: AssessmentResultsByDomain; // בחירות checkbox
    loadedFromPersist: boolean; // האם שוחזר משמירה
    studentName: string; // שם התלמיד
    isCompleted: boolean; // האם ההערכה הושלמה
}

const initialState: FormState = {
    domainIndex: 0,
    selections: buildEmptySelections(),
    loadedFromPersist: false,
    studentName: '',
    isCompleted: false
};


const formSlice = createSlice({
    name: "form",
    initialState,
    reducers: {
        nextDomain: (state) => {
            if (state.domainIndex < formData.length - 1) {
                state.domainIndex += 1;
            }
        },

        previousDomain: (state) => {
            if (state.domainIndex > 0) {
                state.domainIndex -= 1;
            }
        },

        setDomainIndex(state, action: PayloadAction<number>) {
            state.domainIndex = action.payload;
        },

        toggleStatement: (state, action: PayloadAction<{
            domainId: string;
            subDomainId: string;
            statementText: string;
            type: "strength" | "weakness";
        }>) => {
            const { domainId, subDomainId, statementText, type } = action.payload;

            // וודא שהדומיין קיים
            if (!state.selections[domainId]) {
                state.selections[domainId] = {};
            }

            // וודא שה-sub-domain קיים
            if (!state.selections[domainId][subDomainId]) {
                state.selections[domainId][subDomainId] = { strengths: [], weaknesses: [] };
            }

            const targetArray = type === 'strength'
                ? state.selections[domainId][subDomainId].strengths
                : state.selections[domainId][subDomainId].weaknesses;

            const existingIndex = targetArray.findIndex(text => text === statementText);

            if (existingIndex >= 0) {
                // הסר אם כבר קיים
                targetArray.splice(existingIndex, 1);
            } else {
                // הוסף אם לא קיים
                targetArray.push(statementText);
            }
        },

        updateSelection: () => {
            // Deprecated - use toggleStatement instead
        },

        saveDomain(state) {
            if (state.domainIndex < formData.length - 1) {
                state.domainIndex += 1;
            }
        },

        setStudentName: (state, action: PayloadAction<string>) => {
            state.studentName = action.payload;
        },

        resetForm: (state) => {
            state.domainIndex = 0;
            state.selections = buildEmptySelections();
            state.studentName = '';
            state.isCompleted = false;
        },

        completeForm: (state) => {
            state.isCompleted = true;
        },

        loadFormForStudent: (state, action: PayloadAction<string>) => {
            const studentId = action.payload;
            // איפוס לתחילה
            state.domainIndex = 0;
            state.selections = buildEmptySelections();
            state.isCompleted = false;

            // ניסיון טעינה של נתונים שמורים מ-localStorage
            try {
                const savedData = localStorage.getItem(`form_${studentId}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    state.selections = { ...state.selections, ...parsedData };
                }
            } catch (error) {
                console.error('Error loading form data from localStorage:', error);
            }
        },

        loadFormSelections: (state, action: PayloadAction<AssessmentResultsByDomain>) => {
            state.selections = action.payload;
            // חישוב אחוז השלמה - בדיקה בטוחה
            const completedDomains = Object.keys(action.payload).filter(domainId => {
                const domain = action.payload[domainId];
                // בדיקה אם זה המבנה החדש (מקונן) או הישן (שטוח)
                if (!domain || typeof domain !== 'object') return false;

                // בדיקה אם יש sub-domains
                const subDomainKeys = Object.keys(domain);
                if (subDomainKeys.length === 0) return false;

                return subDomainKeys.some(key => {
                    const subDomain = domain[key];
                    // בדיקה בטוחה שה-subDomain קיים ויש לו את המאפיינים הנכונים
                    if (!subDomain || typeof subDomain !== 'object') return false;
                    if (!('strengths' in subDomain) || !('weaknesses' in subDomain)) return false;
                    if (!Array.isArray(subDomain.strengths) || !Array.isArray(subDomain.weaknesses)) return false;

                    return subDomain.strengths.length > 0 || subDomain.weaknesses.length > 0;
                });
            }).length;
            const totalDomains = Object.keys(state.selections).length;
            state.isCompleted = completedDomains === totalDomains && completedDomains > 0;
        }
    }
});

export const {
    nextDomain,
    previousDomain,
    setDomainIndex,
    toggleStatement,
    updateSelection,
    saveDomain,
    setStudentName,
    resetForm,
    completeForm,
    loadFormForStudent,
    loadFormSelections
} = formSlice.actions;

export default formSlice.reducer;