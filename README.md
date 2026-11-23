# KHF Designs — موقع المهندس خالد للتصميم وخدمات CNC

موقع أعمال (Portfolio) ومتجر استفسارات لخدمات التصميم الهندسي والحفر بالـ CNC، مع لوحة تحكم كاملة للإدارة.

| الجزء | التقنيات | الاستضافة الحالية |
|------|-----------|-------------------|
| `frontEnd/` | React 19 · Vite · TypeScript · Tailwind | Vercel — `khaled-fathe.vercel.app` |
| `backEnd/` | Node.js · Express 5 · MongoDB (Mongoose) · Cloudinary · Gemini | `khfdesign.cloud` |

## المزايا

- **معرض أعمال** مقسّم إلى فئات، مع بحث وترتيب، وصفحة مستقلة لكل منتج `/project/:id` (معرض صور، بيانات SEO وJSON-LD، رابط قابل للمشاركة).
- **اطلب عرض سعر** عبر واتساب مباشرة من أي منتج (اسم المنتج وصورته ورابطه في الرسالة)، أو من صفحة `/quote` برفع ملف DXF / STL / DWG / SVG / PDF حتى 25MB.
- **تقييمات ومفضلة** لكل منتج، و**آراء العملاء** تظهر بعد موافقة الإدارة.
- **مساعد ذكي (Gemini)** يعمل عبر الخادم، فلا يصل المفتاح إلى المتصفح.
- **لوحة تحكم** `/admin`: نظرة عامة بالأرقام، وإدارة الأعمال (سحب لإعادة الترتيب، إخفاء بدل الحذف، رفع عدة صور بالسحب والإفلات، اختيار صورة الغلاف)، والفئات، وطلبات عرض السعر مع حالاتها، والموافقة على التقييمات، والمستخدمين.
- **Sitemap تلقائي** على `/sitemap.xml` يُنشأ من الأعمال والفئات الظاهرة.

## التشغيل محلياً

المتطلبات: Node.js 20 أو أحدث، وقاعدة MongoDB (محلية أو Atlas)، وحساب Cloudinary لرفع الصور والملفات.

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
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | تخزين الصور وملفات التصميم |
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
| `VITE_API_URL` | رابط الخادم |
| `VITE_SITE_URL` | رابط الموقع العام (للمشاركة وSEO) |
| `VITE_WHATSAPP_NUMBER` | رقم واتساب بالصيغة الدولية بدون + |

> ⚠️ كل متغير يبدأ بـ `VITE_` يصل إلى المتصفح، فلا تضع فيه أي مفتاح سري.

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
