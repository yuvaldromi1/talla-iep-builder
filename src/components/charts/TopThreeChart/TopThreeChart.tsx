import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../../assets/styles/components/charts/TopThreeChart.css';

interface TopSubDomainData {
    subDomainName: string;
    domainName: string;
    strengthCount?: number;
    weaknessCount?: number;
    subDomainId: string;
}

interface Props {
    data: TopSubDomainData[];
    mode: "strengths" | "weaknesses";
    title: string;
}

// פונקציה ליצירת נתונים מעובדים לגרף
const processDataForChart = (data: TopSubDomainData[], mode: 'strengths' | 'weaknesses') => {
    // המרת הנתונים לפורמט שהגרף מצפה לו
    const chartData = data.map(item => ({
        subDomainName: item.subDomainName,
        domainName: item.domainName,
        value: mode === 'strengths' ? (item.strengthCount || 0) : (item.weaknessCount || 0)
    }));

    return chartData;
};

// Tooltip מותאם
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        return (
            <div className={`custom-tooltip`}>
                <div className="tooltip-header">
                    <strong>תת-תחום: {data.subDomainName}</strong>
                </div>
                <div className="tooltip-content">
                    <p className="tooltip-score">
                        <span className="tooltip-label">תחום על:</span>
                        <span className="tooltip-value">{data.domainName}</span>
                    </p>
                    <p className="tooltip-score">
                        <span className="tooltip-label">כמות:</span>
                        <span className="tooltip-value">{data.value}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function TopThreeChart({ data, mode, title }: Props) {
    const chartData = processDataForChart(data, mode);

    const barColor = mode === 'strengths' ? '#2ecc71' : '#f39c12';
    const gradientId = mode === 'strengths' ? 'topStrengthGradient' : 'topWeaknessGradient';

    // חישוב הערך המקסימלי בנתונים
    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="top-three-chart">
            <h3 className="chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="subDomainName"
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        interval={0}
                        tick={{ fontSize: 11, fill: '#333' }}
                    />
                    <YAxis
                        domain={[0, maxValue * 1.1]}
                        tick={{ fontSize: 12, fill: '#333' }}
                        label={{ value: 'כמות', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="value"
                        fill={`url(#${gradientId})`}
                        radius={[4, 4, 0, 0]}
                        strokeWidth={1}
                        stroke={barColor}
                    />
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={barColor} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={barColor} stopOpacity={0.7} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
