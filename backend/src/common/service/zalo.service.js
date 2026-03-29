const logger = require('../utils/logger');

/**
 * Zalo Service for ZNS (Official Account Message)
 */
class ZaloService {
    constructor() {
        this.accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
        this.refreshToken = process.env.ZALO_OA_REFRESH_TOKEN;
        this.appId = process.env.ZALO_APP_ID;
        this.appSecret = process.env.ZALO_APP_SECRET;
        this.znsApiUrl = 'https://business.openapi.zalo.me/message/template';
        this.tokenApiUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';
    }

    /**
     * Send ZNS Message via Zalo Official Account
     * @param {string} phone - Recipient phone number (e.g., 84987654321)
     * @param {string} templateId - ZNS Template ID
     * @param {object} templateData - JSON object for template fields
     * @returns {Promise<object>} - API response
     */
    async sendZNS(phone, templateId, templateData) {
        try {
            if (!this.accessToken) {
                logger.warn('[ZaloService] Missing Access Token, skipping real ZNS send.');
                return { error: -1, message: 'Missing Access Token' };
            }

            // Standardize phone number for Vietnam (if it starts with 0, replace with 84)
            let formattedPhone = phone;
            if (phone.startsWith('0')) {
                formattedPhone = '84' + phone.substring(1);
            }

            const body = {
                phone: formattedPhone,
                template_id: templateId,
                template_data: templateData,
                tracking_id: `zns_${Date.now()}`
            };

            const response = await fetch(this.znsApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': this.accessToken
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.error === -216) { // Access Token Expired
                logger.info('[ZaloService] Access Token expired, attempting refresh...');
                const refreshed = await this.refreshTokens();
                if (refreshed) {
                    // Retry once with new token
                    return this.sendZNS(phone, templateId, templateData);
                }
            }

            if (result.error !== 0) {
                logger.error('[ZaloService] ZNS send failed:', result);
            } else {
                logger.info(`[ZaloService] ZNS sent successfully to ${phone}`);
            }

            return result;
        } catch (error) {
            logger.error('[ZaloService] Error sending ZNS:', error);
            return { error: -500, message: error.message };
        }
    }

    /**
     * Refresh Access Token using Refresh Token
     * Note: In production, you might want to persist the tokens in a DB or Redis.
     * @returns {Promise<boolean>} - Success status
     */
    async refreshTokens() {
        try {
            if (!this.refreshToken || !this.appId || !this.appSecret) {
                logger.warn('[ZaloService] Missing credentials to refresh token.');
                return false;
            }

            const response = await fetch(this.tokenApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'secret_key': this.appSecret
                },
                body: new URLSearchParams({
                    refresh_token: this.refreshToken,
                    app_id: this.appId,
                    grant_type: 'refresh_token'
                })
            });

            const data = await response.json();

            if (data.access_token) {
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token; // Refresh token also updates
                
                // Update environment variables (Temporary, will reset on server restart)
                process.env.ZALO_OA_ACCESS_TOKEN = data.access_token;
                process.env.ZALO_OA_REFRESH_TOKEN = data.refresh_token;
                
                logger.info('[ZaloService] Tokens refreshed successfully.');
                return true;
            } else {
                logger.error('[ZaloService] Token refresh failed:', data);
                return false;
            }
        } catch (error) {
            logger.error('[ZaloService] Error refreshing tokens:', error);
            return false;
        }
    }
}

module.exports = new ZaloService();
