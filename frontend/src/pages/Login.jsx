import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(form.email, form.password); nav('/'); }
    catch(ex){ setErr(ex.response?.data?.error || 'Login failed'); }
    finally{ setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Trading Journal</h1>
        <p className="auth-sub">Sign in to your account</p>
        {err && <div className="err-box">{err}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Email</label><input type="email" autoFocus value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" required/></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required/></div>
          <button className="btn btn-primary btn-full" disabled={busy}>{busy?'Signing in…':'Sign In'}</button>
        </form>
        <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
