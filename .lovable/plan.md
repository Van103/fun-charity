

# KẾ HOẠCH CẬP NHẬT SIDEBAR FUN CHARITY

## TÓM TẮT THAY ĐỔI

Cập nhật sidebar với các yêu cầu:
1. Sửa tên chính xác: **FUN WALLET**, **FUNTREASURY**, **GREEN EARTH**
2. Logo to gấp đôi (8 → 16)
3. Viền ánh kim sang nhẹ bên ngoài vòng tròn logo
4. Đổi màu chữ sidebar sang tím đỏ nổi bật, sang trọng
5. Phông chữ to rõ, sang trọng

---

## PHASE 1: Thêm Translation Keys

### File: `src/contexts/LanguageContext.tsx`

Thêm 3 translation keys mới với tên chính xác theo yêu cầu:

| Key | Giá trị hiển thị |
|-----|------------------|
| `menu.wallet` | **FUN WALLET** |
| `menu.treasury` | **FUNTREASURY** |
| `menu.greenearth` | **GREEN EARTH** |

Thêm vào sau dòng 249 (sau `menu.legal`):

```tsx
"menu.wallet": {
  en: "FUN WALLET", vi: "FUN WALLET", zh: "FUN WALLET", ...
},
"menu.treasury": {
  en: "FUNTREASURY", vi: "FUNTREASURY", zh: "FUNTREASURY", ...
},
"menu.greenearth": {
  en: "GREEN EARTH", vi: "GREEN EARTH", zh: "GREEN EARTH", ...
},
```

---

## PHASE 2: Cập nhật Logo Style trong LeftSidebar.tsx

### 2.1 Tăng kích thước logo từ 32px (w-8) lên 64px (w-16)

| Trước | Sau |
|-------|-----|
| `w-8 h-8` (32px) | `w-16 h-16` (64px) |

### 2.2 Thêm viền ánh kim sang nhẹ (ring gradient gold)

Thay thế:
```tsx
<img src={item.image} alt="" className="w-8 h-8 rounded-full object-cover" />
```

Thành:
```tsx
<div className="relative">
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-champagne via-yellow-300 to-gold-dark opacity-60 blur-[2px] scale-110" />
  <img 
    src={item.image} 
    alt="" 
    className="relative w-16 h-16 rounded-full object-cover ring-2 ring-gold-champagne/50 shadow-gold-sm" 
  />
</div>
```

### 2.3 Đổi màu chữ sang Tím Đỏ Nổi Bật + Font to rõ

Màu chữ mới: **#9333EA** (Purple 600) hoặc **#7C3AED** (Violet 600) - tím đỏ rực rỡ

Thay thế style text:
```tsx
// Trước
<span style={{ fontSize: '18px' }}>{t(item.labelKey)}</span>

// Sau - Tím đỏ nổi bật, font to rõ sang trọng
<span 
  className="font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500"
  style={{ fontSize: '20px' }}
>
  {t(item.labelKey)}
</span>
```

---

## PHASE 3: Áp dụng tương tự cho MobileBottomNav.tsx

Đồng bộ các thay đổi:
- Logo size: `w-16 h-16`
- Viền ánh kim gradient
- Màu chữ tím đỏ gradient
- Font size: 20px, font-bold

---

## CHI TIẾT KỸ THUẬT

### Màu chữ Tím Đỏ Nổi Bật Sang Trọng

CSS gradient text class mới trong index.css:
```css
.sidebar-text-luxury {
  @apply font-bold tracking-wide text-transparent bg-clip-text;
  background-image: linear-gradient(
    135deg,
    hsl(270 91% 50%) 0%,    /* Purple đậm */
    hsl(300 90% 55%) 50%,   /* Fuchsia */
    hsl(330 85% 50%) 100%   /* Rose/đỏ hồng */
  );
}
```

### Viền Ánh Kim Logo

Ring gradient với glow effect:
```css
.logo-golden-ring {
  @apply relative;
}

.logo-golden-ring::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    hsl(43 96% 56%) 0%,
    hsl(48 100% 75%) 50%,
    hsl(43 96% 56%) 100%
  );
  opacity: 0.7;
  filter: blur(2px);
}
```

---

## FILES CẦN SỬA

| File | Thay đổi |
|------|----------|
| `src/contexts/LanguageContext.tsx` | Thêm 3 translation keys: wallet, treasury, greenearth |
| `src/components/social/LeftSidebar.tsx` | Logo x2, viền ánh kim, màu chữ tím đỏ, font to |
| `src/components/layout/MobileBottomNav.tsx` | Đồng bộ thay đổi với LeftSidebar |
| `src/index.css` | Thêm class `.sidebar-text-luxury` và `.logo-golden-ring` |

---

## KẾT QUẢ MONG ĐỢI

| Yếu tố | Trước | Sau |
|--------|-------|-----|
| Tên hiển thị | Fun Wallet, Fun Treasury | FUN WALLET, FUNTREASURY, GREEN EARTH |
| Kích thước logo | 32px (nhỏ) | 64px (to gấp đôi) |
| Viền logo | Không có | Ánh kim vàng gradient sang nhẹ |
| Màu chữ | Xám nhạt | Tím đỏ gradient nổi bật |
| Font size | 18px | 20px |
| Font weight | Medium | Bold |

---

## THỜI GIAN THỰC HIỆN

- Phase 1 (Translations): ~5 phút
- Phase 2 (LeftSidebar): ~10 phút  
- Phase 3 (MobileBottomNav): ~5 phút

**Tổng: ~20 phút**

