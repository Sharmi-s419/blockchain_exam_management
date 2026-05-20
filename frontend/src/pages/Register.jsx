import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Lock, Mail, BadgeCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Student' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register/', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Error registering user.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white">Create Account</h2>
          <p className="text-indigo-300 mt-2 text-sm">Join the next-gen exam portal</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
            <input type="text" placeholder="Username" required
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
            <input type="email" placeholder="Email Address" required
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
            <input type="password" placeholder="Password" required
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <div className="relative">
            <BadgeCheck className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
            <select onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none">
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit"
            className="w-full py-3 px-4 font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300">
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-white font-semibold hover:text-indigo-400 transition-colors">Log In</Link>
        </p>
      </div>
    </div>
  );
}
