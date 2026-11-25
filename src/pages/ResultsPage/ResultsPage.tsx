// src/pages/ResultsPage.tsx

import { useSelector } from "react-redux";
import { useMemo } from "react";
import StrengthChart from "../../components/charts/StrengthChart/StrengthChart";
import WeaknessChart from "../../components/charts/WeaknessChart/WeaknessChart";
import TopThreeChart from "../../components/charts/TopThreeChart/TopThreeChart";
import { CoreDomainChart } from "../../components/charts/CoreDomainChart/CoreDomainChart";
import { TopCoreSubDomainsChart } from "../../components/charts/TopCoreSubDomainsChart/TopCoreSubDomainsChart";

import { analyzeResults } from "../../features/assessment/analyzer/analyzer";
import { normalizeAssessment } from "../../features/assessment/analyzer/normalizeAssessment";
import formData from "../../features/assessment/data/formData.json";
import { getFormDataForStudent } from "../../features/students/utils/studentUtils";

import type { RootState } from "../../app/store";
import type { AssessmentResultsByDomain } from "../../features/assessment/models/types";
import "./ResultsPage.css";

function ResultsPage() {
    const { selectedStudentId, allStudents } = useSelector((state: RootState) => state.students);

    // טעינת נתוני הטופס של התלמיד מ-localStorage
    const formSelections: AssessmentResultsByDomain = selectedStudentId ? getFormDataForStudent(selectedStudentId) : {};

    const selectedStudent = allStudents.find(student => student.id === selectedStudentId);
    const studentName = selectedStudent?.name || 'תלמיד לא זוהה';

    // חילוץ נתונים מ-formData
    const allSubDomains = formData.flatMap(domain =>
        domain.subDomains.map(subDomain => ({
            id: subDomain.id,
            name: subDomain.name,
            domainId: domain.id,
            statementIds: subDomain.statements.map(stmt => stmt.id)
        }))
    );

    const allStatements = formData.flatMap(domain =>
        domain.subDomains.flatMap(subDomain =>
            subDomain.statements.map(stmt => ({
                id: stmt.id,
                text: stmt.text,
                type: stmt.type as "strength" | "weakness",
                domainId: domain.id,
                subDomainId: subDomain.id
            }))
        )
    );

    // המרת הנתונים לפורמט הנדרש
    const normalizedData = normalizeAssessment(
        formSelections,
        allSubDomains,
        allStatements
    );

    // חישוב כל נתוני הניתוח בבת אחת
    const analysisResults = useMemo(() => {
        return analyzeResults(normalizedData);
    }, [normalizedData]);

    const {
        coreDomainScores,
        topCoreSubDomains,
        topStrengthSubDomains,
        topWeaknessSubDomains
    } = analysisResults;

    // לוגים לבדיקה (development only)
    if (import.meta.env.MODE === "development") {
        console.log("=== ResultsPage Debug ===");
        console.log("formSelections:", formSelections);
        console.log("normalizedData:", normalizedData);
        console.log("analysisResults:", analysisResults);
        console.log("========================");
    }

    return (
        <div className="results-page">
            <div className="results-header">
                <h1 className="results-title">
                    תוצאות האבחון {studentName && `- ${studentName}`}
                </h1>
                <p className="results-subtitle">
                    סיכום מפורט של מוקדי כוח ומוקדים לחיזוק שזוהו בהערכה
                </p>
            </div>

            {/* 1. גרפי החוزקות והחולשות לפי תחומי על */}
            <div className="charts-container">
                <div className="chart-wrapper">
                    <StrengthChart data={formSelections} />
                </div>
                <div className="chart-wrapper">
                    <WeaknessChart data={formSelections} />
                </div>
            </div>

            <div className="section-divider"></div>

            {/* 2. גרפי תתי-תחומים בולטים */}
            <div className="top-three-section">
                <div className="top-three-wrapper">
                    <TopThreeChart
                        data={topWeaknessSubDomains}
                        mode="weaknesses"
                        title="3 תתי־תחומים בולטים (מוקדים לחיזוק)"
                    />
                </div>
                <div className="top-three-wrapper">
                    <TopThreeChart
                        data={topStrengthSubDomains}
                        mode="strengths"
                        title="3 תתי־תחומים בולטים (מוקדי כוח)"
                    />
                </div>
            </div>

            <div className="section-divider"></div>

            {/* 3. גרפי הניתוח הסמנטי המתקדם */}
            <div className="semantic-analysis-section">
                <h2 className="section-title">ניתוח סמנטי מתקדם</h2>
                <p className="section-description">
                    זיהוי תחומי קושי ליבתיים על בסיס ניתוח של מילות מפתח סמנטיות
                </p>

                <div className="charts-container">
                    <div className="chart-wrapper">
                        <CoreDomainChart data={coreDomainScores} />
                    </div>
                    <div className="chart-wrapper">
                        <TopCoreSubDomainsChart data={topCoreSubDomains} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultsPage;
