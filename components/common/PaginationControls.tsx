import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  pageSizeOptions?: number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full text-sm">
      <div className="font-semibold text-on-surface-variant">
        Showing {totalItems > 0 ? Math.min(currentPage * pageSize + 1, totalItems) : 0} - {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} results
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <span className="font-semibold text-on-surface-variant">Show:</span>
            <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="neu-control neu-select px-3 py-1.5 text-sm font-sans font-semibold"
            >
                {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="neu-control p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-on-surface-variant w-20 text-center">
                Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
            </span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="neu-control p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
