import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userConnections, setUserConnections] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, connections')
          .eq('id', userId)
          .single();

        setCurrentUser(userData);
        setUserConnections(userData?.connections || []);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .or(`id.eq.${query},email.ilike.%${query}%,name.ilike.%${query}%`);

    if (error) {
      console.error('Search error:', error.message);
    } else {
      // Exclude self from results
      const filtered = data.filter(user => user.id !== currentUser?.id);
      setResults(filtered);
    }
  };

  const handleConnect = async (targetid) => {
    if (!currentUser) return;

    const updatedConnections = [...new Set([...(userConnections || []), targetid])];

    // Update current user
    const { error: err1 } = await supabase
      .from('users')
      .update({ connections: updatedConnections })
      .eq('id', currentUser.id);

    // Update the other user as well
    const { data: otherUser } = await supabase
      .from('users')
      .select('connections')
      .eq('id', targetid)
      .single();

    const otherUpdated = [...new Set([...(otherUser?.connections || []), currentUser.id])];

    const { error: err2 } = await supabase
      .from('users')
      .update({ connections: otherUpdated })
      .eq('id', targetid);

    if (!err1 && !err2) {
      setUserConnections(updatedConnections);
      alert('Connected successfully!');
    } else {
      alert('Connection failed.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-6">🔍 Search Users</h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter id, name, or email"
          className="flex-1 border border-gray-300 rounded-lg p-3"
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </div>

      {results.map((user) => (
        <div
          key={user.id}
          className="bg-white shadow-md rounded-lg py-4 px-6 mb-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-gray-800">id: {user.id}</p>
            <p className="text-sm text-gray-500">Email: {user.email}</p>
            <p className="text-sm text-gray-500">Name: {user.name}</p>
          </div>
          {userConnections.includes(user.id) ? (
            <span className="text-green-600 font-semibold">✔ Connected</span>
          ) : (
            <button
              onClick={() => handleConnect(user.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Connect
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchUsers;
