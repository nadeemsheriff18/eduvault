import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;

      if (!currentUserId) {
        setConnections([]);
        setLoading(false);
        return;
      }

      const { data: currentUser, error: userErr } = await supabase
        .from('users')
        .select('connections')
        .eq('id', currentUserId)
        .single();

      if (userErr || !currentUser?.connections || currentUser.connections.length === 0) {
        setConnections([]);
        setLoading(false);
        return;
      }

      const { data: connectedUsers, error: connErr } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', currentUser.connections);

      if (connErr) {
        console.error('Error fetching connected users:', connErr);
      } else {
        setConnections(connectedUsers);
      }

      setLoading(false);
    };

    fetchConnections();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">👥 Your Connections</h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading connections...</p>
      ) : connections.length === 0 ? (
        <p className="text-gray-500 text-center">You have no connections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {connections.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 shadow rounded-lg border border-gray-200"
            >
              <h3 className="font-semibold text-gray-800">{user.name || 'No Name'}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;
