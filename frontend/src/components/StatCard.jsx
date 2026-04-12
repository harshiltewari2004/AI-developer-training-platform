import { Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
export default function StatCard({ title, value, sub, icon, color = 'text-gray-900' }) {
    return (
        <Paper
            elevation={0}
            sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-gray-400 mb-1">{title}</p>
                    <p className={`text-2xl font-semibold ${color}`}>
                        {value ?? '—'}
                    </p>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                {icon && (
                    <div className="text-gray-300 text-xl">
                        <FontAwesomeIcon icon={icon} />
                    </div>
                )}
            </div>
        </Paper>
    );
}