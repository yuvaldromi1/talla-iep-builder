// src/features/assessment/analyzer/analyzer.ts

import type {
    AssessmentBySubDomain
} from "./types";
import { coreDomains } from "./coreWords";
import formData from "../data/formData.json";


/* ---------------------------------------------
   טיפוס התוצאה הכוללת
--------------------------------------------- */
export interface AnalyzerResults {
    strengthsBySubDomain: Record<string, number>;
    weaknessesBySubDomain: Record<string, number>;
    topStrengthSubDomains: Array<{
        subDomainName: string;
        domainName: string;
        strengthCount: number;
        subDomainId: string;
    }>;
    topWeaknessSubDomains: Array<{
        subDomainName: string;
        domainName: string;
        weaknessCount: number;
        subDomainId: string;
    }>;
    coreDomainScores: Record<string, number>;
    topCoreSubDomains: Array<{
        subDomainName: string;
        domainName: string;
        coreContribution: number;
        subDomainId: string;
    }>;
}

/* ---------------------------------------------
   פונקציה ראשית: מנתחת את כל תוצאות הטופס
--------------------------------------------- */
export function analyzeResults(
    assessment: AssessmentBySubDomain
): AnalyzerResults {
    const strengthsBySubDomain = computeStrengths(assessment);
    const weaknessesBySubDomain = computeWeaknesses(assessment);
    const coreDomainScores = computeCoreDomains(assessment);
    const topCoreSubDomains = computeTopCoreSubDomains(assessment);
    const topStrengthSubDomains = computeTopStrengthSubDomains(assessment);
    const topWeaknessSubDomains = computeTopWeaknessSubDomains(assessment);

    return {
        strengthsBySubDomain,
        weaknessesBySubDomain,
        topStrengthSubDomains,
        topWeaknessSubDomains,
        coreDomainScores,
        topCoreSubDomains
    };
}

/* ---------------------------------------------
   חישוב חוזקות לכל תת־תחום
--------------------------------------------- */
export function computeStrengths(
    assessment: AssessmentBySubDomain
): Record<string, number> {
    const result: Record<string, number> = {};

    Object.entries(assessment).forEach(([subDomainName, statements]) => {
        const strengthsCount = statements.strengths.length;
        const totalStatements = statements.strengths.length + statements.weaknesses.length;

        if (totalStatements > 0) {
            const strengthRatio = strengthsCount / totalStatements;
            // נחשיב כחוזקה אם יש יותר מ-56% חוזקות
            result[subDomainName] = strengthRatio >= 0.56 ? strengthRatio * 100 : 0;
        } else {
            result[subDomainName] = 0;
        }
    });

    return result;
}

/* ---------------------------------------------
   חישוב נקודות לחיזוק לכל תת־תחום
--------------------------------------------- */
export function computeWeaknesses(
    assessment: AssessmentBySubDomain
): Record<string, number> {
    const result: Record<string, number> = {};

    Object.entries(assessment).forEach(([subDomainName, statements]) => {
        const weaknessesCount = statements.weaknesses.length;
        const totalStatements = statements.strengths.length + statements.weaknesses.length;

        if (totalStatements > 0) {
            const weaknessRatio = weaknessesCount / totalStatements;
            // נחשיב כחולשה אם יש יותר מ-56% חולשות
            result[subDomainName] = weaknessRatio >= 0.56 ? weaknessRatio * 100 : 0;
        } else {
            result[subDomainName] = 0;
        }
    });

    return result;
}

/* ---------------------------------------------
   שלושת המובילים (Top 3)
--------------------------------------------- */
export function getTopThree(scoreMap: Record<string, number>, lowest = false) {
    return Object.entries(scoreMap)
        .filter(([, score]) => score > 0) // רק ציונים רלוונטיים
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => lowest ? a.score - b.score : b.score - a.score)
        .slice(0, 3);
}

/* ---------------------------------------------
   Top 3 תתי-תחומים עם הכי הרבה חוזקות (מספר מוחלט)
--------------------------------------------- */
export function computeTopStrengthSubDomains(
    assessment: AssessmentBySubDomain
): Array<{
    subDomainName: string;
    domainName: string;
    strengthCount: number;
    subDomainId: string;
}> {
    const subDomainStrengths: Array<{
        subDomainName: string;
        domainName: string;
        strengthCount: number;
        subDomainId: string;
    }> = [];

    // עבור על כל התת-תחומים
    Object.entries(assessment).forEach(([subDomainKey, subDomainData]) => {
        const strengthCount = subDomainData.strengths?.length || 0;

        // מצא את שם התת-תחום והתחום-על לפי המפתח (יכול להיות ID או שם)
        let subDomainName = '';
        let subDomainId = '';
        let domainName = '';

        for (const domain of formData) {
            // נסה למצוא לפי ID
            let subDomain = domain.subDomains.find(sd => sd.id === subDomainKey);

            // אם לא נמצא, נסה למצוא לפי שם
            if (!subDomain) {
                subDomain = domain.subDomains.find(sd => sd.name === subDomainKey);
            }

            if (subDomain) {
                subDomainName = subDomain.name;
                subDomainId = subDomain.id;
                domainName = domain.name;
                break;
            }
        }

        // אם יש חוזקות - הוסף לרשימה
        if (strengthCount > 0 && subDomainName) {
            subDomainStrengths.push({
                subDomainName,
                domainName,
                strengthCount,
                subDomainId
            });
        }
    });

    // מיון לפי כמות חוזקות (מהגבוה לנמוך) ולקיחת 3 הראשונים
    const result = subDomainStrengths
        .sort((a, b) => b.strengthCount - a.strengthCount)
        .slice(0, 3);

    return result;
}/* ---------------------------------------------
   Top 3 תתי-תחומים עם הכי הרבה חולשות (מספר מוחלט)
--------------------------------------------- */
export function computeTopWeaknessSubDomains(
    assessment: AssessmentBySubDomain
): Array<{
    subDomainName: string;
    domainName: string;
    weaknessCount: number;
    subDomainId: string;
}> {
    const subDomainWeaknesses: Array<{
        subDomainName: string;
        domainName: string;
        weaknessCount: number;
        subDomainId: string;
    }> = [];

    // עבור על כל התת-תחומים
    Object.entries(assessment).forEach(([subDomainKey, subDomainData]) => {
        const weaknessCount = subDomainData.weaknesses?.length || 0;

        // מצא את שם התת-תחום והתחום-על לפי המפתח (יכול להיות ID או שם)
        let subDomainName = '';
        let subDomainId = '';
        let domainName = '';

        for (const domain of formData) {
            // נסה למצוא לפי ID
            let subDomain = domain.subDomains.find(sd => sd.id === subDomainKey);

            // אם לא נמצא, נסה למצוא לפי שם
            if (!subDomain) {
                subDomain = domain.subDomains.find(sd => sd.name === subDomainKey);
            }

            if (subDomain) {
                subDomainName = subDomain.name;
                subDomainId = subDomain.id;
                domainName = domain.name;
                break;
            }
        }

        // אם יש חולשות - הוסף לרשימה
        if (weaknessCount > 0 && subDomainName) {
            subDomainWeaknesses.push({
                subDomainName,
                domainName,
                weaknessCount,
                subDomainId
            });
        }
    });

    // מיון לפי כמות חולשות (מהגבוה לנמוך) ולקיחת 3 הראשונים
    const result = subDomainWeaknesses
        .sort((a, b) => b.weaknessCount - a.weaknessCount)
        .slice(0, 3);

    return result;
}/* ---------------------------------------------
   ניתוח תחומי־ליבה (ויסות / עצמאות / סנסורי / תקשורת)
--------------------------------------------- */
export function computeCoreDomains(
    assessment: AssessmentBySubDomain
): Record<string, number> {
    const coreDomainScores: Record<string, number> = {};

    // אתחול הציונים
    coreDomains.forEach(domain => {
        coreDomainScores[domain.id] = 0;
    });

    if (import.meta.env.MODE === "development") {
        console.log("🔍 computeCoreDomains - assessment:", assessment);
        console.log("🔍 coreDomains structure:", coreDomains);
    }

    // עבור על כל התת-תחומים
    Object.entries(assessment).forEach(([subDomainId, subDomainData]) => {
        if (import.meta.env.MODE === "development") {
            console.log(`📌 Checking sub-domain: ${subDomainId}`);
            console.log(`   Weaknesses count: ${subDomainData.weaknesses?.length || 0}`);
            console.log(`   Weaknesses array:`, subDomainData.weaknesses);
            console.log(`   Full subDomainData:`, subDomainData);
        }

        // רק היגדי חולשות (מוקדים לחיזוק)
        if (subDomainData.weaknesses && subDomainData.weaknesses.length > 0) {
            subDomainData.weaknesses.forEach(weakness => {
                // weakness הוא עכשיו Statement object
                const text = weakness.text.toLowerCase();

                if (import.meta.env.MODE === "development") {
                    console.log(`   🔎 Checking weakness: "${text}"`);
                }

                // חיפוש מילות מפתח בכל תחום ליבה
                coreDomains.forEach(coreDomain => {
                    const matched = coreDomain.keywords.some(keyword => {
                        const keywordLower = keyword.toLowerCase();
                        const found = text.includes(keywordLower);

                        if (found && import.meta.env.MODE === "development") {
                            console.log(`      ✓ Match: "${keyword}" in "${text}"`);
                        }

                        return found;
                    });

                    if (matched) {
                        coreDomainScores[coreDomain.id] = (coreDomainScores[coreDomain.id] || 0) + 1;

                        if (import.meta.env.MODE === "development") {
                            console.log(`      ✓ TOTAL Match: "${weakness.text}" → ${coreDomain.name}`);
                        }
                    }
                });
            });
        } else {
            if (import.meta.env.MODE === "development") {
                console.log(`   ⚠️ NO WEAKNESSES for ${subDomainId} - weaknesses is:`, subDomainData.weaknesses);
            }
        }
    });

    if (import.meta.env.MODE === "development") {
        console.log("📊 Final core domain scores:", coreDomainScores);
    }

    return coreDomainScores;
}

/* ---------------------------------------------
   3 תתי-תחומים מובילים בקושי ליבה
--------------------------------------------- */
export function computeTopCoreSubDomains(
    assessment: AssessmentBySubDomain
): Array<{
    subDomainName: string;
    domainName: string;
    coreContribution: number;
    subDomainId: string;
}> {
    const subDomainContributions: Array<{
        subDomainName: string;
        domainName: string;
        coreContribution: number;
        subDomainId: string;
    }> = [];

    if (import.meta.env.MODE === "development") {
        console.log("🔍 computeTopCoreSubDomains - assessment:", assessment);
    }

    // עבור על כל התת-תחומים
    Object.keys(assessment).forEach(subDomainId => {
        const subDomainData = assessment[subDomainId];
        let coreWordsCount = 0;

        // מצא את התת-תחום ב-formData
        let subDomainName = '';
        let domainName = '';

        for (const domain of formData) {
            const subDomain = domain.subDomains.find(sd => sd.id === subDomainId);
            if (subDomain) {
                subDomainName = subDomain.name;
                domainName = domain.name;
                break;
            }
        }

        // רק היגדי חולשות
        if (subDomainData.weaknesses && subDomainData.weaknesses.length > 0) {
            subDomainData.weaknesses.forEach(weakness => {
                // weakness הוא Statement object
                const text = weakness.text.toLowerCase();

                // חפש מילות מפתח בהיגד זה
                coreDomains.forEach(coreDomain => {
                    coreDomain.keywords.forEach(keyword => {
                        if (text.includes(keyword.toLowerCase())) {
                            coreWordsCount++;
                        }
                    });
                });
            });
        }

        // אם נמצאו מילות מפתח - הוסף לרשימה
        if (coreWordsCount > 0 && subDomainName) {
            subDomainContributions.push({
                subDomainName,
                domainName,
                coreContribution: coreWordsCount,
                subDomainId
            });
        }
    });

    // מיון לפי תרומה ולקיחת 3 הראשונים
    const topThree = subDomainContributions
        .sort((a, b) => b.coreContribution - a.coreContribution)
        .slice(0, 3);

    if (import.meta.env.MODE === "development") {
        console.log("📊 Top 3 sub-domains:", topThree);
    }

    return topThree;
}
