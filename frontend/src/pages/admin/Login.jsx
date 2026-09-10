import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);

  if (user?.role === 'admin') {
    return <Navigate to="/admin/v1/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      if (result.payload.user.role === 'admin') {
        navigate('/admin/v1/dashboard', { replace: true });
      } else {
        dispatch(clearError());
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <Link to="/" className="block text-center text-2xl font-semibold mb-1">Raftar</Link>
        <h1 className="text-xl font-medium text-center mb-2">Admin Login</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Sign in to manage your store</p>
        {error && <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-4"><Link to="/" className="text-sm text-gray-500 underline">← Back to store</Link></p>
      </div>
    </div>
  );
}
