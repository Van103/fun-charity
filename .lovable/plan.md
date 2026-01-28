

# KẾ HOẠCH: NÚT QUAY LẠI TRÊN CẢ WEB VÀ MOBILE

---

## PHÂN TÍCH YÊU CẦU

Con muốn:
1. Nút Back hiển thị **trên cả Desktop** (không chỉ Mobile như hiện tại)
2. Khi vào **bất kỳ thư mục/trang con** nào đều có nút quay lại
3. Có thể quay về **trang chủ** (/social)

### Hiện trạng
- `MobileBackButton.tsx` chỉ hiển thị trên Mobile (`isMobile === true`)
- Desktop không có nút Back vì dựa vào Navbar

---

## GIẢI PHÁP

### Tạo component mới: `BackButton.tsx`

Thay thế `MobileBackButton.tsx` bằng component mới hỗ trợ cả Desktop và Mobile

| Platform | Vị trí | Style |
|----------|--------|-------|
| **Desktop** | Fixed góc trái, dưới Navbar | Nút lớn hơn, có text "Quay lại" |
| **Mobile/Tablet** | Fixed góc trái, dưới Navbar | Nút icon tròn (giữ nguyên) |

### Logic hiển thị

```text
Các trang KHÔNG hiển thị nút Back:
├── "/" (Landing page)
├── "/social" (Trang chủ chính)  
└── "/auth" (Đăng nhập)

Tất cả trang khác → HIỂN THỊ nút Back
```

---

## THAY ĐỔI CỤ THỂ

### File: `src/components/layout/MobileBackButton.tsx` → Rename thành `BackButton.tsx`

**Cập nhật:**
1. **Bỏ điều kiện `isMobile`** → Hiển thị trên mọi device
2. **Responsive design:**
   - Mobile: Nút tròn, icon ArrowLeft
   - Desktop: Nút lớn hơn hoặc có text "Quay lại"
3. **Vị trí tối ưu:**
   - Mobile: `top-20 left-3` (dưới Navbar)
   - Desktop: `top-20 left-4` với style khác biệt
4. **Animation:** Giữ nguyên slide-in effect

### Import trong App.tsx

Đổi import từ `MobileBackButton` → `BackButton`

---

## CHI TIẾT CODE

### Component BackButton mới

```jsx
// Hiển thị trên TẤT CẢ devices (Desktop + Mobile + Tablet)
// Ẩn chỉ trên: "/", "/social", "/auth"

const BackButton = () => {
  const rootPages = ['/', '/social', '/auth'];
  const shouldShow = !rootPages.includes(location.pathname);
  
  // Responsive:
  // - Mobile: w-10 h-10 rounded-full (icon only)
  // - Desktop: px-4 py-2 rounded-lg với text "Quay lại"
  
  return shouldShow && (
    <motion.button>
      <ArrowLeft />
      <span className="hidden md:inline ml-2">Quay lại</span>
    </motion.button>
  );
};
```

### Style theo device

| Device | Width | Height | Text | Border Radius |
|--------|-------|--------|------|---------------|
| Mobile (< 768px) | 40px | 40px | Ẩn | Full circle |
| Desktop (≥ 768px) | auto | 40px | "Quay lại" | 8px rounded |

---

## FILES CẦN THAY ĐỔI

| File | Thay đổi |
|------|----------|
| `src/components/layout/MobileBackButton.tsx` | Rename + cập nhật logic để hiển thị trên Desktop |
| `src/App.tsx` | Cập nhật import nếu rename file |

---

## UI PREVIEW

### Desktop (≥ 768px)
```
┌──────────────────────────────────────────────────┐
│  [Logo] [Search]    [Home] [Platform] [Community]│  ← Navbar
├──────────────────────────────────────────────────┤
│                                                  │
│  [← Quay lại]                                    │  ← Back Button
│                                                  │
│              Page Content...                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────────┐
│  [Logo]      [☰ Menu]  │  ← Navbar
├────────────────────────┤
│                        │
│  [←]                   │  ← Back Button (icon only)
│                        │
│    Page Content...     │
│                        │
└────────────────────────┘
```

---

## TIMELINE

| Bước | Thời gian | Mô tả |
|------|-----------|-------|
| 1 | 2 phút | Cập nhật MobileBackButton.tsx → BackButton |
| 2 | 1 phút | Cập nhật import trong App.tsx |

**Tổng: ~3 phút**

---

## KẾT QUẢ SAU KHI HOÀN THÀNH

1. ✅ Nút Back hiển thị trên **cả Desktop và Mobile**
2. ✅ Desktop: Nút có text "Quay lại" dễ nhận biết
3. ✅ Mobile: Nút icon tròn gọn gàng
4. ✅ Ẩn trên trang chủ (`/`, `/social`, `/auth`)
5. ✅ Click → Quay về trang trước hoặc `/social` nếu không có history

