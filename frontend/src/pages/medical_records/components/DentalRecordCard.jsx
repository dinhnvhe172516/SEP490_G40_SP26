import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

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
 * DentalRecordCard – Card hiển thị 1 hồ sơ nha khoa (tối giản, không icon)
 */
const DentalRecordCard = ({ record }) => {
    const navigate = useNavigate();
    const statusInfo = statusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };

    return (
        <div className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">

                    {/* Left: nội dung */}
                    <div className="flex-1 space-y-3 min-w-0">

                        {/* Tên hồ sơ + trạng thái */}
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                                {record.record_name}
                            </h3>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                                {statusInfo.label}
                            </span>
                        </div>

                        {/* Bệnh nhân + bác sĩ */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                            {record.full_name && (
                                <span>
                                    <span className="text-gray-400 text-xs uppercase tracking-wide mr-1">BN</span>
                                    <strong className="text-gray-800">{record.full_name}</strong>
                                </span>
                            )}
                            {record.phone && (
                                <span className="text-gray-400">SDT: {record.phone}</span>
                            )}
                            {record.created_by?.full_name && (
                                <span>
                                    <span className="text-gray-400 text-xs uppercase tracking-wide mr-1">BS</span>
                                    {record.created_by.full_name}
                                </span>
                            )}
                        </div>

                        {/* Mô tả */}
                        {record.description && (
                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                {record.description}
                            </p>
                        )}

                        {/* Ngày + số phiếu */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            {formatDate(record.start_date) && (
                                <span>Bắt đầu: {formatDate(record.start_date)}</span>
                            )}
                            {formatDate(record.end_date) && (
                                <span>Kết thúc: {formatDate(record.end_date)}</span>
                            )}
                            {!record.start_date && formatDate(record.createdAt) && (
                                <span>Tạo: {formatDate(record.createdAt)}</span>
                            )}
                            {record.treatment_list?.length > 0 && (
                                <span className="text-teal-500 font-medium">
                                    {record.treatment_list.length} phiếu điều trị
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: nút xem chi tiết */}
                    <Button
                        onClick={() => navigate(`/dentist/dental-records/${record._id}`)}
                        className="flex-shrink-0 self-center px-5 py-2 rounded-xl border border-teal-500 text-teal-600 text-sm font-medium hover:bg-teal-500 hover:text-white transition-all duration-200"
                        variant="outline"
                        size="sm"
                    >
                        Xem chi tiết
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DentalRecordCard;
