import React, { useState, useEffect } from 'react';
import { 
    Search, Calendar, User, Phone, FileText, 
    Stethoscope, Clock, CalendarPlus, AlertCircle 
} from 'lucide-react';
// Import api service của bạn
import treatmentService from '../../../services/treatmentService'; 

const ReBooking = () => {
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const fetchPendingTreatments = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                search: searchTerm || undefined,
                filter_date: filterDate || undefined,
                status: "PLANNED",
                sort: 'desc', 
                limit: 20 
            };
            
            // Gọi API
            const response = await treatmentService.getListTreatementWithAppointmentNull(params);
            
            // Giả sử API trả về { data: [...], pagination: {...} }
            // Điều chỉnh lại tùy theo response thực tế của axios (thường là response.data.data)
            const dataList = response?.data?.data || response?.data || [];
            setTreatments(dataList);
        } catch (err) {
            console.error("Lỗi lấy danh sách chờ xếp lịch:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount hoặc khi bộ lọc thay đổi (có thể thêm debounce cho search nếu cần)
    useEffect(() => {
        // Tạm thời dùng setTimeout mỏng để làm mượt tìm kiếm
        const delaySearch = setTimeout(() => {
            fetchPendingTreatments();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, filterDate]);

    // Hàm format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* HEADER & THANH TÌM KIẾM */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Clock className="text-orange-500" size={28} />
                        Chờ xếp lịch hẹn
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Danh sách các phiếu điều trị cần được lên lịch cho bệnh nhân
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tên BN, SĐT, Hồ sơ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium w-full md:w-64 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* TRẠNG THÁI LOADING / ERROR */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold mt-4 animate-pulse">Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 font-medium">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* DANH SÁCH THẺ (GRID) */}
            {!loading && !error && treatments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <CalendarPlus className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">Không có phiếu điều trị nào đang chờ xếp lịch.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {treatments.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col h-full group">
                            
                            {/* Phần đầu: Thông tin bệnh nhân */}
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">
                                            {item.record_info?.full_name || "Khách hàng"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                                            <Phone size={14} />
                                            <span className="font-medium">{item.record_info?.phone || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">
                                    {item.phase}
                                </span>
                            </div>

                            {/* Phần giữa: Thông tin điều trị */}
                            <div className="flex-1 space-y-3 mb-5">
                                <div className="flex items-start gap-2 text-sm">
                                    <FileText size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Hồ sơ bệnh án</p>
                                        <p className="font-semibold text-slate-700">{item.record_info?.record_name || "Chưa có tên hồ sơ"}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-2 text-sm">
                                    <Stethoscope size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Chỉ định điều trị (Răng: {item.tooth_position})</p>
                                        <p className="font-medium text-slate-600 line-clamp-2">{item.note || "Không có ghi chú"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-sm">
                                    <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Ngày dự kiến</p>
                                        <p className="font-semibold text-blue-600">{formatDate(item.planned_date)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nút hành động */}
                            <button 
                                onClick={() => console.log("Mở modal đặt lịch cho:", item)}
                                className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                            >
                                <CalendarPlus size={18} />
                                Lên lịch hẹn ngay
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReBooking;