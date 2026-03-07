/**
 * DentalRecordPagination – Phân trang tối giản (không icon, hiệu ứng mượt)
 */
const DentalRecordPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Hiển thị tối đa 7 trang, rút gọn bằng dấu ...
    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [];
        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1 pt-4">
            {/* Prev */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                Trước
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-gray-300">
                        ···
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${p === currentPage
                                ? 'bg-teal-500 text-white shadow-sm scale-105'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                Sau
            </button>
        </div>
    );
};

export default DentalRecordPagination;
