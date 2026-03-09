const express = require('express');
const router = express.Router();
const { getDashboardController } = require('../controller/dashboard.controller');

/**
 * @swagger
 * tags:
 *   name: Receptionist
 *   description: API dành cho Lễ Tân
 */

/**
 * @swagger
 * /api/receptionist/dashboard:
 *   get:
 *     summary: Lấy dữ liệu dashboard lễ tân
 *     description: Trả về thống kê tổng quan, lịch hẹn hôm nay, hóa đơn chưa thanh toán và bệnh nhân gần đây
 *     tags: [Receptionist]
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Get dashboard data success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         today_appointment:
 *                           type: integer
 *                           example: 5
 *                         pending_confirm:
 *                           type: integer
 *                           example: 2
 *                         pending_invoices:
 *                           type: integer
 *                           example: 0
 *                         new_patient:
 *                           type: integer
 *                           example: 8
 *                     today_appointment_list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           full_name:
 *                             type: string
 *                             example: Nguyễn Thị Lan
 *                           phone:
 *                             type: string
 *                             example: "0978901234"
 *                           appointment_time:
 *                             type: string
 *                             example: "09:00"
 *                           status:
 *                             type: string
 *                             example: SCHEDULED
 *                     unpaid_invoices:
 *                       type: array
 *                       items: {}
 *                       example: []
 *                     recent_patients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           patient_code:
 *                             type: string
 *                             example: PT000001
 *                           status:
 *                             type: string
 *                             example: active
 *                           profile_id:
 *                             type: object
 *                             properties:
 *                               full_name:
 *                                 type: string
 *                                 example: Lê Văn Hoàng
 *                               phone:
 *                                 type: string
 *                                 example: "0967890123"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard', getDashboardController);

module.exports = router;
