FROM denoland/deno

WORKDIR /app

COPY . .

RUN deno install

CMD ["deno", "run", "dev"]
