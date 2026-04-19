import React from 'react';

export default function Card({
    children,
    padding = 24,
    style = {},
    onClick,
    hoverable = false
}) {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding,
                transition: hoverable ? 'border-color 0.15s, box-shadow 0.15s' : 'none',
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
            onMouseEnter={e => {
                if (hoverable) {
                    e.currentTarget.style.borderColor = '#A3A3A3';
                }
            }}
            onMouseLeave={e => {
                if (hoverable) {
                    e.currentTarget.style.borderColor = '#E5E5E5';
                }
            }}
        >
            {children}
        </div>
    );
}