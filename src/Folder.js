import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';
import { IoReturnUpBack } from "react-icons/io5";
import {Link} from 'react-router-dom';
const Folder = () => {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showViewer, setShowViewer] = useState(false);

  const fetchFolderName = async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('name')
      .eq('id', folderId)
      .single();

    setFolderName(error ? 'Unnamed Folder' : data.name);
  };

  const fetchFiles = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error } = await supabase
      .from('files')
      .select('id, file_name, file_path')
      .eq('user_id', userId)
      .eq('folder_id', folderId);

    if (!error) setFiles(data);
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
    if (!metadataError) {
      setFile(null);
      fetchFiles();
    }
  };

  const handleFileView = async (filePath) => {
    const { data, error } = await supabase.storage
      .from('folderfiles')
      .createSignedUrl(filePath, 60);

    if (!error && data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
      setShowViewer(true);
    } else {
      alert('Could not open file.');
    }
  };

  useEffect(() => {
    fetchFolderName();
    fetchFiles();
  }, [folderId]);

  return (
    <div className="container mx-auto py-6 px-4">
      <Link to='/'><button className='px-4 hover:animate-bounce'><IoReturnUpBack size={30} /></button></Link>
      <h1 className="text-3xl font-semibold text-center text-indigo-700 mb-6">
        📁 {folderName || 'Loading...'}
      </h1>

      {/* File Upload Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col md:flex-row justify-center items-center gap-5">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 rounded-lg p-3 w-full md:w-auto"
        />
        <button
          onClick={uploadFile}
          disabled={uploading}
          className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
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
              className="bg-white shadow-md rounded-lg py-4 px-6 flex justify-between items-center hover:bg-gray-50 transition mx-2"
            >
              <span className="text-lg text-gray-800 font-medium truncate">{file.file_name}</span>
              <button
                onClick={() => handleFileView(file.file_path)}
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

      {/* FocusView Modal */}
      {showViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-700">📄 FocusView</h3>
              <button
                onClick={() => {
                  setShowViewer(false);
                  setPreviewUrl('');
                }}
                className="text-gray-500 hover:text-red-500"
              >
                ✖
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-4 text-center">
              <iframe
                src={previewUrl}
                className="w-full h-[70vh]"
                title="File Viewer"
              ></iframe>
            </div>
            <div className="p-4 border-t text-right">
              <a
                href={previewUrl}
                download
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Folder;
