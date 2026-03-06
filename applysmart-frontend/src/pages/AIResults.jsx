import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiApi, applicationApi } from '../services/nodeApi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

// ── Helpers defined OUTSIDE component ────────────────────────────────────────

const normaliseSkill = (s) => {
  if (typeof s === 'string') return s;
  if (typeof s === 'object' && s !== null) {
    return s.skill || s.name || s.skill_name || s.title || s.technology
      || Object.values(s).find(v => typeof v === 'string')
      || JSON.stringify(s);
  }
  return String(s);
};

const parseAnalysis = (text) => {
  if (!text) return null;

  let raw = null;

  try {
    raw = JSON.parse(text);
  } catch {
    const fenceMatch = text.match(/```json\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      try { raw = JSON.parse(fenceMatch[1]); } catch { /* fall through */ }
    }
  }

  if (raw) {
    const src = raw.for_the_candidate || raw.for_the_recruiter || raw;

    const rawRecs = Array.isArray(src.recommendations)
  ? src.recommendations
  : src.recommendations
  ? [src.recommendations]
  : Array.isArray(src.suggestions)
  ? src.suggestions
  : src.suggestions
  ? [src.suggestions]
  : [];
    const recommendations = rawRecs.map(r => {
      if (typeof r === 'string') return { category: null, details: r };
      if (typeof r === 'object' && r !== null) {
        return {
          category: r.category || r.title || null,
          details: r.details || r.text || r.description || JSON.stringify(r),
        };
      }
      return { category: null, details: String(r) };
    });

    const rawMatching = src.matching_skills ?? src.matchingSkills ?? src.skills ?? [];
    const rawMissing  = src.missing_skills  ?? src.missingSkills  ?? src.gaps  ?? [];

    return {
      matchScore:     src.match_score ?? src.matchScore ?? src.score ?? null,
      matchingSkills: Array.isArray(rawMatching) ? rawMatching.map(normaliseSkill) : [],
      missingSkills:  Array.isArray(rawMissing)  ? rawMissing.map(normaliseSkill)  : [],
      recommendations,
    };
  }

  return { rawText: text };
};

// ── Sub-components defined OUTSIDE to prevent remount ────────────────────────

const CircularProgress = ({ percentage, scoreColor }) => {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width="176" height="176">
        <circle cx="88" cy="88" r={r} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <circle
          cx="88" cy="88" r={r}
          stroke={scoreColor} strokeWidth="12" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color: scoreColor }}>{percentage}%</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">ATS Score</span>
      </div>
    </div>
  );
};

const StatCard = ({ value, label, colorClass, bgClass }) => (
  <div className={`rounded-2xl p-5 border bg-gradient-to-br ${bgClass}`}>
    <div className={`text-3xl font-black ${colorClass}`}>{value}</div>
    <div className={`text-xs font-semibold mt-1 uppercase tracking-wide ${colorClass} opacity-80`}>{label}</div>
  </div>
);

const Pill = ({ label, variant }) => {
  const styles = variant === 'match'
    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    : 'bg-red-50 text-red-700 border border-red-200';
  const icon = variant === 'match' ? '✓' : '○';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium ${styles}`}>
      <span className="text-xs">{icon}</span> {String(label)}
    </span>
  );
};

const CopyButton = ({ text }) => (
  <button
    onClick={() => { navigator.clipboard.writeText(text); alert('✓ Copied!'); }}
    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
  >
    Copy
  </button>
);

const EmptyState = ({ icon, title, subtitle, onGenerate, btnLabel, loading }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="text-6xl mb-4">{icon}</span>
    <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 mb-6 text-sm">{subtitle}</p>
    <button
      onClick={onGenerate}
      disabled={loading}
      className="px-7 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
    >
      {loading ? 'Generating…' : btnLabel}
    </button>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const AIResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resumeId, jdId, analysis, jdData } = location.state || {};

  const [coverLetter, setCoverLetter]     = useState('');
  const [followUpEmail, setFollowUpEmail] = useState('');
  const [loading, setLoading]             = useState({ coverLetter: false, followUp: false, save: false });
  const [activeTab, setActiveTab]         = useState('analysis');
  const [saved, setSaved]                 = useState(false);
  const [toast, setToast]                 = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const analysisData    = parseAnalysis(analysis);
  const atsScore        = analysisData?.matchScore ?? 0;
  const matchingSkills  = Array.isArray(analysisData?.matchingSkills) ? analysisData.matchingSkills : [];
  const missingSkills   = Array.isArray(analysisData?.missingSkills)  ? analysisData.missingSkills  : [];
  const recommendations = Array.isArray(analysisData?.recommendations) ? analysisData.recommendations : [];

  const scoreColor = atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444';
  const scoreLabel = atsScore >= 80 ? 'Strong Match' : atsScore >= 60 ? 'Good Match' : 'Fair Match';
  const scoreBg    = atsScore >= 80
    ? 'from-emerald-50 to-green-50 border-emerald-200'
    : atsScore >= 60
    ? 'from-amber-50 to-yellow-50 border-amber-200'
    : 'from-red-50 to-orange-50 border-red-200';

  const generateCoverLetter = async () => {
    setLoading(prev => ({ ...prev, coverLetter: true }));
    try {
      const response = await aiApi.generateCoverLetter({ resumeId, jdId, userName: user?.name || 'User' });
      setCoverLetter(response.data.coverLetter);
      setActiveTab('coverLetter');
    } catch {
      alert('Failed to generate cover letter');
    } finally {
      setLoading(prev => ({ ...prev, coverLetter: false }));
    }
  };

  const generateFollowUp = async () => {
    setLoading(prev => ({ ...prev, followUp: true }));
    try {
      const response = await aiApi.generateFollowUp({
        jobTitle: jdData.title,
        companyName: jdData.company,
        userName: user?.name || 'User',
      });
      setFollowUpEmail(response.data.followUpEmail);
      setActiveTab('followUp');
    } catch {
      alert('Failed to generate follow-up email');
    } finally {
      setLoading(prev => ({ ...prev, followUp: false }));
    }
  };

  const saveApplication = async () => {
    if (!coverLetter || !followUpEmail) {
      alert('Please generate both cover letter and follow-up email first');
      return;
    }
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 5);
      await applicationApi.create({
        resumeId, jdId, coverLetter, followUpEmail,
        followUpDate: followUpDate.toISOString(),
        atsScore,
        analysisResult: analysis,
      });
      setSaved(true);
      showToast('✅ Application saved successfully!');
    } catch {
      showToast('❌ Failed to save application');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const tabs = [
    { key: 'analysis',    icon: '🔍', label: 'Analysis' },
    { key: 'coverLetter', icon: '📄', label: 'Cover Letter', done: !!coverLetter },
    { key: 'followUp',    icon: '📧', label: 'Follow-up',    done: !!followUpEmail },
  ];

  const renderAnalysis = () => {
    if (!analysisData) return <p className="text-center py-12 text-gray-400">No analysis data available.</p>;

    return (
      <div className="space-y-6">

        {/* Score hero */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="flex justify-center">
              <CircularProgress percentage={atsScore} scoreColor={scoreColor} />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <StatCard value={matchingSkills.length} label="Matching Skills"   colorClass="text-emerald-600" bgClass="from-emerald-50 to-green-50 border-emerald-200" />
              <StatCard value={missingSkills.length}  label="Skills to Develop" colorClass="text-red-600"     bgClass="from-red-50 to-orange-50 border-red-200" />
              <StatCard
                value={scoreLabel} label="Match Level"
                colorClass={atsScore >= 80 ? 'text-emerald-600' : atsScore >= 60 ? 'text-amber-600' : 'text-red-600'}
                bgClass={scoreBg}
              />
              <StatCard
                value={`${Math.round(matchingSkills.length / Math.max(matchingSkills.length + missingSkills.length, 1) * 100)}%`}
                label="Skill Coverage"
                colorClass="text-blue-600"
                bgClass="from-blue-50 to-cyan-50 border-blue-200"
              />
            </div>
          </div>

          <div className={`mt-5 p-4 rounded-xl bg-gradient-to-r ${scoreBg} border`}>
            <p className="text-sm font-medium text-gray-700">
              {atsScore >= 80
                ? '🎉 Excellent! Your profile is a strong match for this role.'
                : atsScore >= 60
                ? '👍 Good fit. Emphasise your matching skills in your application.'
                : '📈 Consider developing missing skills or highlighting transferable experience.'}
            </p>
          </div>
        </div>

        {/* Matching skills */}
        {matchingSkills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</span>
              Your Strengths
              <span className="ml-auto text-xs font-normal text-gray-400">{matchingSkills.length} skills</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {matchingSkills.map((s, i) => <Pill key={i} label={s} variant="match" />)}
            </div>
          </div>
        )}

        {/* Missing skills */}
        {missingSkills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs">○</span>
              Skills to Develop
              <span className="ml-auto text-xs font-normal text-gray-400">{missingSkills.length} skills</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((s, i) => <Pill key={i} label={s} variant="missing" />)}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">💡 AI Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex-shrink-0 w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {rec.category && (
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">{rec.category}</p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{rec.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw text fallback */}
        {analysisData.rawText && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Full Analysis</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 p-4 rounded-lg overflow-auto">
              {analysisData.rawText}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 pb-28">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">AI Analysis Results</h1>
            <p className="text-sm text-gray-500 mt-0.5">Resume match analysis and application generator</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* Job banner */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">💼</div>
          <div>
            <h2 className="text-lg font-bold text-white">{jdData?.title}</h2>
            <p className="text-sm text-gray-400">{jdData?.company}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={generateCoverLetter}
            disabled={loading.coverLetter}
            className="flex items-center justify-center gap-2 py-3.5 px-5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            {loading.coverLetter
              ? <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Generating…</>
              : <><span>📄</span> Generate Cover Letter</>}
          </button>
          <button
            onClick={generateFollowUp}
            disabled={loading.followUp}
            className="flex items-center justify-center gap-2 py-3.5 px-5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            {loading.followUp
              ? <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Generating…</>
              : <><span>📧</span> Generate Follow-up Email</>}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.done && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'analysis' && renderAnalysis()}

            {activeTab === 'coverLetter' && (
              coverLetter
                ? <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Cover Letter</h3>
                      <CopyButton text={coverLetter} />
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-6 overflow-auto">
                      {coverLetter}
                    </pre>
                  </div>
                : <EmptyState
                    icon="📄" title="No Cover Letter Yet"
                    subtitle="Generate a tailored cover letter for this role"
                    onGenerate={generateCoverLetter} btnLabel="Generate Cover Letter"
                    loading={loading.coverLetter}
                  />
            )}

            {activeTab === 'followUp' && (
              followUpEmail
                ? <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Follow-up Email</h3>
                      <CopyButton text={followUpEmail} />
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-6 overflow-auto">
                      {followUpEmail}
                    </pre>
                  </div>
                : <EmptyState
                    icon="📧" title="No Follow-up Email Yet"
                    subtitle="Create a professional follow-up email"
                    onGenerate={generateFollowUp} btnLabel="Generate Follow-up Email"
                    loading={loading.followUp}
                  />
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {saved ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 py-3.5 px-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm">
                <span>✅</span> Application saved successfully
              </div>
              <button
                onClick={() => navigate('/tracker')}
                className="px-5 py-3.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
              >
                View in Tracker →
              </button>
            </div>
          ) : (
            <button
              onClick={saveApplication}
              disabled={loading.save || !coverLetter || !followUpEmail}
              className="w-full py-3.5 px-6 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading.save
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…
                  </span>
                : !coverLetter || !followUpEmail
                ? 'Generate cover letter & follow-up to save'
                : '💾 Save Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResults;