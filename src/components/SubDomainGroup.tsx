import "../assets/styles/components/SubDomainGroup.css";
import type { AssessmentResultsByDomain } from "../features/assessment/models/types";

interface Props {
    domainId: string;
    subDomainId: string;
    name: string;
    statements: {
        strengths: { id: string; text: string }[];
        weaknesses: { id: string; text: string }[];
    };
    selections: AssessmentResultsByDomain;
    onStatementSelect: (statementId: string, statementText: string, type: "strength" | "weakness") => void;
}

function SubDomainGroup({ domainId, subDomainId, name, statements, selections, onStatementSelect }: Props) {
    // בדיקה בטוחה - אם אין selections עבור הדומיין הזה, צור אובייקט ריק
    const domainSelections = selections[domainId]?.[subDomainId] || { strengths: [], weaknesses: [] };

    const renderStatements = (statementListToRender: { id: string; text: string }[], type: "strength" | "weakness") => {
        return statementListToRender.map(statement => {
            // בדיקה בטוחה לקיום המערך
            const relevantSelections = type === "strength"
                ? (domainSelections.strengths || [])
                : (domainSelections.weaknesses || []);

            const isSelected = relevantSelections.includes(statement.text);

            return (
                <div
                    key={statement.id}
                    className={`statement-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                        onStatementSelect(statement.id, statement.text, type);
                    }}
                >
                    <div className={`statement-checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && '✓'}
                    </div>
                    <span className="statement-text">{statement.text}</span>
                </div>
            );
        });
    };

    const strengthStatements = renderStatements(statements.strengths, "strength");
    const weaknessStatements = renderStatements(statements.weaknesses, "weakness");

    // אל תציג את הקבוצה אם אין הצהרות
    if (strengthStatements.length === 0 && weaknessStatements.length === 0) {
        return null;
    }

    return (
        <div className="subdomain-group-container">
            <div className="subdomain-header">
                <h3 className="subdomain-title">{name}</h3>
            </div>

            {strengthStatements.length > 0 && (
                <div className="statement-group strength-group">
                    <h4 className="statement-group-title strength-title">
                        <span className="section-icon">💪</span>
                        מוקדי כוח
                    </h4>
                    <div className="statement-list">
                        {strengthStatements}
                    </div>
                </div>
            )}

            {weaknessStatements.length > 0 && (
                <div className="statement-group weakness-group">
                    <h4 className="statement-group-title weakness-title">
                        <span className="section-icon">🎯</span>
                        מוקדים לחיזוק
                    </h4>
                    <div className="statement-list">
                        {weaknessStatements}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SubDomainGroup;
