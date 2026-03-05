import React, { useState } from 'react';
import { DollarSign, Search, FileText, CheckCircle, Clock, Eye, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { mockInvoices } from '../../utils/mockData';
import InvoiceDetailModal from './components/modals/InvoiceDetailModal';

const ReceptionistInvoices = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const filteredInvoices = mockInvoices.filter(inv => {
        const matchesSearch = inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.code.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Pending': return 'danger';
            case 'Partial': return 'warning';
            default: return 'default';
        }
    };

    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = filteredInvoices.reduce((sum, inv) => sum + inv.paid, 0);
    const pendingAmount = totalAmount - paidAmount;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Hóa Đơn</h1>
                <p className="text-gray-600 mt-1">Theo dõi và thu tiền hóa đơn</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {totalAmount.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đã thu</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {paidAmount.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chưa thu</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">
                                {pendingAmount.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <Clock size={24} className="text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã HĐ, tên bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Pending">Chưa thanh toán</option>
                        <option value="Partial">Thanh toán 1 phần</option>
                        <option value="Paid">Đã thanh toán</option>
                    </select>
                </div>
            </Card>

            {/* Invoices Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã HĐ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bệnh nhân</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đã trả</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{invoice.code}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{invoice.patientName}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{invoice.date}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-medium text-gray-900">
                                            {invoice.total.toLocaleString('vi-VN')}đ
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm text-gray-600">
                                            {invoice.paid.toLocaleString('vi-VN')}đ
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Badge variant={getStatusVariant(invoice.status)}>
                                            {invoice.status === 'Paid' ? 'Đã TT' : invoice.status === 'Pending' ? 'Chưa TT' : 'TT 1 phần'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleViewDetails(invoice)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        {invoice.status !== 'Paid' && (
                                            <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                <CreditCard size={16} /> Thu tiền
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredInvoices.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Không tìm thấy hóa đơn nào
                    </div>
                )}
            </Card>

            {/* Modal Chi tiết hóa đơn */}
            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setTimeout(() => setSelectedInvoice(null), 300); // clear after animation
                }}
                onPaymentClick={(invoice) => {
                    // TODO: Open payment modal
                    console.log('Open payment for', invoice.code);
                    alert(`Tính năng thu tiền cho hóa đơn ${invoice.code} đang được phát triển.`);
                }}
            />
        </div>
    );
};

export default ReceptionistInvoices;
