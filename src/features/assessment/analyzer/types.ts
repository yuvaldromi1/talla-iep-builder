// src/features/assessment/analyzer/types.ts

export type DomainId = string;
export type SubDomainId = string;
export type StatementId = string;
export type StudentId = string;

export type StatementType = "strength" | "weakness";

// היגד
export interface Statement {
    id: StatementId;
    text: string;
    type: StatementType;
    domainId: DomainId;
    subDomainId: SubDomainId;
}

// תת־תחום
export interface SubDomain {
    id: SubDomainId;
    name: string;
    domainId: DomainId;
    statementIds: StatementId[];
}

// תחום־על
export interface Domain {
    id: DomainId;
    name: string;
    subDomainIds: SubDomainId[];
}

// תוצאות לפי תחום־על (נשמר בטופס)
export interface AssessmentResultsByDomain {
    [domainId: string]: {
        [subDomainId: string]: {
            strengths: string[];
            weaknesses: string[];
        };
    };
}

// תוצאות לפי תת־תחום (אחרי Normalize)
export interface AssessmentBySubDomain {
    [subDomainId: string]: {
        strengths: Statement[];
        weaknesses: Statement[];
        coreStrengths: Statement[];
        coreWeaknesses: Statement[];
    };
}

// הערכה מלאה אחת (Submit)
export interface Assessment {
    id: string;
    studentId: StudentId;
    createdAt: string;
    results: AssessmentResultsByDomain;
}

// תחומי ליבה (ויסות / מעברים / עצמאות / חושי / תקשורת)
export interface CoreDomain {
    id: string;
    name: string;
    keywords: string[];
}