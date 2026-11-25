import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../app/store";
import { nextDomain, previousDomain, toggleStatement, loadFormForStudent } from "../../features/assessment/store/formSlice";
import { saveFormDataForStudent } from "../../features/students/utils/studentUtils";
import "./FormPage.css";
import SubDomainGroup from "../../components/SubDomainGroup";

// טוענים את כל מבנה ההיגדים
import formData from "../../features/assessment/data/formData.json";
function FormPage() {
    const dispatch = useDispatch();

    // השליפה מה־store
    const domainIndex = useSelector((state: RootState) => state.form.domainIndex);
    const selections = useSelector((state: RootState) => state.form.selections);
    const { selectedStudentId, allStudents } = useSelector((state: RootState) => state.students);

    // בדיקה שיש תלמיד נבחר
    const selectedStudent = allStudents.find(student => student.id === selectedStudentId);
    const studentName = selectedStudent?.name || 'תלמיד לא זוהה';

    const currentDomain = formData[domainIndex];
    const totalDomains = formData.length;

    // גלילה לראש הדף כאשר הדומיין משתנה
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [domainIndex]);

    // שמירה אוטומטית של נתוני הטופס כאשר יש שינויים
    useEffect(() => {
        if (selectedStudentId && Object.keys(selections).length > 0) {
            saveFormDataForStudent(selectedStudentId, selections);

            if (import.meta.env.MODE === "development") {
                console.log(`💾 Auto-saved form for student ${selectedStudentId}`);
            }
        }
    }, [selections, selectedStudentId]);

    // טען נתונים כשנבחר תלמיד
    useEffect(() => {
        if (selectedStudentId) {
            dispatch(loadFormForStudent(selectedStudentId));
        }
    }, [selectedStudentId, dispatch]);

    // אם אין תלמיד נבחר, הצג הודעת שגיאה
    if (!selectedStudentId) {
        return (
            <div className="form-page-error">
                <h2>לא נבחר תלמיד</h2>
                <p>אנא חזור לדף הבית ובחר תלמיד לפני תחילת ההערכה</p>
            </div>
        );
    }

    const handleStatementToggle = (_statementId: string, statementText: string, type: "strength" | "weakness", subDomainId: string) => {
        dispatch(toggleStatement({
            domainId: currentDomain.id,
            subDomainId,
            statementText,
            type,
        }));
    };

    const handleNext = () => {
        if (domainIndex < totalDomains - 1) {
            dispatch(nextDomain());
        }
    };

    const handlePrevious = () => {
        if (domainIndex > 0) {
            dispatch(previousDomain());
        }
    };

    return (
        <div className="form-page">
            {/* שורת התקדמות */}
            <div className="progress-bar">
                <div className="progress-steps">
                    {Array.from({ length: totalDomains }, (_, progressStepIndex) => (
                        <div
                            key={progressStepIndex}
                            className={`progress-step ${progressStepIndex < domainIndex ? 'completed' :
                                progressStepIndex === domainIndex ? 'active' : 'pending'
                                }`}
                        >
                            <span className="step-number">{progressStepIndex + 1}</span>
                        </div>
                    ))}
                </div>
                <div className="progress-fill" style={{ width: `${((domainIndex + 1) / totalDomains) * 100}%` }}></div>
            </div>

            {/* כותרת הדף */}
            <div className="form-header">
                <h1 className="domain-title">הערכת TALLA - {studentName}</h1>
                <h2 className="domain-subtitle">{currentDomain.name}</h2>
                <div className="form-meta">
                    <span className="domain-counter">תחום {domainIndex + 1} מתוך {totalDomains}</span>
                    <span className="completion-percent">
                        {Math.round(((domainIndex + 1) / totalDomains) * 100)}% הושלם
                    </span>
                </div>
                <p className="form-description">
                    אנא סמן את ההיגדים הרלוונטיים לכל תת-תחום.
                    ניתן לבחור מספר היגדים בכל קטגוריה.
                </p>
            </div>

            {/* תוכן הטופס */}
            <div className="form-content">
                {currentDomain.subDomains.map((subDomain) => (
                    <SubDomainGroup
                        key={subDomain.id}
                        domainId={currentDomain.id}
                        subDomainId={subDomain.id}
                        name={subDomain.name}
                        statements={{
                            strengths: subDomain.statements.filter(statement => statement.type === "strength"),
                            weaknesses: subDomain.statements.filter(statement => statement.type === "weakness")
                        }}
                        selections={selections}
                        onStatementSelect={(statementId, statementText, type) =>
                            handleStatementToggle(statementId, statementText, type, subDomain.id)
                        }
                    />
                ))}
            </div>

            {/* כפתורי ניווט */}
            <div className="form-navigation">
                <div className="nav-buttons">
                    {domainIndex > 0 && (
                        <button
                            className="btn btn-secondary btn-back"
                            onClick={handlePrevious}
                        >
                            <span className="btn-icon">←</span>
                            אחורה
                        </button>
                    )}

                    <div className="nav-spacer"></div>

                    {domainIndex < totalDomains - 1 ? (
                        <button
                            className="btn btn-primary btn-next"
                            onClick={handleNext}
                        >
                            הבא
                            <span className="btn-icon">→</span>
                        </button>
                    ) : (
                        <button
                            className="btn btn-success btn-submit"
                            onClick={() => {
                                if (selectedStudentId) {
                                    saveFormDataForStudent(selectedStudentId, selections);
                                    alert("הטופס הושלם ונשמר בהצלחה!");
                                }
                            }}
                        >
                            <span className="btn-icon">✓</span>
                            סיום ושליחה
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FormPage;

