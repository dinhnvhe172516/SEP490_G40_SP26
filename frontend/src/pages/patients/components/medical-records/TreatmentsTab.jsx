import React from 'react';
import { Clock, DollarSign, Eye, Stethoscope } from 'lucide-react';
import { getStatusBadge, formatCurrency } from './statusHelpers';

const TreatmentsTab = ({ treatments, onViewDetail }) => {
    const sessions = (treatments || []).filter(t => t.phase === 'SESSION' || (t.phase !== 'PLAN' && t.status !== 'PLANNED'));

    if (sessions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Stethoscope size={36} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có buổi điều trị nào được thực hiện.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-6 border-l-2 border-primary-200 space-y-6">
            {sessions.map((t, idx) => (
                <div key={t._id || idx} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-white shadow ${t.status === 'DONE' ? 'bg-green-500' : t.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />

                    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-semibold text-gray-800">{t.tooth_position || 'Toàn hàm'}</span>
                                    {getStatusBadge(t.status)}
                                </div>
                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                    {t.performed_date && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} /> {new Date(t.performed_date).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                    {t.planned_price != null && (
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={13} />
                                            {formatCurrency(t.planned_price)}
                                        </span>
                                    )}
                                </div>
                                {t.result && <p className="text-sm text-gray-600 mt-1">Kết quả: {t.result}</p>}
                                {t.note && <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">— {t.note}</p>}
                            </div>
                            <button
                                onClick={() => onViewDetail(t)}
                                className="flex-shrink-0 px-3 py-1.5 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                                <Eye size={14} /> Chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TreatmentsTab;
