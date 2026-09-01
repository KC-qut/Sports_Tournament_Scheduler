import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

// REQ-1.1: Public Homepage — accessible without authentication.
// REQ-1.2: Tournament Search — search by sport name or tournament name.
// REQ-1.3: Tournament Display — recent and upcoming tournaments shown on the homepage.
const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchTournaments = async (searchQuery = '') => {
    setLoading(true);
    try {
      const endpoint = searchQuery
        ? `/api/tournaments/search?q=${encodeURIComponent(searchQuery)}`
        : '/api/tournaments';
      const response = await axiosInstance.get(endpoint);
      setTournaments(response.data);
    } catch (error) {
      alert('Failed to load tournaments.');
    } finally {
      setLoading(false);
    }
  };

  // STS-19: Show Results on Homepage
  const fetchRecentResults = async () => {
    try {
      const response = await axiosInstance.get('/api/matches/recent');
      setRecentResults(response.data);
    } catch (error) {
      // Non-critical section — fail silently rather than blocking the whole homepage
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchRecentResults();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(query.trim().length > 0);
    fetchTournaments(query);
  };

  const renderGrid = (list) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.map((t) => (
        <Link
          to={`/tournaments/${t._id}`}
          key={t._id}
          className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4 hover:border-[#cf0] transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
              {t.sport}
            </span>
            <span className="bg-[#1e293b] text-[#38bdf8] text-[10px] font-bold uppercase px-2 py-1 rounded-md">
              {t.status}
            </span>
          </div>
          <h2 className="font-bold text-white text-base">{t.name}</h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            {new Date(t.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-[#94a3b8]">
            {(t.participants || []).filter((p) => p.status === 'Accepted').length}/{t.maxCapacity} joined
          </p>
        </Link>
      ))}
    </div>
  );

  const now = new Date();
  // STS-03: Upcoming — tournaments scheduled for today or later
  const upcoming = tournaments.filter((t) => new Date(t.date) >= now);
  // STS-02: Recent — tournaments already held, most recent first
  const recent = [...tournaments]
    .filter((t) => new Date(t.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-[#0b0e14] px-8 md:px-[120px] py-10">
      <div className="max-w-[760px] mb-6">
        <h1 className="font-extrabold text-white text-4xl md:text-5xl mb-3">
          Find your next tournament
        </h1>
        <p className="text-[#94a3b8]">
          Search leagues, tournaments, and pickup games across your region. Register,
          follow results, and track your team's schedule.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex max-w-[920px]">
        <input
          type="text"
          placeholder="Search games & tournaments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 bg-[#171e2c] border border-[#2a3547] text-white placeholder-[#94a3b8] rounded-l-2xl"
        />
        <button type="submit" className="bg-[#cf0] text-[#0b0e14] font-extrabold px-6 rounded-r-2xl">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-[#94a3b8]">Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-[#94a3b8]">No tournaments found.</p>
      ) : searching ? (
        renderGrid(tournaments)
      ) : (
        <>
          <h2 className="text-xl font-bold text-white uppercase mb-3">Upcoming Tournaments</h2>
          {upcoming.length === 0 ? (
            <p className="text-[#94a3b8] mb-8">No upcoming tournaments right now.</p>
          ) : (
            <div className="mb-8">{renderGrid(upcoming)}</div>
          )}

          <h2 className="text-xl font-bold text-white uppercase mb-3">Recent Tournaments</h2>
          {recent.length === 0 ? (
            <p className="text-[#94a3b8]">No past tournaments yet.</p>
          ) : (
            renderGrid(recent.slice(0, 6))
          )}

          {recentResults.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-white uppercase mb-3 mt-8">Recent Results</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentResults.map((m) => (
                  <div key={m._id} className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4">
                    <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                      {m.tournamentId?.sport}
                    </span>
                    <p className="font-bold text-white text-base mt-2">{m.tournamentId?.name}</p>
                    <p className="text-sm text-[#94a3b8]">
                      {(m.participants || []).map((p) => p.name).join(' vs ')}
                    </p>
                    {m.winner && (
                      <p className="text-sm text-[#10b981] mt-1">Winner: {m.winner.name}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
