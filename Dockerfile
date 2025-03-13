FROM node:20-alpine

WORKDIR /app

# Copy only necessary files to production container
COPY --from=build /app /app
COPY package.json ./
COPY package-lock.json ./
COPY app.js ./

# Install only production dependencies
RUN npm install --production

# Expose the app on port 5000
EXPOSE 3000

# Start the Express server
CMD ["node", "index.js"]
