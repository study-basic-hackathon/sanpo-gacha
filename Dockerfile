FROM node:26-alpine

WORKDIR /app

COPY package*.json ./
COPY docker-entrypoint.sh ./

RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]