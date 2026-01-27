

# KẾ HOẠCH CHỈNH SỬA SIDEBAR FUN CHARITY

## TÓM TẮT YÊU CẦU

1. Logo tròn đều, rõ ràng, kích thước phù hợp
2. Đồng bộ kích thước chữ và logo cho đẹp, sang trọng
3. Cập nhật chữ **FUN TREASURY** (có khoảng trắng)
4. Màu chữ sidebar tím sáng thuần, bỏ gradient đỏ phía sau

---

## PHASE 1: Cập nhật Translation Key

### File: `src/contexts/LanguageContext.tsx`

Sửa `menu.treasury` từ "FUNTREASURY" thành "FUN TREASURY":

| Trước | Sau |
|-------|-----|
| FUNTREASURY | FUN TREASURY |

---

## PHASE 2: Chỉnh sửa LeftSidebar.tsx

### 2.1 Giảm kích thước logo cho cân đối

Kích thước hiện tại `w-16 h-16` (64px) quá to, gây mất cân đối.

| Trước | Sau |
|-------|-----|
| `w-16 h-16` (64px) | `w-12 h-12` (48px) |

### 2.2 Đồng bộ kích thước chữ

Giảm font size để cân đối với logo mới:

| Trước | Sau |
|-------|-----|
| `fontSize: '20px'` | `fontSize: '16px'` |

### 2.3 Đổi màu chữ sang Tím Sáng Thuần (bỏ gradient đỏ)

**Trước (gradient tím-đỏ):**
```tsx
className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500"
```

**Sau (tím sáng thuần):**
```tsx
className="text-purple-600 font-bold"
```

Hoặc dùng màu `#9333EA` (Purple 600) - tím sáng rực rỡ, không có đỏ.

### 2.4 Cập nhật viền logo sáng nhẹ hơn

Giữ viền ánh kim nhưng tinh chỉnh kích thước cho phù hợp với logo nhỏ hơn:

```tsx
<div className="relative">
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-champagne via-yellow-300 to-gold-dark opacity-50 blur-[1px] scale-105" />
  <img 
    src={item.image} 
    alt="" 
    className="relative w-12 h-12 rounded-full object-cover ring-2 ring-gold-champagne/40 shadow-md" 
  />
</div>
```

---

## PHASE 3: Đồng bộ MobileBottomNav.tsx

Áp dụng các thay đổi tương tự:
- Logo size: `w-12 h-12` (hoặc nhỏ hơn cho mobile: `w-10 h-10`)
- Font size: `16px`
- Màu chữ: Tím sáng thuần `text-purple-600`

---

## SO SÁNH TRƯỚC VÀ SAU

| Yếu tố | Trước | Sau |
|--------|-------|-----|
| Kích thước logo | 64px (quá to) | 48px (cân đối) |
| Font size | 20px | 16px |
| Màu chữ | Gradient tím→fuchsia→đỏ | Tím sáng thuần (#9333EA) |
| Viền logo | Blur 2px, scale 110% | Blur 1px, scale 105% (nhẹ hơn) |
| FUN TREASURY | FUNTREASURY | FUN TREASURY |

---

## FILES CẦN SỬA

| File | Thay đổi |
|------|----------|
| `src/contexts/LanguageContext.tsx` | Sửa "FUNTREASURY" → "FUN TREASURY" |
| `src/components/social/LeftSidebar.tsx` | Logo size, font size, màu chữ tím thuần |
| `src/components/layout/MobileBottomNav.tsx` | Đồng bộ thay đổi |

---

## KẾT QUẢ MONG ĐỢI

1. Logo tròn đều, kích thước cân đối (48px)
2. Chữ và logo đồng bộ, sang trọng
3. Màu tím sáng thuần, không có gradient đỏ
4. "FUN TREASURY" hiển thị đúng với khoảng trắng
5. Giao diện tổng thể hài hòa, sang trọng hơn

---

## THỜI GIAN THỰC HIỆN

- Phase 1 (Translation): ~2 phút
- Phase 2 (LeftSidebar): ~5 phút
- Phase 3 (MobileBottomNav): ~5 phút

**Tổng: ~12 phút**

