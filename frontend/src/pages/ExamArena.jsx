import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ExamArena() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamDetails();
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      const res = await api.get(`/exams/${id}/`);
      setExam(res.data);
      checkTiming(res.data);
    } catch (err) {
      setError('Exam not found.');
    }
  };

  const checkTiming = (examData) => {
    const now = new Date();
    const start = new Date(examData.start_time);
    const end = new Date(examData.end_time);

    if (now < start) {
      setError('Exam has not started yet.');
    } else if (now > end) {
      setError('Exam has already ended.');
    } else {
      fetchQuestions();
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/exams/${id}/questions/`);
      setQuestions(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching questions. Strict timing restricted.');
    }
  };

  useEffect(() => {
    if (!exam || result || error) return;
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(exam.end_time);
      const diff = end - now;
      if (diff <= 0) {
        clearInterval(timer);
        handleSubmit();
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, result, error]);

  const handleOptionChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/exams/${id}/submit_exam/`, { answers });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 leading-relaxed">
        <div className="text-center space-y-4 max-w-sm w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-red-500/20">
          <ShieldCheck className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="text-slate-300">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition-colors">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-950 text-white p-6">
        <div className="text-center space-y-6 max-w-lg w-full bg-slate-900/60 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Exam Completed!</h2>
          <div className="p-6 bg-slate-800 rounded-2xl shadow-inner border border-white/10 text-left space-y-3">
             <p className="text-lg"><span className="font-semibold text-emerald-300">Score:</span> {result.score}</p>
             <p className="text-sm font-mono break-all text-slate-400"><span className="font-semibold text-emerald-300">Blockchain TX:</span> {result.blockchain_tx}</p>
             <p className="text-xs text-slate-500 mt-2 italic">Your score has been permanently recorded on the blockchain.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-bold rounded-xl text-lg shadow-lg transition-transform active:scale-95">Go Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 shadow-xl border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto py-5 px-6 flex justify-between items-center text-white">
          <h1 className="text-2xl font-bold tracking-tight">{exam?.title || 'Loading Exam...'}</h1>
          <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-inner">
            <Clock className="text-red-400" size={20} />
            <span className="font-mono text-xl font-bold text-red-100">{timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {questions.length === 0 ? (
          <p className="text-center text-slate-500 animate-pulse mt-10">Waiting for questions to load or Exam time has ended.</p>
        ) : (
          <div className="space-y-8 pb-32">
            {questions.map((q, idx) => {
              let opts = [];
              try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch(e){}
              return (
                <div key={q.id} className="bg-white p-8 shadow-sm rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-slate-900 flex">
                    <span className="text-indigo-500 mr-3">{idx + 1}.</span> {q.text}
                  </h3>
                  <div className="mt-6 space-y-4">
                    {opts.map((opt, i) => (
                      <label key={i} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                        <input type="radio" name={`q_${q.id}`} value={opt} onChange={() => handleOptionChange(q.id, opt)} className="hidden" />
                        <span className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${answers[q.id] === opt ? 'border-indigo-600 border-8' : 'border-slate-300'}`}></span>
                        <span className="text-slate-700 text-lg">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 drop-shadow-2xl">
              <div className="max-w-4xl mx-auto flex justify-end">
                <button onClick={handleSubmit} className="px-10 py-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-[0_4px_14px_0_rgb(79,70,229,39%)] transition-all active:scale-95 text-xl flex items-center">
                  <ShieldCheck className="mr-2"/> Submit Final Answers
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
