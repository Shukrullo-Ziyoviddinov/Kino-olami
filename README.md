# Kino-olami

## Google qidiruvi

Express servisida `SITE_URL` qiymatiga saytning asosiy HTTPS manzilini kiriting. Standart qiymat `https://kino-olami.uz`. Client build Express orqali xizmat qilishi kerak. Frontend alohida hostingda bo‘lsa, bosh sahifa, `/movie/*`, `/robots.txt` va `/sitemap.xml` so‘rovlarini Express’ga yo‘naltiring.

Deploydan keyin `/sitemap.xml`ni Google Search Console’ga yuboring va URL Inspection orqali mavjud kino sahifasini tekshiring.

## MoviyAI

MoviyAI orqali kirgan foydalanuvchi /embed ichida alohida Kino Olami ro‘yxatidan o‘tmaydi. MoviyAI API odatdagi Google yoki Telegram sessiyasini tekshiradi va Kino Olami API bilan serverdan serverga qisqa muddatli sessiya almashadi. Kino Olami sessiyasi freym yoki WebView xotirasida saqlanadi.

1. Ikkala API servisida bir xil, tasodifiy va kamida 32 baytli `MOVIYAI_SSO_SECRET` o‘rnating. Kino Olami’ning mavjud `JWT_SECRET` qiymati alohida qoladi. SSO secret frontend yoki Expo muhitiga berilmaydi.
2. MoviyAI API servisida `KINO_OLAMI_API_URL`ga Kino Olami Express API originini kiriting. Production qiymati HTTPS bo‘lishi kerak. Vercel frontend originidan foydalanilsa, u `/api/auth/moviy/exchange` so‘rovini Express API’ga uzatishi kerak.
3. Kino Olami frontendida `REACT_APP_MOVIYAI_ORIGINS` qiymati kerak bo‘lsa, aniq MoviyAI veb originlarini vergul bilan ajratib bering. Standart ro‘yxat `https://moviyai.uz,https://www.moviyai.uz,http://localhost:3000`. Framing uchun HTML javobidagi `frame-ancestors` ham shu originlarga mos bo‘lsin.
4. Kino Olami API va frontendini, MoviyAI API hamda veb va Native bundle’larini yangilang. Eski Kino Olami hisobini bog‘lash MongoDB tranzaksiyasidan foydalanadi. Buning uchun replica set yoki sharded cluster va `MoviyIdentity.userId` uchun unique indeks kerak.

MoviyAI ichidagi Kino Olami ekranida navbar yurakchasi `/embed/wishlist`ni ochadi. Shu sahifadagi «Kino Olami hisobini bog‘lash» tugmasi eski hisobning telefon raqami va parolini tekshiradi, so‘ng ikkala hisobda saqlangan filmlarni birlashtiradi. MoviyAI’dagi boshqa sahifalarda yurakcha odatdagi Sevimlilar yo‘liga olib boradi.

- Lokal URL `http://localhost:5000/embed`. `client` ichida `npm run build` bajaring, so‘ng `server` ichida mavjud MongoDB sozlamalari bilan `npm start` ishlating. CRA dev-serverda UI `http://localhost:3000/embed` orqali ochiladi. Freym sarlavhalarini Express servisida sinang.
- Production URL deploydan so‘ng `https://kino-olami.uz/embed`. Film yo‘li `/embed/movie/<id>`, katalogdagi qidiruv misoli `/embed?q=film`. Vaqtinchalik dizayn qiymatlari `client/src/components/EmbedLayout/EmbedLayout.css` faylida.
- Express muhitida `MOVIYAI_FRAME_ORIGINS` qiymatiga vergul bilan ajratilgan aniq MoviyAI veb originlarini kiriting. Lokal ota sahifa uchun misol `http://localhost:3000`. Qiymat bo‘sh bo‘lsa, `/embed` freym ichida bloklanadi. Expo WebView URL’ni bevosita yuklaydi va unga ota veb origini kerak emas.
- Statik hosting yoki CDN HTML xizmatini bajarsa, `/embed` va `/embed/*` uchun SPA fallbackni `index.html`ga yo‘naltiring. Shu HTTP javoblariga `Content-Security-Policy: frame-ancestors https://<MoviyAI-veb-origini>` qo‘llang, `X-Frame-Options`ni olib tashlang va ziddiyatli `frame-ancestors` direktivalarini almashtiring. Boshqa CSP direktivalari va boshqa yo‘llardagi qoidalarni saqlang. Reverse proxy Express sarlavhalarini uzatsa, bu yo‘llarga qo‘shimcha freym cheklovi qo‘shmasin.
- Next.js iframe’da `allowFullScreen` va `allow="autoplay; fullscreen; encrypted-media; picture-in-picture"` ishlating. MoviyAI CSP’da `frame-src` cheklangan bo‘lsa, Kino olami originini kiriting. `Permissions-Policy` fullscreen delegatsiyasiga imkon berishi kerak. Kino olami pleeri ichki iframe’da fullscreen ruxsatini uzatadi. Kino olami CSP’sida `frame-src` cheklangan bo‘lsa, katalogda ishlatiladigan provayder originlarini qo‘shing (`https://www.youtube.com`, `https://mover.uz`, `https://vkvideo.ru`). Provayder `frame-ancestors` yuborsa, u barcha ota freymlarga ruxsat berishi kerak. Har bir video uchun provayderning ijro cheklovlari ham amal qiladi.
- Expo’da `react-native-webview` orqali URL’ni bevosita yuklang. JavaScript va Android DOM storage yoqilgan bo‘lsin. Android uchun `allowsFullscreenVideo`, iOS uchun `allowsInlineMediaPlayback` ishlating. Qurilmalarda ijro, to‘liq ekran va WebView ichidagi orqaga qaytishni sinang.
- Video boshlash uchun Kino olami akkaunti bilan kirish talab qilinadi. Freymda brauzer storage’ni bloklasa, sessiya sahifa xotirasida turadi va sahifani yangilashda qayta kirish talab qilinadi.
