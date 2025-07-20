# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache \
    ffmpeg \
    git \
    python3 \
    make \
    g++ \
    sqlite

# Copy project files
COPY . .

# Install npm dependencies
RUN npm install

# Expose port (optional, for logs or socket use)
EXPOSE 3000

# Start the bot using pm2
CMD ["npx", "pm2", "start", "index.js", "--attach", "--name", "hermit-md"]
