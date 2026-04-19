import { CircularProgress } from '@mui/material';

export default function Button({
    children, onClick, variant = 'primary',
    size = 'md', loading = false,
    disabled = false, icon, style = {}
}) {
    const sizes = {
        sm: { padding: '6px 12px', fontSize: 11 },
        md: { padding: '8px 14px', fontSize: 12 },
        lg: { padding: '11px 20px', fontSize: 13 },
    };

    const variants = {
        primary: {
            backgroundColor: '#FAFAFA',
            color: '#0A0A0A',
            border: '1px solid #FAFAFA',
        },
        secondary: {
            backgroundColor: 'transparent',
            color: '#A3A3A3',
            border: '1px solid #262626',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#525252',
            border: '1px solid transparent',
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'opacity 0.15s, border-color 0.15s',
                letterSpacing: '-0.1px',
                ...sizes[size],
                ...variants[variant],
                ...style
            }}
            onMouseEnter={e => {
                if (!disabled && !loading) {
                    if (variant === 'primary') e.currentTarget.style.opacity = '0.85';
                    if (variant === 'secondary') e.currentTarget.style.borderColor = '#333333';
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                if (variant === 'secondary') e.currentTarget.style.borderColor = '#262626';
            }}
        >
            {loading
                ? <CircularProgress size={11} style={{ color: 'inherit' }} />
                : icon
            }
            {children}
        </button>
    );
}