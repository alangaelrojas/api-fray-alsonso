FROM node:12

WORKDIR /api-fray-alfonso

COPY package*.json ./
COPY app.js ./

RUN npm install 

COPY . .

CMD ["npm", "start"]