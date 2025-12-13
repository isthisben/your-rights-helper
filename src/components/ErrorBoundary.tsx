import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h1 className="text-xl font-semibold">Something went wrong</h1>
        </div>
        
        <p className="text-muted-foreground">
          We encountered an unexpected error. Please try refreshing the page or return to the home page.
        </p>
        
        {import.meta.env.DEV && error && (
          <details className="mt-4 p-3 bg-muted rounded text-sm">
            <summary className="cursor-pointer font-medium mb-2">Error details (dev only)</summary>
            <pre className="whitespace-pre-wrap text-xs overflow-auto">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div className="flex gap-3 pt-4">
          <Button onClick={onReset} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: Props) {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
}

