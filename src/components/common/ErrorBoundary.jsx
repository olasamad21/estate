import React from 'react';
import { safeLocalStorage } from '../../utils/storage.js';
import { Button } from './Button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    safeLocalStorage.clearDemoStorage();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-canvas flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-surface border border-line rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h1 className="text-lg font-bold text-ink">
              Something went wrong
            </h1>
            <p className="text-xs text-ink-muted leading-relaxed">
              The demo hit an unexpected problem. Resetting it will bring everything back.
            </p>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                onClick={this.handleReset}
              >
                Reset demo and reload
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
