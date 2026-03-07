/**
 * DentalRecordFilter – Thanh tìm kiếm & bộ lọc (tối giản, không icon)
 */
const DentalRecordFilter = ({
    inputValue, onInputChange,
    statusFilter, onStatusChange,
    treatmentFilter, onTreatmentChange,
    sortOrder, onSortChange,
    onClear,
}) => {
    const hasFilter = inputValue || statusFilter || treatmentFilter || sortOrder;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Tìm theo tên hồ sơ, bác sĩ, vị trí răng..."
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    className="flex-1 min-w-[220px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                >
                    <option value="">Trạng thái hồ sơ</option>
                    <option value="IN_PROGRESS">Đang điều trị</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>
                <select
                    value={treatmentFilter}
                    onChange={(e) => onTreatmentChange(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                >
                    <option value="">Trạng thái phiếu</option>
                    <option value="PENDING">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                >
                    <option value="">Sắp xếp</option>
                    <option value="asc">Cũ nhất trước</option>
                    <option value="desc">Mới nhất trước</option>
                </select>
                {hasFilter && (
                    <button
                        onClick={onClear}
                        className="px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition underline-offset-2 hover:underline"
                    >
                        Xóa lọc
                    </button>
                )}
            </div>
        </div>
    );
};

export default DentalRecordFilter;
