import React from 'react';
import { Link } from 'react-router-dom';

export default class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background text-text">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-secondary-text mb-6">DataLens encountered an unexpected interface error.</p>
        <div className="flex gap-3">
          <button onClick={this.handleRetry} className="bg-accent text-white px-5 py-2.5 rounded-lg font-medium">Retry</button>
          <Link to="/dashboard" className="bg-raised border border-border px-5 py-2.5 rounded-lg font-medium">Go to Dashboard</Link>
        </div>
        {import.meta.env.DEV && (
          <pre className="mt-6 max-w-2xl overflow-auto text-left text-xs text-error whitespace-pre-wrap">{this.state.error.stack}</pre>
        )}
      </div>
    );
  }
}