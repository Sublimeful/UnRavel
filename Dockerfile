FROM denoland/deno

WORKDIR /app

COPY package.json .
COPY deno.lock .

RUN deno install

COPY . .

CMD ["deno", "run", "prod"]
