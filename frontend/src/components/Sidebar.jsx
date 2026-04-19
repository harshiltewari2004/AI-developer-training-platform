import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGaugeHigh, faCode, faClipboardCheck,
    faChartLine, faStar, faUser,
    faSignOut, faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const problemLinks = [
    { to: '/dashboard',       label: 'Dashboard',    icon: faGaugeHigh },
    { to: '/problems',        label: 'Problems',      icon: faCode },
    { to: '/submissions',     label: 'Submissions',   icon: faClipboardCheck },
    { to: '/progress',        label: 'Progress',      icon: faChartLine },
    { to: '/recommendations', label: 'Recommend',     icon: faStar },
    { to: '/codeforces',      label: 'Codeforces',    icon: faCodeBranch },
];

const devLinks = [
    { to: '/github-intelligence', label: 'GitHub Intel', icon: faGithub },
];

function SectionLabel({ label }) {
    return (
        <p style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#333333',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            padding: '0 10px',
            marginBottom: 4,
            marginTop: 16,
            fontFamily: 'Inter, sans-serif'
        }}>
            {label}
        </p>
    );
}

function NavItem({ to, label, icon }) {
    return (
        <NavLink to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '7px 10px',
                        borderRadius: 8,
                        backgroundColor: isActive ? '#FAFAFA' : 'transparent',
                        transition: 'background-color 0.1s',
                        cursor: 'pointer',
                        marginBottom: 1
                    }}
                    onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#111111';
                    }}
                    onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <FontAwesomeIcon
                        icon={icon}
                        style={{
                            fontSize: 13,
                            color: isActive ? '#0A0A0A' : '#525252',
                            width: 14,
                            flexShrink: 0
                        }}
                    />
                    <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#0A0A0A' : '#A3A3A3',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {label}
                    </span>
                </div>
            )}
        </NavLink>
    );
}

export default function Sidebar() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside style={{
            width: 216,
            minHeight: '100vh',
            backgroundColor: '#0A0A0A',
            borderRight: '1px solid #1A1A1A',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
        }}>

            {/* Logo */}
            <div style={{
                padding: '20px 16px 16px',
                borderBottom: '1px solid #1A1A1A'
            }}>
                <p style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#FAFAFA',
                    letterSpacing: '-0.3px',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    DevTrack
                </p>
                <p style={{
                    fontSize: 11,
                    color: '#525252',
                    marginTop: 2,
                    fontFamily: 'Inter, sans-serif'
                }}>
                    AI Training Platform
                </p>
            </div>

            {/* Nav */}
            <nav style={{
                flex: 1,
                padding: '8px 8px',
                overflowY: 'auto'
            }}>
                <SectionLabel label="Problem Solving" />
                {problemLinks.map(l => <NavItem key={l.to} {...l} />)}

                <SectionLabel label="Development" />
                {devLinks.map(l => <NavItem key={l.to} {...l} />)}

                <div style={{
                    marginTop: 16,
                    borderTop: '1px solid #1A1A1A',
                    paddingTop: 8
                }}>
                    <NavItem to="/profile" label="Profile" icon={faUser} />
                </div>
            </nav>

            {/* User footer */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #1A1A1A'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10
                }}>
                    <Avatar
                        src={user?.avatar}
                        alt={user?.name}
                        sx={{
                            width: 28,
                            height: 28,
                            fontSize: 11,
                            bgcolor: '#1A1A1A',
                            border: '1px solid #262626',
                            flexShrink: 0
                        }}
                    >
                        {user?.name?.[0]?.toUpperCase() || user?.user?.[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <p style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#FAFAFA',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            {user?.name || user?.user}
                        </p>
                        <p style={{
                            fontSize: 11,
                            color: '#525252',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            {user?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#525252',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Inter, sans-serif',
                        transition: 'color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.color = '#525252'}
                >
                    <FontAwesomeIcon icon={faSignOut} style={{ fontSize: 11 }} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}