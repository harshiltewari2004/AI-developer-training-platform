import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#0A0A0A'
        }}>
            <Sidebar />
            <main style={{
                flex: 1,
                padding: '36px 40px',
                overflowY: 'auto',
                maxWidth: 'calc(100vw - 216px)'
            }}>
                {children}
            </main>
        </div>
    );
}