FROM cypress/included:15.18.1
WORKDIR /e2e
COPY --from=oven/bun:1.4.3 /usr/local/bin/bun /usr/local/bin/bun
RUN bun init -y && bun add pg
