"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { MdRefresh, MdError } from "react-icons/md";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="bg-red-50 p-8 rounded-xl shadow-sm border border-red-100 max-w-lg w-full">
            <div className="flex items-center justify-center mb-4">
              <MdError className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-red-700 text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 text-center mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <MdRefresh className="w-5 h-5 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
