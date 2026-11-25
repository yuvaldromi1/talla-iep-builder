import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/components/Navigation.css';

interface NavigationItem {
    id: string;
    name: string;
    path: string;
    icon: string;
}

const navigationItems: NavigationItem[] = [
    { id: 'dashboard', name: 'לוח בקרה', path: '/', icon: '🏠' },
    { id: 'form', name: 'טופס הערכה', path: '/form', icon: '📋' },
    { id: 'results', name: 'תוצאות', path: '/results', icon: '📊' },
    { id: 'reports', name: 'דוחות', path: '/reports', icon: '📈' },
];

function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <nav className={`navigation ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="nav-header">
                <div className="nav-logo">
                    <span className="logo-text">TALLA</span>
                </div>
                <button
                    className="nav-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle navigation"
                >
                    {isCollapsed ? '☰' : '✕'}
                </button>
            </div>

            <ul className="nav-items">
                {navigationItems.map((item) => (
                    <li key={item.id} className="nav-item">
                        <button
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="nav-footer">
                <div className="user-info">
                    <div className="user-avatar">👤</div>
                    <div className="user-details">
                        <span className="user-name">משתמש</span>
                        <span className="user-role">מעריך</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;