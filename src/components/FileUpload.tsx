import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FileUpload: React.FC = () => {
  const navigate = useNavigate();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target?.result?.toString().split(',')[1];
        if (!base64Content) {
          throw new Error('Failed to read file');
        }

        const fileList = JSON.parse(localStorage.getItem('csvFiles') || '[]');
        const newFile = {
          id: Date.now(),
          name: file.name,
          path: `ArchivosCsv/${file.name}`
        };

        // Store file metadata
        localStorage.setItem('csvFiles', JSON.stringify([...fileList, newFile]));
        // Store file content
        localStorage.setItem(`file_${newFile.id}`, base64Content);

        alert('File uploaded successfully!');
        navigate('/files');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  }, [navigate]);

  return (
    <div className="p-8">
      <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-50">
        <Upload className="w-8 h-8 text-blue-500" />
        <span className="mt-2 text-base">Select CSV file</span>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
};

export default FileUpload;