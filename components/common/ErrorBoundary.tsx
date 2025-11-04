
import React, { ErrorInfo, ReactNode } from 'react';
import { ServerCrash } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Switched to using a constructor to explicitly initialize state and ensure 'this.props' is correctly set up on the component instance, resolving the type error.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // This static method is the first step in the error handling process.
    // It should return a state update.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // This is for side effects like logging.
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRefresh = () => {
    // A full page reload is a simple and effective recovery mechanism for an error boundary.
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
            <div className="text-center neu-card p-12">
                <ServerCrash size={48} className="mx-auto text-primary mb-4" />
                <h1 className="text-3xl font-display font-bold">Something went wrong.</h1>
                <p className="text-on-surface-variant mt-2 mb-6">
                    An unexpected error occurred. Please try refreshing the page.
                </p>
                <button
                    onClick={this.handleRefresh}
                    className="neu-button active px-6 py-2 font-bold"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
