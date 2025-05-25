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
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📘 EduVault</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Hi, {userName}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Panel: Folders */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-6">
            <input
              type="text"
              placeholder="Search folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded border w-full"
            />
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition w-1/4"
            >
              ➕ Create Folder
            </button>
          </div>

          {/* Folders Grid */}
          {filteredFolders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredFolders.map((folder) => (
                <Link to={`/folder/${folder.id}`} key={folder.id}>
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition h-32 flex flex-col justify-between">
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

        {/* Right Panel: Connections */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold mb-4 text-indigo-700">👥 Your Connections</h3>
          {connections.length === 0 ? (
            <p className="text-gray-500 text-sm">You have no connections.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {connections.map((c) => (
                <li key={c.id} className="flex flex-col border-b pb-2">
                  <span className="font-medium text-gray-800">{c.name || 'No Name'}</span>
                  <span className="text-sm text-gray-500">{c.email}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between gap-2">
            <Link
              to="/connections"
              className="flex-1 text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              View
            </Link>
            <Link
              to="/searchusers"
              className="flex-1 text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add More
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-96 space-y-4">
            <h2 className="text-xl font-bold">Create New Folder</h2>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
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
