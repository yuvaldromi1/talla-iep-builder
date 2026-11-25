import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../../assets/styles/components/charts/TopCoreSubDomainsChart.css';

interface Props {
    data: Array<{
        subDomainName: string;
        domainName: string;
        coreContribution: number;
        subDomainId: string;
    }>;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            subDomainName: string;
            domainName: string;
            coreContribution: number;
        };
    }>;
    label?: string;
}

// Tooltip מותאם
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipProps['payload'] }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <div className="tooltip-header">
                    <strong>תת-תחום: {data.subDomainName}</strong>
                </div>
                <div className="tooltip-content">
                    <p className="tooltip-score">
                        <span className="tooltip-label">תחום על:</span>
                        <span className="tooltip-value">{data.domainName}</span>
                    </p>
                    <p className="tooltip-score">
                        <span className="tooltip-label">מילות מפתח ליבתיות:</span>
                        <span className="tooltip-value">{data.coreContribution}</span>
                    </p>
                    <p className="tooltip-description">
                        תת-תחום זה תורם משמעותית לקושי הליבתי
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function TopCoreSubDomainsChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="top-core-subdomains-chart">
                <h3 className="chart-title">תתי-תחומים מובילים בקושי ליבתי</h3>
                <div className="no-data">
                    לא נמצאו תתי-תחומים עם קושי ליבתי משמעותי
                </div>
            </div>
        );
    }

    return (
        <div className="top-core-subdomains-chart">
            <h3 className="chart-title">3 תתי-תחומים מובילים בקושי ליבתי</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
                        tick={{ fontSize: 12, fill: '#333' }}
                        label={{ value: 'מספר מילות מפתח ליבתיות', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="coreContribution"
                        fill="url(#topCoreGradient)"
                        radius={[4, 4, 0, 0]}
                        strokeWidth={1}
                        stroke="#e74c3c"
                    />
                    <defs>
                        <linearGradient id="topCoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e67e22" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#d35400" stopOpacity={0.7} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}