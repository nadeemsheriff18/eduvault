import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';

const Folder = () => {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState('');

  // Fetch folder name
  const fetchFolderName = async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('name')
      .eq('id', folderId)
      .single();

    if (error) {
      console.error('Error fetching folder name:', error);
      setFolderName('Unnamed Folder');
    } else {
      setFolderName(data.name);
    }
  };

  // Fetch files from metadata table
  const fetchFiles = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error } = await supabase
      .from('files')
      .select('id, file_name, file_path')
      .eq('user_id', userId)
      .eq('folder_id', folderId);

    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const filePath = `${userId}/${folderId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('folderfiles')
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: metadataError } = await supabase.from('files').insert([
      {
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        folder_id: folderId,
      },
    ]);

    setUploading(false);
    if (metadataError) {
      alert(metadataError.message);
    } else {
      setFile(null);
      fetchFiles();
    }
  };

  useEffect(() => {
    fetchFolderName();
    fetchFiles();
  }, [folderId]);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-semibold text-center text-indigo-700 mb-6">
        📁 {folderName ? folderName : 'Loading...'}
      </h1>

      {/* File Upload Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-center items-center gap-5">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 rounded-lg p-3 text-gray-700"
        />
        <button
          onClick={uploadFile}
          disabled={uploading}
          className="bg-indigo-600 text-white py-3 px-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition ease-in-out"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Files List */}
      <div className="space-y-4">
        {files.length > 0 ? (
          files.map((file) => (
            <div
              key={file.id}
              className="bg-white shadow-md rounded-lg py-4 px-8 flex justify-between items-center hover:bg-gray-50 transition ease-in-out mx-5"
            >
              <span className="text-lg text-gray-800 font-medium">{file.file_name}</span>
              <button
                onClick={async () => {
                  const { data, error } = await supabase.storage
                    .from('folderfiles')
                    .createSignedUrl(file.file_path, 60);
                  if (error || !data?.signedUrl) {
                    alert('Could not open file.');
                  } else {
                    window.open(data.signedUrl, '_blank');
                  }
                }}
                className="text-indigo-500 hover:underline transition"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg">No files found in this folder.</div>
        )}
      </div>
    </div>
  );
};

export default Folder;
