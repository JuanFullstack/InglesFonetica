import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import CsvViewer from './components/CsvViewer';
import { Upload, List } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">CSV Manager</h1>
            <div className="space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Link>
              <Link
                to="/files"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <List className="w-4 h-4 mr-2" />
                Files
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<FileUpload />} />
            <Route path="/files" element={<FileList />} />
            <Route path="/viewer/:id" element={<CsvViewer />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;