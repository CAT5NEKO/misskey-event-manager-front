import { Pagination, type PaginationProps } from '@design-system/primitives/Pagination';

export { Pagination, type PaginationProps };

export function PaginationFooter(props: Omit<PaginationProps, 'className'>) {
  return (
    <div className="fixed bottom-[var(--ds-min-bottom-spacing-mobile)] left-0 right-0 z-20 border-t-[0.5px] border-ds-border bg-ds-surface shadow-ds-top min-[501px]:bottom-0 min-[501px]:left-[var(--ds-sidebar-icon-width)] min-[1280px]:left-[var(--ds-sidebar-width)]">
      <div className="mx-auto max-w-ds-wide px-4 py-3">
        <Pagination {...props} />
      </div>
    </div>
  );
}
