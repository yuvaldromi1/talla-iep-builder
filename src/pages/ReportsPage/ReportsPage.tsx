// src/pages/ReportsPage/ReportsPage.tsx

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { generateAnalysisData, validateFormData } from '../../features/assessment/analyzer/reportAnalyzer';
import type { RootState } from '../../app/store';
import type { ReportAnalysisData } from '../../features/assessment/analyzer/reportAnalyzer';
import { getFormDataForStudent } from '../../features/students/utils/studentUtils';
import TopThreeChart from '../../components/charts/TopThreeChart/TopThreeChart';

import './ReportsPage.css';



function ReportsPage() {
    const [generatedReport, setGeneratedReport] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string>('');
    const [chartData, setChartData] = useState<ReportAnalysisData | null>(null);

    const { selectedStudentId, allStudents } = useSelector((state: RootState) => state.students);

    const selectedStudent = allStudents.find(student => student.id === selectedStudentId);
    const studentName = selectedStudent?.name || 'תלמיד לא זוהה';

    // טעינת נתוני הטופס והכנת הגרפים
    useEffect(() => {
        if (selectedStudentId) {
            try {
                // טען נתוני הטופס
                const formData = getFormDataForStudent(selectedStudentId);

                if (!validateFormData(formData)) {
                    setError('אין נתוני הערכה לתלמיד זה. אנא השלם את הטופס תחילה.');
                    setChartData(null);
                    return;
                }

                // הכן נתונים לגרפים
                const analysisData = generateAnalysisData(studentName, formData);

                setChartData(analysisData);
                setError('');

            } catch (err) {
                console.error('❌ Error loading chart data:', err);
                setError('שגיאה בטעינת נתוני הגרפים: ' + (err as Error).message);
                setChartData(null);
            }
        }
    }, [selectedStudentId, studentName]);

    // פונקציות עזר לעיבוד הנתונים
    const getTopSubDomainsForStrengths = () => {
        if (!chartData) return [];

        const allStrengthSubDomains = chartData.domainAnalysis.flatMap(domain =>
            domain.strongestSubDomains.map(subDomain => ({
                subDomainName: subDomain.name,
                domainName: domain.domainName,
                strengthCount: subDomain.score,
                subDomainId: subDomain.id
            }))
        );

        return allStrengthSubDomains
            .sort((a, b) => b.strengthCount - a.strengthCount)
            .slice(0, 5);
    };

    const getTopSubDomainsForWeaknesses = () => {
        if (!chartData) return [];

        const allWeaknessSubDomains = chartData.domainAnalysis.flatMap(domain =>
            domain.weakestSubDomains.map(subDomain => ({
                subDomainName: subDomain.name,
                domainName: domain.domainName,
                weaknessCount: subDomain.score,
                subDomainId: subDomain.id
            }))
        );

        return allWeaknessSubDomains
            .sort((a, b) => b.weaknessCount - a.weaknessCount)
            .slice(0, 5);
    };

    // פונקציות חדשות לחילוץ נתונים לפי תחומי-על
    const getTopDomainsForStrengths = () => {
        if (!chartData) return [];

        return chartData.domainAnalysis
            .filter(domain => domain.strengthsCount > 0)
            .sort((a, b) => b.strengthsCount - a.strengthsCount)
            .slice(0, 5)
            .map(domain => ({
                subDomainName: domain.domainName,
                domainName: domain.domainName,
                strengthCount: domain.strengthsCount,
                subDomainId: domain.domainId
            }));
    };

    const getTopDomainsForWeaknesses = () => {
        if (!chartData) return [];

        return chartData.domainAnalysis
            .filter(domain => domain.weaknessesCount > 0)
            .sort((a, b) => b.weaknessesCount - a.weaknessesCount)
            .slice(0, 5)
            .map(domain => ({
                subDomainName: domain.domainName,
                domainName: domain.domainName,
                weaknessCount: domain.weaknessesCount,
                subDomainId: domain.domainId
            }));
    };

    const handleGenerateReport = async () => {
        if (!selectedStudentId || !chartData) {
            setError('אין נתוני הערכה זמינים לתלמיד זה');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            // 1. טען את נתוני הטופס
            const formData = getFormDataForStudent(selectedStudentId);

            if (!formData) {
                throw new Error('לא נמצאו נתונים עבור תלמיד זה');
            }

            // 2. שלח ל-API
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            console.log('📦 Sending to server:', {
                studentName: studentName,
                hasChartData: !!chartData,
                hasDomainAnalysis: !!chartData?.domainAnalysis,
                hasFormSelections: !!formData
            });

            const payload = {
                studentName: studentName,
                analysisData: chartData, // ✅ השתמש ב-chartData שכבר מכיל domainAnalysis
                formSelections: formData
            };

            const response = await fetch(`${apiUrl}/api/generate-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ Server error:', errorData);
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setGeneratedReport(data.report);

            // שמור את הדוח
            localStorage.setItem(`talla-report-${selectedStudentId}`, JSON.stringify({
                studentId: selectedStudentId,
                report: data.report,
                generatedAt: new Date().toISOString()
            }));

            alert('הדוח נוצר בהצלחה! ✅');

        } catch (err) {
            console.error('❌ Error generating report:', err);
            const errorMessage = err instanceof Error ? err.message : 'שגיאה בלתי צפויה';
            setError('שגיאה ביצירת הדוח: ' + errorMessage);
            alert(`שגיאה: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrintReport = () => {
        window.print();
    };

    const handleDownloadReport = () => {
        if (!generatedReport) return;

        const blob = new Blob([generatedReport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `דוח_עומק_${studentName}_${new Date().toLocaleDateString('he-IL')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const canGenerateReport = selectedStudent && chartData;

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1 className="reports-title">
                    <span className="title-icon">📋</span>
                    פרופיל עומק - {studentName}
                </h1>
                <p className="reports-subtitle">
                    דוח מקצועי מקיף המבוסס על ניתוח נתוני ההערכה באמצעות בינה מלאכותית
                </p>
            </div>

            {!selectedStudent && (
                <div className="no-student-warning">
                    <div className="warning-icon">⚠️</div>
                    <h3>לא נבחר תלמיד</h3>
                    <p>יש לבחור תלמיד מהדף הראשי כדי ליצור דוח עומק</p>
                </div>
            )}

            {selectedStudent && !chartData && (
                <div className="no-data-warning">
                    <div className="warning-icon">📝</div>
                    <h3>אין מספיק נתוני הערכה</h3>
                    <p>יש להשלים את טופס ההערכה של {studentName} כדי ליצור דוח עומק</p>
                </div>
            )}

            {canGenerateReport && (
                <div className="report-controls">
                    <button
                        className="generate-report-btn"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <span className="loading-spinner"></span>
                                מייצר דוח עומק...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">🧠</span>
                                הפק דוח עומק
                            </>
                        )}
                    </button>

                    {generatedReport && (
                        <div className="report-actions">
                            <button className="action-btn print-btn" onClick={handlePrintReport}>
                                <span className="btn-icon">🖨️</span>
                                הדפס דוח
                            </button>
                            <button className="action-btn download-btn" onClick={handleDownloadReport}>
                                <span className="btn-icon">💾</span>
                                הורד דוח
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="error-message">
                    <div className="error-icon">❌</div>
                    <p>{error}</p>
                </div>
            )}

            {/* תצוגת גרפים */}
            {chartData && (
                <>
                    {/* סקשן חדש - תחומי-על */}
                    <div className="charts-section">
                        <h2 className="section-title">ניתוח לפי תחומי-על</h2>
                        <p className="section-description">
                            התפלגות חוזקות וחולשות לפי 7 תחומי ההתפתחות המרכזיים
                        </p>

                        <div className="chart-row">
                            <div className="chart-container">
                                <h3 className="chart-title">תחומי-על מובילים בכוח</h3>
                                {getTopDomainsForStrengths().length > 0 ? (
                                    <TopThreeChart
                                        data={getTopDomainsForStrengths()}
                                        mode="strengths"
                                        title="חוזקות לפי תחומים"
                                    />
                                ) : (
                                    <p className="no-data">אין נתונים זמינים</p>
                                )}
                            </div>

                            <div className="chart-container">
                                <h3 className="chart-title">תחומי-על מובילים בקושי</h3>
                                {getTopDomainsForWeaknesses().length > 0 ? (
                                    <TopThreeChart
                                        data={getTopDomainsForWeaknesses()}
                                        mode="weaknesses"
                                        title="חולשות לפי תחומים"
                                    />
                                ) : (
                                    <p className="no-data">אין נתונים זמינים</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* סקשן קיים - תת-תחומים */}
                    <div className="charts-section">
                        <h2 className="section-title">ניתוח מפורט לפי תת-תחומים</h2>
                        <p className="section-description">
                            זיהוי תת-התחומים הספציפיים עם החוזקות והחולשות הבולטות ביותר
                        </p>

                        <div className="chart-row">
                            <div className="chart-container">
                                <h3 className="chart-title">תת-תחומים מובילים בכוח</h3>
                                {getTopSubDomainsForStrengths().length > 0 ? (
                                    <TopThreeChart
                                        data={getTopSubDomainsForStrengths()}
                                        mode="strengths"
                                        title="חוזקות לפי תת-תחומים"
                                    />
                                ) : (
                                    <p className="no-data">אין נתונים זמינים</p>
                                )}
                            </div>

                            <div className="chart-container">
                                <h3 className="chart-title">תת-תחומים מובילים בקושי ליבתי</h3>
                                {getTopSubDomainsForWeaknesses().length > 0 ? (
                                    <TopThreeChart
                                        data={getTopSubDomainsForWeaknesses()}
                                        mode="weaknesses"
                                        title="חולשות לפי תת-תחומים"
                                    />
                                ) : (
                                    <p className="no-data">אין נתונים זמינים</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {generatedReport && (
                <div className="report-content">
                    <div className="report-header">
                        <h2 className="report-main-title">פרופיל תל״א - {studentName}</h2>
                        <div className="report-metadata">
                            <span className="report-date">
                                נוצר בתאריך: {new Date().toLocaleDateString('he-IL')}
                            </span>
                            <span className="report-generated-by">
                                נוצר באמצעות מערכת ניתוח TALLA
                            </span>
                        </div>
                    </div>

                    <div className="report-body">
                        <div className="report-text">
                            {generatedReport.split('\n').map((paragraph, index) => (
                                <p key={index} className={`report-paragraph ${paragraph.trim().length === 0 ? 'empty' : ''}`}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



export default ReportsPage;