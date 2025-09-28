FROM node:18

WORKDIR /app

COPY ./

COPY . .

CMD ["npm", "start"]
