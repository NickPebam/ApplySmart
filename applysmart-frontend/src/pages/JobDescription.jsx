import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jdApi, aiApi } from '../services/nodeApi';
import Navbar from '../components/layout/Navbar';

const JobDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeId = location.state?.resumeId;

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    recruiterEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const extractSkills = (text) => {
    const skillKeywords = ['javascript', 'react', 'node', 'python', 'java', 'mongodb'];
    return skillKeywords.filter(s => text.toLowerCase().includes(s));
  };

  const extractRequirements = (text) =>
    text.split('\n').filter(l => l.trim().length > 10).slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const jdResponse = await jdApi.create({
        ...formData,
        skills: extractSkills(formData.description),
        requirements: extractRequirements(formData.description),
      });
      const jdId = jdResponse.data.jdId;
      const analysisResponse = await aiApi.analyze({ resumeId, jdId });
      navigate('/ai-results', {
        state: { resumeId, jdId, analysis: analysisResponse.data.analysis, jdData: formData },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Step 2 of 2</p>
          <h1 className="text-2xl font-black text-gray-900">Add Job Description</h1>
          <p className="text-sm text-gray-500 mt-1">Paste the JD and we'll score your resume match instantly.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Title *</label>
                <input
                  type="text" className="input" placeholder="e.g., Frontend Engineer"
                  value={formData.title} onChange={set('title')} required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company *</label>
                <input
                  type="text" className="input" placeholder="e.g., Acme Corp"
                  value={formData.company} onChange={set('company')} required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Job Description *</label>
                <span className={`text-xs ${wordCount > 50 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {wordCount} words {wordCount > 50 ? '✓' : '(aim for 50+)'}
                </span>
              </div>
              <textarea
                className="input min-h-[240px] resize-none font-sans text-sm leading-relaxed"
                placeholder="Paste the full job description here…"
                value={formData.description}
                onChange={set('description')}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Recruiter Email <span className="font-normal normal-case text-gray-400">(optional — for follow-up)</span>
              </label>
              <input
                type="email" className="input" placeholder="hr@company.com"
                value={formData.recruiterEmail} onChange={set('recruiterEmail')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analysing with AI…
                </>
              ) : (
                <>🔍 Analyse with AI</>
              )}
            </button>
          </form>
        </div>

        {/* What happens next */}
        {!loading && (
          <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What happens next</p>
            <div className="space-y-2">
              {[
                'AI scores your resume against the JD (ATS match score)',
                'Identifies your matching skills and skill gaps',
                'Generates tailored recommendations for your application',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 text-sm">Analysing your resume…</p>
            <p className="text-xs text-gray-400 mt-1">This takes about 10–20 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescription;