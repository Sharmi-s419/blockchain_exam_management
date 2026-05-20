import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle2, XCircle, Info, ArrowLeft, ShieldCheck, Trophy } from 'lucide-react';

export default function ExamResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/exams/${id}/my_attempt/`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No result record found for this exam.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
           <Info className="mx-auto h-12 w-12 text-slate-400 mb-4" />
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Notice</h2>
           <p className="text-slate-500 mb-6">{error}</p>
           <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const { attempt, questions, exam_title } = data;
  const submissions = attempt.submitted_answers || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors">
              <ArrowLeft size={20} className="mr-2"/> Dashboard
            </button>
            <h1 className="text-xl font-bold text-slate-900 truncate mx-4">{exam_title} - Final Report</h1>
            <div className="w-24"></div> 
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* SCORE CARD */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <p className="text-indigo-100 font-bold uppercase tracking-widest text-sm mb-2">Cumulative Performance</p>
                    <h2 className="text-5xl font-extrabold mb-4">Exam Completed!</h2>
                    <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center border border-white/20">
                            <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400"/> 
                            <span className="text-xs font-mono truncate max-w-[120px]" title={attempt.blockchain_tx_hash}>TX: {attempt.blockchain_tx_hash || 'Verified'}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white text-indigo-900 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl border-8 border-indigo-400/30">
                    <Trophy className="h-8 w-8 text-amber-500 mb-1"/>
                    <span className="text-4xl font-black">{attempt.score}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Total Score</span>
                </div>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </section>

        {/* DETAILED RESULTS */}
        <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-wider flex items-center">
                Paper Review
            </h3>
            {questions.map((q, idx) => {
                const userAns = submissions[q.id.toString()];
                const isCorrect = userAns === q.correct_answer;
                const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

                return (
                    <div key={q.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden transition-all hover:border-indigo-300">
                        <div className="flex items-start">
                            <span className="bg-slate-100 text-slate-600 font-black px-3 py-1 rounded-lg text-sm mr-4 mt-1"># {idx + 1}</span>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-slate-900 leading-snug mb-6">{q.text}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {opts.map((opt, i) => {
                                        let statusColor = "border-slate-100 text-slate-600";
                                        let Icon = null;

                                        if (opt === q.correct_answer) {
                                            statusColor = "border-emerald-200 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20";
                                            Icon = <CheckCircle2 className="ml-auto text-emerald-500 h-5 w-5" />;
                                        } else if (opt === userAns && userAns !== q.correct_answer) {
                                            statusColor = "border-rose-200 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20";
                                            Icon = <XCircle className="ml-auto text-rose-500 h-5 w-5" />;
                                        }

                                        return (
                                            <div key={i} className={`p-4 rounded-2xl border-2 flex items-center font-semibold transition-all ${statusColor}`}>
                                                <span className="mr-3">{String.fromCharCode(65 + i)})</span> {opt}
                                                {Icon}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-100">
                                    <p className="text-sm font-bold flex items-center">
                                       Your Choice: <span className={`ml-2 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{userAns || 'Not Answered'}</span>
                                    </p>
                                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {isCorrect ? '+ ' + q.marks : '0'} Points
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
}
