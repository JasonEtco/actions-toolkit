FROM node:slim
COPY package*.json ./
RUN npm ci
COPY . .
ENTRYPOINT ["node", "/entrypoint.js"]
