import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { DatasetProvider } from './context/DatasetContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import AppErrorBoundary from './components/common/AppErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <DatasetProvider>
        <BrowserRouter>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </BrowserRouter>
      </DatasetProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
