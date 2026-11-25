import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AssessmentResultsByDomain } from '../../../features/assessment/models/types';
import formData from '../../../features/assessment/data/formData.json';
import '../../../assets/styles/components/charts/WeaknessChart.css';

interface Props {
    data: AssessmentResultsByDomain;
}

// פונקציה ליצירת נתונים מעובדים לגרף
const processDataForChart = (data: AssessmentResultsByDomain) => {
    return formData.map(domain => {
        // חישוב חולשות לתחום זה
        let totalWeaknesses = 0;
        let totalStatements = 0;

        domain.subDomains.forEach((subDomain) => {
            const subDomainResults = data[domain.id]?.[subDomain.id];
            if (subDomainResults) {
                const strengthsInSubDomain = subDomainResults.strengths?.length || 0;
                const weaknessesInSubDomain = subDomainResults.weaknesses?.length || 0;
                const totalInSubDomain = strengthsInSubDomain + weaknessesInSubDomain;

                totalWeaknesses += weaknessesInSubDomain;
                totalStatements += totalInSubDomain;
            }
        });

        const weaknessPercentage = totalStatements > 0 ? (totalWeaknesses / totalStatements) * 100 : 0;

        return {
            domainName: domain.name,
            domainId: domain.id,
            score: Math.round(weaknessPercentage),
            subDomains: domain.subDomains.map(sd => ({
                name: sd.name,
                id: sd.id
            }))
        };
    });
};

// Tooltip מותאם
const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
        payload: {
            domainName: string;
            score: number;
            subDomains: Array<{ name: string; id: string }>;
        };
    }>;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip weakness-tooltip">
                <div className="tooltip-header">
                    <strong>{label}</strong>
                </div>
                <div className="tooltip-content">
                    <p className="tooltip-score">
                        <span className="tooltip-label">ציון לחיזוק:</span>
                        <span className="tooltip-value">{data.score}%</span>
                    </p>
                    <div className="tooltip-subdomains">
                        <span className="tooltip-label">תתי-תחומים:</span>
                        <ul>
                            {data.subDomains.map((sd: { name: string; id: string }) => (
                                <li key={sd.id}>{sd.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function WeaknessChart({ data }: Props) {
    const chartData = processDataForChart(data);

    return (
        <div className="weakness-chart">
            <h3 className="chart-title">תחומים לחיזוק לפי תחומי על</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="domainName"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12, fill: '#333' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#333' }}
                        label={{ value: 'אחוז לחיזוק (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="score"
                        fill="url(#weaknessGradient)"
                        radius={[4, 4, 0, 0]}
                        strokeWidth={1}
                        stroke="#e67e22"
                    />
                    <defs>
                        <linearGradient id="weaknessGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f39c12" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#e67e22" stopOpacity={0.7} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
