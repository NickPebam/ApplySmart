import { useState, useEffect } from 'react';
import { applicationApi } from '../services/nodeApi';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';

const STATUS_CONFIG = {
  Applied:   { dot: 'bg-blue-500',    pill: 'bg-blue-50 text-blue-700 border-blue-200',    stat: 'text-blue-600',   statBg: 'from-blue-50 to-cyan-50 border-blue-200' },
  Interview: { dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700 border-amber-200', stat: 'text-amber-600',  statBg: 'from-amber-50 to-yellow-50 border-amber-200' },
  Rejected:  { dot: 'bg-red-500',     pill: 'bg-red-50 text-red-700 border-red-200',       stat: 'text-red-600',    statBg: 'from-red-50 to-orange-50 border-red-200' },
  Accepted:  { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', stat: 'text-emerald-600', statBg: 'from-emerald-50 to-green-50 border-emerald-200' },
};

const STATUSES = ['Applied', 'Interview', 'Rejected', 'Accepted'];

// ── Parse analysisResult string into structured data ──────────────────────────
const parseAnalysis = (text) => {
  if (!text) return null;
  let raw = null;
  try { raw = JSON.parse(text); } catch {
    const m = text.match(/```json\s*\n?([\s\S]*?)\n?```/);
    if (m) { try { raw = JSON.parse(m[1]); } catch { return null; } }
  }
  if (!raw) return null;
  const src = raw.for_the_candidate || raw.for_the_recruiter || raw;
  const normalise = (s) => {
    if (typeof s === 'string') return s;
    if (typeof s === 'object' && s !== null)
      return s.skill || s.name || s.skill_name || Object.values(s).find(v => typeof v === 'string') || '';
    return String(s);
  };
  const rawRecs = Array.isArray(src.recommendations) ? src.recommendations
    : src.recommendations ? [src.recommendations] : [];
  return {
    matchScore:     src.match_score ?? src.matchScore ?? src.score ?? null,
    matchingSkills: (src.matching_skills ?? src.matchingSkills ?? []).map(normalise).filter(Boolean),
    missingSkills:  (src.missing_skills  ?? src.missingSkills  ?? []).map(normalise).filter(Boolean),
    recommendations: rawRecs.map(r =>
      typeof r === 'string' ? { category: null, details: r }
      : { category: r.category || r.title || null, details: r.details || r.text || r.description || '' }
    ),
  };
};

// ── Mini circular score ───────────────────────────────────────────────────────
const MiniScore = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const r = 22; const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="-rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={r} stroke="#e5e7eb" strokeWidth="5" fill="none" />
        <circle cx="28" cy="28" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[11px] font-black" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
};

// ── Analysis tab content ──────────────────────────────────────────────────────
const AnalysisPanel = ({ analysisResult, atsScore }) => {
  const data = parseAnalysis(analysisResult);
  const score = data?.matchScore ?? atsScore ?? null;

  if (!data && !score) return (
    <div className="py-8 text-center">
      <span className="text-3xl block mb-2">🤖</span>
      <p className="text-sm text-gray-400">No analysis data available for this application.</p>
    </div>
  );

  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';
  const matching = data?.matchingSkills ?? [];
  const missing  = data?.missingSkills  ?? [];
  const recs     = data?.recommendations ?? [];

  return (
    <div className="space-y-4">
      {/* Score row */}
      {score != null && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <MiniScore score={score} />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">
              ATS Score: <span className={scoreColor}>{score}%</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {score >= 80 ? 'Strong match for this role' : score >= 60 ? 'Good fit — highlight matching skills' : 'Consider addressing skill gaps'}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <span className="text-emerald-600 font-bold">{matching.length}</span> matched ·{' '}
            <span className="text-red-500 font-bold">{missing.length}</span> missing
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="grid sm:grid-cols-2 gap-3">
        {matching.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">✓ Matching Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {matching.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {missing.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">○ Skills to Develop</p>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">💡 Recommendations</p>
          <div className="space-y-2">
            {recs.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="w-5 h-5 bg-gray-900 text-white rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  {rec.category && <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">{rec.category}</p>}
                  <p className="text-xs text-gray-700 leading-relaxed">{rec.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedTab, setExpandedTab] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        applicationApi.getAll(),
        applicationApi.getStats(),
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await applicationApi.updateStatus(id, newStatus);
      fetchData();
    } catch {
      alert('Failed to update status');
    }
  };

  const deleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await applicationApi.delete(id);
      if (expandedId === id) setExpandedId(null);
      fetchData();
    } catch {
      alert('Failed to delete application');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    setExpandedTab(prev => ({ ...prev, [id]: prev[id] || 'cover' }));
  };

  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  const isFollowUpSoon = (dateStr) => {
    if (!dateStr) return false;
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 2;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Application Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all your job applications</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-black text-gray-900">{stats.total ?? applications.length}</p>
            </div>
            {STATUSES.map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div
                  key={s}
                  onClick={() => setSelectedStatus(selectedStatus === s ? 'all' : s)}
                  className={'bg-gradient-to-br ' + cfg.statBg + ' border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ' + (selectedStatus === s ? 'ring-2 ring-offset-1 ring-gray-400' : '')}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{s}</p>
                  <p className={'text-3xl font-black ' + cfg.stat}>{stats[s] ?? 0}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setSelectedStatus('all')}
            className={'px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ' + (selectedStatus === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}
          >
            All ({applications.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(selectedStatus === s ? 'all' : s)}
              className={'px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ' + (selectedStatus === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}
            >
              {s} ({applications.filter(a => a.status === s).length})
            </button>
          ))}
        </div>

        {/* Applications */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-gray-700">No applications found</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedStatus !== 'all' ? 'No ' + selectedStatus + ' applications yet' : 'Start by analysing a resume'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;
              const isOpen = expandedId === app._id;
              const tab = expandedTab[app._id] || 'cover';
              const soonFollowUp = isFollowUpSoon(app.followUpDate);
              const hasAnalysis = !!(app.analysisResult || app.atsScore);

              // Build tabs dynamically
              const tabs = [
                { key: 'cover',    label: '📄 Cover Letter' },
                { key: 'followup', label: '📧 Follow-up' },
              ];
              if (hasAnalysis) tabs.push({ key: 'analysis', label: '🔍 Analysis' });

              return (
                <div key={app._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">

                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={'w-2 h-2 rounded-full flex-shrink-0 ' + cfg.dot} />
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {app.jdId?.title || 'Job Title'}
                          </h3>
                          {/* ATS badge on card */}
                          {app.atsScore != null && (
                            <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (app.atsScore >= 80 ? 'bg-emerald-100 text-emerald-700' : app.atsScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600')}>
                              {app.atsScore}% ATS
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 ml-4">{app.jdId?.company || 'Company Name'}</p>
                        <div className="flex flex-wrap gap-3 mt-3 ml-4 text-xs text-gray-400">
                          <span>Applied {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {app.followUpDate && (
                            <span className={soonFollowUp ? 'text-amber-600 font-semibold' : ''}>
                              {soonFollowUp ? '⏰ ' : ''}Follow-up {new Date(app.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={'hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold border ' + cfg.pill}>
                          {app.status}
                        </span>
                        <select
                          value={app.status}
                          onChange={e => updateStatus(app._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={() => toggleExpand(app._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-xs font-bold"
                        >
                          {isOpen ? '▲' : '▼'}
                        </button>
                        <button
                          onClick={() => deleteApplication(app._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable */}
                  {isOpen && (
                    <div className="border-t border-gray-100">
                      {/* Tabs */}
                      <div className="flex border-b border-gray-100 bg-gray-50">
                        {tabs.map(t => (
                          <button
                            key={t.key}
                            onClick={() => setExpandedTab(prev => ({ ...prev, [app._id]: t.key }))}
                            className={'flex-1 py-2.5 text-xs font-semibold transition-colors ' + (tab === t.key ? 'text-gray-900 border-b-2 border-gray-900 bg-white' : 'text-gray-400 hover:text-gray-600')}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-5">
                        {tab === 'cover' && (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Cover Letter</p>
                              <button
                                onClick={() => { navigator.clipboard.writeText(app.coverLetter); alert('✓ Copied!'); }}
                                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap text-xs text-gray-700 font-sans leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-64 overflow-auto">
                              {app.coverLetter || 'No cover letter available.'}
                            </pre>
                          </div>
                        )}

                        {tab === 'followup' && (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Follow-up Email</p>
                              <button
                                onClick={() => { navigator.clipboard.writeText(app.followUpEmail); alert('✓ Copied!'); }}
                                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap text-xs text-gray-700 font-sans leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-64 overflow-auto">
                              {app.followUpEmail || 'No follow-up email available.'}
                            </pre>
                          </div>
                        )}

                        {tab === 'analysis' && (
                          <AnalysisPanel
                            analysisResult={app.analysisResult}
                            atsScore={app.atsScore}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;