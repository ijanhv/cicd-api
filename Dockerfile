# > 1. OS SET UP --
FROM ubuntu:22.04

# > 1.a -- Install various essential dependencies
RUN apt-get update && apt-get install -y curl gnupg zip unzip build-essential python3

# > 1.b Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# > 1.c Install BunJS
ENV BUN_INSTALL=/root/.bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH=$BUN_INSTALL/bin:$PATH

# > 2. PROJECT SET UP --
# > 2.a -- Set up working directory for the project 
WORKDIR /app

# > 2.b -- Copy essential dependency specification files
COPY package.json .
COPY bun.lockb .
COPY tsconfig.json .
COPY prisma ./prisma/

# > 2.c -- Install dependencies
RUN bun install

# > 2.d -- Run prisma codegen
RUN bunx prisma generate

# > 2.e -- Copy essential files and folders
COPY src src

RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh


RUN curl -sSL https://nixpacks.com/install.sh -o install.sh \
    && chmod +x install.sh \
    && ./install.sh \
    && bun install -g tsx

RUN curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack

# > 3. RUN PROJECT --
# > 3.a -- Expose various ports as necessary
EXPOSE 8001

EXPOSE 5555


# > 3.b -- Run
CMD ["bun", "start:dev"]

