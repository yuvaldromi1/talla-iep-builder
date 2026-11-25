import React from 'react'
import Navigation from './Navigation'
import '../assets/styles/components/Layout.css'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="app-layout">
            <Navigation />
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}

export default Layout