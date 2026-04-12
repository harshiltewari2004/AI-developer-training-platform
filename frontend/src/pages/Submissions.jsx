import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Paper, Chip, Alert, Skeleton,
    Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel,
    Select, MenuItem, CircularProgress
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faXmark, faCircleCheck,
    faCircleXmark, faClock, faFilter,
    faClipboardList, faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';

const statusConfig = {
    'Accepted':              { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: faCircleCheck },
    'Wrong Answer':          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: faCircleXmark },
    'Time Limit Exceeded':   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: faClock },
    'Runtime Error':         { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: faCircleXmark },
    'Compilation Error':     { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', icon: faCircleXmark },
};

const statuses = Object.keys(statusConfig);

// format date nicely
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// single submission row
function SubmissionRow({ submission }) {
    const status = statusConfig[submission.status] || statusConfig['Wrong Answer'];
    const problem = submission.problem;

    return (
        <Paper
            elevation={0}
            sx={{
                border: '1px solid #f3f4f6',
                borderRadius: 3,
                p: 2.5,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }}
        >
            <div className="flex items-start justify-between gap-4">

                {/* left */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: status.bg }}
                    >
                        <FontAwesomeIcon
                            icon={status.icon}
                            style={{ color: status.color }}
                            className="text-sm"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* problem title */}
                        {problem ? (
                            <a
                                href={problem.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors group"
                            >
                                <span className="truncate">{problem.title}</span>
                                <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    className="text-gray-300 group-hover:text-indigo-400 text-xs shrink-0"
                                />
                            </a>
                        ) : (
                            <p className="text-sm font-medium text-gray-400">Problem deleted</p>
                        )}

                        {/* meta row */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                style={{
                                    color: status.color,
                                    backgroundColor: status.bg,
                                    borderColor: status.border
                                }}
                            >
                                {submission.status}
                            </span>

                            {problem?.difficulty && (
                                <span className="text-xs text-gray-400">
                                    {problem.difficulty}
                                </span>
                            )}

                            {submission.time_taken && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <FontAwesomeIcon icon={faClock} className="text-gray-300" />
                                    {submission.time_taken} min
                                </span>
                            )}

                            {/* topics */}
                            {problem?.topics?.map((topic, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize"
                                >
                                    {typeof topic === 'object' ? topic.name : topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* right — date */}
                <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400">
                        {formatDate(submission.createdAt)}
                    </p>
                </div>
            </div>
        </Paper>
    );
}

// loading skeleton
function SubmissionSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Paper key={i} elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}>
                    <div className="flex gap-3">
                        <Skeleton variant="rounded" width={32} height={32} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="50%" height={20} />
                            <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                        </div>
                        <Skeleton variant="text" width={80} height={16} />
                    </div>
                </Paper>
            ))}
        </div>
    );
}

// log submission dialog
function LogSubmissionDialog({ open, onClose, onLogged, problems }) {
    const [form, setForm] = useState({
        problemId: '', status: 'Accepted', time_taken: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async () => {
        if (!form.problemId) {
            setError('Please select a problem.');
            return;
        }
        setLoading(true);
        try {
            await API.post('/submissions', {
                problemId: form.problemId,
                status: form.status,
                time_taken: form.time_taken ? parseInt(form.time_taken) : undefined
            });
            // save weekly progress automatically
            await API.post('/progress/weekly').catch(() => {});
            onLogged();
            onClose();
            setForm({ problemId: '', status: 'Accepted', time_taken: '' });
        } catch (err) {
            setError('Failed to log submission. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Log Submission</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <div className="space-y-4">
                    {error && (
                        <Alert severity="error" sx={{ fontSize: 13, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* problem selector */}
                    <FormControl size="small" fullWidth>
                        <InputLabel>Problem</InputLabel>
                        <Select
                            name="problemId"
                            value={form.problemId}
                            label="Problem"
                            onChange={handleChange}
                            sx={{ borderRadius: 2 }}
                        >
                            {problems.map(p => (
                                <MenuItem key={p._id} value={p._id}>
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <span className="truncate text-sm">{p.title}</span>
                                        <span
                                            className="text-xs shrink-0"
                                            style={{ color: statusConfig['Accepted']?.color }}
                                        >
                                            {p.difficulty}
                                        </span>
                                    </div>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* status selector */}
                    <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={form.status}
                            label="Status"
                            onChange={handleChange}
                            sx={{ borderRadius: 2 }}
                        >
                            {statuses.map(s => {
                                const cfg = statusConfig[s];
                                return (
                                    <MenuItem key={s} value={s}>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={cfg.icon}
                                                style={{ color: cfg.color }}
                                                className="text-xs"
                                            />
                                            <span className="text-sm">{s}</span>
                                        </div>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    {/* time taken */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Time Taken (minutes) — optional
                        </label>
                        <input
                            type="number"
                            name="time_taken"
                            value={form.time_taken}
                            onChange={handleChange}
                            placeholder="e.g. 25"
                            min="1"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300"
                        />
                    </div>
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <button
                    onClick={onClose}
                    className="text-xs text-gray-400 hover:text-gray-600 px-4 py-2 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                    {loading
                        ? <CircularProgress size={14} color="inherit" />
                        : <FontAwesomeIcon icon={faPlus} />
                    }
                    {loading ? 'Logging...' : 'Log Submission'}
                </button>
            </DialogActions>
        </Dialog>
    );
}

export default function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [problems, setProblems]       = useState([]);
    const [stats, setStats]             = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [dialogOpen, setDialogOpen]   = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const [subRes, statsRes] = await Promise.all([
                API.get('/submissions/my'),
                API.get('/submissions/my/stats')
            ]);
            setSubmissions(subRes.data.submissions || []);
            setStats(statsRes.data.stats || null);
        } catch (err) {
            setError('Failed to load submissions.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProblems = async () => {
        try {
            const res = await API.get('/problems');
            setProblems(res.data.problems || []);
        } catch (err) {}
    };

    useEffect(() => {
        fetchSubmissions();
        fetchProblems();
    }, []);

    // filter by status
    const filtered = filterStatus
        ? submissions.filter(s => s.status === filterStatus)
        : submissions;

    const acceptedCount = submissions.filter(s => s.status === 'Accepted').length;

    return (
        <div className="space-y-6">

            {/* header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Submissions</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {submissions.length} total · {acceptedCount} accepted
                    </p>
                </div>
                <button
                    onClick={() => setDialogOpen(true)}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Log Submission
                </button>
            </div>

            {/* stats row */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total',           value: stats.total_submissions },
                        { label: 'Accepted',         value: stats.accepted,         color: '#16a34a' },
                        { label: 'Acceptance Rate',  value: `${stats.accepted_rate}%`, color: '#6366f1' },
                        { label: 'Avg Time',         value: stats.avg_time_taken_minutes ? `${stats.avg_time_taken_minutes} min` : '—' },
                    ].map((s, i) => (
                        <Paper key={i} elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}>
                            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                            <p
                                className="text-2xl font-semibold"
                                style={{ color: s.color || '#111827' }}
                            >
                                {s.value ?? '—'}
                            </p>
                        </Paper>
                    ))}
                </div>
            )}

            {/* status filter */}
            <div className="flex gap-2 flex-wrap items-center">
                <FontAwesomeIcon icon={faFilter} className="text-gray-300 text-xs" />
                <button
                    onClick={() => setFilterStatus('')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        !filterStatus
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                >
                    All
                </button>
                {statuses.map(s => {
                    const cfg = statusConfig[s];
                    return (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                            className="text-xs px-3 py-1.5 rounded-full border transition-all"
                            style={{
                                color: filterStatus === s ? '#fff' : cfg.color,
                                backgroundColor: filterStatus === s ? cfg.color : cfg.bg,
                                borderColor: cfg.color
                            }}
                        >
                            {s}
                        </button>
                    );
                })}
            </div>

            {/* error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>
                    {error}
                </Alert>
            )}

            {/* loading */}
            {loading && <SubmissionSkeleton />}

            {/* empty state */}
            {!loading && filtered.length === 0 && (
                <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 6 }}>
                    <div className="text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon icon={faClipboardList} className="text-gray-300 text-xl" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            {filterStatus ? `No ${filterStatus} submissions` : 'No submissions yet'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {filterStatus
                                ? 'Try clearing the filter'
                                : 'Click "Log Submission" to track your first attempt'
                            }
                        </p>
                    </div>
                </Paper>
            )}

            {/* submissions list */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                    {filtered.map(sub => (
                        <SubmissionRow key={sub._id} submission={sub} />
                    ))}
                </div>
            )}

            {/* log dialog */}
            <LogSubmissionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onLogged={fetchSubmissions}
                problems={problems}
            />
        </div>
    );
}