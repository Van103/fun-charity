
# KẾ HOẠCH: GIAO DIỆN FUN CHAT GIỐNG MESSENGER

---

## PHÂN TÍCH YÊU CẦU TỪ HÌNH ẢNH

Giao diện Messenger có **4 tabs** ở dưới cùng:
1. **Đoạn chat** - Danh sách cuộc hội thoại
2. **Tin** - Stories/Status
3. **Thông báo** - Notifications
4. **Menu** - Cài đặt và các mục khác

### Menu Page bao gồm:
- User Profile với avatar và badge thông báo
- Cài đặt (Settings)
- Section 1: Marketplace, Cộng đồng, Tin nhắn đang chờ, Kho lưu trữ
- Section 2: Lời mời kết bạn, Lời mời tham gia kênh, Chat với AI, Tạo AI
- Section 3: FUN Ecosystem platforms (thay cho Meta)

---

## GIẢI PHÁP TRIỂN KHAI

### Tổng quan
Chuyển trang `/messages` thành giao diện Messenger-style với **tabs nội bộ** trong trang chat, không thay đổi bottom nav chính của app.

### Cấu trúc mới

```text
/messages (FUN Chat Page)
├── Mobile View:
│   ├── Chat Bottom Tabs: [Đoạn chat] [Tin] [Thông báo] [Menu]
│   ├── Tab Content:
│   │   ├── Đoạn chat → Conversations List
│   │   ├── Tin → Stories (placeholder cho tương lai)
│   │   ├── Thông báo → Chat Notifications
│   │   └── Menu → ChatMenuTab component
│   └── Active Conversation → Full screen chat
│
├── Desktop View:
│   ├── Left Sidebar với tabs (giống hiện tại + thêm tabs)
│   ├── Center: Messages Area
│   └── Right: Settings Panel
```

---

## FILES CẦN TẠO MỚI

### 1. `src/components/chat/ChatBottomTabs.tsx`
Bottom navigation tabs cho FUN Chat (chỉ hiển thị trên Mobile khi chưa chọn conversation)

| Tab | Icon | Label (VI) | Label (EN) |
|-----|------|------------|------------|
| Đoạn chat | MessageCircle | Đoạn chat | Chats |
| Tin | CirclePlus | Tin | Stories |
| Thông báo | Bell | Thông báo | Notifications |
| Menu | Menu | Menu | Menu |

### 2. `src/components/chat/ChatMenuTab.tsx`
Giao diện Menu giống Messenger với các sections:

```text
┌────────────────────────────────────────┐
│ Menu                              [⚙️]  │
├────────────────────────────────────────┤
│  [Avatar] Tên người dùng        [🔴10] │
│  Chuyển trang cá nhân · @username      │
├────────────────────────────────────────┤
│  ⚙️ Cài đặt                        >   │
├────────────────────────────────────────┤
│  💬 Tin nhắn đang chờ          [🔵] >  │
│  📦 Kho lưu trữ                     >  │
├────────────────────────────────────────┤
│  👥 Lời mời kết bạn                 >  │
│  🤖 Chat với AI                     >  │
├────────────────────────────────────────┤
│  FUN ECOSYSTEM PLATFORMS               │
│  [logos grid - như MobileBottomNav]    │
└────────────────────────────────────────┘
```

### 3. `src/components/chat/ChatStoriesTab.tsx`
Placeholder cho tính năng Stories/Tin trong tương lai

### 4. `src/components/chat/ChatNotificationsTab.tsx`
Hiển thị thông báo chat (tin nhắn chưa đọc, cuộc gọi nhỡ)

---

## FILES CẦN CẬP NHẬT

### `src/pages/Messages.tsx`
- Thêm state `activeChatTab` để quản lý tabs nội bộ
- Import và render các tab components mới
- Hiển thị `ChatBottomTabs` khi không có active conversation (Mobile)
- Desktop: Thêm tabs vào sidebar hoặc giữ nguyên layout

### `src/contexts/LanguageContext.tsx`
Thêm translations mới:
- `chat.chats`: "Đoạn chat" / "Chats"
- `chat.stories`: "Tin" / "Stories"
- `chat.notifications`: "Thông báo" / "Notifications"
- `chat.menu`: "Menu" / "Menu"
- `chat.pendingMessages`: "Tin nhắn đang chờ" / "Pending messages"
- `chat.archive`: "Kho lưu trữ" / "Archive"
- `chat.friendRequests`: "Lời mời kết bạn" / "Friend requests"
- `chat.chatWithAI`: "Chat với AI" / "Chat with AI"
- `chat.settings`: "Cài đặt" / "Settings"
- `chat.switchProfile`: "Chuyển trang cá nhân" / "Switch profile"

---

## CHI TIẾT TRIỂN KHAI

### ChatBottomTabs.tsx (~100 lines)

```text
┌──────────────────────────────────────────────────┐
│  💬           📷           🔔           ☰        │
│ Đoạn chat    Tin      Thông báo      Menu       │
│  ▬▬▬▬                                            │  ← Active indicator
└──────────────────────────────────────────────────┘
```

**Props:**
- `activeTab`: "chats" | "stories" | "notifications" | "menu"
- `onTabChange`: (tab) => void
- `unreadCounts`: { chats: number, notifications: number }

### ChatMenuTab.tsx (~250 lines)

**Sections:**
1. **User Profile Card** - Avatar, tên, link profile, badge thông báo
2. **Settings Row** - Link đến settings
3. **Messages Section** - Tin nhắn đang chờ (với badge), Kho lưu trữ
4. **Social Section** - Lời mời kết bạn, Chat với AI
5. **FUN Ecosystem** - Grid logos các platform (tái sử dụng từ MobileBottomNav)

### Mobile Layout Flow

```text
┌────────────────────────────────────────┐
│  FUN Chat                    [Settings]│  ← Header
├────────────────────────────────────────┤
│                                        │
│        Tab Content Area                │
│   (Chats / Stories / Notifs / Menu)    │
│                                        │
├────────────────────────────────────────┤
│  💬      📷      🔔      ☰             │  ← Chat Bottom Tabs
│ Đoạn   Tin   Thông  Menu              │
│  chat         báo                      │
└────────────────────────────────────────┘
```

### Desktop Layout (giữ nguyên + cải tiến)

```text
┌───────────────┬─────────────────────────┬─────────────┐
│               │                         │             │
│  Left Sidebar │    Messages Area        │ Right Panel │
│               │                         │             │
│  [Tabs]       │                         │  Settings   │
│  [Chats List] │                         │  Media      │
│               │                         │             │
└───────────────┴─────────────────────────┴─────────────┘
```

---

## TIMELINE DỰ KIẾN

| Bước | Thời gian | Mô tả |
|------|-----------|-------|
| 1 | 3 phút | Tạo ChatBottomTabs.tsx |
| 2 | 5 phút | Tạo ChatMenuTab.tsx |
| 3 | 2 phút | Tạo ChatStoriesTab.tsx (placeholder) |
| 4 | 2 phút | Tạo ChatNotificationsTab.tsx |
| 5 | 5 phút | Cập nhật Messages.tsx với tabs logic |
| 6 | 2 phút | Thêm translations vào LanguageContext |

**Tổng: ~19 phút**

---

## KẾT QUẢ SAU KHI HOÀN THÀNH

1. **Giao diện Mobile** có 4 tabs giống Messenger:
   - Đoạn chat (danh sách conversations)
   - Tin (Stories - placeholder)
   - Thông báo (chat notifications)
   - Menu (profile, settings, pending, archive, AI chat, ecosystem)

2. **Desktop** giữ nguyên layout 3 cột, có thể thêm tabs nhỏ

3. **Menu Tab** hiển thị:
   - User profile với badge
   - Settings link
   - Tin nhắn đang chờ với badge nếu có
   - Kho lưu trữ
   - Lời mời kết bạn
   - Chat với AI (mở AngelAI modal)
   - FUN Ecosystem grid

4. **Animations** mượt mà với Framer Motion

5. **Responsive**: Tự động chuyển layout giữa Mobile/Desktop

---

## UI MOCKUP FINAL

### Mobile - Chats Tab
```
┌────────────────────────────────────────┐
│ Đoạn chat                    [⚙️][✏️] │
├────────────────────────────────────────┤
│ [🔍 Tìm kiếm trên FUN Chat...]        │
│ [Tất cả] [Chưa đọc] [Nhóm] [📞 Cuộc gọi]
├────────────────────────────────────────┤
│ [Avatar] Nguyễn Văn A          · 5 ph  │
│          Tin nhắn mới...         🔵    │
├────────────────────────────────────────┤
│ [Avatar] Nhóm FUN Chat         · 1 giờ │
│          Ai đó: Xin chào!              │
├────────────────────────────────────────┤
│                                        │
│  💬      📷      🔔      ☰             │
│ Đoạn   Tin   Thông  Menu              │
│ ━━━━   chat         báo               │
└────────────────────────────────────────┘
```

### Mobile - Menu Tab
```
┌────────────────────────────────────────┐
│ Menu                              [⚙️] │
├────────────────────────────────────────┤
│ [Avatar] Tên người dùng         [🔴10]│
│          Chuyển trang cá nhân · @user  │
├────────────────────────────────────────┤
│ ⚙️ Cài đặt                          > │
├────────────────────────────────────────┤
│ 💬 Tin nhắn đang chờ         [🔵2] > │
│ 📦 Kho lưu trữ                      > │
├────────────────────────────────────────┤
│ 👥 Lời mời kết bạn                  > │
│ 🤖 Chat với AI                      > │
├────────────────────────────────────────┤
│     FUN ECOSYSTEM PLATFORMS            │
│ ┌──────┬──────┬──────┬──────┐         │
│ │PROFILE│ FARM │PLANET│ PLAY │         │
│ └──────┴──────┴──────┴──────┘         │
│                                        │
│  💬      📷      🔔      ☰             │
│ Đoạn   Tin   Thông  Menu              │
│  chat         báo   ━━━━              │
└────────────────────────────────────────┘
```
