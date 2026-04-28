# Sử dụng Node bản nhẹ (có thể đổi thành node:24-alpine nếu project yêu cầu)
FROM node:20-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy các file quản lý thư viện và cài đặt
COPY package*.json ./
RUN npm install --production

# Copy toàn bộ code vào container (nhớ tạo file .dockerignore để loại bỏ node_modules)
COPY . .

# Mặc định Azure Web App for Containers thường giao tiếp qua port 80 hoặc 8080
ENV PORT=5000
EXPOSE 5000

# Lệnh khởi chạy server (đảm bảo package.json của bạn có script "start")
CMD ["npm", "start"]