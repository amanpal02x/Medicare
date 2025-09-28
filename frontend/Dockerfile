FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install || npm install || npm install
COPY . .
CMD ["npm", "start"]
