import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AskData from './pages/AskData';
import Visualize from './pages/Visualize';
import DataQuality from './pages/DataQuality';
import Reports from './pages/Reports';
import Schema from './pages/Schema';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import CommandPalette from './components/CommandPalette';

function App() {
  return (
    <>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ask" element={<AskData />} />
          <Route path="/visualize" element={<Visualize />} />
          <Route path="/quality" element={<DataQuality />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/schema" element={<Schema />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        </div>
      </main>
      </div>
    </>
  );
}

export default App;
