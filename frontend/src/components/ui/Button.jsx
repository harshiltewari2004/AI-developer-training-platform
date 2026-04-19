import { CircularProgress } from '@mui/material';

export default function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style = {}
}) {
    const sizes = {
        sm: { padding: '6px 12px', fontSize: 12 },
        md: { padding: '8px 16px', fontSize: 13 },
        lg: { padding: '12px 24px', fontSize: 14 },
    };

    const variants = {
        primary: {
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            border: '1px solid #0A0A0A',
        },
        secondary: {
            backgroundColor: '#FFFFFF',
            color: '#0A0A0A',
            border: '1px solid #E5E5E5',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#737373',
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
                opacity: disabled ? 0.5 : 1,
                transition: 'opacity 0.15s, background-color 0.15s',
                ...sizes[size],
                ...variants[variant],
                ...style
            }}
            onMouseEnter={e => {
                if (!disabled && !loading) {
                    if (variant === 'primary') e.currentTarget.style.opacity = '0.85';
                    if (variant === 'secondary') e.currentTarget.style.borderColor = '#A3A3A3';
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                if (variant === 'secondary') e.currentTarget.style.borderColor = '#E5E5E5';
            }}
        >
            {loading
                ? <CircularProgress size={12} style={{ color: 'inherit' }} />
                : icon
            }
            {children}
        </button>
    );
}