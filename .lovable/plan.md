

# KẾ HOẠCH CẬP NHẬT GIAO DIỆN FUN CHARITY

## TÓM TẮT YÊU CẦU

1. Đổi màu chữ Quick Actions sang **tím hồng**
2. Làm **chữ và thư mục to hơn**
3. Logo FUN CHARITY **to lớn hơn và sáng hơn**

---

## PHASE 1: Cập nhật Quick Actions trong LeftSidebar.tsx

### 1.1 Tiêu đề Quick Actions - Màu tím hồng + To hơn

Thay đổi từ:
```tsx
<h3 className="font-semibold mb-3 text-[#4C1D95] ..." style={{ fontSize: '18px' }}>
```

Thành:
```tsx
<h3 className="font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500" style={{ fontSize: '20px' }}>
```

### 1.2 Kích thước các item Quick Actions - To hơn

| Yếu tố | Trước | Sau |
|--------|-------|-----|
| Icon size | `w-4 h-4` | `w-5 h-5` |
| Icon wrapper | `p-1.5` | `p-2` |
| Font size | `15px` | `17px` |
| Padding | `py-2.5` | `py-3` |

### 1.3 Màu chữ Quick Actions - Tím hồng

Thay đổi text color từ `text-foreground` sang gradient tím hồng:
```tsx
<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500" style={{ fontSize: '17px' }}>
  {t(item.labelKey)}
</span>
```

---

## PHASE 2: Cập nhật Logo FUN CHARITY to lớn hơn và sáng hơn

### 2.1 Tăng kích thước Logo trong Logo.tsx

Thay đổi sizes object:

| Size | Trước | Sau |
|------|-------|-----|
| sm | 72px | 80px |
| md | 96px | 120px |
| lg | 120px | 150px |
| xl | 160px | 200px |

### 2.2 Thêm hiệu ứng sáng hơn

Thêm filter brightness và glow effect:
```tsx
<motion.div
  ...
  className="relative drop-shadow-[0_0_15px_rgba(147,51,234,0.4)]"
>
  <img
    ...
    className="w-full h-full object-contain brightness-110"
  />
</motion.div>
```

---

## SO SÁNH TRƯỚC VÀ SAU

| Yếu tố | Trước | Sau |
|--------|-------|-----|
| Quick Actions title | Tím đậm `#4C1D95`, 18px | Gradient tím-hồng, 20px, bold |
| Quick Actions text | `text-foreground`, 15px | Gradient tím-hồng, 17px |
| Quick Actions icon | `w-4 h-4`, `p-1.5` | `w-5 h-5`, `p-2` |
| Quick Actions padding | `py-2.5` | `py-3` |
| Logo size (md) | 96px | 120px |
| Logo effect | Không có | Brightness 110%, glow tím |

---

## FILES CẦN SỬA

| File | Thay đổi |
|------|----------|
| `src/components/social/LeftSidebar.tsx` | Quick Actions: màu tím hồng, kích thước to hơn |
| `src/components/brand/Logo.tsx` | Logo to hơn, sáng hơn với glow effect |

---

## KẾT QUẢ MONG ĐỢI

1. Quick Actions có màu tím hồng gradient đẹp mắt
2. Thư mục và chữ Quick Actions to rõ ràng hơn
3. Logo FUN CHARITY to lớn và rực rỡ hơn với hiệu ứng phát sáng
4. Giao diện tổng thể sang trọng và nổi bật

---

## THỜI GIAN THỰC HIỆN

- Phase 1 (Quick Actions): ~8 phút
- Phase 2 (Logo): ~5 phút

**Tổng: ~13 phút**

