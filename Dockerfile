FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install -f
COPY . .
RUN npm run build

FROM nginx:1.25-bullseye
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist/ebanking-frontend/browser ./
COPY nginx.conf /etc/nginx/nginx.conf
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1
EXPOSE 80
