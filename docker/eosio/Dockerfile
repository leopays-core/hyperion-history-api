FROM ubuntu:18.04

RUN apt-get update && apt-get upgrade -y && apt-get autoremove && apt-get install -y wget netcat

RUN wget -nv https://github.com/leopays-core/leopays/releases/download/v2.0.5/leopays_2.0.5-1-ubuntu-18.04_amd64.deb
RUN apt-get install -y ./leopays_2.0.5-1-ubuntu-18.04_amd64.deb

RUN useradd -m -s /bin/bash leopays
USER leopays

EXPOSE 8080
