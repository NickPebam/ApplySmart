import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { applicationApi } from '../services/nodeApi';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusColors = {
  Applied:   'bg-amber-100 text-amber-700',
  Interview: 'bg-blue-100 text-blue-700',
  Accepted:  'bg-emerald-100 text-emerald-700',
  Rejected:  'bg-red-100 text-red-700',
  Withdrawn: 'bg-gray-100 text-gray-500',
};

const statusDot = {
  Applied:   'bg-amber-400',
  Interview: 'bg-blue-400',
  Accepted:  'bg-emerald-400',
  Rejected:  'bg-red-400',
  Withdrawn: 'bg-gray-400',
};

const CircularScore = ({ score = 0 }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="-rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <circle cx="48" cy="48" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black" style={{ color }}>{score}%</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ATS</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <span className="text-xs font-bold text-gray-900">{value}</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={'h-full rounded-full ' + color}
        style={{ width: (max > 0 ? (value / max) * 100 : 0) + '%', transition: 'width 1s ease-out' }}
      />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [recentApps, setRecentApps]   = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.allSettled([
        applicationApi.getStats(),
        applicationApi.getAll(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (appsRes.status === 'fulfilled') {
        const apps = appsRes.value.data || [];
        setRecentApps(apps.slice(0, 3));
        const withActivity = apps.find(function(a) { return a.coverLetter || a.followUpEmail; });
        if (withActivity) setLastAnalysis(withActivity);
      }
    } catch (e) { /* silent */ }
    finally { setLoadingApps(false); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const total     = stats?.total     ?? 0;
  const interview = stats?.Interview ?? 0;
  const accepted  = stats?.Accepted  ?? 0;
  const pending   = stats?.Applied   ?? 0;
  const atsScore  = lastAnalysis?.atsScore ?? 0;

  const pipeline = [
    { label: 'Applications', value: total,     color: 'bg-blue-500' },
    { label: 'Interviews',   value: interview,  color: 'bg-purple-500' },
    { label: 'Offers',       value: accepted,   color: 'bg-emerald-500' },
  ];

  // ── General AI activity (aggregated, not per-app) ─────────────────────────
  const totalAnalysed = recentApps.length;
  const withCover     = recentApps.filter(function(a) { return a.coverLetter; }).length;
  const withFollowUp  = recentApps.filter(function(a) { return a.followUpEmail; }).length;

  const aiActivity = [];
  if (totalAnalysed > 0) aiActivity.push({ icon: '🔍', text: totalAnalysed + ' resume' + (totalAnalysed > 1 ? 's' : '') + ' analysed against job descriptions' });
  if (withCover > 0)     aiActivity.push({ icon: '✍️', text: withCover + ' cover letter' + (withCover > 1 ? 's' : '') + ' generated' });
  if (withFollowUp > 0)  aiActivity.push({ icon: '📧', text: withFollowUp + ' follow-up email' + (withFollowUp > 1 ? 's' : '') + ' created' });
  if (total > 0)         aiActivity.push({ icon: '📊', text: total + ' application' + (total > 1 ? 's' : '') + ' tracked in your pipeline' });
  if (interview > 0)     aiActivity.push({ icon: '🎙️', text: interview + ' interview' + (interview > 1 ? 's' : '') + ' secured so far' });

  const hasData = total > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{greeting()}</p>
            <h1 className="text-3xl font-black text-gray-900">{user?.name?.split(' ')[0] ?? 'Dashboard'} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Here's your job search at a glance.</p>
          </div>
          <Link
            to="/upload-resume"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
          >
            <span>+</span> New Analysis
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Applications', value: total,     icon: '📝', color: 'text-blue-600',    bg: 'from-blue-50 to-cyan-50 border-blue-100' },
            { label: 'Interviews',   value: interview,  icon: '🎙️', color: 'text-purple-600',  bg: 'from-purple-50 to-violet-50 border-purple-100' },
            { label: 'Pending',      value: pending,    icon: '⏳', color: 'text-amber-600',   bg: 'from-amber-50 to-yellow-50 border-amber-100' },
            { label: 'Accepted',     value: accepted,   icon: '🎉', color: 'text-emerald-600', bg: 'from-emerald-50 to-green-50 border-emerald-100' },
          ].map(function(s, i) {
            return (
              <div key={i} className={'rounded-2xl p-5 border bg-gradient-to-br ' + s.bg}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className={'text-3xl font-black ' + s.color}>{s.value}</span>
                </div>
                <p className={'text-xs font-bold uppercase tracking-wide ' + s.color + ' opacity-70'}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: '📄', label: 'Upload Resume',       desc: 'Parse your resume',        to: '/upload-resume',   tag: 'Step 1', tagBg: 'bg-blue-100 text-blue-700' },
              { icon: '📋', label: 'Add Job Description', desc: 'Get instant match score',   to: '/job-description', tag: 'Step 2', tagBg: 'bg-purple-100 text-purple-700' },
              { icon: '📊', label: 'View Applications',   desc: 'Manage your pipeline',      to: '/tracker',         tag: 'Manage', tagBg: 'bg-emerald-100 text-emerald-700' },
            ].map(function(a, i) {
              return (
                <Link key={i} to={a.to}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center text-xl transition-colors flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-gray-900">{a.label}</span>
                      <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded-full ' + a.tagBg}>{a.tag}</span>
                    </div>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Insights + Pipeline */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* AI Insights */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">AI Insights</h2>
            {hasData && atsScore > 0 ? (
              <div className="flex items-center gap-6">
                <CircularScore score={atsScore} />
                <div className="flex-1 space-y-3">
                  <ProgressBar label="Skills Matched" value={lastAnalysis?.matchingSkillsCount ?? 0} max={(lastAnalysis?.matchingSkillsCount ?? 0) + (lastAnalysis?.missingSkillsCount ?? 0)} color="bg-emerald-400" />
                  <ProgressBar label="Skills Missing" value={lastAnalysis?.missingSkillsCount ?? 0}  max={(lastAnalysis?.matchingSkillsCount ?? 0) + (lastAnalysis?.missingSkillsCount ?? 0)} color="bg-red-400" />
                  <p className="text-xs text-gray-400">Latest · {lastAnalysis?.jdId?.title}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-4xl mb-3">🤖</span>
                <p className="text-sm font-semibold text-gray-700 mb-1">No analysis yet</p>
                <p className="text-xs text-gray-400 mb-4">Upload a resume and paste a job description to see your ATS score.</p>
                <Link to="/upload-resume" className="text-xs font-bold text-gray-900 underline underline-offset-2">
                  Start now →
                </Link>
              </div>
            )}
          </div>

          {/* Pipeline Tracker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Application Pipeline</h2>
            {hasData ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  {pipeline.map(function(stage, i) {
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 relative">
                        {i < pipeline.length - 1 && (
                          <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-100" />
                        )}
                        <div className={'w-10 h-10 rounded-full ' + stage.color + ' flex items-center justify-center text-white font-black text-sm z-10 shadow'}>
                          {stage.value}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{stage.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <ProgressBar label="Applied to Interview" value={interview} max={Math.max(total, 1)}     color="bg-purple-400" />
                  <ProgressBar label="Interview to Offer"   value={accepted} max={Math.max(interview, 1)} color="bg-emerald-400" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-4xl mb-3">📊</span>
                <p className="text-sm font-semibold text-gray-700 mb-1">No pipeline data yet</p>
                <p className="text-xs text-gray-400">Your application funnel will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Recent Applications</h2>
            {hasData && (
              <Link to="/tracker" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                View all →
              </Link>
            )}
          </div>

          {loadingApps ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
            </div>
          ) : recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
              <span className="text-5xl mb-4">📭</span>
              <p className="text-base font-bold text-gray-900 mb-1">No applications yet</p>
              <p className="text-sm text-gray-400 mb-5">Start by uploading your resume and analysing a job description.</p>
              <Link to="/upload-resume" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors">
                Upload Resume →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Company</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide hidden sm:table-cell">ATS</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentApps.map(function(app, i) {
                    return (
                      <tr key={app._id ?? i} onClick={function() { navigate('/tracker'); }}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                              {(app.jdId?.company || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                              {app.jdId?.company || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 truncate max-w-[140px] block">
                            {app.jdId?.title || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {app.atsScore != null ? (
                            <span className={'text-sm font-bold ' + (app.atsScore >= 80 ? 'text-emerald-600' : app.atsScore >= 60 ? 'text-amber-600' : 'text-red-500')}>
                              {app.atsScore}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ' + (statusColors[app.status] || 'bg-gray-100 text-gray-500')}>
                            <span className={'w-1.5 h-1.5 rounded-full ' + (statusDot[app.status] || 'bg-gray-400')} />
                            {app.status || 'Applied'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-xs text-gray-400">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Activity + How It Works */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* AI Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">AI Activity</h2>
            {aiActivity.length > 0 ? (
              <div className="space-y-3">
                {aiActivity.map(function(item, i) {
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      <p className="text-sm text-gray-600 leading-snug pt-1">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2">⚡</span>
                <p className="text-sm text-gray-400">AI activity will appear here after your first analysis.</p>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <h2 className="text-sm font-bold mb-5">How ApplySmart works</h2>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Upload Resume',         desc: 'We parse your skills and experience automatically.' },
                { step: '02', title: 'Paste Job Description', desc: 'AI scores your fit and finds skill gaps instantly.' },
                { step: '03', title: 'Apply Smarter',         desc: 'Get a tailored cover letter and follow-up in one click.' },
              ].map(function(item, i) {
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-2xl font-black text-gray-700 leading-none w-8 flex-shrink-0">{item.step}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;