import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({ name: response.data.name, email: response.data.email });
        setRole(response.data.role);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-white bg-[#0b0e14] min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-start justify-center pt-20">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#171e2c] border border-[#2a3547] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Your Profile</h1>
        {role && (
          <p className="text-center text-sm text-[#94a3b8] mb-4">
            Role: <span className="font-semibold text-white">{role}</span>
          </p>
        )}
        {error && (
          <div className="mb-4 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-[#1e3b2f] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-sm px-3 py-2 rounded-lg">
            {success}
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
        <button type="submit" className="w-full bg-[#cf0] text-[#0b0e14] font-bold p-2 rounded-lg">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
