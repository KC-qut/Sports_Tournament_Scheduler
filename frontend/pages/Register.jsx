import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

// REQ-2.1: User Login/Registration
// REQ-2.2: Role-Based Access — user signs up as Organizer or Participant
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Participant',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/api/auth/register', formData);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-start justify-center pt-20">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#171e2c] border border-[#2a3547] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Register</h1>
        {error && (
          <div className="mb-4 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
        />
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
        />
        <label className="block mb-1 text-sm text-[#94a3b8]">I am registering as a:</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white rounded-lg"
        >
          <option value="Participant">Participant</option>
          <option value="Organizer">Organizer</option>
        </select>
        <button type="submit" className="w-full bg-[#cf0] text-[#0b0e14] font-bold p-2 rounded-lg">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
