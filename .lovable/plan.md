
# KẾ HOẠCH SỬA NÚT TRỞ VỀ TRONG TRANG CHAT

---

## VẤN ĐỀ PHÁT HIỆN

Nút trở về trong trang Chat (`/messages`) đang sử dụng `navigate(-1)` đơn giản, không kiểm tra xem có history để quay lại hay không.

**Trước (không hoạt động khi vào trực tiếp):**
```typescript
onClick={() => navigate(-1)}
```

**Sau (hoạt động mượt mà):**
```typescript
onClick={() => {
  if (window.history.length > 2) {
    navigate(-1);
  } else {
    navigate('/social'); // Mặc định về trang chủ Social
  }
}}
```

---

## FILE CẦN SỬA

### `src/pages/Messages.tsx` (dòng 1096-1103)

**Thay đổi:**
Cập nhật logic onClick của nút ArrowLeft để xử lý trường hợp không có history

**Trước:**
```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={() => navigate(-1)}
  className="rounded-full h-10 w-10 flex-shrink-0 hover:bg-muted"
>
  <ArrowLeft className="w-5 h-5 text-[#9333EA]" />
</Button>
```

**Sau:**
```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/social');
    }
  }}
  className="rounded-full h-10 w-10 flex-shrink-0 hover:bg-muted"
>
  <ArrowLeft className="w-5 h-5 text-[#9333EA]" />
</Button>
```

---

## KẾT QUẢ SAU KHI SỬA

| Trường hợp | Hành vi |
|------------|---------|
| Có history (từ Social → Chat) | Quay lại trang trước đó |
| Không có history (vào trực tiếp /messages) | Chuyển về /social (trang chủ) |

---

## THỜI GIAN TRIỂN KHAI

~2 phút - Chỉ cần sửa 1 dòng code
