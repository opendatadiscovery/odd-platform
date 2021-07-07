FROM provectuslabs/openapi-generator-cli AS openapi
WORKDIR /usr/src
COPY . .
RUN  java -jar /opt/openapi-generator/modules/openapi-generator-cli/target/openapi-generator-cli.jar generate -c odc-ui/openapi-config.yaml

FROM node:lts-slim AS build
WORKDIR /usr/src/app
ENV NODE_ENV=production
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY ./odc-ui/package.json /usr/src/app/
COPY ./odc-ui/package-lock.json /usr/src/app/
RUN npm install
COPY ./odc-ui/ /usr/src/app/
COPY --from=openapi /usr/src/odc-ui/src/generated-sources /usr/src/app/src/generated-sources
RUN npm run build-only

FROM nginx:stable-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY ./odc-ui/nginx /etc/nginx/templates
ENV BACKEND_URI=http://127.0.0.1:8080
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
