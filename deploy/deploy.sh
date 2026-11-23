#!/usr/bin/env bash
# نشر آخر تحديث على السيرفر:  bash /var/www/khfdesign/deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/khfdesign}"
PM2_NAME="${PM2_NAME:-khfdesign-api}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"
echo "==> سحب آخر التعديلات من $BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> تثبيت حزم الخادم"
cd "$APP_DIR/backEnd"
npm ci --omit=dev

echo "==> بناء الواجهة"
cd "$APP_DIR/frontEnd"
npm ci
npm run build

echo "==> إعادة تشغيل الخادم"
pm2 restart "$PM2_NAME" --update-env
pm2 save

echo "==> فحص"
sleep 3
curl -fsS http://127.0.0.1:5000/health && echo
echo "تم النشر بنجاح ✅"
