import { configureStore } from '@reduxjs/toolkit'
import formReducer from '../features/assessment/store/formSlice'
import studentsReducer from '../features/students/store/studentsSlice'

export const store = configureStore({
    reducer: {
        form: formReducer,
        students: studentsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
