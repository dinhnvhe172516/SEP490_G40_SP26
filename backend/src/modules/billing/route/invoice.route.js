const express = require('express');
const router = express.Router();
const { getListController } = require('../controller/invoice.controller');

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Quản lý hóa đơn cho Lễ Tân
 */

/**
 * @swagger
 * /api/billing:
 *   get:
 *     summary: Danh sách hóa đơn
 *     tags: [Billing]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo mã HĐ hoặc tên bệnh nhân
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', getListController);

module.exports = router;
