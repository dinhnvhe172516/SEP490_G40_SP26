import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LeaveRequestStats from './components/LeaveRequestStats';
import LeaveRequestTable from './components/LeaveRequestTable';
import LeaveRequestForm from './components/LeaveRequestForm';
import { useAuth } from '../../contexts/AuthContext';
import staffService from '../../services/staffService';
import Toast from '../../components/ui/Toast';

const LeaveRequestList = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            const response = await staffService.getLeaveRequests();
            // Assuming the API returns { data: [...] } or the array directly
            const data = response.data?.data || response.data || [];
            // Sort by newest first (createdAt descending)
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(sortedData);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nghỉ phép:', error);
            setToast({ show: true, message: 'Không thể tải danh sách nghỉ phép.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLeaveRequests();
        }
    }, [user]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    // Calculate stats
    const stats = useMemo(() => ({
        totalDays: requests.reduce((acc, curr) => {
            const start = new Date(curr.startedDate);
            const end = new Date(curr.endDate);
            const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
            return acc + (days > 0 ? days : 0);
        }, 0),
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    }), [requests]);

    // Filter requests
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.reason.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            const matchesType = typeFilter === "All" || req.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [requests, searchTerm, statusFilter, typeFilter]);

    const handleCreateRequest = async (data) => {
        try {
            await staffService.createLeaveRequest(data);
            setToast({ show: true, message: 'Yêu cầu nghỉ phép đã được gửi thành công!', type: 'success' });
            setIsModalOpen(false);
            fetchLeaveRequests(); // Reload data
        } catch (error) {
            console.error('Lỗi khi tạo yêu cầu nghỉ phép:', error);
            setToast({ show: true, message: error.response?.data?.message || 'Không thể tạo yêu cầu.', type: 'error' });
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Xin nghỉ phép</h1>
                    <p className="text-gray-600 mt-1">Quản lý các yêu cầu nghỉ phép của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Tạo yêu cầu
                </Button>
            </div>

            {/* Stats */}
            <LeaveRequestStats stats={stats} />

            {/* Search and Filter */}
            <Card>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Tìm kiếm theo lý do..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'All', label: 'Tất cả trạng thái' },
                                { value: 'PENDING', label: 'Chờ duyệt' },
                                { value: 'APPROVED', label: 'Đã duyệt' },
                                { value: 'REJECTED', label: 'Từ chối' }
                            ]}
                        />
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { value: 'All', label: 'Tất cả loại nghỉ' },
                                { value: 'SICK', label: 'Nghỉ ốm' },
                                { value: 'ANNUAL', label: 'Nghỉ phép năm' },
                                { value: 'MATERNITY', label: 'Thai sản' },
                                { value: 'UNPAID', label: 'Không lương' },
                                { value: 'BEREAVEMENT', label: 'Tang chế' },
                                { value: 'EMERGENCY', label: 'Khẩn cấp' }
                            ]}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            variant="outline"
                            className="bg-transparent"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("All");
                                setTypeFilter("All");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card
                title={`Danh sách yêu cầu (${filteredRequests.length})`}
                actions={<Badge variant="info">{filteredRequests.length} yêu cầu</Badge>}
            >
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <LeaveRequestTable requests={filteredRequests} />
                )}
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tạo yêu cầu nghỉ phép"
            >
                <LeaveRequestForm
                    onSubmit={handleCreateRequest}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default LeaveRequestList;
