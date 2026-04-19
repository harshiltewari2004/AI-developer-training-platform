export default function PageHeader({ title, subtitle, action }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 32
        }}>
            <div>
                <h1 style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#0A0A0A',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: 14,
                        color: '#737373',
                        marginTop: 4,
                        fontWeight: 400
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}