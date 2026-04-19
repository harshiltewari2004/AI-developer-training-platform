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

function NavItem({ to, label, icon }) {
    return (
        <NavLink to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 10px',
                    borderRadius: 8,
                    backgroundColor: isActive ? '#0A0A0A' : 'transparent',
                    transition: 'background-color 0.1s',
                    cursor: 'pointer',
                    marginBottom: 1
                }}
                onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F5F5F5';
                }}
                onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                    <FontAwesomeIcon
                        icon={icon}
                        style={{
                            fontSize: 13,
                            color: isActive ? '#FFFFFF' : '#A3A3A3',
                            width: 14,
                            flexShrink: 0
                        }}
                    />
                    <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#FFFFFF' : '#525252',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {label}
                    </span>
                </div>
            )}
        </NavLink>
    );
}

function SectionLabel({ label }) {
    return (
        <p style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#A3A3A3',
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

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside style={{
            width: 216,
            minHeight: '100vh',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E5E5E5',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
        }}>

            {/* Logo */}
            <div style={{
                padding: '20px 16px 16px',
                borderBottom: '1px solid #F5F5F5'
            }}>
                <p style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0A0A0A',
                    letterSpacing: '-0.3px',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    DevTrack
                </p>
                <p style={{
                    fontSize: 11,
                    color: '#A3A3A3',
                    marginTop: 1,
                    fontFamily: 'Inter, sans-serif'
                }}>
                    AI Training Platform
                </p>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
                <SectionLabel label="Problem Solving" />
                {problemLinks.map(l => <NavItem key={l.to} {...l} />)}

                <SectionLabel label="Development" />
                {devLinks.map(l => <NavItem key={l.to} {...l} />)}

                <div style={{ marginTop: 16, borderTop: '1px solid #F5F5F5', paddingTop: 8 }}>
                    <NavItem to="/profile" label="Profile" icon={faUser} />
                </div>
            </nav>

            {/* User footer */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #F5F5F5'
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
                            bgcolor: '#0A0A0A',
                            flexShrink: 0
                        }}
                    >
                        {user?.name?.[0]?.toUpperCase() || user?.user?.[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <p style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#0A0A0A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            {user?.name || user?.user}
                        </p>
                        <p style={{
                            fontSize: 11,
                            color: '#A3A3A3',
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
                        color: '#A3A3A3',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Inter, sans-serif',
                        transition: 'color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A3A3A3'}
                >
                    <FontAwesomeIcon icon={faSignOut} style={{ fontSize: 11 }} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}