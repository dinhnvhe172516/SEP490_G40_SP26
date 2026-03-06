import { X, CheckCircle, Wrench, Package, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const PrepareAppointmentModal = ({ appointment, isOpen, onClose, onComplete }) => {
    const [checklist, setChecklist] = useState({
        equipment: {
            dentalChair: false,
            instruments: false,
            xrayMachine: false,
            suction: false,
            light: false
        },
        supplies: {
            gloves: false,
            masks: false,
            gauze: false,
            anesthesia: false,
            tray: false,
            syringe: false
        },
        hygiene: {
            sterilization: false,
            disinfection: false,
            areaPrep: false,
            wasteReady: false
        }
    });

    const [notes, setNotes] = useState('');

    if (!isOpen || !appointment) return null;

    const equipmentLabels = {
        dentalChair: { label: 'Ghế nha khoa hoạt động tốt', icon: '🪑' },
        instruments: { label: 'Dụng cụ khám đã tiệt trùng', icon: '🔧' },
        xrayMachine: { label: 'Máy X-quang sẵn sàng', icon: '📷' },
        suction: { label: 'Máy hút hoạt động bình thường', icon: '💨' },
        light: { label: 'Đèn soi hoạt động tốt', icon: '💡' }
    };

    const suppliesLabels = {
        gloves: { label: 'Găng tay y tế (đủ cỡ)', icon: '🧤' },
        masks: { label: 'Khẩu trang y tế', icon: '😷' },
        gauze: { label: 'Băng gạc, bông', icon: '🩹' },
        anesthesia: { label: 'Thuốc tê (nếu cần)', icon: '💉' },
        tray: { label: 'Khay khám cơ bản', icon: '🍽️' },
        syringe: { label: 'Kim tiêm vô trùng', icon: '🔬' }
    };

    const hygieneLabels = {
        sterilization: { label: 'Dụng cụ đã tiệt trùng', icon: '✨' },
        disinfection: { label: 'Khu vực khám đã khử trùng', icon: '🧹' },
        areaPrep: { label: 'Phòng khám sạch sẽ, ngăn nắp', icon: '🏥' },
        wasteReady: { label: 'Thùng rác y tế sẵn sàng', icon: '🗑️' }
    };

    const handleCheckboxChange = (category, item) => {
        setChecklist(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [item]: !prev[category][item]
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            checklist,
            notes,
            completedAt: new Date().toISOString()
        };
        if (onComplete) {
            onComplete(appointment.id, data);
        }
        onClose();
    };

    // Calculate progress
    const totalItems = Object.values(checklist).reduce(
        (sum, category) => sum + Object.keys(category).length, 0
    );
    const checkedItems = Object.values(checklist).reduce(
        (sum, category) => sum + Object.values(category).filter(Boolean).length, 0
    );
    const progress = Math.round((checkedItems / totalItems) * 100);
    const isAllChecked = progress === 100;

    const renderChecklistGroup = (title, icon, items, labels, category) => (
        <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                {icon}
                {title}
                <span className="text-xs font-normal text-gray-400 normal-case tracking-normal">
                    ({Object.values(items).filter(Boolean).length}/{Object.keys(items).length})
                </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(items).map(([key, checked]) => (
                    <label
                        key={key}
                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${checked
                                ? 'bg-green-50 border-green-200 shadow-sm'
                                : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxChange(category, key)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 border-gray-300"
                        />
                        <span className="text-base mr-1">{labels[key]?.icon}</span>
                        <span className={`text-sm ${checked ? 'text-green-700 font-medium line-through' : 'text-gray-700'}`}>
                            {labels[key]?.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <CheckCircle className="text-green-600" size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Chuẩn Bị Ca Khám</h2>
                            <p className="text-xs text-gray-500">Kiểm tra thiết bị & vật tư trước ca</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Tiến độ chuẩn bị</span>
                        <span className={`font-bold ${isAllChecked ? 'text-green-600' : 'text-blue-600'}`}>
                            {checkedItems}/{totalItems} mục ({progress}%)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${isAllChecked
                                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-240px)] p-6">
                    {/* Appointment Info Banner */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-blue-600 font-medium">Bệnh nhân:</span>
                                <span className="ml-2 text-blue-900 font-semibold">{appointment.patientName}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Thời gian:</span>
                                <span className="ml-2 text-blue-900">{appointment.date} - {appointment.time}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Bác sĩ:</span>
                                <span className="ml-2 text-blue-900">{appointment.doctorName}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Lý do:</span>
                                <span className="ml-2 text-blue-900">{appointment.reason}</span>
                            </div>
                        </div>
                    </div>

                    {/* Equipment Checklist */}
                    {renderChecklistGroup(
                        'Kiểm Tra Thiết Bị',
                        <Wrench size={18} className="text-amber-600" />,
                        checklist.equipment,
                        equipmentLabels,
                        'equipment'
                    )}

                    {/* Supplies Checklist */}
                    {renderChecklistGroup(
                        'Vật Tư Y Tế',
                        <Package size={18} className="text-blue-600" />,
                        checklist.supplies,
                        suppliesLabels,
                        'supplies'
                    )}

                    {/* Hygiene Checklist */}
                    {renderChecklistGroup(
                        'Vệ Sinh & Khử Trùng',
                        <ShieldCheck size={18} className="text-green-600" />,
                        checklist.hygiene,
                        hygieneLabels,
                        'hygiene'
                    )}

                    {/* Notes */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Ghi chú về tình trạng chuẩn bị, vấn đề gặp phải..."
                        />
                    </div>

                    {/* Success Banner */}
                    {isAllChecked && (
                        <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                            <CheckCircle size={22} className="text-green-600 shrink-0" />
                            <p className="text-sm text-green-800 font-medium">
                                Tất cả các hạng mục đã được kiểm tra đầy đủ! Bạn có thể xác nhận hoàn thành.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={!isAllChecked}
                            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium ${isAllChecked
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle size={18} />
                            Xác Nhận Hoàn Thành
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrepareAppointmentModal;
