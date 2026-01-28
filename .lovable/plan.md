

# KẾ HOẠCH: REBRAND "MESSAGES" → "FUN CHAT" (MESSENGER-STYLE)

---

## PHÂN TÍCH YÊU CẦU

Con muốn:
1. **Đổi tên** từ "Messages" → "Chat" (FUN CHAT) trong toàn bộ giao diện
2. **Giao diện Messenger-like** cho cả điện thoại và web
3. Cập nhật text hiển thị ở empty state: "Your messages" → "Your chats"

### Hình ảnh tham khảo
- Empty state hiện tại: "Your messages" + "Select a conversation to start chatting"
- Menu Messenger: "Đoạn chat", "Tin", "Thông báo", "Menu"

---

## THAY ĐỔI CẦN THỰC HIỆN

### 1. Cập nhật Translations trong LanguageContext.tsx

| Key hiện tại | Key mới/cập nhật | Giá trị mới (EN) | Giá trị mới (VI) |
|--------------|------------------|------------------|------------------|
| `messages.title` | `messages.title` | "Chat" | "Chat" |
| `messages.yourMessages` | `messages.yourChats` | "Your chats" | "Đoạn chat của bạn" |
| `messages.selectConversation` | Giữ nguyên | "Select a conversation to start chatting" | "Chọn một cuộc trò chuyện để bắt đầu chat" |
| `nav.messages` | `nav.chat` | "Chat" | "Chat" |

### 2. Cập nhật Messages.tsx

| Vị trí | Thay đổi |
|--------|----------|
| **Helmet title** | `Messenger \| FUN Charity` → `FUN Chat \| FUN Charity` |
| **Empty state** | `t('messages.yourMessages')` → `t('messages.yourChats')` |
| **Header (nếu có)** | Đổi "Messages" → "Chat" |

### 3. Cập nhật MobileBottomNav.tsx

| Vị trí | Thay đổi |
|--------|----------|
| **Label key** | `nav.messages` → `menu.chat` (đã có sẵn = "FUN CHAT") |
| **Icon label** | Hiển thị "Chat" thay vì "Messages" |

### 4. Cập nhật Navigation Components

**Files cần kiểm tra:**
- `LeftSidebar.tsx` - Đã dùng `menu.chat` ✅
- `MobileBottomNav.tsx` - Cần cập nhật label nếu đang dùng `nav.messages`
- `Navbar.tsx` - Kiểm tra nếu có liên kết đến Messages

---

## CHI TIẾT TRIỂN KHAI

### File 1: `src/contexts/LanguageContext.tsx`

**Thêm translation mới:**
```typescript
"messages.yourChats": {
  en: "Your chats", vi: "Đoạn chat của bạn", zh: "您的聊天", 
  ja: "あなたのチャット", ko: "내 채팅", th: "แชทของคุณ",
  fr: "Vos discussions", de: "Ihre Chats", es: "Tus chats",
  pt: "Seus chats", ru: "Ваши чаты", ar: "محادثاتك", hi: "आपकी चैट"
},
```

**Cập nhật `nav.messages`:**
```typescript
"nav.messages": {
  en: "Chat", vi: "Chat", zh: "聊天", ja: "チャット", ko: "채팅",
  th: "แชท", fr: "Chat", de: "Chat", es: "Chat",
  pt: "Chat", ru: "Чат", ar: "الدردشة", hi: "चैट"
},
```

### File 2: `src/pages/Messages.tsx`

**Line ~902 - Helmet:**
```typescript
<Helmet>
  <title>FUN Chat | FUN Charity</title>
</Helmet>
```

**Line ~1654 - Empty state:**
```typescript
<p className="font-bold text-xl text-foreground">{t('messages.yourChats')}</p>
```

### File 3: `src/components/layout/MobileBottomNav.tsx`

**Line ~36 - mainNavItems:**
```typescript
{ icon: MessageCircle, labelKey: "nav.chat", href: "/messages" },
```

**Thêm translation `nav.chat`:**
```typescript
"nav.chat": {
  en: "Chat", vi: "Chat", zh: "聊天", ja: "チャット", ko: "채팅",
  th: "แชท", fr: "Chat", de: "Chat", es: "Chat",
  pt: "Chat", ru: "Чат", ar: "الدردشة", hi: "चैट"
},
```

---

## UI PREVIEW SAU KHI THAY ĐỔI

### Empty State (Desktop & Mobile)
```
┌────────────────────────────────────────┐
│                                        │
│           ┌──────────────┐            │
│           │     📤       │            │
│           │  (icon)      │            │
│           └──────────────┘            │
│                                        │
│          Your chats                    │  ← Đổi từ "Your messages"
│   Select a conversation to start       │
│            chatting                    │
│                                        │
└────────────────────────────────────────┘
```

### Mobile Bottom Nav
```
┌────────────────────────────────────────┐
│  🏠     📰      👥      💬      ☰    │
│ Home  Campaigns Profiles Chat   Menu  │  ← "Chat" thay "Messages"
└────────────────────────────────────────┘
```

### Browser Tab Title
```
FUN Chat | FUN Charity
```

---

## FILES CẦN THAY ĐỔI

| File | Loại thay đổi | Chi tiết |
|------|---------------|----------|
| `src/contexts/LanguageContext.tsx` | Thêm/Sửa | Thêm `messages.yourChats`, `nav.chat`, cập nhật `nav.messages` |
| `src/pages/Messages.tsx` | Sửa | Đổi Helmet title, cập nhật empty state text |
| `src/components/layout/MobileBottomNav.tsx` | Sửa | Đổi labelKey thành `nav.chat` |

---

## TIMELINE DỰ KIẾN

| Bước | Thời gian | Mô tả |
|------|-----------|-------|
| 1 | 2 phút | Cập nhật LanguageContext với translations mới |
| 2 | 1 phút | Cập nhật Messages.tsx (Helmet + empty state) |
| 3 | 1 phút | Cập nhật MobileBottomNav.tsx |

**Tổng: ~4 phút**

---

## KẾT QUẢ SAU KHI HOÀN THÀNH

1. ✅ Empty state hiển thị "Your chats" / "Đoạn chat của bạn"
2. ✅ Browser tab hiển thị "FUN Chat | FUN Charity"
3. ✅ Mobile bottom nav hiển thị "Chat"
4. ✅ Sidebar vẫn giữ "FUN CHAT" (đã đúng từ trước)
5. ✅ Giao diện nhất quán giữa Desktop và Mobile

