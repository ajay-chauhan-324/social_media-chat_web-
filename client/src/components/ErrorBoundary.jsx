import { Component } from 'react';
import Button from '@/components/ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-surface-2 px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-danger/10 text-3xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-content">Something went wrong</h1>
          <p className="mt-2 text-muted">
            An unexpected error occurred. Try reloading — if it persists, please let us know.
          </p>
          <Button variant="gradient" className="mt-6" onClick={this.handleReset}>
            Back to safety
          </Button>
        </div>
      </div>
    );
  }
}
