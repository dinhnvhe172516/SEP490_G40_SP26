import React from 'react';
import { Pill, CheckCircle2, AlertCircle } from 'lucide-react';

const PrescriptionsTab = ({ treatments }) => {
    // Gom tất cả medicine_usage từ mọi treatment
    const allMeds = [];
    (treatments || []).forEach((t) => {
        if (t.medicine_usage && t.medicine_usage.length > 0) {
            t.medicine_usage.forEach((med) => {
                allMeds.push({
                    ...med,
                    fromTooth: t.tooth_position || 'Toàn hàm',
                    performedDate: t.performed_date || t.planned_date,
                });
            });
        }
    });

    if (allMeds.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Pill size={36} className="mx-auto mb-2 text-gray-300" />
                <p>Không có đơn thuốc nào trong hồ sơ này.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-primary-50 to-blue-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên thuốc</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Số lượng</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Hướng dẫn sử dụng</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Ghi chú</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Đã cấp</th>
                    </tr>
                </thead>
                <tbody>
                    {allMeds.map((med, i) => (
                        <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-gray-800">
                                {med.medicine_id?.name || med.medicine_id || `Thuốc #${i + 1}`}
                            </td>
                            <td className="px-4 py-2.5 text-center text-gray-700">{med.quantity}</td>
                            <td className="px-4 py-2.5 text-gray-600">{med.usage_instruction || '—'}</td>
                            <td className="px-4 py-2.5 text-gray-500 italic">{med.note || '—'}</td>
                            <td className="px-4 py-2.5 text-center">
                                {med.dispensed ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                        <CheckCircle2 size={14} /> Đã cấp
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                                        <AlertCircle size={14} /> Chưa cấp
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PrescriptionsTab;
