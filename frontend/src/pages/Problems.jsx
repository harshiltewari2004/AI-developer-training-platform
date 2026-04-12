import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Paper, Chip, CircularProgress, Alert,
    Skeleton, TextField, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogActions,
    Select, FormControl, InputLabel
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faFilter, faArrowUpRightFromSquare,
    faTrash, faSearch, faCodeBranch, faXmark
} from '@fortawesome/free-solid-svg-icons';

const difficultyConfig = {
    Easy:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    Medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    Hard:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const platforms = ['LeetCode', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'Other'];
const difficulties = ['Easy', 'Medium', 'Hard'];

// single problem card
function ProblemCard({ problem, onDelete }) {
    const diff = difficultyConfig[problem.difficulty] || difficultyConfig.Easy;

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
                <div className="flex-1 min-w-0">

                    {/* title + link */}
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

                    {/* topics */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {problem.topics?.map((topic, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize"
                            >
                                {typeof topic === 'object' ? topic.name : topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* right side */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{
                            color: diff.color,
                            backgroundColor: diff.bg,
                            borderColor: diff.border
                        }}
                    >
                        {problem.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">{problem.platform}</span>
                    <button
                        onClick={() => onDelete(problem._id)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-xs"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
        </Paper>
    );
}

// loading skeleton
function ProblemSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Paper key={i} elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}>
                    <div className="flex justify-between">
                        <div className="flex-1">
                            <Skeleton variant="text" width="50%" height={20} />
                            <Skeleton variant="text" width="25%" height={16} sx={{ mt: 1 }} />
                        </div>
                        <Skeleton variant="rounded" width={60} height={26} />
                    </div>
                </Paper>
            ))}
        </div>
    );
}

// add problem dialog
function AddProblemDialog({ open, onClose, onAdded, topics }) {
    const [form, setForm] = useState({
        title: '', difficulty: 'Easy', platform: 'LeetCode', link: ''
    });
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

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
            // create problem
            const res = await API.post('/problems', form);
            const newProblem = res.data.problem;

            // tag selected topics
            for (const topicId of selectedTopics) {
                await API.post('/topics/tag', {
                    problemId: newProblem._id,
                    topicId
                });
            }

            onAdded();
            onClose();
            setForm({ title: '', difficulty: 'Easy', platform: 'LeetCode', link: '' });
            setSelectedTopics([]);
        } catch (err) {
            setError('Failed to add problem. Please try again.');
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
                    <span className="text-base font-semibold text-gray-900">Add Problem</span>
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

                    <TextField
                        fullWidth
                        size="small"
                        label="Problem Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        label="Problem Link"
                        name="link"
                        value={form.link}
                        onChange={handleChange}
                        placeholder="https://leetcode.com/problems/..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <FormControl size="small" fullWidth>
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                                name="difficulty"
                                value={form.difficulty}
                                label="Difficulty"
                                onChange={handleChange}
                                sx={{ borderRadius: 2 }}
                            >
                                {difficulties.map(d => (
                                    <MenuItem key={d} value={d}>{d}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" fullWidth>
                            <InputLabel>Platform</InputLabel>
                            <Select
                                name="platform"
                                value={form.platform}
                                label="Platform"
                                onChange={handleChange}
                                sx={{ borderRadius: 2 }}
                            >
                                {platforms.map(p => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* topic selection */}
                    {topics.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Topics (optional)</p>
                            <div className="flex flex-wrap gap-2">
                                {topics.map(topic => (
                                    <button
                                        key={topic._id}
                                        onClick={() => {
                                            setSelectedTopics(prev =>
                                                prev.includes(topic._id)
                                                    ? prev.filter(id => id !== topic._id)
                                                    : [...prev, topic._id]
                                            );
                                        }}
                                        className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${
                                            selectedTopics.includes(topic._id)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'text-gray-500 border-gray-200 hover:border-gray-400'
                                        }`}
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
            if (platform)   params.platform   = platform;
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

    // client-side search filter
    const filtered = problems.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    // counts
    const easyCnt  = problems.filter(p => p.difficulty === 'Easy').length;
    const medCnt   = problems.filter(p => p.difficulty === 'Medium').length;
    const hardCnt  = problems.filter(p => p.difficulty === 'Hard').length;

    return (
        <div className="space-y-6">

            {/* header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Problems</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {problems.length} problem{problems.length !== 1 ? 's' : ''} in your set
                    </p>
                </div>
                <button
                    onClick={() => setDialogOpen(true)}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Problem
                </button>
            </div>

            {/* difficulty summary chips */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: `${easyCnt} Easy`,   val: 'Easy',   color: '#16a34a', bg: '#f0fdf4' },
                    { label: `${medCnt} Medium`,  val: 'Medium', color: '#d97706', bg: '#fffbeb' },
                    { label: `${hardCnt} Hard`,   val: 'Hard',   color: '#dc2626', bg: '#fef2f2' },
                ].map(item => (
                    <button
                        key={item.val}
                        onClick={() => handleFilterDiff(item.val)}
                        className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                        style={{
                            color: filterDiff === item.val ? '#fff' : item.color,
                            backgroundColor: filterDiff === item.val ? item.color : item.bg,
                            borderColor: item.color
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* search + platform filter */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"
                    />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white"
                    />
                </div>

                <div className="flex gap-2">
                    {platforms.slice(0, 3).map(p => (
                        <button
                            key={p}
                            onClick={() => handleFilterPlat(p)}
                            className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                                filterPlat === p
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>
                    {error}
                </Alert>
            )}

            {/* loading */}
            {loading && <ProblemSkeleton />}

            {/* empty state */}
            {!loading && filtered.length === 0 && (
                <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 6 }}>
                    <div className="text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon icon={faCodeBranch} className="text-gray-300 text-xl" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            {search || filterDiff || filterPlat ? 'No problems match your filters' : 'No problems yet'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {search || filterDiff || filterPlat
                                ? 'Try clearing your filters'
                                : 'Click "Add Problem" to build your problem set'
                            }
                        </p>
                    </div>
                </Paper>
            )}

            {/* problem list */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                    {filtered.map(problem => (
                        <ProblemCard
                            key={problem._id}
                            problem={problem}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* add problem dialog */}
            <AddProblemDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAdded={fetchProblems}
                topics={topics}
            />
        </div>
    );
}