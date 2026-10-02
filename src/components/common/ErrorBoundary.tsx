import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GME Error Boundary] Caught exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 text-[#111827]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200 p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Recovered Safely</h2>
              <p className="text-sm text-gray-600 mt-2">
                A rendering component encountered an unexpected error. Global Mountain Explorer state was protected from cascading failure.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-xs bg-gray-50 text-gray-700 p-3 rounded-lg text-left overflow-x-auto border border-gray-200 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Explorer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
