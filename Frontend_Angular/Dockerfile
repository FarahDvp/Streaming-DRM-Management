FROM node:18-alpine AS build

WORKDIR /src

COPY . .

RUN npm install -g @angular/cli && \
    npm install --legacy-peer-deps

EXPOSE 4200

CMD ng serve --host 0.0.0.0 --port 4200 
