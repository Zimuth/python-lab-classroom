FROM node:20-slim

RUN apt-get update && apt-get install -y python3 && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN mkdir -p /sandbox

EXPOSE 3000

CMD ["node", "dist/main"]