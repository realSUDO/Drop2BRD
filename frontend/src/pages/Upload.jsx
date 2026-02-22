import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileChartColumn, FileText, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import { api } from '../services/api';
import dragAndDropImage from '../assets/drag-drop.svg';

export default function Upload() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
  };

  const addFiles = (files) => {
    const validFiles = [];
    
    for (const file of files) {
      // Check for duplicates
      const isDuplicate = uploadedFiles.some(
        existing => existing.name === file.name && existing.size === file.size
      );
      
      if (isDuplicate) {
        alert(`File "${file.name}" is already uploaded.`);
        continue;
      }
      
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 20MB.`);
        continue;
      }
      
      // Check file type
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['csv', 'pdf'].includes(ext)) {
        alert(`File "${file.name}" is not supported. Only CSV and PDF files are allowed.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ext === 'csv' ? FileChartColumn : FileText;
  };

  const handleContinue = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }

    console.log(`\n🚀 Uploading ${uploadedFiles.length} file(s)`);

    setIsProcessing(true);
    
    try {
      const projectId = Date.now().toString();
      
      // Upload all files
      for (const file of uploadedFiles) {
        console.log(`📤 Uploading ${file.name}...`);
        await api.uploadFile(projectId, file);
      }
      console.log('✅ All files uploaded and processed');
      
      // Set project name if provided
      if (projectName.trim()) {
        await api.renameProject(projectId, projectName.trim());
        console.log(`✏️ Project renamed to: ${projectName.trim()}`);
      }
      
      // Generate BRD
      console.log('🤖 Generating BRD...');
      await api.generateBRD(projectId);
      console.log('✅ BRD generated successfully');
      
      // Navigate to report page
      navigate(`/report/${projectId}`);
    } catch (error) {
      console.error('❌ Failed:', error);
      alert('Failed to process files: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex min-h-screen bg-primary items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/loading.gif" alt="Loading" className="w-100 h-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <TopBar title="Upload Communication Data" className="text-gray-600" />

      <div className="flex-1 flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Upload box */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {/* Project Name Input */}
          <div className="w-full max-w-[400px] mb-4">
            <input
              type="text"
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-figma bg-card border border-border text-[#B0B0B0] placeholder:text-muted-lighter outline-none focus:border-btn-primary transition-colors"
            />
          </div>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('upload-input').click()}
            className="w-full max-w-[400px] min-h-[279px] flex flex-col items-center justify-center gap-2 rounded-figma-lg border-2 border-dashed border-input-border bg-card-alt cursor-pointer hover:border-muted-light transition-colors p-6"
          >
            <input
              id="upload-input"
              type="file"
              accept=".csv,.pdf"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            
            {uploadedFiles.length === 0 ? (
              <>
                <img src={dragAndDropImage} alt="Drag and drop" className="w-48 h-48" />
                <span className="text-sm text-muted-light">CSV or PDF files (max 20MB)</span>
              </>
            ) : (
              <div className="w-full h-full flex flex-wrap gap-4 justify-center items-center content-center overflow-auto p-4">
                {uploadedFiles.map((file, index) => {
                  const isCSV = file.name.toLowerCase().endsWith('.csv');
                  const fileCount = uploadedFiles.length;
                  const sizeClass = fileCount <= 2 ? 'w-32 h-32' : fileCount <= 4 ? 'w-24 h-24' : 'w-20 h-20';
                  const iconSize = fileCount <= 2 ? 'w-16 h-16' : fileCount <= 4 ? 'w-12 h-12' : 'w-10 h-10';
                  
                  return (
                    <div key={index} className="relative group">
                      <div className={`${sizeClass} flex flex-col items-center justify-center gap-1 rounded-lg bg-card border border-border p-2`}>
                        {isCSV ? (
                          <FileChartColumn className={`${iconSize} text-blue-400`} strokeWidth={1.5} />
                        ) : (
                          <FileText className={`${iconSize} text-green-400`} strokeWidth={1.5} />
                        )}
                        <span className="text-xs text-white truncate w-full text-center px-1">
                          {file.name.length > 10 ? file.name.slice(0, 10) + '...' : file.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" strokeWidth={2} />
                      </button>
                    </div>
                  );
                })}
                <div className={`${uploadedFiles.length <= 2 ? 'w-32 h-32' : uploadedFiles.length <= 4 ? 'w-24 h-24' : 'w-20 h-20'} flex items-center justify-center rounded-lg border-2 border-dashed border-input-border hover:border-muted-light transition-colors`}>
                  <span className="text-2xl text-muted-light">+</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue button - bottom right */}
      <div className="flex justify-end p-6 border-t border-border">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isProcessing || uploadedFiles.length === 0}
          className="flex items-center gap-2.5 py-3 px-4 rounded-pill bg-white text-primary text-base font-normal hover:opacity-90 disabled:opacity-70"
        >
          {isProcessing ? 'Processing...' : 'Continue'}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
