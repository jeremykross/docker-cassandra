FROM debian:jessie

MAINTAINER ContainerShip Developers <developers@containership.io>

# add cassandra apt repo
RUN apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 514A2AD631A57A16DD0047EC749D6EEC0353B12C
RUN echo 'deb http://www.apache.org/dist/cassandra/debian 21x main' >> /etc/apt/sources.list.d/cassandra.list

# set cassandra variables
ENV CASSANDRA_VERSION 2.1.5
ENV CASSANDRA_CONFIG /etc/cassandra/cassandra.yaml

# install packages
RUN apt-get update \
    && apt-get install -y cassandra="$CASSANDRA_VERSION" \
    && apt-get install -y curl \
    && apt-get install -y npm \
    && rm -rf /var/lib/apt/lists/*

# install node
RUN npm install -g n
RUN n 0.10.38

# create /app and add files
WORKDIR /app
ADD . /app

# install dependencies
RUN npm install

# expose ports
EXPOSE 7000 7001 7199 9042 9160

# run cassandra
CMD node cassandra.js
