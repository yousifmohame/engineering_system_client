# المرحلة الأولى: بناء المشروع (Build)
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# المرحلة الثانية: التشغيل عبر Nginx
FROM nginx:alpine
# نسخ ملفات الـ build من المرحلة السابقة إلى مجلد Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# يمكنك إضافة ملف إعدادات nginx مخصص هنا إذا أردت توجيه الـ Routes
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]