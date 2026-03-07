import { useState, useEffect, useCallback } from 'react';
import { findPatientByInfo, getDentalRecordsByPatient } from '../../services/dentalRecordService';
import PatientSearchBar from './components/PatientSearchBar';
import PatientCard from './components/PatientCard';
import PatientRecordList from './components/PatientRecordList';

const PatientRecordSearch = () => {
    // ── Patient search state ──────────────────────────────────────
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // ── Dental records state ──────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // ── Debounce search 400ms ─────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(inputValue.trim()), 400);
        return () => clearTimeout(t);
    }, [inputValue]);

    // ── Search patients ───────────────────────────────────────────
    useEffect(() => {
        if (!searchTerm) {
            setPatients([]);
            setSelectedPatient(null);
            return;
        }
        const doSearch = async () => {
            setIsSearching(true);
            try {
                // GET /api/dentist/patient?search=...
                const res = await findPatientByInfo(searchTerm);
                // res is the data array directly (Success response)
                const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
                setPatients(list);
                // Auto-clear selection if patient not in new result
                setSelectedPatient(prev =>
                    prev && list.find(p => p.patient_id === prev.patient_id) ? prev : null
                );
            } catch (err) {
                console.error('Patient search error:', err);
                setPatients([]);
            } finally {
                setIsSearching(false);
            }
        };
        doSearch();
    }, [searchTerm]);

    // ── Fetch dental records by patient ───────────────────────────
    const fetchRecords = useCallback(async (patient) => {
        if (!patient?.patient_id) return;
        setIsLoadingRecords(true);
        setIsVisible(false);
        setRecordsError(null);
        try {
            // GET /api/dentist/staff/patient/:id/dental-record
            const res = await getDentalRecordsByPatient(patient.patient_id);
            setRecords(res.data ?? []);
        } catch (err) {
            console.error('Error loading patient records:', err);
            setRecordsError('Không thể tải hồ sơ của bệnh nhân. Vui lòng thử lại.');
        } finally {
            setIsLoadingRecords(false);
            setTimeout(() => setIsVisible(true), 60);
        }
    }, []);

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        fetchRecords(patient);
    };

    const handleClear = () => {
        setInputValue('');
        setSearchTerm('');
        setPatients([]);
        setSelectedPatient(null);
        setRecords([]);
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="pb-3 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Tìm kiếm hồ sơ nha khoa</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                    Tìm bệnh nhân, sau đó xem toàn bộ hồ sơ nha khoa của họ
                </p>
            </div>

            {/* Search bar */}
            <PatientSearchBar
                value={inputValue}
                onChange={setInputValue}
                isSearching={isSearching}
            />

            {/* Main 2-col layout */}
            {(patients.length > 0 || selectedPatient) && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    {/* Left: Patient results */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-500">
                                Tìm thấy <span className="font-medium text-gray-700">{patients.length}</span> bệnh nhân
                            </p>
                            <button
                                onClick={handleClear}
                                className="text-xs text-gray-400 hover:text-red-500 transition-colors underline-offset-2 hover:underline"
                            >
                                Xóa tìm kiếm
                            </button>
                        </div>

                        {patients.length === 0 && searchTerm && !isSearching && (
                            <div className="bg-white border border-gray-100 rounded-2xl py-10 text-center text-gray-400 text-sm">
                                Không tìm thấy bệnh nhân khớp với "{searchTerm}"
                            </div>
                        )}

                        <div className="space-y-2">
                            {patients.map(p => (
                                <PatientCard
                                    key={p.patient_id}
                                    patient={p}
                                    isSelected={selectedPatient?.patient_id === p.patient_id}
                                    onSelect={handleSelectPatient}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Dental records of selected patient */}
                    <div
                        className="md:col-span-3 transition-all duration-200"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(6px)'
                        }}
                    >
                        {selectedPatient ? (
                            <PatientRecordList
                                patient={selectedPatient}
                                records={records}
                                isLoading={isLoadingRecords}
                                error={recordsError}
                                onRetry={() => fetchRecords(selectedPatient)}
                            />
                        ) : (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center text-gray-400 text-sm">
                                Chọn một bệnh nhân để xem hồ sơ nha khoa
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state – no search yet */}
            {!searchTerm && patients.length === 0 && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
                    <p className="text-gray-400 text-sm">Nhập thông tin bệnh nhân để bắt đầu tìm kiếm</p>
                </div>
            )}
        </div>
    );
};

export default PatientRecordSearch;
