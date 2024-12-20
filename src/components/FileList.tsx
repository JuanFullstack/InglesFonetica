import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2 } from 'lucide-react';
import type { CsvFile } from '../types/csv';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<CsvFile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('csvFiles') || '[]');
    setFiles(storedFiles);
  }, []);

  const handleSelect = (fileId: number) => {
    localStorage.setItem('selectedFileId', fileId.toString());
    navigate(`/viewer/${fileId}`);
  };

  const handleDelete = (fileId: number) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    localStorage.setItem('csvFiles', JSON.stringify(updatedFiles));
    setFiles(updatedFiles);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Available CSV Files</h2>
      <div className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-3" />
              <span>{file.name}</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleSelect(file.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Select
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;