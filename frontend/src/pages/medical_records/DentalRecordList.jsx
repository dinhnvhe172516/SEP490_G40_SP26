import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllDentalRecords } from '../../services/dentalRecordService';
import CreateDentalRecordModal from './components/CreateDentalRecordModal';
import DentalRecordFilter from './components/DentalRecordFilter';
import DentalRecordCard from './components/DentalRecordCard';
import DentalRecordPagination from './components/DentalRecordPagination';

const PAGE_SIZE = 5;

const DentalRecordList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const queryName = searchParams.get('name') || '';
    const queryPhone = searchParams.get('phone') || '';

    // ── State ──────────────────────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalItems: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [isVisible, setIsVisible] = useState(true); // for page-change animation

    const [inputValue, setInputValue] = useState(queryName);
    const [searchTerm, setSearchTerm] = useState(queryName);
    const [statusFilter, setStatusFilter] = useState('');
    const [treatmentFilter, setTreatmentFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isPatientContext = Boolean(queryName);
    const totalPages = Math.ceil((pagination.totalItems || 0) / PAGE_SIZE);

    // ── Fetch ──────────────────────────────────────────────────────
    const fetchRecords = useCallback(async (page = 1) => {
        setIsLoading(true);
        setIsVisible(false); // fade out
        setError(null);
        try {
            const params = {
                page,
                limit: PAGE_SIZE,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { filter_dental_record: statusFilter }),
                ...(treatmentFilter && { filter_treatment: treatmentFilter }),
                ...(sortOrder && { sort: sortOrder }),
            };
            const res = await getAllDentalRecords(params);
            setRecords(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalItems: 0 });
        } catch (err) {
            console.error('Error fetching dental records:', err);
            setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
            // Slight delay before fading in for smooth feel
            setTimeout(() => setIsVisible(true), 60);
        }
    }, [searchTerm, statusFilter, treatmentFilter, sortOrder]);

    useEffect(() => { fetchRecords(currentPage); }, [fetchRecords, currentPage]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, treatmentFilter, sortOrder]);

    // Debounce search 400ms
    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(inputValue), 400);
        return () => clearTimeout(t);
    }, [inputValue]);

    // ── Handlers ──────────────────────────────────────────────────
    const handlePageChange = (page) => {
        setIsVisible(false);
        setTimeout(() => setCurrentPage(page), 150);
    };

    const handleClearFilter = () => {
        setInputValue('');
        setStatusFilter('');
        setTreatmentFilter('');
        setSortOrder('');
    };

    const handleCreateSuccess = (newRecord) => {
        setIsCreateModalOpen(false);
        navigate(`/dentist/dental-records/${newRecord._id}`);
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2 border-b border-gray-100">
                <div>
                    <nav className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                        <Link to="/dentist/schedule" className="hover:text-teal-500 transition-colors">Lịch hẹn</Link>
                        <span>/</span>
                        <span className="text-gray-600">Hồ Sơ Nha Khoa</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        {isPatientContext ? `Hồ sơ của "${queryName}"` : 'Hồ Sơ Nha Khoa'}
                    </h1>
                    {isPatientContext && queryPhone && (
                        <p className="text-sm text-gray-400 mt-0.5">{queryPhone}</p>
                    )}
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="self-start md:self-auto px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-sm"
                >
                    Tạo hồ sơ mới
                </button>
            </div>

            {/* ── Patient context notice ── */}
            {isPatientContext && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-700">
                    Hiển thị tất cả hồ sơ khớp với <strong>"{queryName}"</strong>.
                    Nếu có nhiều kết quả, kiểm tra thêm ngày sinh hoặc số điện thoại để xác định đúng bệnh nhân.
                </div>
            )}

            {/* ── Filter ── */}
            <DentalRecordFilter
                inputValue={inputValue} onInputChange={setInputValue}
                statusFilter={statusFilter} onStatusChange={setStatusFilter}
                treatmentFilter={treatmentFilter} onTreatmentChange={setTreatmentFilter}
                sortOrder={sortOrder} onSortChange={setSortOrder}
                onClear={handleClearFilter}
            />

            {/* ── Result summary ── */}
            <div className="text-sm text-gray-400">
                {isLoading ? 'Đang tải...' : (
                    <>Tìm thấy <span className="text-gray-700 font-medium">{pagination.totalItems ?? 0}</span> hồ sơ</>
                )}
            </div>

            {/* ── Error ── */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => fetchRecords(currentPage)} className="underline font-medium hover:text-red-700">
                        Thử lại
                    </button>
                </div>
            )}

            {/* ── Loading skeleton ── */}
            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
                            <div className="flex justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                                    <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                                </div>
                                <div className="h-9 w-24 bg-gray-100 rounded-xl shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty state ── */}
            {!isLoading && !error && records.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl py-20 text-center">
                    <p className="text-gray-400 text-sm">Chưa có hồ sơ nha khoa nào</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-3 text-teal-500 text-sm hover:underline"
                    >
                        Tạo hồ sơ đầu tiên
                    </button>
                </div>
            )}

            {/* ── Record list (fade transition) ── */}
            {!isLoading && !error && records.length > 0 && (
                <div
                    className="space-y-3 transition-all duration-200"
                    style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(6px)' }}
                >
                    {records.map(record => (
                        <DentalRecordCard key={record._id} record={record} />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            <DentalRecordPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* ── Create modal ── */}
            <CreateDentalRecordModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSuccess}
                defaultName={queryName}
                defaultPhone={queryPhone}
            />
        </div>
    );
};

export default DentalRecordList;
