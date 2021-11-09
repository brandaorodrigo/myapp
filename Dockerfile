FROM node:14-alpine3.10 as ts-compiler
WORKDIR /app
COPY [".", "./"]
RUN npm install
ARG REACT_APP_URL_API
ENV REACT_APP_URL_API $REACT_APP_URL_API
ARG REACT_APP_URL_MOS1
ENV REACT_APP_URL_MOS1 $REACT_APP_URL_MOS1
ARG REACT_APP_URL_MOS2
ENV REACT_APP_URL_MOS2 $REACT_APP_URL_MOS2
RUN npm run build

FROM nginx:alpine
WORKDIR /app
COPY --from=ts-compiler ["/app/build", "./"]
# nginx
RUN mkdir "/etc/nginx/logs/"
RUN rm "/etc/nginx/conf.d/default.conf"
COPY ["nginx/nginx.conf", "/etc/nginx/nginx.conf"]
COPY ["nginx/server.conf", "/etc/nginx/conf.d/server.conf"]
COPY ["nginx/mime.types", "/etc/nginx/"]
EXPOSE 3000
