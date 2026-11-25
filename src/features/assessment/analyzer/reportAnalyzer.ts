// src/features/assessment/analyzer/reportAnalyzer.ts

import type { AssessmentResultsByDomain } from './types';
import formData from '../data/formData.json';
import { coreDomains } from './coreWords';

export interface SemanticAnalysisResult {
    coreKeywordsDetected: number;
    criticalityScore: number;
    dominantPattern: string;
    keywordMatches: Array<{
        keyword: string;
        coreDomain: string;
        frequency: number;
    }>;
}

export interface ReportAnalysisData {
    studentName: string;
    domainAnalysis: Array<{
        domainId: string;
        domainName: string;
        strengthsCount: number;
        weaknessesCount: number;
        strengthPercentage: number;
        weaknessPercentage: number;
        totalStatements: number;
        strongestSubDomains: Array<{
            id: string;
            name: string;
            score: number;
        }>;
        weakestSubDomains: Array<{
            id: string;
            name: string;
            score: number;
        }>;
        semanticAnalysis: SemanticAnalysisResult;
    }>;
    overallSummary: {
        totalStrengths: number;
        totalWeaknesses: number;
        topThreeStrengthDomains: string[];
        topThreeWeaknessDomains: string[];
        completionPercentage: number;
        globalSemanticAnalysis: SemanticAnalysisResult;
        coreKeywordsCoverage: number;
    };
}

// פונקציה לניתוח סמנטי מתקדם עם 60 מילות מפתח
function performSemanticAnalysis(
    domainSelections: { strengths: string[], weaknesses: string[] },
    domainId: string
): SemanticAnalysisResult {
    // מציאת מילות המפתח לתחום
    const domainKeywords = getDomainKeywords(domainId);

    if (domainKeywords.length === 0) {
        return {
            coreKeywordsDetected: 0,
            criticalityScore: 0,
            dominantPattern: 'לא זוהו תבנית',
            keywordMatches: []
        };
    }

    // איסוף כל ההיגדים שנבחרו בתחום
    const allSelectedStatements = [...domainSelections.strengths, ...domainSelections.weaknesses];

    // חיפוש מילות מפתח בהיגדים הנבחרים
    const keywordMatches: Array<{
        keyword: string;
        coreDomain: string;
        frequency: number;
    }> = [];

    // יצירת טקסט מאוחד מכל ההיגדים הנבחרים
    let allText = '';

    allSelectedStatements.forEach(statementId => {
        const domain = formData.find(d => d.id === domainId);
        if (domain) {
            domain.subDomains.forEach(subDomain => {
                const statement = subDomain.statements.find(s => s.id === statementId);
                if (statement) {
                    allText += statement.text + ' ';
                }
            });
        }
    });

    if (allText.trim().length === 0) {
        return {
            coreKeywordsDetected: 0,
            criticalityScore: 0,
            dominantPattern: 'אין טקסט לניתוח',
            keywordMatches: []
        };
    }

    // חיפוש בכל מילות המפתח של התחום
    domainKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = allText.match(regex);
        const frequency = matches ? matches.length : 0;

        if (frequency > 0) {
            keywordMatches.push({
                keyword,
                coreDomain: getDomainName(domainId),
                frequency
            });
        }
    });

    // חישוב ציון קריטיות
    const totalKeywords = domainKeywords.length;
    const detectedKeywords = keywordMatches.length;
    const totalFrequency = keywordMatches.reduce((sum, match) => sum + match.frequency, 0);

    const criticalityScore = Math.round(
        ((detectedKeywords / totalKeywords) * 0.6 + (totalFrequency / Math.max(allSelectedStatements.length, 1)) * 0.4) * 100
    );

    // זיהוי תבנית דומיננטית
    let dominantPattern = 'תבנית לא זוהתה';
    if (criticalityScore >= 75) {
        dominantPattern = 'קושי ליבתי גבוה';
    } else if (criticalityScore >= 50) {
        dominantPattern = 'קושי מרכזי מתון';
    } else if (criticalityScore >= 25) {
        dominantPattern = 'קושי קל עם נקודות חוזק';
    } else {
        dominantPattern = 'תחום יציב יחסית';
    }

    return {
        coreKeywordsDetected: detectedKeywords,
        criticalityScore,
        dominantPattern,
        keywordMatches: keywordMatches.sort((a, b) => b.frequency - a.frequency)
    };
}

// פונקציה לקבלת מילות מפתח לפי תחום
function getDomainKeywords(domainId: string): string[] {
    // מיפוי בין ID של התחומים ב-formData ל-ID של תחומי הליבה
    const domainMapping: { [key: string]: string } = {
        'D1': 'communication',  // תקשורת
        'D2': 'regulation',     // תפקוד רגשי/ויסות
        'D3': 'independence',   // תפקוד יומיומי/יוזמה ועצמאות
        'D4': 'sensory',        // תנועה ומרחב/עיבוד חושי
        'D5': 'transitions',    // למידה קוגניטיבית/מעברים
        'D6': 'regulation'      // תפקוד חברתי/ויסות
    };

    const mappedId = domainMapping[domainId];
    if (!mappedId) {
        return [];
    }

    const coreDomain = coreDomains.find(cd => cd.id === mappedId);
    const keywords = coreDomain ? coreDomain.keywords : [];

    return keywords;
}

// פונקציה לקבלת שם התחום
function getDomainName(domainId: string): string {
    // מיפוי בין ID של התחומים ב-formData ל-ID של תחומי הליבה
    const domainMapping: { [key: string]: string } = {
        'D1': 'communication',  // תקשורת
        'D2': 'regulation',     // תפקוד רגשי/ויסות
        'D3': 'independence',   // תפקוד יומיומי/יוזמה ועצמאות
        'D4': 'sensory',        // תנועה ומרחב/עיבוד חושי
        'D5': 'transitions',    // למידה קוגניטיבית/מעברים
        'D6': 'regulation',     // תפקוד חברתי/ויסות
        'D7': 'communication'   // תחושת עצמי זהות ומוטיבציה ללמידה - מיפוי לתקשורת
    };

    const mappedId = domainMapping[domainId];
    if (!mappedId) {
        return 'תחום לא זוהה';
    }

    const coreDomain = coreDomains.find(cd => cd.id === mappedId);
    return coreDomain ? coreDomain.name : 'תחום לא זוהה';
}

export function generateAnalysisData(
    studentName: string,
    formSelections: AssessmentResultsByDomain
): ReportAnalysisData {
    const domainAnalysis = formData.map(domain => {
        const domainData = formSelections[domain.id] || {};

        // אסוף את כל ה-strengths ו-weaknesses מכל תת-התחומים
        let allStrengths: string[] = [];
        let allWeaknesses: string[] = [];

        // עבור על כל תת-תחום
        domain.subDomains.forEach(subDomain => {
            const subDomainData = domainData[subDomain.id];
            if (subDomainData) {
                allStrengths = [...allStrengths, ...subDomainData.strengths];
                allWeaknesses = [...allWeaknesses, ...subDomainData.weaknesses];
            }
        });

        const strengthsCount = allStrengths.length;
        const weaknessesCount = allWeaknesses.length;
        const totalStatements = strengthsCount + weaknessesCount;

        // ניתוח תת-תחומים
        const subDomainScores = domain.subDomains.map(subDomain => {
            const subDomainData = domainData[subDomain.id] || { strengths: [], weaknesses: [] };

            return {
                id: subDomain.id,
                name: subDomain.name,
                strengthScore: subDomainData.strengths.length,
                weaknessScore: subDomainData.weaknesses.length,
                totalScore: subDomainData.strengths.length + subDomainData.weaknesses.length
            };
        });

        // מיון לפי חוזקות וחולשות
        const strongestSubDomains = subDomainScores
            .filter(sub => sub.strengthScore > 0)
            .sort((a, b) => b.strengthScore - a.strengthScore)
            .slice(0, 3)
            .map(sub => ({
                id: sub.id,
                name: sub.name,
                score: sub.strengthScore
            }));

        const weakestSubDomains = subDomainScores
            .filter(sub => sub.weaknessScore > 0)
            .sort((a, b) => b.weaknessScore - a.weaknessScore)
            .slice(0, 3)
            .map(sub => ({
                id: sub.id,
                name: sub.name,
                score: sub.weaknessScore
            }));

        // ניתוח סמנטי מתקדם לתחום - העבר את ההיגדים שאספנו
        const semanticAnalysis = performSemanticAnalysis(
            { strengths: allStrengths, weaknesses: allWeaknesses },
            domain.id
        );

        return {
            domainId: domain.id,
            domainName: domain.name,
            strengthsCount,
            weaknessesCount,
            strengthPercentage: totalStatements > 0 ? Math.round((strengthsCount / totalStatements) * 100) : 0,
            weaknessPercentage: totalStatements > 0 ? Math.round((weaknessesCount / totalStatements) * 100) : 0,
            totalStatements,
            strongestSubDomains,
            weakestSubDomains,
            semanticAnalysis
        };
    });

    // סיכום כללי
    const totalStrengths = domainAnalysis.reduce((sum, domain) => sum + domain.strengthsCount, 0);
    const totalWeaknesses = domainAnalysis.reduce((sum, domain) => sum + domain.weaknessesCount, 0);
    const totalPossible = formData.length * 10; // הערכה גסה
    const completionPercentage = Math.round(((totalStrengths + totalWeaknesses) / totalPossible) * 100);

    // תחומים מובילים
    const topThreeStrengthDomains = domainAnalysis
        .sort((a, b) => b.strengthsCount - a.strengthsCount)
        .slice(0, 3)
        .map(domain => domain.domainName);

    const topThreeWeaknessDomains = domainAnalysis
        .sort((a, b) => b.weaknessesCount - a.weaknessesCount)
        .slice(0, 3)
        .map(domain => domain.domainName);

    // ניתוח סמנטי גלובלי
    const allKeywordMatches = domainAnalysis.flatMap(domain => domain.semanticAnalysis.keywordMatches);
    const totalUniqueKeywords = new Set(allKeywordMatches.map(match => match.keyword)).size;
    const totalPossibleKeywords = coreDomains.reduce((sum, domain) => sum + domain.keywords.length, 0);

    const globalSemanticAnalysis: SemanticAnalysisResult = {
        coreKeywordsDetected: totalUniqueKeywords,
        criticalityScore: Math.round((totalUniqueKeywords / totalPossibleKeywords) * 100),
        dominantPattern: totalUniqueKeywords >= 45 ? 'תבנית קושי מרכבת גבוהה' :
            totalUniqueKeywords >= 30 ? 'תבנית קושי מתונה' :
                totalUniqueKeywords >= 15 ? 'תבנית מוקדת עם נקודות חוזק' :
                    'פרופיל יציב יחסית',
        keywordMatches: allKeywordMatches
    };

    const coreKeywordsCoverage = Math.round((totalUniqueKeywords / 60) * 100);

    return {
        studentName,
        domainAnalysis,
        overallSummary: {
            totalStrengths,
            totalWeaknesses,
            topThreeStrengthDomains,
            topThreeWeaknessDomains,
            completionPercentage,
            globalSemanticAnalysis,
            coreKeywordsCoverage
        }
    };
}

// פונקציות עזר
export function getDomainNameById(domainId: string): string {
    const domain = formData.find(d => d.id === domainId);
    return domain?.name || 'תחום לא זוהה';
}

export function getSubDomainNameById(subDomainId: string): string {
    for (const domain of formData) {
        const subDomain = domain.subDomains.find(sd => sd.id === subDomainId);
        if (subDomain) return subDomain.name;
    }
    return 'תת-תחום לא זוהה';
}

export function validateFormData(formSelections: AssessmentResultsByDomain): boolean {
    // בדיקה בסיסית שיש נתונים
    const hasData = Object.keys(formSelections).length > 0;

    // בדוק שיש לפחות תת-תחום אחד עם נתונים
    const hasContent = Object.values(formSelections).some(domainData => {
        // domainData = { 'SD1-1': {...}, 'SD1-2': {...} }
        return Object.values(domainData).some(subDomainData =>
            subDomainData.strengths.length > 0 || subDomainData.weaknesses.length > 0
        );
    });

    return hasData && hasContent;
}