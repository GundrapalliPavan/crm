import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

/**
 * Catches render-time failures so a single broken component degrades to a
 * readable message instead of an unexplained blank screen (FRONTEND.md
 * section 130).
 *
 * The fallback is deliberately minimal: the production error experience is
 * designed once the design system is implemented. Technical detail is logged,
 * never rendered - stack traces must not reach users (FRONTEND.md section 131).
 */
export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Replace with the project's monitoring transport when observability is
    // configured; console is the only sink available today.
    console.error('Unhandled rendering error', error, errorInfo.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-slate-600">
          The page could not be displayed. Reloading usually resolves this.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-md border border-slate-300 px-4 py-2 font-medium"
        >
          Reload page
        </button>
      </main>
    );
  }
}
