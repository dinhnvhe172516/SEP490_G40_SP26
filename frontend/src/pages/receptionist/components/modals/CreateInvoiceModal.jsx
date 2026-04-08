import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import billingService from '../../../../services/billingService';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, appointmentData }) => {
    console.log('CreateInvoiceModal received appointmentData:', appointmentData);
    // Trạng thái của Modal: 'IDLE' | 'CREATING' | 'SUCCESS' | 'ERROR'
    const [status, setStatus] = useState('IDLE');
    const [createdInvoice, setCreatedInvoice] = useState(null);
    const [error, setError] = useState(null);

    // Thông tin tài khoản ngân hàng của Phòng khám (Bạn tự thay đổi phần này)
    const BANK_BIN = 'MB'; // Tên viết tắt hoặc BIN của ngân hàng (VD: MB, VCB, TCB)
    const BANK_ACCOUNT = '0123456789'; // Số tài khoản
    const ACCOUNT_NAME = 'NHA KHOA CLINIC'; // Tên chủ tài khoản

    const autoCreateInvoice = async () => {
        setStatus('CREATING');
        setError(null);

        try {
            const payload = {
                patient_id: appointmentData.patient_id,
                appointment_id: appointmentData._id,
                items: appointmentData.treatments_to_pay?.map(t => {
                    const fallbackServiceId = appointmentData.book_service?.[0]?.service_id;
                    const fallbackSubServiceId = appointmentData.book_service?.[0]?.sub_service_id;

                    return {
                        service_id: t.service_id || fallbackServiceId, 
                        sub_service_id: t.sub_service_id || fallbackSubServiceId || null,
                        quantity: t.quantity || 1,
                        price: t.price || 0 
                    };
                }) || [],
                note: 'Tự động tạo hóa đơn chuyển khoản (QR)',
                payment_method: 'TRANSFER'
            };

            const response = await billingService.createInvoice(payload);
            const newInvoice = response?.data?.data || response?.data;

            setCreatedInvoice(newInvoice);
            setStatus('SUCCESS');

            if (onSuccess) onSuccess(newInvoice);
            
            // Đóng modal này vì ReceptionistInvoices sẽ tự mở PaymentModal (chứa QR)
            onClose();

        } catch (err) {
            console.error('Error auto-creating invoice:', err);
            setError(err.response?.data?.message || 'Không thể tự động tạo hóa đơn. Vui lòng thử lại.');
            setStatus('ERROR');
        }
    };

    useEffect(() => {
        // Kích hoạt tự động tạo hóa đơn khi Modal mở và có dữ liệu
        if (isOpen && appointmentData && status === 'IDLE') {
            autoCreateInvoice();
        }

        if (!isOpen) {
            setStatus('IDLE');
            setCreatedInvoice(null);
            setError(null);
        }
    }, [isOpen, appointmentData]);

    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={status !== 'CREATING' ? onClose : undefined}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">

                {/* --- TRẠNG THÁI 1: ĐANG TẠO HÓA ĐƠN --- */}
                {status === 'CREATING' && (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Đang khởi tạo hóa đơn...</h3>
                        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát, hệ thống đang xử lý dữ liệu.</p>
                    </div>
                )}

                {/* --- TRẠNG THÁI 2: LỖI TẠO HÓA ĐƠN --- */}
                {status === 'ERROR' && (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Khởi tạo thất bại</h3>
                        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-6 border border-red-100">
                            {error}
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Đóng lại
                        </button>
                    </div>
                )}

                {/* --- TRẠNG THÁI 3: THÀNH CÔNG (Đã được chuyển sang PaymentModal nên không cần UI này) --- */}
                {status === 'SUCCESS' && createdInvoice && (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Đã tạo hóa đơn!</h3>
                        <p className="text-sm text-gray-500">Đang chuyển hướng đến trang thanh toán QR...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateInvoiceModal;