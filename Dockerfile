FROM nginx:1.25-alpine
COPY index.html /usr/share/nginx/html/
COPY data/ /usr/share/nginx/html/data/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
