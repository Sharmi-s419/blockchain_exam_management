import React, { useEffect, useState } from 'react';
import api from '../api';
import { PlusCircle, CalendarDays, Users, LogOut, CheckCircle, ListTodo, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function QuestionModal({ exam, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ text: '', options: '', correct_answer: '', marks: 1 });

  useEffect(() => {
    fetchQuestions();
  }, [exam.id]);

  const fetchQuestions = async () => {
    const res = await api.get(`/questions/?exam=${exam.id}`);
    setQuestions(res.data);
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      ...newQ,
      exam: exam.id,
      options: newQ.options.split(',').map(s => s.trim())
    };
    await api.post('/questions/', payload);
    setNewQ({ text: '', options: '', correct_answer: '', marks: 1 });
    fetchQuestions();
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/questions/${id}/`);
    fetchQuestions();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Questions for: {exam.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={addQuestion} className="bg-slate-50 p-6 rounded-2xl mb-8 space-y-4 border border-slate-200">
          <h4 className="font-bold text-slate-800 flex items-center"><PlusCircle className="mr-2 w-4 h-4"/> Add New Question</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Question Text" required value={newQ.text} onChange={e => setNewQ({...newQ, text: e.target.value})} className="md:col-span-2 p-3 rounded-xl border border-slate-300"/>
            <input placeholder="Options (comma separated)" required value={newQ.options} onChange={e => setNewQ({...newQ, options: e.target.value})} className="p-3 rounded-xl border border-slate-300"/>
            <input placeholder="Correct Answer" required value={newQ.correct_answer} onChange={e => setNewQ({...newQ, correct_answer: e.target.value})} className="p-3 rounded-xl border border-slate-300"/>
            <input type="number" placeholder="Marks" required value={newQ.marks} onChange={e => setNewQ({...newQ, marks: parseInt(e.target.value)})} className="p-3 rounded-xl border border-slate-300"/>
            <button type="submit" className="md:col-span-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">Add to Paper</button>
          </div>
        </form>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-800">Current Question Paper</h4>
          {questions.map((q, i) => (
            <div key={q.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-start hover:border-indigo-300 transition-colors">
              <div>
                <p className="font-bold text-slate-900">{i+1}. {q.text}</p>
                <p className="text-sm text-slate-500">Options: {q.options.join(', ')}</p>
                <p className="text-sm font-semibold text-green-600">Answer: {q.correct_answer} ({q.marks} Marks)</p>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-slate-400 py-4">No questions added yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ResultsModal({ exam, onClose }) {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total_registered: 0, attended: 0, not_attended: 0 });
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    fetchResults();
    fetchStats();
  }, [exam.id]);

  const fetchResults = async () => {
    const res = await api.get(`/exams/${exam.id}/admin_results/`);
    setResults(res.data);
  };

  const fetchStats = async () => {
    const res = await api.get(`/exams/${exam.id}/admin_stats/`);
    setStats(res.data);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{exam.title} - Participation Report</h3>
            <div className="flex gap-4 mt-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Registered: {stats.total_registered}</span>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Attended: {stats.attended}</span>
              <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Absent: {stats.not_attended}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-x-auto p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold text-center">Score</th>
                <th className="px-6 py-4 font-bold">Submission Details</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 font-medium text-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs mr-3">{r.user_username[0].toUpperCase()}</div>
                       <span className="font-bold text-slate-900">{r.user_username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">{r.score}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500">Submitted: {new Date(r.submitted_at).toLocaleString()}</p>
                    <code className="text-[10px] text-slate-400 block truncate w-32 mt-1" title={r.blockchain_tx_hash}>TX: {r.blockchain_tx_hash || 'Calculating...'}</code>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedAttempt(r)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg transition-all active:scale-95">
                      <Eye size={14} className="mr-1"/> View Sheet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center">
               <Users className="w-16 h-16 text-slate-200 mb-4"/>
               <p className="text-slate-500 font-bold text-lg">No exam submissions yet.</p>
               <p className="text-slate-400 text-sm">Wait for students to complete the exam to see results here.</p>
            </div>
          )}
        </div>

        {selectedAttempt && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-bold text-slate-900 italic">Answer Sheet: {selectedAttempt.user_username}</h4>
              <button onClick={() => setSelectedAttempt(null)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">Close Sheet</button>
            </div>
            <div className="space-y-6">
               <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest text-indigo-600">JSON Submission Dump</h5>
                  <pre className="text-sm bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-x-auto shadow-inner font-mono leading-relaxed">
                    {JSON.stringify(selectedAttempt.submitted_answers, null, 2)}
                  </pre>
               </div>
               <p className="text-center text-slate-400 italic text-sm border-t border-slate-100 pt-6">This record is verified and hashed on the blockchain.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExamForQs, setSelectedExamForQs] = useState(null);
  const [selectedExamForResults, setSelectedExamForResults] = useState(null);
  const [newExam, setNewExam] = useState({ title: '', start_time: '', end_time: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const res = await api.get('/exams/');
    setExams(res.data);
  };

  const uploadFile = async (id, field, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(field, file);
    try {
      const res = await api.patch(`/exams/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const msg = res.data.sync_message || res.data.key_sync_message || 'File uploaded successfully!';
      alert(msg);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.error || 'Error uploading file');
    }
  };

  const createExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams/', newExam);
      setShowModal(false);
      setNewExam({ title: '', start_time: '', end_time: '' });
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating exam");
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam? All related questions and results will be permanently removed.")) return;
    try {
      await api.delete(`/exams/${id}/`);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting exam");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <CheckCircle className="mr-3 text-indigo-400" /> Admin Control Center
          </h1>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-indigo-300 hover:text-white transition-colors">
            <LogOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Statistics and Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-sm rounded-3xl border border-white/20 p-6 flex items-center">
            <div className="flex-shrink-0 bg-indigo-500/10 rounded-2xl p-4">
              <CalendarDays className="h-7 w-7 text-indigo-600" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Exams</dt>
              <dd className="text-3xl font-black text-slate-900">{exams.length}</dd>
            </div>
          </div>
          
          <div onClick={() => setShowModal(true)} 
               className="group bg-gradient-to-br from-indigo-600 to-violet-700 overflow-hidden shadow-lg shadow-indigo-200 rounded-3xl p-6 flex items-center cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="flex-shrink-0 bg-white/20 rounded-2xl p-4 group-hover:rotate-12 transition-transform">
              <PlusCircle className="h-7 w-7 text-white" />
            </div>
            <div className="ml-5 text-white">
              <dt className="text-sm font-medium opacity-80 uppercase tracking-wider">Management</dt>
              <dd className="text-xl font-bold">Launch New Exam</dd>
            </div>
          </div>
        </div>

        {/* Section: Planned Exams */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center">
              <CalendarDays className="mr-3 text-indigo-500"/> Planned & Active
            </h2>
            <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {exams.filter(e => new Date(e.end_time) > new Date()).length} Live
            </span>
          </div>
          
          <div className="bg-white/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/40">
            <ul className="divide-y divide-slate-100">
              {exams.filter(e => new Date(e.end_time) > new Date()).map((exam) => (
                <li key={exam.id} className="group p-8 hover:bg-white/60 transition-all duration-300">
                  <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900">{exam.title}</h3>
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center">
                          <Users size={14} className="mr-2 text-indigo-500"/> {exam.registered_count} Registered
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center">
                          <PlusCircle size={14} className="mr-2 text-indigo-500"/> Starts: {new Date(exam.start_time).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50 gap-2">
                         <label className="cursor-pointer bg-white shadow-sm px-4 py-2 rounded-xl text-xs font-black text-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center">
                           <PlusCircle size={14} className="mr-2 text-indigo-500"/> Paper
                           <input type="file" className="hidden" onChange={(e) => uploadFile(exam.id, 'question_paper', e.target.files[0])}/>
                         </label>
                         <label className="cursor-pointer bg-white shadow-sm px-4 py-2 rounded-xl text-xs font-black text-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center">
                           <PlusCircle size={14} className="mr-2 text-emerald-500"/> Answer Key
                           <input type="file" className="hidden" onChange={(e) => uploadFile(exam.id, 'correct_answer_sheet', e.target.files[0])}/>
                         </label>
                      </div>
                      <button onClick={() => setSelectedExamForQs(exam)} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm">
                        <ListTodo size={18} className="mr-3"/> Questions
                      </button>
                      <button onClick={() => deleteExam(exam.id)} className="p-2.5 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300">
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {exams.filter(e => new Date(e.end_time) > new Date()).length === 0 && (
                <li className="p-20 text-center flex flex-col items-center">
                  <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <CalendarDays className="w-12 h-12 text-slate-300"/>
                  </div>
                  <p className="text-slate-400 font-bold">No active or upcoming exams scheduled.</p>
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Section: Completed Archive */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-400 flex items-center opacity-70">
              <CheckCircle className="mr-3 text-emerald-500"/> Completed Archive
            </h2>
            <span className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Historical Records
            </span>
          </div>
          
          <div className="bg-slate-100/50 grayscale-[0.6] opacity-80 backdrop-blur-sm shadow-inner rounded-[2.5rem] overflow-hidden border border-slate-200">
            <ul className="divide-y divide-slate-200/50">
              {exams.filter(e => new Date(e.end_time) <= new Date()).map((exam) => (
                <li key={exam.id} className="p-8 hover:grayscale-0 hover:opacity-100 hover:bg-white transition-all duration-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CheckCircle size={100} className="text-emerald-500" />
                  </div>
                  <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-500 line-through decoration-slate-300">{exam.title}</h3>
                      <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-tighter">Completed on: {new Date(exam.end_time).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      <button onClick={() => setSelectedExamForResults(exam)} className="flex items-center px-8 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-2xl hover:border-emerald-500 hover:text-emerald-700 transition-all text-sm shadow-sm">
                        <Eye size={18} className="mr-3"/> Participation Reports
                      </button>
                      <button onClick={() => deleteExam(exam.id)} className="p-2.5 text-slate-300 hover:text-rose-500 bg-transparent hover:bg-rose-50 rounded-2xl transition-all">
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {exams.filter(e => new Date(e.end_time) <= new Date()).length === 0 && (
                <li className="p-16 text-center text-slate-400 italic">No exams have been completed yet.</li>
              )}
            </ul>
          </div>
        </section>
      </main>

      {selectedExamForQs && <QuestionModal exam={selectedExamForQs} onClose={() => setSelectedExamForQs(null)} />}
      {selectedExamForResults && <ResultsModal exam={selectedExamForResults} onClose={() => setSelectedExamForResults(null)} />}

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto pl-4">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-slate-900 opacity-60 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-8 pt-8 pb-6">
                <h3 className="text-2xl leading-6 font-bold text-slate-900 mb-6" id="modal-title">Create a New Exam</h3>
                <form onSubmit={createExam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Exam Title</label>
                    <input type="text" required onChange={e => setNewExam({...newExam, title: e.target.value})}
                      className="mt-1 block w-full border border-slate-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Start Time</label>
                    <input type="datetime-local" required onChange={e => setNewExam({...newExam, start_time: e.target.value})}
                      className="mt-1 block w-full border border-slate-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">End Time</label>
                    <input type="datetime-local" required onChange={e => setNewExam({...newExam, end_time: e.target.value})}
                      className="mt-1 block w-full border border-slate-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="py-2 px-4 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit"
                      className="py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors">
                      Save Exam
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
