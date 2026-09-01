import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-start justify-center pt-20">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#171e2c] border border-[#2a3547] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Login</h1>
        {justRegistered && (
          <div className="mb-4 bg-[#1e3b2f] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-sm px-3 py-2 rounded-lg">
            Registration successful. Please log in.
          </div>
        )}
        {error && (
          <div className="mb-4 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
        />
        <button type="submit" className="w-full bg-[#cf0] text-[#0b0e14] font-bold p-2 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
