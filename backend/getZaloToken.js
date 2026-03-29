const qs = require('querystring');

// 🔴 BẠN XÓA XONG ĐIỀN THÔNG TIN THẬT VÀO 3 BIẾN BÊN DƯỚI: 🔴
const APP_ID = '3874737669226678936';
const APP_SECRET = 'Dán_App_Secret_của_bạn_vào_đây';
const AUTH_CODE = 'Dán_Auth_Code_siêu_dài_vào_đây';

async function getToken() {
    try {
        const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'secret_key': APP_SECRET
            },
            body: qs.stringify({
                app_id: APP_ID,
                grant_type: 'authorization_code',
                code: AUTH_CODE
            })
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(JSON.stringify(data));
        }

        console.log('\n🎉 LẤY TOKEN THÀNH CÔNG 🎉');
        console.log('--------------------------------------------------');
        console.log('👉 ACCESS TOKEN:\n', data.access_token);
        console.log('\n👉 REFRESH TOKEN:\n', data.refresh_token);
        console.log('--------------------------------------------------');

        // Copy 2 mã này lưu ra Notepad nha!

    } catch (error) {
        console.error('❌ LỖI RỒI BẠN ƠI:', error.response ? error.response.data : error.message);
    }
}

getToken();
