FROM nginx:1.27-alpine

COPY infrastructure-nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web /usr/share/nginx/html

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:7860/healthz || exit 1
