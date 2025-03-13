FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY app.js ./

RUN npm install --production

EXPOSE 3000

CMD ["node", "index.js"]
