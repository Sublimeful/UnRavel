FROM denoland/deno

WORKDIR /app

COPY . .

RUN deno run build

CMD ["deno", "run", "dev"]
