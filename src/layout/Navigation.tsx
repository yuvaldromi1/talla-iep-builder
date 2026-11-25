import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import '../assets/styles/components/Navigation.css'

const Navigation: React.FC = () => {
    const location = useLocation()
    const { selectedStudentId, allStudents } = useSelector((state: RootState) => state.students)

    const selectedStudent = allStudents.find(student => student.id === selectedStudentId)

    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="navigation">
            <div className="nav-brand">
                <h1>TALLA Assessment</h1>
            </div>

            <div className="nav-links">
                <Link
                    to="/dashboard"
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                    <span className="nav-icon">🏠</span>
                    דף ראשי
                </Link>

                <Link
                    to="/form"
                    className={`nav-link ${isActive('/form') ? 'active' : ''}`}
                >
                    <span className="nav-icon">📝</span>
                    טופס הערכה
                </Link>

                <Link
                    to="/results"
                    className={`nav-link ${isActive('/results') ? 'active' : ''}`}
                >
                    <span className="nav-icon">📊</span>
                    תוצאות
                </Link>

                <Link
                    to="/reports"
                    className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                >
                    <span className="nav-icon">📋</span>
                    דוחות
                </Link>
            </div>

            {selectedStudent && (
                <div className="selected-student">
                    <span className="student-label">תלמיד נבחר:</span>
                    <span className="student-name">{selectedStudent.name}</span>
                </div>
            )}
        </nav>
    )
}

export default Navigation