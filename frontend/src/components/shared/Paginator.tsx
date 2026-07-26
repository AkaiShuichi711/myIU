interface PaginatorProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  isLoading?: boolean;
}

const Paginator = ({ page, total, pageSize, onChange, isLoading }: PaginatorProps) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const items: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      items.push(i);
    } else if (items[items.length - 1] !== '…') {
      items.push('…');
    }
  }

  const base = 'w-8 h-8 rounded-lg text-sm font-medium transition-all flex items-center justify-center';
  const active = 'bg-[#0057A8] text-white';
  const idle = 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';
  const disabled = 'text-slate-300 dark:text-slate-600 cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-1 py-5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1 || isLoading}
        className={`${base} ${page === 1 ? disabled : idle}`}
      >
        ‹
      </button>

      {items.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="w-8 text-center text-slate-400 dark:text-slate-500 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            disabled={isLoading}
            className={`${base} ${p === page ? active : idle}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages || isLoading}
        className={`${base} ${page === totalPages ? disabled : idle}`}
      >
        ›
      </button>

      <span className="ml-3 text-xs text-slate-400 dark:text-slate-500">
        {page} / {totalPages}
      </span>
    </div>
  );
};

export default Paginator;
