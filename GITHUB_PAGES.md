# انتشار روی GitHub Pages

این ریپو مستقل و آمادهٔ انتشار است. پوشهٔ `dist/` خروجی کامل سایت است؛ انتشار به کامپایل مجدد لاتک نیاز ندارد.

۱. در GitHub یک ریپوی خالی بسازید؛ گزینهٔ ساخت README، مجوز و gitignore را فعال نکنید تا تاریخچهٔ جداگانه ایجاد نشود.
۲. در همین پوشه، آدرس واقعی ریپو را جایگزین کنید و اجرا کنید:

```sh
git remote add origin https://github.com/EhsanShahbazii/REPOSITORY.git
git push -u origin main
```

۳. در Settings → Pages، گزینهٔ Source را روی GitHub Actions قرار دهید. سپس از تب Actions، گردش‌کار Deploy GitHub Pages را اجرا کنید. پس از فعال‌شدن Pages، هر push روی main انتشار را به‌روز می‌کند.

گردش‌کار ابتدا وابستگی‌های قفل‌شده را نصب و بررسی نحو و آزمون‌ها را اجرا می‌کند، سپس `dist/` را منتشر می‌کند. مسیرهای نسبی و مسیریابی hash برای آدرس پروژه مانند `https://ehsanshahbazii.github.io/REPOSITORY/` مناسب‌اند.

برای پیش‌نمایش محلی:

```sh
python3 -m http.server 4173 --directory dist
```

سپس `http://localhost:4173` را باز کنید.

پیکربندی انتشار بر اساس [مستندات رسمی GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) است. تاریخچهٔ بازسازی‌شده در `RECONSTRUCTED_HISTORY.md` توضیح داده شده است.
