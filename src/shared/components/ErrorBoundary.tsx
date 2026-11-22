import { Component, type ReactNode } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from '@design-system/primitives/Button';
import { Panel } from '@design-system/primitives/Panel';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-ds-bg p-4">
          <Panel className="w-full max-w-md p-8 text-center">
            <IconAlertTriangle size={32} className="mx-auto text-ds-danger" aria-hidden="true" />
            <h1 className="mt-3 text-lg font-bold text-ds-text">エラーが発生しました</h1>
            <p className="mt-2 text-sm text-ds-text-muted">
              {this.state.error?.message || '予期しないエラーが発生しました'}
            </p>
            <Button
              variant="primary"
              className="mt-5"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              トップに戻る
            </Button>
          </Panel>
        </div>
      );
    }

    return this.props.children;
  }
}
