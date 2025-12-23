FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install

COPY . .

# For development, we'll run in dev mode
# For production, uncomment the build step
# RUN npm run build

EXPOSE 3000

# Development mode
CMD ["npm", "run", "dev"]

# Production mode (uncomment when building for production)
# CMD ["npm", "start"]

