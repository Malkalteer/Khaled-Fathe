# KHF Designs — موقع المهندس خالد للتصميم وخدمات CNC

موقع أعمال (Portfolio) ومتجر استفسارات لخدمات التصميم الهندسي والحفر بالـ CNC، مع لوحة تحكم كاملة للإدارة.

| الجزء | التقنيات |
|------|-----------|
| `frontEnd/` | React 19 · Vite · TypeScript · Tailwind |
| `backEnd/` | Node.js · Express 5 · MongoDB (Mongoose) · sharp · Gemini |

الموقع كله على سيرفر VPS واحد بدومين **https://khfdesign.cloud**:
nginx يعرض الواجهة المبنية من `frontEnd/dist`، ويحوّل `/api` و`/sitemap.xml` إلى خادم Node.js (pm2) على المنفذ 5000.

## المزايا

- **معرض أعمال** مقسّم إلى فئات، مع بحث وترتيب، وصفحة مستقلة لكل منتج `/project/:id` (معرض صور، بيانات SEO وJSON-LD، رابط قابل للمشاركة).
- **متجر**: قسم «الأكثر مبيعاً» يحدده المدير، والفئات بصور 1080×1350، والسعر ظاهر على كل منتج، وزر «شراء» يضيف المنتج للسلة، ويتم إتمام الطلب عبر واتساب مع الإجمالي.
- **تواصل معنا** `/contact`: واتساب مباشر، أو رسالة مع ملف تصميم اختياري (DXF / STL / DWG / SVG / PDF حتى 25MB).
- **تقييمات ومفضلة** لكل منتج، و**آراء العملاء** تظهر بعد موافقة الإدارة.
- **مساعد ذكي (Gemini)** يعمل عبر الخادم، فلا يصل المفتاح إلى المتصفح.
- **لوحة تحكم** `/admin`: نظرة عامة بالأرقام، وإدارة الأعمال (سحب لإعادة الترتيب، إخفاء بدل الحذف، رفع عدة صور بالسحب والإفلات، اختيار صورة الغلاف)، والفئات، وطلبات عرض السعر مع حالاتها، والموافقة على التقييمات، والمستخدمين.
- **Sitemap تلقائي** على `/sitemap.xml` يُنشأ من الأعمال والفئات الظاهرة.

## التشغيل محلياً

المتطلبات: Node.js 20 أو أحدث، وقاعدة MongoDB (محلية أو Atlas).

### 1) الخادم

```bash
cd backEnd
cp .env.example .env   # ثم املأ القيم
npm install
npm run dev            # http://localhost:5000
```

| المتغير | الوصف |
|---------|-------|
| `MONGO_URI` | رابط قاعدة MongoDB |
| `JWT_SECRET` | سر عشوائي طويل (32 حرفاً أو أكثر) |
| `FRONTEND_URL` | نطاقات الواجهة المسموح لها (مفصولة بفاصلة) |
| `SITE_URL` | رابط الموقع العام (يُستخدم في sitemap) |
| `UPLOADS_DIR` | مجلد حفظ الصور وملفات العملاء على السيرفر (مثل `/var/www/khfdesign-uploads`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | يُنشأ حساب المدير تلقائياً عند أول تشغيل |
| `GEMINI_API_KEY` | مفتاح المساعد الذكي (في الخادم فقط) |
| `GEMINI_MODEL` | اختياري — الافتراضي `gemini-3-flash-preview` |
| `MONGO_DNS_SERVERS` | اختياري — فقط إذا فشل الاتصال بـ `mongodb+srv` بسبب DNS |
| `NODE_ENV` | `production` على الخادم الحقيقي (لتفعيل كوكيز `Secure`) |

### 2) الواجهة

```bash
cd frontEnd
npm install
npm run dev            # http://localhost:3000
```

متغيرات الواجهة في `frontEnd/.env.development` و`frontEnd/.env.production`:

| المتغير | الوصف |
|---------|-------|
| `VITE_API_URL` | رابط الخادم — اتركه فارغاً في الإنتاج (نفس الدومين) |
| `VITE_SITE_URL` | رابط الموقع العام (للمشاركة وSEO) |
| `VITE_WHATSAPP_NUMBER` | رقم واتساب بالصيغة الدولية بدون + |

> ⚠️ كل متغير يبدأ بـ `VITE_` يصل إلى المتصفح، فلا تضع فيه أي مفتاح سري.

## النشر على السيرفر (VPS)

بعد أي تعديل يُدمج في `main`، ادخل إلى السيرفر بـ SSH وشغّل:

```bash
bash /var/www/khfdesign/deploy/deploy.sh
```

السكربت يسحب التعديلات، ويثبّت الحزم، ويبني الواجهة، ويعيد تشغيل `khfdesign-api` في pm2.

إعدادات nginx موجودة في `deploy/nginx-khfdesign.conf`.

### تغيير بريد دخول المدير

```bash
cd /var/www/khfdesign/backEnd && npm run admin:email -- Engkhaledfathy.khf@gmail.com
```

بعدها عدّل `ADMIN_EMAIL` في `.env` إلى نفس البريد، ثم أعد تشغيل الخادم. كلمة المرور تبقى كما هي.

### تخزين الصور والملفات

كل الملفات تُحفظ على السيرفر في المجلد `UPLOADS_DIR`:

- `public/images/…`: صور الموقع. تُحوَّل تلقائياً إلى WebP بعرض أقصى 2000px، وتُعرض على `/uploads/…`.
- `private/quotes/…`: ملفات العملاء (DXF / STL …). لا تُعرض للعامة، ويحمّلها المدير فقط من لوحة التحكم.

⚠️ هذا المجلد خارج git، فخذ منه نسخة احتياطية دورياً، مثلاً عبر Snapshots في لوحة هوستينجر.

لنقل الصور القديمة من Cloudinary إلى السيرفر:

```bash
cd /var/www/khfdesign/backEnd && npm run migrate:images -- --dry-run   # تجربة فقط
cd /var/www/khfdesign/backEnd && npm run migrate:images                # تنفيذ فعلي
```

## الاختبارات وCI

```bash
cd backEnd && npm test          # Jest + Supertest + MongoDB في الذاكرة
cd frontEnd && npm run typecheck && npm run build
```

يشغّل GitHub Actions الاختبارات والبناء عند كل push (`.github/workflows/ci.yml`).

## واجهة الـ API باختصار

| المسار | الوصف |
|--------|-------|
| `POST /api/auth/register` · `login` · `refresh` · `logout` · `GET /api/auth/me` | الحسابات (كوكيز httpOnly) |
| `GET /api/projects` · `GET /api/projects/:id` | الأعمال الظاهرة مع إحصائيات التقييم |
| `GET /api/projects/admin` · `PUT /api/projects/reorder` · `PATCH /api/projects/:id/visibility` | إدارة (مدير فقط) |
| `GET/POST/PUT/DELETE /api/categories` | الفئات |
| `POST /api/product-interactions/:id` · `GET /api/product-interactions/favorites` | التقييم والمفضلة |
| `GET/POST /api/reviews` · `GET /api/reviews/admin` · `PATCH /api/reviews/:id` | آراء العملاء والموافقة عليها |
| `POST /api/quotes` · `GET/PATCH/DELETE /api/quotes/:id` | طلبات عرض السعر |
| `POST /api/chat` | المساعد الذكي |
| `POST /api/upload` | رفع صورة (مدير فقط) |
| `GET /api/admin/stats` | أرقام لوحة التحكم |
| `GET /sitemap.xml` | خريطة الموقع |
