import Card from './Card';

export default function StatCard({ label, value, sub, icon, trend }) {
    return (
        <Card>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
            }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#A3A3A3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        marginBottom: 8
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#0A0A0A',
                        letterSpacing: '-1px',
                        lineHeight: 1
                    }}>
                        {value ?? '—'}
                    </p>
                    {sub && (
                        <p style={{
                            fontSize: 11,
                            color: '#A3A3A3',
                            marginTop: 6
                        }}>
                            {sub}
                        </p>
                    )}
                </div>
                {icon && (
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: '#F5F5F5',
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