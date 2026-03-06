import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/nodeApi';
import Navbar from '../components/layout/Navbar';

const UploadResume = () => {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
    setSuccess('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await resumeApi.upload(file);
      setSuccess('Resume uploaded successfully!');
      setTimeout(() => {
        navigate('/job-description', { state: { resumeId: response.data.resumeId } });
      }, 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fileExt = file?.name?.split('.').pop().toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Step 1 of 2</p>
          <h1 className="text-2xl font-black text-gray-900">Upload Your Resume</h1>
          <p className="text-sm text-gray-500 mt-1">We'll extract your skills and experience for AI matching.</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
            <span>✓</span> {success}
          </div>
        )}

        {/* Drop zone */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
              dragging
                ? 'border-gray-400 bg-gray-50'
                : file
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('resume-upload').click()}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => handleFileChange(e.target.files[0])}
              className="hidden"
              id="resume-upload"
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fileExt} · {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-3 py-1 rounded-full">
                  ✓ Ready to upload
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-sm">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 w-full py-3.5 px-6 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                <>Upload & Continue →</>
              )}
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tips for best results</p>
          <div className="space-y-2">
            {[
              'Use a clean, single-column PDF for best parsing accuracy',
              'Include clear section headers: Experience, Skills, Education',
              'Avoid tables, images, and text boxes',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">{i + 1}</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;