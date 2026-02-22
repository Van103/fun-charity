

# KE HOACH TOI UU HIEU SUAT TOAN BO UNG DUNG

---

## VAN DE PHAT HIEN TU PERFORMANCE PROFILE

| Chi so | Gia tri hien tai | Muc tieu |
|--------|-----------------|----------|
| First Contentful Paint (FCP) | **6,232ms** | < 2,000ms |
| DOM Content Loaded | **6,025ms** | < 2,500ms |
| Full Page Load | **6,988ms** | < 3,500ms |
| Script Resources | **185 files / 2,307KB** | Giam 40% |
| JS Heap | **40.5MB** | < 25MB |

---

## NGUYEN NHAN GOC

### 1. LanguageContext.tsx = 2,674 dong (235KB) - TAI TREN MOI TRANG
File dich thuat lon nhat ung dung, chua tat ca 13 ngon ngu inline. Moi khi user truy cap bat ky trang nao, 235KB nay deu duoc tai.

### 2. hero-poster.jpg preload tren MOI TRANG (210KB lang phi)
`index.html` co `<link rel="preload" href="/images/hero-poster.jpg">` - anh nay chi can o trang Home nhung dang bi tai truoc tren tat ca cac trang.

### 3. angel-avatar.png = 450KB - Tai ngay khi app khoi dong
`AngelAIButton` import truc tiep file anh 450KB, component nay render tren moi trang.

### 4. MobileBottomNav import 7+ logo images eagerly
7 file logo duoc import truc tiep, tat ca tai ngay ca khi menu chua duoc mo.

### 5. FlyingAngel.tsx = 1,117 dong - Component nang chay global
Canvas animation phuc tap voi particle system, chay tren moi trang.

### 6. Google Fonts render-blocking
Stylesheet Google Fonts block render, them 72ms truoc khi content hien thi.

### 7. fairy-angel.png preload khong can thiet
Cursor image preload tren moi trang, ke ca mobile (noi cursor bi disable).

---

## GIAI PHAP

### Phase 1: Giam tai trong khoi dong (Tac dong lon nhat)

**1.1 Tach translations ra file rieng va lazy load**

File: `src/contexts/LanguageContext.tsx`

- Tach object `translations` (2500+ dong) ra file rieng `src/data/translations.ts`
- Giu lai LanguageContext chi voi logic context (~150 dong)
- Ket qua: LanguageContext giam tu 235KB xuong ~15KB

**1.2 Xoa preload khong can thiet trong index.html**

File: `index.html`

- Xoa `<link rel="preload" href="/images/hero-poster.jpg">` - chi can tren trang Home
- Xoa `<link rel="preload" href="/cursors/fairy-angel.png">` - khong can preload
- Chuyen Google Fonts tu render-blocking sang `media="print" onload` pattern

**1.3 Toi uu AngelAIButton - lazy load avatar**

File: `src/components/angel/AngelAIButton.tsx`

- Thay `import angelAvatar from '@/assets/angel-avatar.png'` bang URL string voi `loading="lazy"`
- Giam 450KB tai ngay khi khoi dong

**1.4 Lazy load logos trong MobileBottomNav**

File: `src/components/layout/MobileBottomNav.tsx`

- Chuyen 7 logo imports thanh URL strings voi `loading="lazy"` va `decoding="async"`
- Chi tai khi user mo menu Sheet

### Phase 2: Toi uu Components Global

**2.1 Lazy load FlyingAngel va CustomCursor**

File: `src/App.tsx`

- Wrap `FlyingAngel` va `CustomCursor` bang `React.lazy()` voi `Suspense`
- Chi tai component nay sau khi trang da render xong (defer 2s)

**2.2 Toi uu AnimatedBackground**

File: `src/components/background/AnimatedBackground.tsx`

- Giam so luong particles khi pin yeu (Battery API)
- Them check `navigator.hardwareConcurrency` de giam hieu ung tren thiet bi yeu

**2.3 Toi uu EnergyBokeh**

File: `src/components/background/EnergyBokeh.tsx`

- Giam particle count tu 30 xuong 15 tren thiet bi yeu
- Them `requestIdleCallback` cho particle creation

### Phase 3: Font va Asset Optimization

**3.1 Chuyen Google Fonts sang non-blocking**

File: `index.html`

```html
<!-- Truoc: Render-blocking -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=..." />

<!-- Sau: Non-blocking -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=..." as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=..." /></noscript>
```

---

## TOM TAT FILES CAN SUA

| File | Thay doi | Tac dong |
|------|----------|----------|
| `src/contexts/LanguageContext.tsx` | Tach translations ra file rieng | **-220KB** khoi dong |
| `src/data/translations.ts` | Tao moi - chua translations | File moi |
| `index.html` | Xoa preload, non-blocking fonts | **-280KB** preload |
| `src/components/angel/AngelAIButton.tsx` | Lazy load avatar image | **-450KB** khoi dong |
| `src/components/layout/MobileBottomNav.tsx` | Lazy load 7 logos | **-200KB** khoi dong |
| `src/App.tsx` | Lazy load FlyingAngel, CustomCursor | **-150KB** khoi dong |
| `src/components/background/EnergyBokeh.tsx` | Giam particles tren thiet bi yeu | CPU giam 30% |
| `src/components/background/AnimatedBackground.tsx` | Hardware check, giam hieu ung | CPU giam 20% |

---

## KET QUA DU KIEN

| Chi so | Truoc | Sau | Cai thien |
|--------|-------|-----|-----------|
| FCP | 6,232ms | ~2,500ms | **-60%** |
| Bundle khoi dong | ~2,300KB | ~1,200KB | **-48%** |
| JS Heap | 40.5MB | ~25MB | **-38%** |
| Preload waste | 660KB | 0KB | **-100%** |

---

## THOI GIAN TRIEN KHAI

| Phase | Thoi gian | Noi dung |
|-------|-----------|----------|
| 1 | 20 phut | Tach translations, xoa preload, lazy images |
| 2 | 15 phut | Lazy load global components, toi uu particles |
| 3 | 10 phut | Non-blocking fonts |

**Tong: ~45 phut**

