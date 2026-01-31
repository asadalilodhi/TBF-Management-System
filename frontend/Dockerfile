FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# The --legacy-peer-deps flag fixes the dependency conflict automatically
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]