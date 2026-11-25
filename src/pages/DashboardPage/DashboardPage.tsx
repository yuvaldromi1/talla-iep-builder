import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { setStudentName, resetForm, loadFormSelections } from '../../features/assessment/store/formSlice';
import { selectStudent, addStudent } from '../../features/students/store/studentsSlice';
import { StudentSelector } from '../../components/StudentSelector';
import { getFormDataForStudent, getStudentStatus } from '../../features/students/utils/studentUtils';
import type { RootState } from '../../app/store';
import type { Student } from '../../features/students/models/types';
import './DashboardPage.css';

function DashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');

    // Redux selectors
    const isCompleted = useSelector((state: RootState) => state.form.isCompleted);
    const { selectedStudentId, allStudents } = useSelector((state: RootState) => state.students);

    const selectedStudent = allStudents.find(student => student.id === selectedStudentId);

    // טעינת נתוני תלמיד כשנבחר תלמיד
    const handleStudentSelected = (student: Student | null) => {
        if (student) {
            dispatch(selectStudent(student.id));
            dispatch(setStudentName(student.name));

            // טעינת נתוני הטופס של התלמיד
            const formData = getFormDataForStudent(student.id);
            dispatch(loadFormSelections(formData));
        } else {
            dispatch(selectStudent(''));
            dispatch(setStudentName(''));
            dispatch(resetForm());
        }
    };

    const handleStartAssessment = () => {
        if (selectedStudent) {
            navigate('/form');
        }
    };

    const handleViewResults = () => {
        navigate('/results');
    };

    const handleNewAssessment = () => {
        dispatch(resetForm());
        if (selectedStudent) {
            // אפס רק את נתוני הטופס, לא את בחירת התלמיד
            const emptyForm = {};
            dispatch(loadFormSelections(emptyForm));
        }
    };

    const handleAddStudent = () => {
        if (!newStudentName.trim()) {
            alert('נא להזין שם תלמיד');
            return;
        }

        // הוספת התלמיד החדש
        dispatch(addStudent({ name: newStudentName.trim() }));

        console.log('✅ Student added:', newStudentName);

        // איפוס הטופס
        setNewStudentName('');
        setShowAddStudent(false);

        alert(`התלמיד "${newStudentName}" נוסף בהצלחה!`);
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* כותרת ראשית */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        <span className="title-icon">🎯</span>
                        מערכת הערכה תל"א
                    </h1>
                    <p className="dashboard-subtitle">
                        כלי מקצועי להערכת כישורים אקדמיים ותפקודיים
                    </p>
                </div>

                {/* כרטיס בחירת תלמיד */}
                <div className="student-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="card-icon">👥</span>
                            בחירת תלמיד
                        </h2>
                        <button
                            className="btn btn-add-student"
                            onClick={() => setShowAddStudent(!showAddStudent)}
                        >
                            <span className="btn-icon">+</span>
                            {showAddStudent ? 'ביטול' : 'הוסף תלמיד חדש'}
                        </button>
                    </div>

                    {/* טופס הוספת תלמיד */}
                    {showAddStudent && (
                        <div className="add-student-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="שם התלמיד..."
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddStudent();
                                        }
                                    }}
                                    autoFocus
                                />
                                <button
                                    className="btn btn-success"
                                    onClick={handleAddStudent}
                                >
                                    <span className="btn-icon">✓</span>
                                    שמור
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="card-content">
                        <StudentSelector
                            onStudentSelected={handleStudentSelected}
                            placeholder="בחר/י תלמיד מהרשימה או הוסף/י חדש..."
                        />

                        {selectedStudent && (
                            <div className="selected-student-info">
                                <div className="student-details">
                                    <span className="detail-label">תלמיד נבחר:</span>
                                    <span className="detail-value">{selectedStudent.name}</span>
                                </div>

                                <div className="student-status">
                                    <span className="status-label">מצב הטופס:</span>
                                    <span className={`status-value status-${getStudentStatus(selectedStudent)}`}>
                                        {getStudentStatus(selectedStudent) === 'completed' && '🟢 הושלם'}
                                        {getStudentStatus(selectedStudent) === 'in-progress' && `🟡 בתהליך (${selectedStudent.progress}%)`}
                                        {getStudentStatus(selectedStudent) === 'not-started' && '🔴 לא התחיל'}
                                    </span>
                                </div>

                                {selectedStudent.lastModified && (
                                    <div className="last-updated">
                                        <span className="update-label">עודכן לאחרונה:</span>
                                        <span className="update-value">
                                            {new Date(selectedStudent.lastModified).toLocaleDateString('he-IL')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* כפתורי פעולה */}
                <div className="action-buttons">
                    {selectedStudent ? (
                        <>
                            {!isCompleted ? (
                                <button
                                    onClick={handleStartAssessment}
                                    className="action-btn primary-btn"
                                >
                                    <span className="btn-icon">📋</span>
                                    {selectedStudent.progress > 0 ? 'המשך הערכה' : 'התחל הערכה חדשה'}
                                </button>
                            ) : (
                                <div className="completed-actions">
                                    <button
                                        onClick={handleViewResults}
                                        className="action-btn results-btn"
                                    >
                                        <span className="btn-icon">📊</span>
                                        צפה בתוצאות
                                    </button>

                                    <button
                                        onClick={handleNewAssessment}
                                        className="action-btn new-btn"
                                    >
                                        <span className="btn-icon">🔄</span>
                                        הערכה חדשה
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-student-selected">
                            <p className="no-student-message">
                                <span className="message-icon">👆</span>
                                יש לבחור תלמיד כדי להתחיל הערכה
                            </p>
                        </div>
                    )}
                </div>

                {/* סטטיסטיקות מהירות */}
                <div className="quick-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-content">
                            <div className="stat-number">7 × 3</div>
                            <div className="stat-label">שבעה תחומי על ובתוכם עשרים ואחת  תתי תחומים להערכה</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                            <div className="stat-number">45-60</div>
                            <div className="stat-label">דקות להשלמה</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">דיוק מקצועי</div>
                        </div>
                    </div>
                </div>

                {/* הוראות שימוש */}
                <div className="instructions-card">
                    <h3 className="instructions-title">איך זה עובד?</h3>
                    <ol className="instructions-list">
                        <li>הכנס/י את שם התלמיד/ת</li>
                        <li>לחץ/י על "התחל הערכה חדשה"</li>
                        <li>עבור/י על שבעת תחומי ההערכה</li>
                        <li>סמן/י את ההיגדים הרלוונטיים</li>
                        <li>קבל/י דוח מפורט עם התוצאות</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
