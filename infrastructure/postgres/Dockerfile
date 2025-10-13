FROM postgres:16-alpine

# Install dependencies for building pg_jieba
RUN apk add --no-cache \
    git \
    cmake \
    make \
    gcc \
    g++ \
    musl-dev \
    postgresql-dev

# Clone and build pg_jieba
WORKDIR /tmp
RUN git clone --depth 1 https://github.com/jaiminpan/pg_jieba.git && \
    cd pg_jieba && \
    git submodule update --init --recursive && \
    mkdir build && \
    cd build && \
    cmake -DPostgreSQL_TYPE_INCLUDE_DIR=/usr/local/include/postgresql/server .. && \
    make && \
    make install

# Clean up build dependencies
RUN apk del git cmake make gcc g++ musl-dev postgresql-dev && \
    rm -rf /tmp/pg_jieba

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432

