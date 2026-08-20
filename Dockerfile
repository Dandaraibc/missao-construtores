FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
RUN npx next build --webpack
EXPOSE 3000
EXPOSE 2567
CMD ["sh", "-c", "npx tsx server/realtime.ts & npm run start"]
