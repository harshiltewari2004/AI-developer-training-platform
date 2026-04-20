import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Skeleton, TextField, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogActions,
    Select, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faArrowUpRightFromSquare,
    faTrash, faSearch, faCodeBranch, faXmark
} from '@fortawesome/free-solid-svg-icons';

const platforms = ['LeetCode', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'Other'];
const difficulties = ['Easy', 'Medium', 'Hard'];

// dark MUI input styles
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

function ProblemCard({ problem, onDelete }) {
    return (
        <Card hoverable padding={20}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    
                    <a    href={problem.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 14,
                            fontWeight: 500,
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
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {problem.topics?.map((topic, i) => (
                            <span key={i} style={{
                                fontSize: 11,
                                padding: '3px 8px',
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

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#FAFAFA',
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #262626',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {problem.difficulty}
                    </span>
                    <span style={{ fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                        {problem.platform}
                    </span>
                    <button
                        onClick={() => onDelete(problem._id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#333333',
                            cursor: 'pointer',
                            fontSize: 11,
                            transition: 'color 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.color = '#333333'}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
        </Card>
    );
}

function ProblemSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
                <Card key={i} padding={20}>
                    <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#1A1A1A' }} />
                    <Skeleton variant="text" width="20%" height={14} sx={{ bgcolor: '#1A1A1A', mt: 1 }} />
                </Card>
            ))}
        </div>
    );
}

function AddProblemDialog({ open, onClose, onAdded, topics }) {
    const [form, setForm] = useState({ title: '', difficulty: 'Easy', platform: 'LeetCode', link: '' });
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async () => {
        if (!form.title || !form.link) {
            setError('Title and link are required.');
            return;
        }
        setLoading(true);
        try {
            const res = await API.post('/problems', form);
            const newProblem = res.data.problem;
            for (const topicId of selectedTopics) {
                await API.post('/topics/tag', { problemId: newProblem._id, topicId });
            }
            onAdded();
            onClose();
            setForm({ title: '', difficulty: 'Easy', platform: 'LeetCode', link: '' });
            setSelectedTopics([]);
        } catch (err) {
            setError('Failed to add problem.');
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
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    backgroundColor: '#111111 !important',
                    border: '1px solid #262626'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
                        Add Problem
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none',
                        color: '#525252', cursor: 'pointer'
                    }}>
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

                    <TextField fullWidth size="small" label="Problem Title" name="title" value={form.title} onChange={handleChange} sx={darkInputSx} />
                    <TextField fullWidth size="small" label="Problem Link" name="link" value={form.link} onChange={handleChange} placeholder="https://..." sx={darkInputSx} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <FormControl size="small" fullWidth sx={darkInputSx}>
                            <InputLabel>Difficulty</InputLabel>
                            <Select name="difficulty" value={form.difficulty} label="Difficulty" onChange={handleChange}>
                                {difficulties.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" fullWidth sx={darkInputSx}>
                            <InputLabel>Platform</InputLabel>
                            <Select name="platform" value={form.platform} label="Platform" onChange={handleChange}>
                                {platforms.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>

                    {topics.length > 0 && (
                        <div>
                            <p style={{ fontSize: 11, color: '#525252', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                                Topics (optional)
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {topics.map(topic => (
                                    <button
                                        key={topic._id}
                                        onClick={() => setSelectedTopics(prev =>
                                            prev.includes(topic._id) ? prev.filter(id => id !== topic._id) : [...prev, topic._id]
                                        )}
                                        style={{
                                            fontSize: 11,
                                            padding: '4px 10px',
                                            borderRadius: 999,
                                            border: '1px solid #262626',
                                            backgroundColor: selectedTopics.includes(topic._id) ? '#FAFAFA' : 'transparent',
                                            color: selectedTopics.includes(topic._id) ? '#0A0A0A' : '#A3A3A3',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            fontFamily: 'Inter, sans-serif'
                                        }}
                                    >
                                        {topic.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <button onClick={onClose} style={{
                    fontSize: 12, color: '#525252', background: 'none', border: 'none',
                    padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}>
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
                    {loading ? 'Adding...' : 'Add Problem'}
                </button>
            </DialogActions>
        </Dialog>
    );
}

export default function Problems() {
    const [problems, setProblems]     = useState([]);
    const [topics, setTopics]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch]         = useState('');
    const [filterDiff, setFilterDiff] = useState('');
    const [filterPlat, setFilterPlat] = useState('');

    const fetchProblems = async (difficulty = filterDiff, platform = filterPlat) => {
        setLoading(true);
        try {
            const params = {};
            if (difficulty) params.difficulty = difficulty;
            if (platform) params.platform = platform;
            const res = await API.get('/problems', { params });
            setProblems(res.data.problems || []);
        } catch (err) {
            setError('Failed to load problems.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await API.get('/topics');
            setTopics(res.data.topics || []);
        } catch (err) {}
    };

    useEffect(() => {
        fetchProblems();
        fetchTopics();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this problem?')) return;
        try {
            await API.delete(`/problems/${id}`);
            setProblems(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            setError('Failed to delete problem.');
        }
    };

    const handleFilterDiff = (val) => {
        const newVal = filterDiff === val ? '' : val;
        setFilterDiff(newVal);
        fetchProblems(newVal, filterPlat);
    };

    const handleFilterPlat = (val) => {
        const newVal = filterPlat === val ? '' : val;
        setFilterPlat(newVal);
        fetchProblems(filterDiff, newVal);
    };

    const filtered = problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    const easyCnt = problems.filter(p => p.difficulty === 'Easy').length;
    const medCnt  = problems.filter(p => p.difficulty === 'Medium').length;
    const hardCnt = problems.filter(p => p.difficulty === 'Hard').length;

    return (
        <div>
            <PageHeader
                title="Problems"
                subtitle={`${problems.length} problem${problems.length !== 1 ? 's' : ''} in your set`}
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
                        Add Problem
                    </button>
                }
            />

            {/* difficulty filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { label: `${easyCnt} Easy`,  val: 'Easy' },
                    { label: `${medCnt} Medium`, val: 'Medium' },
                    { label: `${hardCnt} Hard`,  val: 'Hard' },
                ].map(item => (
                    <button
                        key={item.val}
                        onClick={() => handleFilterDiff(item.val)}
                        style={{
                            fontSize: 12,
                            padding: '6px 12px',
                            borderRadius: 999,
                            border: '1px solid #262626',
                            backgroundColor: filterDiff === item.val ? '#FAFAFA' : 'transparent',
                            color: filterDiff === item.val ? '#0A0A0A' : '#A3A3A3',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* search + platform */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <FontAwesomeIcon icon={faSearch} style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        color: '#525252', fontSize: 11
                    }} />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px 8px 32px',
                            fontSize: 12,
                            backgroundColor: '#1A1A1A',
                            border: '1px solid #262626',
                            borderRadius: 8,
                            color: '#FAFAFA',
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {platforms.slice(0, 3).map(p => (
                        <button
                            key={p}
                            onClick={() => handleFilterPlat(p)}
                            style={{
                                fontSize: 12,
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '1px solid #262626',
                                backgroundColor: filterPlat === p ? '#FAFAFA' : 'transparent',
                                color: filterPlat === p ? '#0A0A0A' : '#A3A3A3',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12, mb: 2, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important' }}>
                    {error}
                </Alert>
            )}

            {loading && <ProblemSkeleton />}

            {!loading && filtered.length === 0 && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faCodeBranch} style={{ fontSize: 24, color: '#333333', marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            {search || filterDiff || filterPlat ? 'No problems match your filters' : 'No problems yet'}
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                            {search || filterDiff || filterPlat ? 'Try clearing your filters' : 'Click "Add Problem" to start'}
                        </p>
                    </div>
                </Card>
            )}

            {!loading && filtered.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(problem => (
                        <ProblemCard key={problem._id} problem={problem} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <AddProblemDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAdded={fetchProblems}
                topics={topics}
            />
        </div>
    );
}