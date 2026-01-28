
# BƯỚC 3: FORWARD MESSAGE (CHUYỂN TIẾP TIN NHẮN)

---

## MỤC TIÊU

Cho phép người dùng chuyển tiếp tin nhắn (text, ảnh, video) sang cuộc hội thoại khác như Messenger.

---

## THAY ĐỔI CẦN THỰC HIỆN

### 1. Tạo file mới: `ForwardMessageModal.tsx`

Component modal cho phép:
- Hiển thị preview tin nhắn sẽ forward
- Tìm kiếm và chọn nhiều cuộc hội thoại
- Forward tin nhắn đến tất cả conversations đã chọn
- Animation thành công khi forward xong

**Tính năng chi tiết:**
| Tính năng | Mô tả |
|-----------|-------|
| Message Preview | Hiển thị nội dung tin nhắn gốc (text/ảnh/video) |
| Conversation List | Danh sách các cuộc hội thoại có thể forward |
| Multi-select | Chọn nhiều conversations cùng lúc |
| Search | Tìm kiếm theo tên người dùng/nhóm |
| Send Button | Gửi tin nhắn đến tất cả selected conversations |
| Success Animation | Toast notification khi forward thành công |

---

### 2. Cập nhật `Messages.tsx`

**Thêm:**
- State `forwardMessage` để lưu tin nhắn cần forward
- Import và render `ForwardMessageModal`
- Nút "Forward" trong dropdown menu của tin nhắn
- Nút "Forward" cho tin nhắn của người khác

---

## CHI TIẾT TRIỂN KHAI

### ForwardMessageModal.tsx (~200 lines)

```text
┌────────────────────────────────────────┐
│        Chuyển tiếp tin nhắn            │  ← Header
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ "Nội dung tin nhắn..."           │  │  ← Message Preview
│  │ [📷 Ảnh đính kèm]                │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  [🔍 Tìm kiếm người dùng...]          │  ← Search Input
├────────────────────────────────────────┤
│  ☐ Avatar | Nguyễn Văn A              │  │
│  ☑ Avatar | Nhóm FUN Chat             │  │  ← Conversation List
│  ☐ Avatar | Trần Thị B                │  │     (multi-select)
│  ...                                   │  │
├────────────────────────────────────────┤
│  [Hủy]                    [Gửi (2)]   │  ← Actions
└────────────────────────────────────────┘
```

### UI Updates trong Messages.tsx

**Tin nhắn của mình (isCurrentUser):**
```text
┌─────────────────────────┐
│ [Reply] [React] [···]   │  ← Hover actions
├─────────────────────────┤
│ Menu:                   │
│   🔄 Trả lời            │
│   ➡️ Chuyển tiếp   ← NEW │
│   🗑️ Thu hồi            │
└─────────────────────────┘
```

**Tin nhắn của người khác:**
```text
┌─────────────────────────┐
│ [React] [Reply] [Forward] ← NEW button
└─────────────────────────┘
```

---

## LUỒNG HOẠT ĐỘNG

```text
1. User click "Chuyển tiếp" trên tin nhắn
         │
         ▼
2. setForwardMessage(msg) → Mở ForwardMessageModal
         │
         ▼
3. Modal load danh sách conversations
         │
         ▼
4. User chọn 1+ conversations (checkbox)
         │
         ▼
5. Click "Gửi"
         │
         ▼
6. Loop: Insert message mới vào mỗi conversation
         │
         ▼
7. Toast "Đã chuyển tiếp đến X cuộc hội thoại"
         │
         ▼
8. Đóng modal, clear forwardMessage state
```

---

## FILES SẼ THAY ĐỔI

| File | Thay đổi |
|------|----------|
| `src/components/chat/ForwardMessageModal.tsx` | ✨ TẠO MỚI - Modal forward |
| `src/pages/Messages.tsx` | Thêm state, import, nút Forward |

---

## KẾT QUẢ SAU KHI HOÀN THÀNH

1. ✅ Nút "Chuyển tiếp" trong dropdown menu tin nhắn của mình
2. ✅ Nút "Forward" hover action cho tin nhắn người khác
3. ✅ Modal chọn nhiều cuộc hội thoại để forward
4. ✅ Forward cả text và media (ảnh/video)
5. ✅ Toast thông báo khi forward thành công
6. ✅ Animation mượt mà với Framer Motion

---

## PHẦN KỸ THUẬT

### ForwardMessageModal Props Interface
```typescript
interface ForwardMessageModalProps {
  message: {
    id: string;
    content: string;
    image_url: string | null;
    sender_id: string;
    senderName?: string;
  };
  currentUserId: string;
  onClose: () => void;
}
```

### Database Operations
- Không cần thêm cột mới (sử dụng bảng messages hiện có)
- Insert message mới với content/image_url từ tin nhắn gốc
- Update `last_message_at` của conversation được forward đến

### Dependencies sử dụng
- Framer Motion (đã có)
- Supabase client (đã có)
- Radix Dialog (đã có)
- Lucide icons (đã có)

