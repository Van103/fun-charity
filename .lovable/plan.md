

# KẾ HOẠCH CHỈNH SỬA GIAO DIỆN FUN CHAT

---

## PHẦN 1: BACK BUTTON - BỎ CHỮ "QUAY LẠI"

### File: `src/components/layout/BackButton.tsx`

**Thay đổi:**
- Xóa phần `<span>` hiển thị chữ "Quay lại" trên desktop
- Đổi class của button thành hình tròn cố định cho cả mobile và desktop
- Giữ nguyên size w-10 h-10 rounded-full cho mọi thiết bị

**Trước:**
```typescript
w-10 h-10 rounded-full
md:w-auto md:h-10 md:px-4 md:py-2 md:rounded-lg
// + <span className="hidden md:inline">Quay lại</span>
```

**Sau:**
```typescript
w-10 h-10 rounded-full
// Xóa md:w-auto md:h-10 md:px-4 md:py-2 md:rounded-lg
// Xóa luôn <span> chứa "Quay lại"
```

---

## PHẦN 2: SETTINGS MENU - MỞ RỘNG CHI TIẾT

### File: `src/components/chat/ChatMenuTab.tsx`

**Thay đổi menu "Cài đặt":**

Khi bấm vào "Cài đặt", mở Collapsible hoặc navigate đến section với các mục:

| Mục | Icon | Mô tả |
|-----|------|-------|
| Tính năng | Sparkles | Bật/tắt các tính năng chat |
| Trạng thái hoạt động | Activity | Online/Offline/Ẩn |
| Quyền riêng tư và an toàn | Shield | Ai có thể liên hệ, chặn, etc. |
| Thông tin cá nhân | User | Email, SĐT, ngày sinh |
| Mật khẩu và bảo mật | Lock | Đổi mật khẩu, 2FA |
| Kiểm duyệt Admin | ShieldCheck | Chỉ hiển thị cho Admin |

**Cách triển khai:**
- Thêm state `showSettingsSubmenu`
- Khi click "Cài đặt" -> toggle submenu
- Hiển thị các mục con với animation slide-down
- Mỗi mục navigate đến trang/modal tương ứng

---

## PHẦN 3: BOTTOM TABS - CHỮ TO HƠN, MÀU TÍM HỒNG THUẦN

### File: `src/components/chat/ChatBottomTabs.tsx`

**Thay đổi chữ labels:**

**Trước (line 76-82):**
```typescript
<span className={`text-[10px] mt-0.5 font-medium transition-colors ${
  isActive ? "text-primary" : "text-muted-foreground"
}`}>
```

**Sau:**
```typescript
<span className={`text-[12px] mt-0.5 font-semibold transition-colors ${
  isActive ? "text-[#9333EA]" : "text-muted-foreground"
}`}>
```

**Thay đổi màu icon khi active:**

**Trước (line 56-62):**
```typescript
<Icon
  className={`w-6 h-6 transition-colors ${
    isActive ? "text-primary" : "text-muted-foreground"
  }`}
  fill={isActive ? "hsl(var(--primary))" : "none"}
/>
```

**Sau:**
```typescript
<Icon
  className={`w-6 h-6 transition-colors ${
    isActive ? "text-[#9333EA]" : "text-muted-foreground"
  }`}
  fill={isActive ? "#9333EA" : "none"}
/>
```

**Thay đổi active indicator (line 46):**

**Trước:**
```typescript
className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-primary"
```

**Sau:**
```typescript
className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-[#9333EA]"
```

---

## TÓM TẮT THAY ĐỔI

| File | Thay đổi |
|------|----------|
| `BackButton.tsx` | Xóa text "Quay lại", giữ icon tròn cố định |
| `ChatMenuTab.tsx` | Thêm submenu mở rộng cho Cài đặt với 6 mục |
| `ChatBottomTabs.tsx` | Font size: 10px → 12px, font-medium → font-semibold, màu: primary → #9333EA thuần |

---

## PREVIEW SAU KHI HOÀN THÀNH

### Back Button (Trước vs Sau)
```
TRƯỚC:              SAU:
┌───────────────┐   ┌─────┐
│ ← Quay lại   │   │  ←  │
└───────────────┘   └─────┘
```

### Settings Submenu (Mới)
```
┌─────────────────────────────────────┐
│ ⚙️ Cài đặt                      ▼   │
├─────────────────────────────────────┤
│   ✨ Tính năng                  >   │
│   🟢 Trạng thái hoạt động       >   │
│   🛡️ Quyền riêng tư và an toàn  >   │
│   👤 Thông tin cá nhân          >   │
│   🔒 Mật khẩu và bảo mật        >   │
│   🛡️ Kiểm duyệt Admin (Admin)   >   │
└─────────────────────────────────────┘
```

### Bottom Tabs (Chữ to hơn, tím thuần)
```
┌────────────────────────────────────────────────────┐
│   💬        📷        ❤️        🔔        ☰      │
│   0         0         0         0       Menu      │
│ Đoạn chat  Tin    Từ thiện  Thông báo            │
│                   ━━━━━━                          │
│           (Tím thuần #9333EA, 12px, semibold)     │
└────────────────────────────────────────────────────┘
```

