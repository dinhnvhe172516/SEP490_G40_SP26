import { useNavigate } from 'react-router-dom';

const statusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    COMPLETED: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-red-50 text-red-500 border-red-200' },
};

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * PatientRecordList
 * Hiển thị tất cả hồ sơ nha khoa của bệnh nhân đã chọn
 * Props:
 *   patient    – bệnh nhân đang được chọn { full_name, ... }
 *   records    – mảng dental records
 *   isLoading  – bool
 *   error      – string | null
 *   onRetry    – callback
 */
const PatientRecordList = ({ patient, records, isLoading, error, onRetry }) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 rounded-2xl h-24" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={onRetry} className="underline font-medium hover:text-red-700">Thử lại</button>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center text-gray-400 text-sm">
                <p className="font-medium text-gray-500 mb-1">{patient.full_name}</p>
                <p>Bệnh nhân này chưa có hồ sơ nha khoa nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Summary header */}
            <div className="flex items-center justify-between text-sm px-1">
                <span className="font-medium text-gray-700">{patient.full_name}</span>
                <span className="text-gray-400">
                    {records.length} hồ sơ
                </span>
            </div>

            {/* Record cards */}
            {records.map(record => {
                const statusInfo = statusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };
                return (
                    <div
                        key={record._id}
                        className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200"
                    >
                        <div className="p-5">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                {/* Left */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                                            {record.record_name}
                                        </h3>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {record.created_by?.full_name && (
                                        <p className="text-xs text-gray-500">
                                            <span className="text-gray-400 uppercase tracking-wide mr-1">BS</span>
                                            {record.created_by.full_name}
                                        </p>
                                    )}

                                    {record.description && (
                                        <p className="text-xs text-gray-500 line-clamp-1">{record.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                        {formatDate(record.start_date) && (
                                            <span>Bắt đầu: {formatDate(record.start_date)}</span>
                                        )}
                                        {formatDate(record.end_date) && (
                                            <span>Kết thúc: {formatDate(record.end_date)}</span>
                                        )}
                                        {record.treatments?.length > 0 && (
                                            <span className="text-teal-500 font-medium">
                                                {record.treatments.length} phiếu điều trị
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Right */}
                                <button
                                    onClick={() => navigate(`/dentist/dental-records/${record._id}`)}
                                    className="flex-shrink-0 self-center px-4 py-1.5 rounded-xl border border-teal-500 text-teal-600 text-xs font-medium hover:bg-teal-500 hover:text-white transition-all duration-200"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PatientRecordList;
