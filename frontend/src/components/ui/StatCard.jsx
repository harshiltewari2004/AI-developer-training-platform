import Card from './Card';

export default function StatCard({ label, value, sub, icon }) {
    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#525252',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: 10,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: 30,
                        fontWeight: 700,
                        color: '#FAFAFA',
                        letterSpacing: '-1.5px',
                        lineHeight: 1,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {value ?? '—'}
                    </p>
                    {sub && (
                        <p style={{ fontSize: 11, color: '#525252', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
                            {sub}
                        </p>
                    )}
                </div>
                {icon && (
                    <div style={{
                        width: 32, height: 32,
                        borderRadius: 8,
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #262626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}