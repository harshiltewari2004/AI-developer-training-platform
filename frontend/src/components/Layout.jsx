import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 'calc(100vw - 220px)' }}>
                {children}
            </main>
        </div>
    );
}