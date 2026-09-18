FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps
ARG DATABASE_URL="file:./dev.db"
ENV DATABASE_URL=$DATABASE_URL
COPY . .
RUN npx prisma generate
RUN npm run build
RUN mkdir -p /app/data && chown -R appuser:appgroup /app
USER appuser
ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --skip-generate && node node_modules/.bin/next start"]
