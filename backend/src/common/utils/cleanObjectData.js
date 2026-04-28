// const logger = require('./../../common/utils/logger');

// /**
//  * Loại bỏ các trường null, undefined hoặc chuỗi rỗng/toàn space trong Object
//  * @param {Object} obj - Object cần làm sạch
//  * @returns {Object} - Object mới đã được làm sạch
//  */
// const cleanObjectData = (obj) => {
//     // Nếu obj không tồn tại hoặc rỗng thì trả về object rỗng
//     if (!obj) return {};

//     const newObj = { ...obj }; // Copy object để không sửa trực tiếp biến gốc

//     Object.keys(newObj).forEach(key => {
//         const value = newObj[key];

//         // 1. Xóa nếu là null hoặc undefined
//         if (value === null || value === undefined) {
//             delete newObj[key];
//         }

//         // 2. Xử lý nếu là chuỗi
//         else if (typeof value === 'string') {
//             const trimmedValue = value.trim();

//             // Nếu trim xong mà rỗng (tức là input ban đầu là "   " hoặc "")
//             if (trimmedValue === '') {
//                 delete newObj[key]; // Xóa luôn key này -> Giữ lại giá trị cũ trong DB
//             } else {
//                 newObj[key] = trimmedValue; // Cập nhật lại giá trị đã trim sạch sẽ
//             }
//         }
//     });

//     logger.debug('Clean data', {
//         cleanedData: newObj
//     })

//     return newObj;
// };



const mongoose = require('mongoose');
const logger = require('./../../common/utils/logger');

const cleanObjectData = (obj) => {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
        return obj
            .map(item => cleanObjectData(item))
            .filter(item => item !== undefined && item !== null);
    }

    if (typeof obj === 'object') {
        // ✅ Bỏ qua các object đặc biệt
        if (obj instanceof mongoose.Types.ObjectId) return obj;
        if (obj instanceof Date) return obj;
        if (Buffer.isBuffer(obj)) return obj;

        const newObj = {};
        Object.keys(obj).forEach(key => {
            let value = obj[key];

            if (value === null || value === undefined) return;

            if (typeof value === 'string') {
                value = value.trim();
                if (value === '') return;
            }

            if (typeof value === 'object') {
                value = cleanObjectData(value);
                if (
                    value === undefined ||
                    value === null ||
                    (
                        !(value instanceof mongoose.Types.ObjectId) &&
                        !(value instanceof Date) &&
                        !Buffer.isBuffer(value) &&
                        typeof value === 'object' &&
                        Object.keys(value).length === 0
                    )
                ) return;
            }

            newObj[key] = value;
        });

        return newObj;
    }

    return obj;
};

module.exports = {
    cleanObjectData
};