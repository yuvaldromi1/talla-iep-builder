import Navigation from '../Navigation/Navigation';
import '../../assets/styles/components/Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
    return (
        <div className="app-layout">
            <Navigation />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

export default Layout;