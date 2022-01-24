FROM node:lts as builder
COPY . .
RUN npm install
RUN npm run build
WORKDIR static-content
RUN git clone -b gh-pages --depth 1 https://github.com/ivmartel/dwv-jqmobile.git .
RUN rm -rf ./demo/*/node_modules/dwv/dist/*.*
COPY ./dist/* ./demo/trunk/node_modules/dwv/dist/

FROM nginx
COPY --from=builder static-content/demo/trunk/ /usr/share/nginx/html
