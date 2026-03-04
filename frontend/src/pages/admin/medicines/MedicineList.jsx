import React, { useState, useEffect } from 'react';
import { Pill, Plus } from 'lucide-react';
import { mockMedicines } from '../../../utils/mockData';
import Toast from '../../../components/ui/Toast';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

// Components
import MedicineStats from './components/MedicineStats';
import MedicineFilter from './components/MedicineFilter';
import MedicineGrid from './components/MedicineGrid';
import MedicineFormModal from './components/modals/MedicineFormModal';

const MedicineList = () => {
    // ========== STATE MANAGEMENT ==========
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Modals
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Form data
    const [medicineForm, setMedicineForm] = useState({
        medicine_name: '',
        medicine_type: '',
        dosage: '',
        manufacturer: '',
        quantity: '',
        unit: 'Viên',
        expiry_date: '',
        batch_number: '',
        price: '',
        status: 'AVAILABLE'
    });

    // ========== EFFECTS ==========
    useEffect(() => {
        setMedicines(mockMedicines);
        setFilteredMedicines(mockMedicines);
    }, []);

    useEffect(() => {
        let filtered = medicines;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(m => m.status === statusFilter);
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.medicine_name.toLowerCase().includes(searchLower) ||
                m.medicine_type.toLowerCase().includes(searchLower) ||
                m.manufacturer.toLowerCase().includes(searchLower)
            );
        }

        setFilteredMedicines(filtered);
    }, [searchTerm, statusFilter, medicines]);

    // ========== HELPER FUNCTIONS ==========
    const isExpiringSoon = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 60 && diffDays >= 0;
    };

    const isExpired = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return expiry < today;
    };

    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    };

    const getStatusColor = (status) => {
        const colors = {
            'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
            'EXPIRING_SOON': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'LOW_STOCK': 'bg-orange-100 text-orange-700 border-orange-200',
            'OUT_OF_STOCK': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusText = (status) => {
        const texts = {
            'AVAILABLE': 'Còn hàng',
            'EXPIRING_SOON': 'Sắp hết hạn',
            'LOW_STOCK': 'Sắp hết',
            'OUT_OF_STOCK': 'Hết hàng'
        };
        return texts[status] || status;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // ========== HANDLERS ==========
    const handleAddMedicine = () => {
        setIsEditMode(false);
        setMedicineForm({
            medicine_name: '',
            medicine_type: '',
            dosage: '',
            manufacturer: '',
            quantity: '',
            unit: 'Viên',
            expiry_date: '',
            batch_number: '',
            price: '',
            status: 'AVAILABLE'
        });
        setShowMedicineModal(true);
    };

    const handleEditMedicine = (medicine) => {
        setIsEditMode(true);
        setSelectedMedicine(medicine);
        setMedicineForm(medicine);
        setShowMedicineModal(true);
    };

    const handleSaveMedicine = () => {
        if (!medicineForm.medicine_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên thuốc!'
            });
            return;
        }

        if (isEditMode) {
            setMedicines(prev => prev.map(m =>
                m.id === selectedMedicine.id
                    ? { ...m, ...medicineForm, quantity: Number(medicineForm.quantity), price: Number(medicineForm.price) }
                    : m
            ));
            setToast({
                show: true,
                type: 'success',
                message: '✅ Cập nhật thuốc thành công!'
            });
        } else {
            const newMedicine = {
                id: `med_${String(medicines.length + 1).padStart(3, '0')}`,
                ...medicineForm,
                quantity: Number(medicineForm.quantity),
                price: Number(medicineForm.price)
            };
            setMedicines(prev => [...prev, newMedicine]);
            setToast({
                show: true,
                type: 'success',
                message: '✅ Thêm thuốc mới thành công!'
            });
        }

        setShowMedicineModal(false);
        setSelectedMedicine(null);
    };

    const executeDelete = () => {
        if (!deletingId) return;
        setMedicines(prev => prev.filter(m => m.id !== deletingId));
        setToast({
            show: true,
            type: 'success',
            message: '✅ Đã xóa thuốc!'
        });
        setDeletingId(null);
    };

    // Calculate statistics
    const totalMedicines = medicines.length;
    const expiringSoon = medicines.filter(m => isExpiringSoon(m.expiry_date)).length;
    const lowStock = medicines.filter(m => m.quantity < 50).length;
    const totalValue = medicines.reduce((sum, m) => sum + (m.quantity * m.price), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Pill className="text-blue-600" size={40} />
                            Quản lý Thuốc
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Theo dõi lịch khóa và tồn kho thuốc
                        </p>
                    </div>

                    <button
                        onClick={handleAddMedicine}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Thêm thuốc</span>
                    </button>
                </div>

                <MedicineStats
                    totalMedicines={totalMedicines}
                    expiringSoon={expiringSoon}
                    lowStock={lowStock}
                    totalValue={totalValue}
                    formatCurrency={formatCurrency}
                />

                <MedicineFilter
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                <MedicineGrid
                    medicines={filteredMedicines}
                    onEdit={handleEditMedicine}
                    onDelete={setDeletingId}
                    isExpiringSoon={isExpiringSoon}
                    isExpired={isExpired}
                    getDaysUntilExpiry={getDaysUntilExpiry}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    formatCurrency={formatCurrency}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                />

                {/* Results Count */}
                {filteredMedicines.length > 0 && (
                    <div className="mt-8 text-center text-gray-500 text-sm">
                        Hiển thị <span className="font-bold text-gray-900">{filteredMedicines.length}</span> / {medicines.length} loại thuốc
                    </div>
                )}
            </div>

            <MedicineFormModal
                show={showMedicineModal}
                onClose={() => setShowMedicineModal(false)}
                isEditMode={isEditMode}
                medicineForm={medicineForm}
                setMedicineForm={setMedicineForm}
                onSave={handleSaveMedicine}
            />

            <ConfirmationModal
                show={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={executeDelete}
                title="Xác nhận xóa thuốc"
                message="Bạn có chắc chắn muốn xóa thuốc này khỏi hệ thống? Dữ liệu không thể khôi phục sau khi xóa."
            />

            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </div>
    );
};

export default MedicineList;
