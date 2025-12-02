FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 8000

CMD ["nodemon", "server.js"]
