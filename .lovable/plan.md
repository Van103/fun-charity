

# KẾ HOẠCH NÂNG CẤP FUN CHAT GIỐNG MESSENGER

## 📊 PHÂN TÍCH HIỆN TRẠNG

### Tính năng đã có (hoạt động tốt):
| Tính năng | Trạng thái | Ghi chú |
|-----------|------------|---------|
| Chat 1:1 | ✅ Hoạt động | Realtime với Supabase |
| Chat nhóm | ✅ Hoạt động | Tạo nhóm, thêm thành viên |
| Video Call 1:1 | ✅ Hoạt động | Agora SDK 4.x với AccessToken2 |
| Group Video Call | ✅ Hoạt động | Agora multi-user |
| Audio Call | ✅ Hoạt động | Hỗ trợ cả 1:1 và nhóm |
| Gửi ảnh/video | ✅ Hoạt động | Upload qua Supabase Storage |
| Sticker/Emoji | ✅ Hoạt động | 5 packs emoji |
| GIF | ✅ Hoạt động | Hardcoded GIFs |
| Message Reactions | ✅ Hoạt động | 6 emoji reactions |
| Typing Indicator | ✅ Hoạt động | Realtime |
| Online Status | ✅ Hoạt động | Presence tracking |
| Incoming Call Notification | ✅ Hoạt động | Global listener |
| Call History | ✅ Hoạt động | Tabs với lịch sử cuộc gọi |
| Right Panel Info | ✅ Hoạt động | Media, Privacy settings |

### Tính năng cần bổ sung (theo chuẩn Messenger):
| Tính năng | Mức độ | Mô tả |
|-----------|--------|-------|
| Chat Settings Page | 🔴 Thiếu | Trang cài đặt riêng biệt |
| Notification Settings | 🔴 Thiếu | Tắt/bật thông báo theo cuộc hội thoại |
| Theme/Color Customization | 🟡 Cơ bản | Chưa hoạt động |
| Nicknames | 🔴 Thiếu | Đặt biệt danh trong chat |
| Message Search | 🔴 Thiếu | Tìm kiếm tin nhắn trong hội thoại |
| Pin Conversations | 🔴 Thiếu | Ghim cuộc hội thoại |
| Archive Conversations | 🔴 Thiếu | Ẩn hội thoại |
| Voice Messages | 🔴 Thiếu | Ghi âm và gửi |
| Reply to Messages | 🔴 Thiếu | Trả lời tin nhắn cụ thể |
| Forward Messages | 🔴 Thiếu | Chuyển tiếp tin nhắn |
| Message Read Receipts | 🟡 Cơ bản | Chưa hiển thị ai đã đọc |
| Group Admin Features | 🔴 Thiếu | Quản lý admin, kick thành viên |
| Vanish Mode | 🔴 Thiếu | Tin nhắn tự xóa |
| Encrypted Chats | 🟡 UI Only | Chưa mã hóa thực sự |

---

## 🚀 KẾ HOẠCH NÂNG CẤP CHI TIẾT

### PHASE 1: CẢI THIỆN UX/UI CƠ BẢN (1-2 tuần)

#### 1.1 Chat Settings Page mới
Tạo trang cài đặt riêng biệt cho mỗi cuộc hội thoại với đầy đủ tùy chọn.

**File mới:** `src/components/chat/ChatSettingsPanel.tsx`
```
Bao gồm:
- Notification toggle (tắt/bật thông báo)
- Theme color picker (chọn màu chat)
- Nickname editor (đặt biệt danh)
- Media gallery (xem tất cả ảnh/video)
- Search in conversation
- Block/Report user
- Leave group / Delete conversation
```

#### 1.2 Cải thiện Right Panel
Nâng cấp panel bên phải với các tính năng thực sự hoạt động.

**Cập nhật:** `src/pages/Messages.tsx` (phần Right Panel)
```
- Notification toggle: Lưu vào DB, realtime
- Theme picker: 10+ màu sắc preset
- Nickname: Lưu và hiển thị trong chat
- Media gallery: Phân loại ảnh/video/file
- Shared links: Danh sách link đã chia sẻ
```

#### 1.3 Pin & Archive Conversations
Cho phép ghim và ẩn cuộc hội thoại.

**Cập nhật Database:**
```sql
ALTER TABLE conversations ADD COLUMN is_pinned BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN is_archived BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN pinned_at TIMESTAMPTZ;
```

**Cập nhật UI:**
- Swipe actions trên mobile (ghim/ẩn)
- Context menu trên desktop
- Phần "Ghim" hiển thị đầu tiên trong danh sách

---

### PHASE 2: TÍNH NĂNG NÂNG CAO (2-3 tuần)

#### 2.1 Reply to Message (Trả lời tin nhắn)
Cho phép reply trực tiếp vào tin nhắn cụ thể như Messenger.

**Cập nhật Database:**
```sql
ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id);
```

**UI Changes:**
- Swipe right để reply (mobile)
- Hover action button (desktop)
- Preview tin nhắn được reply phía trên input
- Hiển thị quote trong bubble tin nhắn

#### 2.2 Forward Message (Chuyển tiếp)
Cho phép chuyển tiếp tin nhắn sang cuộc hội thoại khác.

**File mới:** `src/components/chat/ForwardMessageModal.tsx`
```
- Chọn nhiều cuộc hội thoại
- Preview tin nhắn
- Forward cả ảnh/video
```

#### 2.3 Voice Messages (Tin nhắn thoại)
Ghi âm và gửi voice message như Messenger.

**File mới:** `src/components/chat/VoiceRecorder.tsx`
```
- Record button với waveform visualization
- Pause/Resume recording
- Cancel/Send actions
- Upload audio to Supabase Storage
```

**Cập nhật Database:**
```sql
ALTER TABLE messages ADD COLUMN audio_url TEXT;
ALTER TABLE messages ADD COLUMN audio_duration INTEGER; -- seconds
```

#### 2.4 Message Search
Tìm kiếm tin nhắn trong cuộc hội thoại.

**File mới:** `src/components/chat/MessageSearch.tsx`
```
- Search input trong Right Panel
- Highlight matching text
- Jump to message trong scroll area
- Filter by sender, date range
```

---

### PHASE 3: GROUP MANAGEMENT (1-2 tuần)

#### 3.1 Group Admin Features
Quản lý nhóm chat như Messenger.

**Cập nhật Database:**
```sql
ALTER TABLE conversation_participants ADD COLUMN role TEXT DEFAULT 'member'; -- 'admin', 'member'
ALTER TABLE conversation_participants ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE conversation_participants ADD COLUMN added_by UUID REFERENCES profiles(user_id);
```

**Tính năng Admin:**
- Thăng/hạ admin
- Kick thành viên
- Approve join requests
- Change group name/avatar
- Set group permissions

#### 3.2 Add/Remove Members
Thêm/xóa thành viên từ nhóm.

**File mới:** `src/components/chat/ManageGroupMembers.tsx`
```
- Danh sách thành viên với role
- Add friends to group
- Remove members (admin only)
- View member profile
```

#### 3.3 Group Avatar & Name Edit
Cho phép thay đổi ảnh và tên nhóm.

**Cập nhật Database:**
```sql
ALTER TABLE conversations ADD COLUMN avatar_url TEXT;
```

---

### PHASE 4: TRẢI NGHIỆM MESSENGER-LIKE (2-3 tuần)

#### 4.1 Read Receipts Enhancement
Hiển thị ai đã đọc tin nhắn (như Messenger).

**Cập nhật Database:**
```sql
CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);
```

**UI:**
- Avatar nhỏ ở cuối tin nhắn đã đọc
- Tooltip hiển thị "Đã xem bởi X, Y, Z"
- "Đã gửi" / "Đã nhận" / "Đã xem" indicators

#### 4.2 Active Now & Last Seen
Hiển thị "Đang hoạt động" hoặc "Hoạt động X phút trước".

**Cập nhật:** `src/hooks/usePresence.ts`
```
- Track last_seen timestamp
- Calculate relative time
- Display in conversation list and header
```

#### 4.3 Quick Reactions (Double-tap to like)
Double-tap vào tin nhắn để thả tim như Messenger.

**Cập nhật:** Message bubble component
```
- onDoubleClick → add ❤️ reaction
- Animation giống Messenger
```

#### 4.4 Emoji Reactions Expansion
Mở rộng reactions với nhiều emoji hơn.

**Cập nhật:** `src/components/chat/MessageReactionPicker.tsx`
```
- Thêm emoji picker full
- Recent reactions
- Frequently used
```

---

## 📁 CẤU TRÚC FILE SAU NÂNG CẤP

```
src/components/chat/
├── AgoraVideoCallModal.tsx      (existing - enhanced)
├── AgoraGroupCallModal.tsx      (existing - enhanced)
├── CallsTab.tsx                 (existing)
├── CallHistoryCard.tsx          (existing)
├── CallMessageBubble.tsx        (existing)
├── ChatGifPicker.tsx            (existing - enhance with API)
├── ChatStickerPicker.tsx        (existing)
├── ChatSettingsPanel.tsx        ✨ NEW
├── CreateGroupModal.tsx         (existing - enhanced)
├── ForwardMessageModal.tsx      ✨ NEW
├── IncomingCallNotification.tsx (existing)
├── ManageGroupMembers.tsx       ✨ NEW
├── MessageReactionPicker.tsx    (existing - enhanced)
├── MessageReplyPreview.tsx      ✨ NEW
├── MessageSearch.tsx            ✨ NEW
├── VoiceRecorder.tsx            ✨ NEW
└── ReadReceiptAvatars.tsx       ✨ NEW
```

---

## 🗄️ DATABASE CHANGES SUMMARY

```sql
-- Phase 1: Pin & Archive
ALTER TABLE conversations 
  ADD COLUMN is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN is_archived BOOLEAN DEFAULT false,
  ADD COLUMN pinned_at TIMESTAMPTZ,
  ADD COLUMN avatar_url TEXT;

-- Phase 2: Reply & Voice
ALTER TABLE messages 
  ADD COLUMN reply_to_id UUID REFERENCES messages(id),
  ADD COLUMN audio_url TEXT,
  ADD COLUMN audio_duration INTEGER;

-- Phase 3: Group Management
ALTER TABLE conversation_participants 
  ADD COLUMN role TEXT DEFAULT 'member',
  ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN added_by UUID REFERENCES profiles(user_id);

-- Phase 4: Read Receipts
CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Chat Settings per conversation
CREATE TABLE conversation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  nickname TEXT,
  theme_color TEXT DEFAULT '#8B5CF6',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);
```

---

## ⏰ TIMELINE

| Phase | Thời gian | Tính năng chính |
|-------|-----------|-----------------|
| Phase 1 | Tuần 1-2 | Settings Panel, Pin/Archive, Theme Colors |
| Phase 2 | Tuần 3-5 | Reply, Forward, Voice Messages, Search |
| Phase 3 | Tuần 6-7 | Group Admin, Member Management |
| Phase 4 | Tuần 8-10 | Read Receipts, Active Status, Quick Reactions |

---

## 🎯 ƯU TIÊN TRIỂN KHAI NGAY

Dựa trên yêu cầu "SUÔN MƯỢT, MẠNH MẼ", tôi đề xuất bắt đầu với:

1. **Chat Settings Panel** - Cài đặt rõ ràng cho từng cuộc hội thoại
2. **Reply to Message** - Tính năng quan trọng nhất của Messenger
3. **Pin Conversations** - Ghim chat quan trọng lên đầu
4. **Voice Messages** - Tính năng được yêu thích trên mobile
5. **Read Receipts** - Biết ai đã đọc tin nhắn

---

## 🔧 PHẦN KỸ THUẬT CHI TIẾT

### Database Migrations:
- 4 ALTER TABLE statements cho `conversations`
- 3 ALTER TABLE statements cho `messages`
- 3 ALTER TABLE statements cho `conversation_participants`
- 2 CREATE TABLE mới

### New Components (7 files):
- ChatSettingsPanel.tsx (~300 lines)
- ForwardMessageModal.tsx (~200 lines)
- ManageGroupMembers.tsx (~250 lines)
- MessageReplyPreview.tsx (~80 lines)
- MessageSearch.tsx (~150 lines)
- VoiceRecorder.tsx (~200 lines)
- ReadReceiptAvatars.tsx (~100 lines)

### Updated Files:
- Messages.tsx (major enhancements)
- CreateGroupModal.tsx (add admin features)
- MessageReactionPicker.tsx (expand reactions)
- usePresence.ts (last seen tracking)

