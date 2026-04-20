import { useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    useEffect(() => {
        document.body.style.backgroundColor = '#0A0A0A';
        document.body.style.color = '#FAFAFA';
        document.documentElement.style.backgroundColor = '#0A0A0A';
    }, []);

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#0A0A0A',
            color: '#FAFAFA'
        }}>
            <Sidebar />
            <main style={{
                flex: 1,
                padding: '36px 40px',
                overflowY: 'auto',
                maxWidth: 'calc(100vw - 216px)',
                backgroundColor: '#0A0A0A'
            }}>
                {children}
            </main>
        </div>
    );
}