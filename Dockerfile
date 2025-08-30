# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install ALL dependencies (including dev dependencies needed for building)
RUN npm install

# Copy source code and assets
COPY server/src ./src
COPY server/tsconfig.json ./

# Build the application
RUN npm run build

# Copy database files to dist folder for runtime access
RUN cp -r src/database dist/

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
