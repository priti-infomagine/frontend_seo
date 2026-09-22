import { useState, useMemo, useCallback } from 'react';

interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  emptyMessage?: string;
}

export function PaginatedList<T>({
  items,
  renderItem,
  itemsPerPage: initialItemsPerPage = 20,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
  emptyMessage = 'No items to display',
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  }, []);

  if (items.length === 0) {
    return (
      <div className={`paginated-list-empty ${className}`} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`paginated-list ${className}`}>
      <div className="paginated-list-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {paginatedItems.map((item, index) => (
          <div key={index} style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {renderItem(item, (currentPage - 1) * itemsPerPage + index)}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="paginated-list-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          {showPageSizeSelector && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  fontSize: '13px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>

            <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'center' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>

          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {items.length} total
          </span>
        </div>
      )}
    </div>
  );
}

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 400,
  overscan = 5,
  className = '',
  emptyMessage = 'No items to display',
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  if (items.length === 0) {
    return (
      <div className={`virtualized-list-empty ${className}`} style={{ height: containerHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      className={`virtualized-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        background: 'var(--card-bg)',
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(visibleRange.start, visibleRange.end).map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}