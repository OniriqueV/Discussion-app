FROM node:20

WORKDIR /app

ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --legacy-peer-deps

COPY . .

CMD ["npm", "run", "dev"]
