import React, { useState } from 'react';
import { searchMedicines } from '../services/medicines';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await searchMedicines(query);
      setResults(data);
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search medicines..."
          required
          className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="text-red-600 text-center mb-2">{error}</div>}
      {/* Render search results outside the form */}
      <ul className="divide-y divide-gray-200">
        {results.map(med => (
          <li
            key={med._id}
            className="py-3 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => {
              console.log('Clicked', med._id);
              navigate(`/medicines/${med._id}`);
            }}
          >
            <div className="font-semibold text-lg">{med.name}</div>
            <div className="text-blue-700 font-bold">${med.price}</div>
          </li>
        ))}
      </ul>
    </div>
  );
} 