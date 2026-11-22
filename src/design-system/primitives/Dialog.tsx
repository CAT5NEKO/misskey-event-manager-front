import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Info, type InfoTone } from './Info';

interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface AlertOptions {
  title?: string;
  message: ReactNode;
  tone?: InfoTone;
  buttonLabel?: string;
}

type DialogState =
  | {
      kind: 'confirm';
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      kind: 'alert';
      options: AlertOptions;
      resolve: () => void;
    };

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('DialogProvider is missing');
  }

  return context;
}

export function useConfirm() {
  return useDialogContext().confirm;
}

export function useAlert() {
  return useDialogContext().alert;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ kind: 'confirm', options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setDialog({ kind: 'alert', options, resolve });
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setDialog((current) => {
      if (!current) return null;

      if (current.kind === 'confirm') {
        current.resolve(value);
      } else {
        current.resolve();
      }

      return null;
    });
  }, []);

  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [dialog, close]);

  const contextValue = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {dialog &&
        createPortal(
          <div
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ds-overlay p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ds-dialog-title"
              className="w-full max-w-md rounded-ds-lg bg-ds-surface p-5 shadow-ds"
            >
              {dialog.kind === 'confirm' ? (
                <>
                  <h2 id="ds-dialog-title" className="text-base font-bold text-ds-text">
                    {dialog.options.title ?? '確認'}
                  </h2>
                  <div className="mt-3 text-sm text-ds-text">{dialog.options.message}</div>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => close(false)}>
                      {dialog.options.cancelLabel ?? 'キャンセル'}
                    </Button>
                    <Button
                      variant={dialog.options.danger ? 'danger' : 'primary'}
                      onClick={() => close(true)}
                    >
                      {dialog.options.confirmLabel ?? 'OK'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="ds-dialog-title" className="text-base font-bold text-ds-text">
                    {dialog.options.title ?? 'お知らせ'}
                  </h2>
                  <div className="mt-3">
                    <Info tone={dialog.options.tone ?? 'info'}>{dialog.options.message}</Info>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Button variant="primary" onClick={() => close(true)}>
                      {dialog.options.buttonLabel ?? 'OK'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </DialogContext.Provider>
  );
}
