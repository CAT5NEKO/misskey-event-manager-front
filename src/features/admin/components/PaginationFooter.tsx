interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ total, page, pageSize, onPageChange, className }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className || ''}`}>
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
      >
        前へ
      </button>
      <span className="px-3 py-1.5 text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page * pageSize >= total}
        className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
      >
        次へ
      </button>
    </div>
  );
}

export function PaginationFooter(props: Omit<PaginationProps, 'className'>) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white shadow-[0_-4px_8px_-6px_rgba(0,0,0,0.4)]">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <Pagination {...props} />
      </div>
    </div>
  );
}