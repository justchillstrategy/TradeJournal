import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', username:'', password:'' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register(form.email, form.username, form.password); nav('/'); }
    catch(ex){ setErr(ex.response?.data?.error || 'Registration failed'); }
    finally{ setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Trading Journal</h1>
        <p className="auth-sub">Create your account</p>
        {err && <div className="err-box">{err}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Email *</label><input type="email" autoFocus value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" required/></div>
          <div className="field"><label>Username *</label><input value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} placeholder="letters, numbers, underscores" required/></div>
          <div className="field"><label>Password *</label><input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="min 6 characters" required/></div>
          <button className="btn btn-primary btn-full" disabled={busy}>{busy?'Creating account…':'Create Account'}</button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
