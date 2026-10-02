# Base image
FROM node:20-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build project
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/main"]