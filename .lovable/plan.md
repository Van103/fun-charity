
# KẾ HOẠCH: NÚT QUAY LẠI + PHASE 2 FUN CHAT

---

## PHẦN 1: NÚT QUAY LẠI (BACK BUTTON)

### Phân tích hiện trạng
- Đã có `MobileBackButton.tsx` nhưng chỉ hiển thị trên một số trang
- Đang ẩn trên các trang root: `/social`, `/`, `/auth`, `/legal`, `/investment`
- Vị trí: `fixed top-20 left-4` - có thể bị che bởi các element khác

### Thay đổi cần thực hiện

#### 1.1 Cải thiện MobileBackButton.tsx
| Thay đổi | Chi tiết |
|----------|----------|
| Mở rộng hiển thị | Hiển thị trên TẤT CẢ trang trừ trang chủ và auth |
| Responsive | Desktop: ẩn (có navbar), Mobile/Tablet: hiện |
| Vị trí tốt hơn | Điều chỉnh position tránh overlap với Navbar |
| Animation đẹp hơn | Thêm slide-in animation khi xuất hiện |

```
Các trang KHÔNG hiển thị back button:
- "/" (Landing page)
- "/social" (Trang chủ chính)
- "/auth" (Đăng nhập)

Tất cả trang khác SẼ có back button trên mobile/tablet
```

#### 1.2 Code thay đổi
**File:** `src/components/layout/MobileBackButton.tsx`
- Thêm hook `useIsMobile` để responsive
- Cập nhật danh sách `rootPages`
- Thêm animation slide-in từ trái
- Điều chỉnh z-index để không bị che

---

## PHẦN 2: PHASE 2 - FUN CHAT MESSENGER FEATURES

### 2.1 Reply to Message (Trả lời tin nhắn)

#### Database Migration
```sql
-- Thêm cột reply_to_id vào bảng messages
ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id);

-- Index để tối ưu query
CREATE INDEX idx_messages_reply_to ON messages(reply_to_id);
```

#### Thay đổi UI/Logic
| Component | Thay đổi |
|-----------|----------|
| `Messages.tsx` | Thêm state `replyToMessage`, UI reply preview, logic gửi với `reply_to_id` |
| `MessageReplyPreview.tsx` | Đã có sẵn, cần tích hợp vào Messages.tsx |
| Message bubble | Hiển thị quote tin nhắn được reply |

**Luồng hoạt động:**
```text
1. User swipe/click "Reply" trên tin nhắn
2. MessageReplyPreview hiển thị phía trên input
3. User nhập tin nhắn mới
4. Gửi với reply_to_id = ID tin nhắn được reply
5. Hiển thị ReplyQuote trong bubble tin nhắn
```

### 2.2 Forward Message (Chuyển tiếp tin nhắn)

#### File mới: `ForwardMessageModal.tsx`
```
Tính năng:
- Chọn 1 hoặc nhiều cuộc hội thoại để forward
- Preview tin nhắn sẽ forward
- Hỗ trợ forward cả text và media
- Animation khi forward thành công
```

**Luồng hoạt động:**
```text
1. User click "Forward" trên tin nhắn
2. Modal hiện danh sách conversations
3. User chọn 1+ conversations
4. Click "Gửi" → Insert message mới vào mỗi conversation được chọn
5. Toast thông báo thành công
```

### 2.3 Voice Messages (Tin nhắn thoại)

#### Database Migration
```sql
-- Thêm cột cho voice messages
ALTER TABLE messages ADD COLUMN audio_url TEXT;
ALTER TABLE messages ADD COLUMN audio_duration INTEGER; -- giây
```

#### File mới: `VoiceRecorder.tsx`
```
Tính năng:
- Nút mic để bắt đầu ghi âm
- Waveform visualization khi đang ghi
- Timer hiển thị thời lượng
- Cancel/Send buttons
- Upload audio to Supabase Storage
```

**Thư viện sử dụng:**
- `MediaRecorder API` (browser native)
- Không cần thêm dependency mới

#### UI trong Messages.tsx
| Vị trí | Thay đổi |
|--------|----------|
| Input area | Thêm nút Mic bên cạnh nút Send |
| Message bubble | Hiển thị audio player cho voice messages |

---

## PHẦN 3: CHI TIẾT TRIỂN KHAI

### 3.1 Database Migration (1 file SQL)
```sql
-- Phase 2: Reply & Voice Messages
ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN audio_url TEXT;
ALTER TABLE messages ADD COLUMN audio_duration INTEGER;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);
```

### 3.2 Files cần tạo mới
| File | Mô tả | Lines (ước tính) |
|------|-------|------------------|
| `src/components/chat/ForwardMessageModal.tsx` | Modal chọn conversations để forward | ~200 |
| `src/components/chat/VoiceRecorder.tsx` | Component ghi âm và gửi voice | ~250 |

### 3.3 Files cần cập nhật
| File | Thay đổi |
|------|----------|
| `MobileBackButton.tsx` | Cải thiện logic hiển thị, responsive |
| `Messages.tsx` | Tích hợp Reply, Forward, Voice features |
| `MessageReplyPreview.tsx` | Thêm translations |

---

## PHẦN 4: LUỒNG DỮ LIỆU

### Reply Message Flow
```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Click Reply    │────▶│  Set replyTo     │────▶│  Show Preview   │
│  on Message     │     │  State           │     │  Above Input    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
         ┌────────────────────────────────────────────────┘
         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Send Message   │────▶│  Insert with     │────▶│  Display with   │
│  with reply_to  │     │  reply_to_id     │     │  ReplyQuote     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Voice Message Flow
```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Hold/Click     │────▶│  Start Recording │────▶│  Show Waveform  │
│  Mic Button     │     │  MediaRecorder   │     │  & Timer        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
         ┌────────────────────────────────────────────────┘
         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Release/Click  │────▶│  Upload to       │────▶│  Insert Message │
│  Send           │     │  Storage         │     │  with audio_url │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## PHẦN 5: THỨ TỰ TRIỂN KHAI

### Bước 1: Back Button + Database
1. Cập nhật `MobileBackButton.tsx`
2. Chạy database migration (reply_to_id, audio columns)

### Bước 2: Reply Feature
3. Cập nhật `Messages.tsx` - thêm reply state & UI
4. Tích hợp `MessageReplyPreview.tsx` vào input area
5. Cập nhật message bubble để hiển thị ReplyQuote

### Bước 3: Forward Feature
6. Tạo `ForwardMessageModal.tsx`
7. Thêm nút Forward vào message dropdown
8. Logic forward message

### Bước 4: Voice Messages
9. Tạo `VoiceRecorder.tsx`
10. Thêm vào input area của Messages.tsx
11. Tạo audio player component cho voice messages

---

## XÁC NHẬN SAU MỖI BƯỚC

Sau khi hoàn thành mỗi bước, tôi sẽ:
1. Báo cáo chi tiết những gì đã thay đổi
2. Liệt kê các file đã tạo/sửa
3. Hướng dẫn kiểm tra tính năng
4. Chờ xác nhận từ con trước khi tiến hành bước tiếp theo

---

## TIMELINE DỰ KIẾN

| Bước | Thời gian | Tính năng |
|------|-----------|-----------|
| 1 | 5 phút | Back Button + DB Migration |
| 2 | 15 phút | Reply to Message |
| 3 | 10 phút | Forward Message |
| 4 | 15 phút | Voice Messages |

**Tổng: ~45 phút**

---

Con muốn Cha bắt đầu với **Bước 1: Back Button + Database Migration** ngay không?
