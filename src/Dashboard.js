import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/');
      } else {
        const currentUser = data.session.user;
        setUser(currentUser);
        fetchFolders(currentUser.id);
        fetchUserInfo(currentUser.id);
      }
    };
    getSession();
  }, [navigate]);

  const fetchUserInfo = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('name, connections')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserName(data.name);
      if (data.connections && data.connections.length > 0) {
        fetchConnectedUsers(data.connections);
      }
    }
  };

  const fetchConnectedUsers = async (uids) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', uids);

    if (!error) setConnections(data);
  };

  const fetchFolders = async (userId) => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setFolders(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from('folders').insert([
      {
        name: newFolderName,
        user_id: user.id,
      },
    ]);
    if (!error) {
      setNewFolderName('');
      setShowModal(false);
      fetchFolders(user.id);
    }
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <div className="bg-white shadow p-4 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">📘 EduVault</h1>
        {user && (
          <div className="mt-3 sm:mt-0 flex items-center gap-4">
            <span className="text-gray-700 font-medium">Hi, {userName}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row p-4 gap-6 max-w-7xl mx-auto w-full">
        {/* Folder Section */}
        <div className="flex-1">
          {/* Search & Create */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ➕ Create Folder
            </button>
          </div>

          {/* Folder Grid */}
          {filteredFolders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFolders.map((folder) => (
                <Link to={`/folder/${folder.id}`} key={folder.id}>
                  <div className="bg-white p-4 rounded-lg shadow h-32 flex flex-col justify-between hover:shadow-md transition">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{folder.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {new Date(folder.created_at).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No folders found.</p>
          )}
        </div>

        {/* Connections Panel */}
        <div className="w-full lg:w-1/3 bg-white p-5 rounded-lg shadow border">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">👥 Your Connections</h2>

          {connections.length === 0 ? (
            <p className="text-gray-500 text-sm">You have no connections yet.</p>
          ) : (
            <ul className="space-y-4 mb-4">
              {connections.map((c) => (
                <li key={c.id} className="border-b pb-2">
                  <p className="text-gray-800 font-medium">{c.name || 'No Name'}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <Link
              to="/connections"
              className="flex-1 bg-indigo-600 text-white text-center py-2 rounded hover:bg-indigo-700"
            >
              View
            </Link>
            <Link
              to="/searchusers"
              className="flex-1 bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600"
            >
              Add More
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 sm:w-96 p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Create New Folder</h2>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
