# Use official Node.js image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Vite default port
EXPOSE 5173

# Run the Vite server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]