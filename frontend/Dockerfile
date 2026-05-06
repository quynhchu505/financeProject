FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .

ARG VITE_API_URL=http://localhost
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- final stage ----
FROM nginx:1.27-alpine AS final

RUN addgroup -S app && adduser -S -G app app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R app:app /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
