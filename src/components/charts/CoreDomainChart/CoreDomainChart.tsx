import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { coreDomains } from '../../../features/assessment/analyzer/coreWords';
import "../../../assets/styles/components/charts/CoreDomainChart.css";

interface Props {
    data: Record<string, number>;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            domainName: string;
            score: number;
            domainId: string;
        };
    }>;
    label?: string;
}

// פונקציה ליצירת נתונים מעובדים לגרף
const processDataForChart = (data: Record<string, number>) => {
    return coreDomains.map(domain => ({
        domainName: domain.name,
        domainId: domain.id,
        score: data[domain.id] || 0
    })).filter(item => item.score > 0); // רק תחומים עם ציון
};

// Tooltip מותאם
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <div className="tooltip-header">
                    <strong>{label}</strong>
                </div>
                <div className="tooltip-content">
                    <p className="tooltip-score">
                        <span className="tooltip-label">מילות מפתח שנמצאו:</span>
                        <span className="tooltip-value">{data.score}</span>
                    </p>
                    <p className="tooltip-description">
                        תחום ליבה זה מציין קושי פנימי שמתבטא בסימפטומים שונים
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function CoreDomainChart({ data }: Props) {
    const chartData = processDataForChart(data);

    if (chartData.length === 0) {
        return (
            <div className="core-domain-chart">
                <h3 className="chart-title">תחומי ליבה</h3>
                <div className="no-data">
                    לא נמצאו מילות מפתח המצביעות על קושי ליבתי
                </div>
            </div>
        );
    }

    return (
        <div className="core-domain-chart">
            <h3 className="chart-title">תחומי ליבה - ניתוח סמנטי</h3>
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
                        tick={{ fontSize: 12, fill: '#333' }}
                        label={{ value: 'מספר מילות מפתח', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="score"
                        fill="url(#coreGradient)"
                        radius={[4, 4, 0, 0]}
                        strokeWidth={1}
                        stroke="#8e44ad"
                    />
                    <defs>
                        <linearGradient id="coreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9b59b6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#8e44ad" stopOpacity={0.7} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
