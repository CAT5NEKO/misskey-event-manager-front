import { cn } from '../lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, description, disabled, id }: SwitchProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-[21px] w-[33.6px] shrink-0 items-center rounded-ds-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-ds-accent' : 'bg-ds-surface-active',
        )}
      >
        <span
          className={cn(
            'absolute left-[3px] top-[3px] h-[15px] w-[15px] rounded-ds-full bg-ds-surface transition-transform',
            checked && 'translate-x-[12.6px]',
          )}
        />
      </button>
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-ds-text">
              {label}
            </label>
          )}
          {description && <p className="mt-0.5 text-xs text-ds-text-muted">{description}</p>}
        </div>
      )}
    </div>
  );
}
