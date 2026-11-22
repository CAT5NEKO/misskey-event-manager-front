import { Button } from './Button';
import { cn } from '../lib/cn';

export interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  className?: string;
}

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  showPageNumbers = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const startPage = Math.max(1, Math.min(page - 3, totalPages - 6));
  const endPage = Math.min(totalPages, startPage + 6);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  return (
    <nav
      aria-label="ページネーション"
      className={cn('flex flex-wrap items-center justify-center gap-2', className)}
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        前へ
      </Button>
      {showPageNumbers ? (
        pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? 'primary' : 'secondary'}
            size="sm"
            aria-current={pageNumber === page ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))
      ) : (
        <span className="px-2 text-sm text-ds-text-muted">
          {page} / {totalPages}
        </span>
      )}
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        次へ
      </Button>
    </nav>
  );
}
