import { useState } from 'react';
import { X } from 'lucide-react';
import { createDentalRecord } from '../../../services/dentalRecordService';

/**
 * CreateDentalRecordModal
 * Gọi POST /api/dentist/patient/:patientId/dental-record
 *
 * Props:
 *   isOpen        – bool
 *   onClose       – callback
 *   onSuccess(record) – callback khi tạo thành công
 *   patientId     – string  (ID bệnh nhân đã chọn)
 *   patientName   – string  (hiển thị readonly)
 *   patientPhone  – string  (hiển thị readonly)
 */
const CreateDentalRecordModal = ({
    isOpen,
    onClose,
    onSuccess,
    patientId,
    patientName = '',
    patientPhone = '',
}) => {
    const [form, setForm] = useState({
        record_name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientId) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const body = {
                record_name: form.record_name.trim(),
                description: form.description.trim(),
                start_date: form.start_date,
                full_name: patientName,
                phone: patientPhone,
            };
            // POST /api/dentist/patient/:id/dental-record
            const res = await createDentalRecord(patientId, body);
            onSuccess?.(res.data);
            onClose();
        } catch (err) {
            console.error('Create dental record error:', err);
            setError(err.response?.data?.message || 'Tạo hồ sơ thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Tạo hồ sơ nha khoa</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Bệnh nhân: {patientName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form id="create-record-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                    {/* Readonly patient info */}
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Họ tên</p>
                            <p className="text-sm font-medium text-gray-700">{patientName || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">SĐT</p>
                            <p className="text-sm font-medium text-gray-700">{patientPhone || '—'}</p>
                        </div>
                    </div>

                    {/* Record name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên hồ sơ <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="record_name"
                            required
                            value={form.record_name}
                            onChange={handleChange}
                            placeholder="VD: Điều trị tủy răng số 6..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Chẩn đoán</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Nhập chẩn đoán hoặc mô tả tình trạng..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition resize-none"
                        />
                    </div>

                    {/* Start date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                        <input
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="create-record-form"
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition"
                    >
                        {isSubmitting ? 'Đang tạo...' : 'Tạo hồ sơ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateDentalRecordModal;
