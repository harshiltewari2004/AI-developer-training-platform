import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faXmark, faCircleCheck, faCircleXmark,
    faClock, faClipboardList, faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';

const statusIcons = {
    'Accepted':            faCircleCheck,
    'Wrong Answer':        faCircleXmark,
    'Time Limit Exceeded': faClock,
    'Runtime Error':       faCircleXmark,
    'Compilation Error':   faCircleXmark,
};

const statuses = Object.keys(statusIcons);

const darkInputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2, fontSize: 13,
        backgroundColor: '#1A1A1A', color: '#FAFAFA',
        fontFamily: 'Inter, sans-serif',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#262626' },
    '& .MuiInputLabel-root': {
        fontSize: 13, color: '#525252',
        fontFamily: 'Inter, sans-serif',
    },
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

function SubmissionRow({ submission }) {
    const icon = statusIcons[submission.status] || faCircleXmark;
    const problem = submission.problem;

    return (
        <Card hoverable padding={20}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #262626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 2
                    }}>
                        <FontAwesomeIcon icon={icon} style={{ color: '#FAFAFA', fontSize: 12 }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {problem ? (
                            
                               <a href={problem.link}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 14, fontWeight: 500,
                                    color: '#FAFAFA',
                                    textDecoration: 'none',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {problem.title}
                                </span>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 10, color: '#525252' }} />
                            </a>
                        ) : (
                            <p style={{ fontSize: 14, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                                Problem deleted
                            </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: 11, fontWeight: 500,
                                padding: '3px 8px', borderRadius: 999,
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #262626',
                                color: '#FAFAFA',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {submission.status}
                            </span>
                            {problem?.difficulty && (
                                <span style={{ fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                                    {problem.difficulty}
                                </span>
                            )}
                            {submission.time_taken && (
                                <span style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif'
                                }}>
                                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 10 }} />
                                    {submission.time_taken} min
                                </span>
                            )}
                            {problem?.topics?.slice(0, 3).map((topic, i) => (
                                <span key={i} style={{
                                    fontSize: 10,
                                    padding: '2px 7px',
                                    backgroundColor: '#1A1A1A',
                                    border: '1px solid #262626',
                                    color: '#A3A3A3',
                                    borderRadius: 999,
                                    textTransform: 'capitalize',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {typeof topic === 'object' ? topic.name : topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                        {formatDate(submission.createdAt)}
                    </p>
                </div>
            </div>
        </Card>
    );
}

function SubmissionSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
                <Card key={i} padding={20}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Skeleton variant="rounded" width={28} height={28} sx={{ bgcolor: '#1A1A1A' }} />
                        <div style={{ flex: 1 }}>
                            <Skeleton variant="text" width="50%" sx={{ bgcolor: '#1A1A1A' }} />
                            <Skeleton variant="text" width="30%" sx={{ bgcolor: '#1A1A1A', mt: 1 }} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function LogSubmissionDialog({ open, onClose, onLogged, problems }) {
    const [form, setForm] = useState({ problemId: '', status: 'Accepted', time_taken: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            await API.post('/progress/weekly').catch(() => {});
            onLogged();
            onClose();
            setForm({ problemId: '', status: 'Accepted', time_taken: '' });
        } catch (err) {
            setError('Failed to log submission.');
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
            PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#111111 !important', border: '1px solid #262626' } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
                        Log Submission
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#525252', cursor: 'pointer' }}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {error && (
                        <Alert severity="error" sx={{ fontSize: 12, borderRadius: 2, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important', border: '1px solid #262626' }}>
                            {error}
                        </Alert>
                    )}

                    <FormControl size="small" fullWidth sx={darkInputSx}>
                        <InputLabel>Problem</InputLabel>
                        <Select name="problemId" value={form.problemId} label="Problem" onChange={handleChange}>
                            {problems.map(p => (
                                <MenuItem key={p._id} value={p._id}>
                                    {p.title} — {p.difficulty}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth sx={darkInputSx}>
                        <InputLabel>Status</InputLabel>
                        <Select name="status" value={form.status} label="Status" onChange={handleChange}>
                            {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <div>
                        <label style={{ fontSize: 11, color: '#525252', marginBottom: 6, display: 'block', fontFamily: 'Inter, sans-serif' }}>
                            Time Taken (minutes) — optional
                        </label>
                        <input
                            type="number"
                            name="time_taken"
                            value={form.time_taken}
                            onChange={handleChange}
                            placeholder="e.g. 25"
                            min="1"
                            style={{
                                width: '100%', padding: '10px 12px', fontSize: 13,
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #262626',
                                borderRadius: 8, color: '#FAFAFA',
                                outline: 'none', fontFamily: 'Inter, sans-serif'
                            }}
                        />
                    </div>
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <button onClick={onClose} style={{ fontSize: 12, color: '#525252', background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600,
                        padding: '8px 16px',
                        backgroundColor: '#FAFAFA', color: '#0A0A0A',
                        border: 'none', borderRadius: 8,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    {loading ? <CircularProgress size={12} sx={{ color: '#0A0A0A' }} /> : <FontAwesomeIcon icon={faPlus} />}
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

    const filtered = filterStatus ? submissions.filter(s => s.status === filterStatus) : submissions;
    const acceptedCount = submissions.filter(s => s.status === 'Accepted').length;

    return (
        <div>
            <PageHeader
                title="Submissions"
                subtitle={`${submissions.length} total · ${acceptedCount} accepted`}
                action={
                    <button
                        onClick={() => setDialogOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, fontWeight: 600,
                            padding: '8px 14px',
                            backgroundColor: '#FAFAFA', color: '#0A0A0A',
                            border: 'none', borderRadius: 8,
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Log Submission
                    </button>
                }
            />

            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                    <StatCard label="Total" value={stats.total_submissions} />
                    <StatCard label="Accepted" value={stats.accepted} />
                    <StatCard label="Acceptance Rate" value={stats.accepted_rate ? `${stats.accepted_rate}%` : '—'} />
                    <StatCard label="Avg Time" value={stats.avg_time_taken_minutes ? `${stats.avg_time_taken_minutes} min` : '—'} />
                </div>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                <button
                    onClick={() => setFilterStatus('')}
                    style={{
                        fontSize: 12, padding: '6px 12px', borderRadius: 999,
                        border: '1px solid #262626',
                        backgroundColor: !filterStatus ? '#FAFAFA' : 'transparent',
                        color: !filterStatus ? '#0A0A0A' : '#A3A3A3',
                        cursor: 'pointer', fontWeight: 500,
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    All
                </button>
                {statuses.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                        style={{
                            fontSize: 12, padding: '6px 12px', borderRadius: 999,
                            border: '1px solid #262626',
                            backgroundColor: filterStatus === s ? '#FAFAFA' : 'transparent',
                            color: filterStatus === s ? '#0A0A0A' : '#A3A3A3',
                            cursor: 'pointer', fontWeight: 500,
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: 12, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important' }}>
                    {error}
                </Alert>
            )}

            {loading && <SubmissionSkeleton />}

            {!loading && filtered.length === 0 && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: 24, color: '#333333', marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            {filterStatus ? `No ${filterStatus} submissions` : 'No submissions yet'}
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                            {filterStatus ? 'Try clearing the filter' : 'Click "Log Submission" to track your first attempt'}
                        </p>
                    </div>
                </Card>
            )}

            {!loading && filtered.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(sub => <SubmissionRow key={sub._id} submission={sub} />)}
                </div>
            )}

            <LogSubmissionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onLogged={fetchSubmissions}
                problems={problems}
            />
        </div>
    );
}