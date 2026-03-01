import { HashRouter, Routes, Route } from 'react-router-dom';
import PasswordGate from './components/PasswordGate';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';

export default function App() {
  return (
    <PasswordGate>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/activities" element={<Activities />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </PasswordGate>
  );
}
