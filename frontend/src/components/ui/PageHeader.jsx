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
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#FAFAFA',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2,
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: 13,
                        color: '#525252',
                        marginTop: 4,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}