FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

RUN mkdir -p data images

EXPOSE 3000

CMD ["bun", "run", "src/app.ts"]