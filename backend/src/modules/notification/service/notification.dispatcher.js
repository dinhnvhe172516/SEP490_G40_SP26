const zaloService = require('../../../common/service/zalo.service');
const Notification = require('../model/notification.model');
const Account = require('../../auth/models/account.model');
const Role = require('../../auth/models/role.model');
const emailService = require('../../../common/service/email.service');
const logger = require('../../../common/utils/logger');

const dispatchEmail = async (notification) => {
    try {
        const { scope, recipient_id, recipient_ids, target_roles, title, message } = notification;
        let emails = [];

        // 1. Thu thập danh sách email
        if (scope === 'INDIVIDUAL' && recipient_id) {
            const acc = await Account.findById(recipient_id).select('email status');
            if (acc && acc.status === 'ACTIVE' && acc.email) {
                emails.push(acc.email);
            }
        }
        else if (scope === 'GROUP') {
            const orConditions = [];

            if (target_roles && target_roles.length > 0) {
                const roles = await Role.find({ name: { $in: target_roles } }).select('_id');
                const roleIds = roles.map(r => r._id);
                if (roleIds.length > 0) {
                    orConditions.push({ role_id: { $in: roleIds } });
                }
            }

            if (recipient_ids && recipient_ids.length > 0) {
                orConditions.push({ _id: { $in: recipient_ids } });
            }

            if (orConditions.length > 0) {
                const accounts = await Account.find({
                    $or: orConditions,
                    status: 'ACTIVE',
                    email: { $exists: true, $ne: null, $ne: '' }
                }).select('email');
                emails = accounts.map(a => a.email);
            }
        }
        else if (scope === 'GLOBAL') {
            const accounts = await Account.find({
                status: 'ACTIVE',
                email: { $exists: true, $ne: null, $ne: '' }
            }).select('email');
            emails = accounts.map(a => a.email);
        }

        // Lọc trùng lặp email
        emails = [...new Set(emails)];

        if (emails.length === 0) {
            await Notification.updateOne(
                { _id: notification._id },
                { $set: { 'channels.email.status': 'FAILED' } }
            );
            return;
        }

        // 2. Format HTML đơn giản cho Email thông báo hệ thống
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: 0; }
                    .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #11998e; }
                    .button { display: inline-block; background: #38ef7d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🔔 Thông Báo Mới</h2>
                    </div>
                    <div class="content">
                        <div class="title">${title}</div>
                        <p>${message.replace(/\n/g, '<br>')}</p>
                        ${notification.action_url ? `<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${notification.action_url}" class="button">Chi Tiết</a>` : ''}
                    </div>
                    <div class="footer">
                        <p>© 2026 Dental CMS System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // 3. Gửi email (Gửi Bcc để ẩn danh sách người nhận)
        await emailService.sendEmail(
            emails.join(', '),
            title || 'Thông báo từ hệ thống Dental CMS',
            emailHtml
        );

        // 4. Update status thành công
        await Notification.updateOne(
            { _id: notification._id },
            {
                $set: {
                    'channels.email.status': 'SENT',
                    'channels.email.sent_at': new Date()
                }
            }
        );

    } catch (error) {
        logger.warn('[Notification] email dispatch failed', { message: error.message });
        await Notification.updateOne(
            { _id: notification._id },
            { $set: { 'channels.email.status': 'FAILED' } }
        ).catch(err => logger.error('Lỗi khi update status failed email', { err: err.message }));
    }
};

const dispatchZalo = async (notification) => {
    try {
        const { scope, recipient_id, recipient_ids, target_roles, title, message, metadata } = notification;
        let phoneNumbers = [];

        // 1. Thu thập danh sách số điện thoại
        if (scope === 'INDIVIDUAL' && recipient_id) {
            const acc = await Account.findById(recipient_id).select('phone_number status');
            if (acc && acc.status === 'ACTIVE' && acc.phone_number) {
                phoneNumbers.push(acc.phone_number);
            }
        } 
        else if (scope === 'GROUP') {
            const orConditions = [];
            
            if (target_roles && target_roles.length > 0) {
                const roles = await Role.find({ name: { $in: target_roles } }).select('_id');
                const roleIds = roles.map(r => r._id);
                if (roleIds.length > 0) {
                    orConditions.push({ role_id: { $in: roleIds } });
                }
            }
            
            if (recipient_ids && recipient_ids.length > 0) {
                orConditions.push({ _id: { $in: recipient_ids } });
            }

            if (orConditions.length > 0) {
                const accounts = await Account.find({
                    $or: orConditions,
                    status: 'ACTIVE',
                    phone_number: { $exists: true, $ne: null, $ne: '' }
                }).select('phone_number');
                phoneNumbers = accounts.map(a => a.phone_number);
            }
        } 
        else if (scope === 'GLOBAL') {
            const accounts = await Account.find({
                status: 'ACTIVE',
                phone_number: { $exists: true, $ne: null, $ne: '' }
            }).select('phone_number');
            phoneNumbers = accounts.map(a => a.phone_number);
        }

        // Lọc trùng lặp số điện thoại
        phoneNumbers = [...new Set(phoneNumbers)];

        if (phoneNumbers.length === 0) {
            await Notification.updateOne(
                { _id: notification._id },
                { $set: { 'channels.zalo.status': 'FAILED' } }
            );
            return;
        }

        // 2. Chuẩn bị dữ liệu Template ZNS
        // Mapper dữ liệu thô sang Template Data theo quy định của Zalo (Cần update template_id thật vào .env)
        const templateId = process.env.ZALO_ZNS_TEMPLATE_ID || 'mock_template_id';
        const templateData = {
            customer_name: metadata?.customer_name || 'Quý khách',
            appointment_date: metadata?.appointment_date || 'N/A',
            appointment_time: metadata?.appointment_time || 'N/A',
            clinic_name: 'DCMS Dental Care',
            message: message.substring(0, 200) // Giới hạn ký tự tin nhắn Zalo
        };

        // 3. Gửi Zalo ZNS API thật
        logger.info('[Zalo ZNS] Dispatching ZNS to phones:', { count: phoneNumbers.length, title });
        
        const sendResults = await Promise.all(
            phoneNumbers.map(phone => zaloService.sendZNS(phone, templateId, templateData))
        );

        // Kiểm tra xem có bất kỳ tin nhắn nào gửi thành công không
        const succeeded = sendResults.some(r => r.error === 0);

        await Notification.updateOne(
            { _id: notification._id },
            { 
                $set: { 
                    'channels.zalo.status': succeeded ? 'SENT' : 'FAILED',
                    'channels.zalo.sent_at': succeeded ? new Date() : null,
                    'channels.zalo.api_response': sendResults // Lưu lại log phản hồi từ Zalo
                } 
            }
        );

    } catch (error) {
        logger.warn('[Notification] Zalo dispatch failed', { message: error.message });
        await Notification.updateOne(
            { _id: notification._id },
            { $set: { 'channels.zalo.status': 'FAILED' } }
        ).catch(err => logger.error('Lỗi khi update status failed Zalo', { err: err.message }));
    }
};

module.exports = {
    dispatchEmail,
    dispatchZalo
};
