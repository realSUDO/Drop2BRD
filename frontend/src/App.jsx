import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Report from './pages/Report';

function App() {
  return (
    <div className="min-h-screen bg-primary">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report/:projectId" element={<Report />} />
      </Routes>
    </div>
  );
}

export default App;
