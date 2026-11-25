import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import FormPage from '../pages/FormPage/FormPage'
import ResultsPage from '../pages/ResultsPage/ResultsPage'
import ReportsPage from '../pages/ReportsPage/ReportsPage'

const Router: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default Router