const successRes = require('../../../common/success');
const { getDashboard } = require('../service/dashboard.service');

const getDashboardController = async (req, res) => {
    try {
        // Gọi service để lấy data
        const data = await getDashboard();

        // Trả về response thành công dùng GetDetailSuccess
        // vì dashboard không có pagination, chỉ là 1 object data
        return new successRes.GetDetailSuccess(
            data,
            'Get dashboard data success'
        ).send(res);

    } catch (error) {
        // Nếu service throw lỗi → trả về lỗi cho FE
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getDashboardController };
