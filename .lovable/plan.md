

# KẾ HOẠCH CHỈNH SỬA GIAO DIỆN FUN CHAT

---

## PHẦN 1: BOTTOM TABS - TẤT CẢ CHỮ HIỂN THỊ MÀU TÍM

### File: `src/components/chat/ChatBottomTabs.tsx`

**Thay đổi:**
Thay đổi màu chữ labels từ `text-muted-foreground` (xám) sang `text-[#9333EA]` (tím) cho TẤT CẢ các tab (kể cả không active)

**Trước (line 76-79):**
```typescript
<span className={`text-[12px] mt-0.5 font-semibold transition-colors ${
  isActive ? "text-[#9333EA]" : "text-muted-foreground"
}`}>
```

**Sau:**
```typescript
<span className={`text-[12px] mt-0.5 font-semibold transition-colors ${
  isActive ? "text-[#9333EA]" : "text-[#9333EA]/70"
}`}>
```

**Thay đổi màu icon (line 56-62):**

**Trước:**
```typescript
<Icon
  className={`w-6 h-6 transition-colors ${
    isActive ? "text-[#9333EA]" : "text-muted-foreground"
  }`}
/>
```

**Sau:**
```typescript
<Icon
  className={`w-6 h-6 transition-colors ${
    isActive ? "text-[#9333EA]" : "text-[#9333EA]/70"
  }`}
/>
```

---

## PHẦN 2: NÚT TRỞ VỀ - DI CHUYỂN LÊN THANH TÌM KIẾM

### Cách tiếp cận:
- Xóa BackButton khỏi trang /messages (ẩn global BackButton)
- Tích hợp nút quay lại vào header của FUN Chat, nằm cùng hàng với thanh tìm kiếm
- Nút quay lại chỉ hiển thị bên trái thanh tìm kiếm

### File 1: `src/components/layout/BackButton.tsx`

**Thay đổi:**
Thêm `/messages` vào danh sách `rootPages` để ẩn nút global trên trang Messages

**Trước:**
```typescript
const rootPages = ['/', '/social', '/auth'];
```

**Sau:**
```typescript
const rootPages = ['/', '/social', '/auth', '/messages'];
```

### File 2: `src/pages/Messages.tsx`

**Thay đổi Header (lines 1091-1113):**

Thêm nút quay lại vào hàng chứa thanh tìm kiếm, thay đổi layout:

**Trước:**
```typescript
<div className="p-4 border-b border-border">
  <div className="flex items-center justify-between mb-4">
    <h1 className="text-2xl font-bold">{t('messages.chats')}</h1>
    <div className="flex items-center gap-1">
      <Button ... />
      <Button ... />
    </div>
  </div>
  
  {/* Search */}
  <div className="relative" ref={searchInputRef}>
    <Search className="absolute left-3 ..." />
    <Input ... />
  </div>
```

**Sau:**
```typescript
<div className="p-4 border-b border-border">
  {/* Search bar with back button */}
  <div className="flex items-center gap-2 mb-4">
    {/* Back Button */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="rounded-full h-10 w-10 flex-shrink-0 hover:bg-muted"
    >
      <ArrowLeft className="w-5 h-5 text-[#9333EA]" />
    </Button>
    
    {/* Search Input */}
    <div className="relative flex-1" ref={searchInputRef}>
      <Search className="absolute left-3 ..." />
      <Input ... />
    </div>
  </div>
  
  {/* Title row */}
  <div className="flex items-center justify-between mb-3">
    <h1 className="text-2xl font-bold">{t('messages.chats')}</h1>
    <div className="flex items-center gap-1">
      <Button ... />
      <Button ... />
    </div>
  </div>
```

---

## TÓM TẮT THAY ĐỔI

| File | Thay đổi |
|------|----------|
| `ChatBottomTabs.tsx` | Tất cả chữ & icon hiển thị màu tím (active: đậm, inactive: nhạt hơn) |
| `BackButton.tsx` | Ẩn global back button trên trang /messages |
| `Messages.tsx` | Thêm nút quay lại nằm cùng hàng với thanh tìm kiếm, di chuyển tiêu đề xuống dưới |

---

## PREVIEW SAU KHI HOÀN THÀNH

### Header Layout (Messenger Style)
```
┌────────────────────────────────────────────────────┐
│  [←]  │ 🔍 Tìm kiếm trên Messenger        │        │
├────────────────────────────────────────────────────┤
│  Đoạn chat                    [⚙️] [✏️]            │
├────────────────────────────────────────────────────┤
│  [Tất cả] [Chưa đọc] [Nhóm] [📞 Cuộc gọi]          │
└────────────────────────────────────────────────────┘
```

### Bottom Tabs (Tất cả màu tím)
```
┌────────────────────────────────────────────────────┐
│   💬        📷        ❤️        🔔        ☰      │
│    0         0         0         0       Menu      │
│ Đoạn chat   Tin    Từ thiện  Thông báo            │
│ (tím đậm) (tím nhạt)(tím nhạt)(tím nhạt)(tím nhạt)│
└────────────────────────────────────────────────────┘
```

