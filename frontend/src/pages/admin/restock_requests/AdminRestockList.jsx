import React, { useState, useEffect } from 'react';
import { PackagePlus } from 'lucide-react';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import Toast from '../../../components/ui/Toast';

// Components
import RestockStats from './components/RestockStats';
import RestockFilter from './components/RestockFilter';
import RestockTable from './components/RestockTable';

// Mock Data matching the API schema
const mockRestockRequests = [
    {
        id: 'REQ-001',
        medicine_name: 'Paracetamol 500mg',
        quantity_requested: 500,
        current_quantity: 20,
        priority: 'high',
        status: 'pending',
        request_by_name: 'Lê Văn Bác Sĩ',
        reason: 'Hết sạch thuốc trong kho y tế',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'REQ-002',
        medicine_name: 'Amoxicillin 250mg',
        quantity_requested: 200,
        current_quantity: 80,
        priority: 'medium',
        status: 'pending',
        request_by_name: 'Trần Thị Y Tá',
        reason: 'Dự trù cho tuần tới',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'REQ-003',
        medicine_name: 'Vitamin C 1000mg',
        quantity_requested: 50,
        current_quantity: 150,
        priority: 'low',
        status: 'accept',
        request_by_name: 'Nguyễn Văn A',
        reason: 'Khách hàng hỏi mua nhiều',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'REQ-004',
        medicine_name: 'Thuốc nhỏ mắt V-Rohto',
        quantity_requested: 30,
        current_quantity: 0,
        priority: 'high',
        status: 'reject',
        request_by_name: 'Phạm Văn C',
        reason: 'Cần gấp cho bệnh nhân',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'REQ-005',
        medicine_name: 'Bông băng y tế',
        quantity_requested: 100,
        current_quantity: 40,
        priority: 'medium',
        status: 'completed',
        request_by_name: 'Lê Văn Bác Sĩ',
        reason: 'Sắp hết đồ sơ cứu',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const AdminRestockList = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // UI States
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Modal action state (approve or reject)
    const [confirmAction, setConfirmAction] = useState({ show: false, action: null, request: null });

    useEffect(() => {
        // Load mock data initially
        setRequests(mockRestockRequests);
        setFilteredRequests(mockRestockRequests);
    }, []);

    useEffect(() => {
        let filtered = requests;

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Priority Filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(r => r.priority === priorityFilter);
        }

        // Search Term Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.medicine_name.toLowerCase().includes(lowerSearch) ||
                r.request_by_name.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredRequests(filtered);
    }, [searchTerm, statusFilter, priorityFilter, requests]);

    // Handle open confirmation modals
    const handleApproveClick = (req) => {
        setConfirmAction({ show: true, action: 'approve', request: req });
    };

    const handleRejectClick = (req) => {
        setConfirmAction({ show: true, action: 'reject', request: req });
    };

    // Execute actions
    const executeAction = () => {
        const { action, request } = confirmAction;
        if (!request) return;

        // Update the mock state replacing API call
        const newStatus = action === 'approve' ? 'accept' : 'reject';

        setRequests(prev => prev.map(r =>
            r.id === request.id ? { ...r, status: newStatus } : r
        ));

        setToast({
            show: true,
            type: 'success',
            message: `✅ Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu nhập thuốc!`
        });

        setConfirmAction({ show: false, action: null, request: null });
    };

    // Calculate Statistics
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const highPriority = requests.filter(r => r.priority === 'high' && r.status === 'pending').length;
    const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'accept').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <PackagePlus className="text-blue-600" size={40} />
                        Yêu cầu Nhập thuốc
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Theo dõi và xét duyệt các yêu cầu bổ sung kho thuốc
                    </p>
                </div>

                <RestockStats
                    totalRequests={totalRequests}
                    pendingRequests={pendingRequests}
                    highPriority={highPriority}
                    completedRequests={completedRequests}
                />

                <RestockFilter
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    priorityFilter={priorityFilter}
                    onPriorityFilterChange={setPriorityFilter}
                />

                <RestockTable
                    requests={filteredRequests}
                    onApprove={handleApproveClick}
                    onReject={handleRejectClick}
                />

                {/* Status counts text */}
                <div className="mt-6 text-center text-sm font-medium text-gray-500">
                    Hiển thị <span className="text-gray-900 font-bold">{filteredRequests.length}</span> / {requests.length} yêu cầu
                </div>
            </div>

            <ConfirmationModal
                show={confirmAction.show}
                onClose={() => setConfirmAction({ show: false, action: null, request: null })}
                onConfirm={executeAction}
                title={confirmAction.action === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
                message={confirmAction.request ?
                    `Bạn có chắc chắn muốn ${confirmAction.action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu nhập thêm ${confirmAction.request.quantity_requested} ${confirmAction.request.medicine_name} của nhân viên ${confirmAction.request.request_by_name} không?`
                    : ''}
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

export default AdminRestockList;
