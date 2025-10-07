# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Vite uses port 5173 by default, so we expose it
EXPOSE 5173

# The command to start the Vite development server
# --host is required to expose the server to the host machine
CMD ["npm", "run", "dev", "--", "--host"]
