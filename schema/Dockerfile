FROM node:20

WORKDIR /app

COPY ./package.json ./

RUN npm ci

COPY . .

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

ENV PORT=7070

EXPOSE 7070

#CMD [ "npm", "start" ]
CMD ["nginx", "-g", "daemon off;"]
