// src/features/assessment/analyzer/normalizeAssessment.ts

import type {
    AssessmentResultsByDomain,
    AssessmentBySubDomain,
    SubDomain,
    Statement,
} from "./types";
import { coreDomains } from "./coreWords";

/**
 * מזהה אילו היגדים מכילים מילות מפתח ליבתיות
 */
function identifyCoreStatements(statements: Statement[]): Statement[] {
    if (statements.length === 0) {
        return [];
    }

    // כל מילות המפתח מכל התחומים
    const allKeywords = coreDomains.flatMap(domain => domain.keywords);

    const coreStatements = statements.filter((statement) => {
        const matchedKeywords = allKeywords.filter((keyword) =>
            statement.text.includes(keyword)
        );

        return matchedKeywords.length > 0;
    });

    return coreStatements;
}

// הופך תוצאות לפי תחום־על → לתוצאות לפי תת־תחום
export function normalizeAssessment(
    results: AssessmentResultsByDomain,
    subDomains: SubDomain[],
    statements: Statement[]
): AssessmentBySubDomain {
    const output: AssessmentBySubDomain = {};

    // הכנה: לכל תת־תחום ניצור כניסה ריקה
    subDomains.forEach((sd) => {
        output[sd.id] = {
            strengths: [],
            weaknesses: [],
            coreStrengths: [],
            coreWeaknesses: [],
        };
    });

    // עבור על כל תחום ותת-תחום
    Object.entries(results).forEach(([_domainId, subDomainsData]) => {
        // עבור על כל תת-תחום בדומיין
        Object.entries(subDomainsData).forEach(([subDomainId, subDomainData]) => {
            // עיבוד חוזקות - הנתונים כבר טקסט ולא IDs!
            if (Array.isArray(subDomainData.strengths)) {
                subDomainData.strengths.forEach((statementText: string) => {
                    // מצא את ה-Statement לפי טקסט
                    const statement = statements.find(s => s.text === statementText && s.subDomainId === subDomainId);

                    if (statement && output[subDomainId]) {
                        output[subDomainId].strengths.push(statement);
                    }
                });
            }

            // עיבוד חולשות - הנתונים כבר טקסט ולא IDs!
            if (Array.isArray(subDomainData.weaknesses)) {
                subDomainData.weaknesses.forEach((statementText: string) => {
                    // מצא את ה-Statement לפי טקסט
                    const statement = statements.find(s => s.text === statementText && s.subDomainId === subDomainId);

                    if (statement && output[subDomainId]) {
                        output[subDomainId].weaknesses.push(statement);
                    }
                });
            }
        });
    });

    // זיהוי היגדים ליבתיים לכל תת-תחום
    Object.entries(output).forEach(([_subDomainId, subDomainData]) => {
        if (subDomainData.strengths.length > 0) {
            subDomainData.coreStrengths = identifyCoreStatements(subDomainData.strengths);
        }

        if (subDomainData.weaknesses.length > 0) {
            subDomainData.coreWeaknesses = identifyCoreStatements(subDomainData.weaknesses);
        }
    });

    return output;
}
