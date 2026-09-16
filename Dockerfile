FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build
RUN mkdir -p /app/data
ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --skip-generate && node node_modules/.bin/next start"]
