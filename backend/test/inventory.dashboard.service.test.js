// ============================================================
//  inventory.dashboard.service.test.js
//  Unit Test Suite - Inventory Dashboard Service
// ============================================================

const dashboardService = require('../src/modules/inventory/service/dashboard.service');
const Medicine = require('../src/modules/inventory/model/medicine.model');
const Treatment = require('../src/modules/treatment/models/treatment.model');

jest.mock('../src/modules/inventory/model/medicine.model');
jest.mock('../src/modules/treatment/models/treatment.model');

describe('Inventory Dashboard Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardStats()', () => {
        it('TC-ID-01: Lấy thông số thành công với tất cả Promise.all xử lý đúng', async () => {
            Medicine.countDocuments = jest.fn()
                .mockResolvedValueOnce(100) // totalActive
                .mockResolvedValueOnce(5)   // lowStock
                .mockResolvedValueOnce(2)   // urgentStock
                .mockResolvedValueOnce(3);  // nearExpired

            Medicine.aggregate = jest.fn().mockResolvedValue([{ _id: null, totalQuantity: 500 }]);
            Treatment.countDocuments = jest.fn().mockResolvedValue(10); // pendingDispense

            const result = await dashboardService.getDashboardStats();

            expect(result.totalMedicines).toBe(100);
            expect(result.totalInventoryQuantity).toBe(500);
            expect(result.pendingOrders).toBe(10);
            expect(result.lowStockCount).toBe(5);
            expect(result.urgentStockCount).toBe(2);
            expect(result.nearExpiredCount).toBe(3);
        });

        it('TC-ID-02: Lấy thông số khi Aggregate trả về mảng rỗng (không có quantity)', async () => {
            Medicine.countDocuments = jest.fn().mockResolvedValue(0);
            Medicine.aggregate = jest.fn().mockResolvedValue([]);
            Treatment.countDocuments = jest.fn().mockResolvedValue(0);

            const result = await dashboardService.getDashboardStats();

            expect(result.totalInventoryQuantity).toBe(0); // Rơi vào nhánh fallback || 0
        });

        it('TC-ID-02.1: Quăng lỗi gốc (throw error) khi truy vấn Medicine.countDocuments thất bại', async () => {
            const dbError = new Error('DB connection timeout');
            Medicine.countDocuments = jest.fn().mockRejectedValueOnce(dbError);
            
            // Do mockRejectedValueOnce ném lỗi, Promise.all sẽ gãy ngay lập tức
            await expect(dashboardService.getDashboardStats())
                .rejects.toThrow('DB connection timeout');
        });

        it('TC-ID-02.2: Quăng lỗi khi aggregate tổng số lượng tồn kho (Medicine.aggregate) gặp sự cố', async () => {
            Medicine.countDocuments = jest.fn().mockResolvedValue(10); // Giả lập count bình thường
            
            const aggError = new Error('Aggregate pipeline error');
            Medicine.aggregate = jest.fn().mockRejectedValueOnce(aggError);

            await expect(dashboardService.getDashboardStats())
                .rejects.toThrow('Aggregate pipeline error');
        });
    });

    describe('getLowStockMedicines(limit)', () => {
        it('TC-ID-03: Lấy danh sách thuốc tồn kho thấp thành công (truyền limit tuỳ chỉnh)', async () => {
            const mockData = [{ medicine_name: 'Para' }];
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockData)
                })
            });

            const result = await dashboardService.getLowStockMedicines(5);

            expect(result).toEqual(mockData);
        });

        it('TC-ID-03.1: Sử dụng limit mặc định (bằng 3) khi không truyền tham số', async () => {
            const mockData = [{ medicine_name: 'Aspirin' }];
            const limitMock = jest.fn().mockResolvedValue(mockData);
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: limitMock
                })
            });

            const result = await dashboardService.getLowStockMedicines();

            expect(result).toEqual(mockData);
            expect(limitMock).toHaveBeenCalledWith(3); // Kiểm tra xem limit(3) có được gọi hay không
        });

        it('TC-ID-03.2: Quăng lỗi gốc (throw error) khi truy vấn Database thất bại', async () => {
            const dbError = new Error('Database query failed');
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockRejectedValueOnce(dbError) // Giả lập lỗi ở bước limit cuối cùng
                })
            });

            await expect(dashboardService.getLowStockMedicines())
                .rejects.toThrow('Database query failed');
        });
    });

    describe('getNearExpiredMedicines(days)', () => {
        it('TC-ID-04: Lấy danh sách thuốc sắp hết hạn', async () => {
            const mockData = [{ medicine_name: 'Para' }];
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockData)
            });

            const result = await dashboardService.getNearExpiredMedicines(10);

            expect(result).toEqual(mockData);
        });

        it('TC-ID-04.1: Sử dụng giá trị mặc định days = 30 khi không truyền tham số', async () => {
            const mockData = [{ medicine_name: 'Amoxicillin' }];
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockData)
            });

            const result = await dashboardService.getNearExpiredMedicines();

            expect(result).toEqual(mockData);
            // Đảm bảo truy vấn được gọi với các mốc thời gian bằng kiểu Date
            expect(Medicine.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    expiry_date: expect.objectContaining({
                        $gte: expect.any(Date),
                        $lte: expect.any(Date)
                    })
                }),
                expect.any(Object)
            );
        });

        it('TC-ID-04.2: Quăng lỗi gốc (throw error) khi truy vấn Database thất bại', async () => {
            const dbError = new Error('Database query execution failed');
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockRejectedValueOnce(dbError) // Giả lập lỗi ở hàm sort
            });

            await expect(dashboardService.getNearExpiredMedicines(15))
                .rejects.toThrow('Database query execution failed');
        });
    });

    describe('getStockTracking(query)', () => {
        it('TC-ID-05: Lấy stock tracking với search keyword hợp lệ', async () => {
            const mockMedicines = [
                { _id: '1', medicine_name: 'M1', quantity: 0, min_quantity: 5 }, // Hết hàng
                { _id: '2', medicine_name: 'M2', quantity: 3, min_quantity: 5 }, // Thấp
                { _id: '3', medicine_name: 'M3', quantity: 10, min_quantity: 5 } // Đủ hàng
            ];

            Medicine.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockMedicines)
                        })
                    })
                })
            });
            Medicine.countDocuments = jest.fn().mockResolvedValue(3);

            const result = await dashboardService.getStockTracking({ page: 1, limit: 10, search: 'Para' });

            // Kiểm tra phân trang và tìm kiếm (có new RegExp)
            expect(result.pagination.totalItems).toBe(3);

            // Branch: quantity <= 0
            expect(result.medicines[0].stock_status).toBe('Hết hàng');
            // Branch: quantity <= min_quantity
            expect(result.medicines[1].stock_status).toBe('Thấp');
            // Branch: còn lại
            expect(result.medicines[2].stock_status).toBe('Đủ hàng');
        });

        it('TC-ID-06: Lấy stock tracking chỉ mảng rỗng khi không có search (Branch coverage cho search)', async () => {
            Medicine.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue([])
                        })
                    })
                })
            });
            Medicine.countDocuments = jest.fn().mockResolvedValue(0);

            // Truyền search: "" (trống tếu hoặc khoảng trắng)
            const result = await dashboardService.getStockTracking({ page: 1, limit: 10, search: '   ' });

            expect(result.medicines.length).toBe(0);
        });
    });

});
