const express = require('express');
const router = express.Router();
const { getListController, getByIdController } = require('../controller/patient.controller');

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Quản lý bệnh nhân cho Lễ Tân
 */

/**
 * @swagger
 * /api/patient:
 *   get:
 *     summary: Danh sách bệnh nhân
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo tên, SĐT, email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
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
 *                   example: Patients retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       patient_code:
 *                         type: string
 *                         example: PT000001
 *                       status:
 *                         type: string
 *                         example: active
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       profile:
 *                         type: object
 *                         properties:
 *                           full_name:
 *                             type: string
 *                             example: Lê Văn Hoàng
 *                           phone:
 *                             type: string
 *                             example: "0967890123"
 *                           email:
 *                             type: string
 *                             example: patient1@gmail.com
 *                           dob:
 *                             type: string
 *                             format: date
 *                           gender:
 *                             type: string
 *                             example: MALE
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', getListController);

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     summary: Chi tiết bệnh nhân
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID của bệnh nhân
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     patient_code:
 *                       type: string
 *                       example: PT000001
 *                     status:
 *                       type: string
 *                       example: active
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     profile_id:
 *                       type: object
 *                       properties:
 *                         full_name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         email:
 *                           type: string
 *                         dob:
 *                           type: string
 *                         gender:
 *                           type: string
 *                         address:
 *                           type: string
 *       404:
 *         description: Không tìm thấy bệnh nhân
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', getByIdController);

module.exports = router;
