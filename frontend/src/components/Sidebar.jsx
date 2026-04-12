import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Divider, Tooltip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGaugeHigh, faCode, faClipboardCheck,
    faChartLine, faStar, faUser,
    faRightFromBracket, faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const problemSolvingLinks = [
    { to: '/dashboard',        label: 'Dashboard',       icon: faGaugeHigh },
    { to: '/problems',         label: 'Problems',         icon: faCode },
    { to: '/submissions',      label: 'Submissions',      icon: faClipboardCheck },
    { to: '/progress',         label: 'Progress',         icon: faChartLine },
    { to: '/recommendations',  label: 'Recommend',        icon: faStar },
    { to: '/codeforces',          label: 'Codeforces',    icon: faCodeBranch },

];

const devLinks = [
    { to: '/github-intelligence', label: 'GitHub Intel',  icon: faGithub },
];

const activeStyle = {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
};

function NavItem({ to, label, icon }) {
    return (
        <NavLink
            to={to}
            style={({ isActive }) => isActive ? activeStyle : {}}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive ? '' : 'hover:bg-gray-50 hover:text-gray-900'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <FontAwesomeIcon
                        icon={icon}
                        style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}
                        className="w-4 h-4 shrink-0"
                    />
                    <span style={{ color: isActive ? '#FFFFFF' : '#374151' }}>
                        {label}
                    </span>
                </>
            )}
        </NavLink>
    );
}

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside style={{
            width: 220,
            minHeight: '100vh',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #F0F0F0',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* logo */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
                    DevTrack
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    AI Training Platform
                </div>
            </div>

            {/* nav */}
            <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>

                {/* problem solving section */}
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.8px', padding: '8px 12px 6px', textTransform: 'uppercase' }}>
                    Problem Solving
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {problemSolvingLinks.map(link => (
                        <NavItem key={link.to} {...link} />
                    ))}
                </div>

                {/* divider */}
                <div style={{ margin: '12px 0' }}>
                    <Divider sx={{ borderColor: '#F0F0F0' }} />
                </div>

                {/* development section */}
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.8px', padding: '0 12px 6px', textTransform: 'uppercase' }}>
                    Development
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {devLinks.map(link => (
                        <NavItem key={link.to} {...link} />
                    ))}
                </div>

                {/* divider */}
                <div style={{ margin: '12px 0' }}>
                    <Divider sx={{ borderColor: '#F0F0F0' }} />
                </div>

                {/* profile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <NavItem to="/profile" label="Profile" icon={faUser} />
                </div>
            </nav>

            {/* user footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Tooltip title={user?.name || user?.user} placement="right">
                        <Avatar
                            src={user?.avatar}
                            alt={user?.name}
                            sx={{ width: 30, height: 30, fontSize: 12, bgcolor: '#4F46E5' }}
                        >
                            {user?.name?.[0]?.toUpperCase() || user?.user?.[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name || user?.user}
                        </div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.email}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#E11D48'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 11 }} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}