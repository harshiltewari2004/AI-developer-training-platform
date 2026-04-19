export default function Card({ children, padding = 24, style = {}, onClick, hoverable = false }) {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: '#111111',
                border: '1px solid #262626',
                borderRadius: 12,
                padding,
                transition: hoverable ? 'border-color 0.15s' : 'none',
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
            onMouseEnter={e => { if (hoverable) e.currentTarget.style.borderColor = '#333333'; }}
            onMouseLeave={e => { if (hoverable) e.currentTarget.style.borderColor = '#262626'; }}
        >
            {children}
        </div>
    );
}