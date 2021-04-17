FROM ubuntu:20.04 AS build

# build stage, installs stuff that we don't want in subsequent stages

ENV DEBIAN_FRONTEND noninteractive
ENV LANG C.UTF-8

RUN apt-get -y update
RUN apt-get -y install \
        python3 \
        nodejs \
        npm \
        && \
    apt-get clean
RUN npm install -g yarn@1.22.10

COPY . /src
WORKDIR /src
RUN yarn && yarn build


FROM ubuntu:20.04 AS base

# runtime base, only packages and code required at runtime

ENV DEBIAN_FRONTEND noninteractive
ENV LANG C.UTF-8

RUN apt-get -y update && \
    apt-get -y install \
        nginx \
        less \
        vim-tiny \
        && \
    apt-get -y --purge autoremove && \
    apt-get clean

RUN rm -Rf /var/www/html/* /etc/nginx/sites-enabled/ /etc/nginx/sites-available/

COPY deploy/nginx.conf /etc/nginx/
COPY --from=build /src/build /var/www/html/transcript-explore

CMD "nginx"
