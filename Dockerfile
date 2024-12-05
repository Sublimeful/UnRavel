FROM denoland/deno

WORKDIR /app

COPY package.json .

RUN deno install

COPY . .

CMD ["deno", "run", "prod"]
