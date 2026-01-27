

# KẾ HOẠCH SỬA LỖI LIVESTREAM VÀ VIDEO CALL

## VẤN ĐỀ ĐÃ XÁC ĐỊNH

Lỗi: **"invalid vendor key, can not find appid"** - SDK Agora không thể đọc được App ID từ token được tạo.

### Nguyên nhân chính:
- Thuật toán tạo token tùy chỉnh trong `agora-token` Edge Function sử dụng phiên bản cũ (**VERSION "006"**) 
- SDK `agora-rtc-sdk-ng` phiên bản 4.x yêu cầu token theo chuẩn **AccessToken2 (007)** hoặc token được tạo từ thư viện chính thức

---

## GIẢI PHÁP

Thay thế thuật toán tạo token thủ công bằng **thư viện chính thức `agora-token`** của Agora sử dụng `RtcTokenBuilder.buildTokenWithUid()`.

---

## PHASE 1: Cập nhật Edge Function `agora-token`

### File: `supabase/functions/agora-token/index.ts`

**Thay đổi chính:**

1. **Import thư viện chính thức** thay vì thuật toán tùy chỉnh:

```typescript
import { RtcTokenBuilder, RtcRole } from "npm:agora-token";
```

2. **Xóa toàn bộ code tạo token thủ công** (các hàm `crc32`, `packUint16`, `packUint32`, `buildAccessToken`, v.v.)

3. **Sử dụng RtcTokenBuilder chuẩn**:

```typescript
const token = RtcTokenBuilder.buildTokenWithUid(
  AGORA_APP_ID,
  AGORA_APP_CERTIFICATE,
  channelName,
  uid || 0,
  role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
  tokenExpireSeconds,     // Token expiration
  privilegeExpireSeconds  // Privilege expiration
);
```

### So sánh trước và sau:

| Yếu tố | Trước | Sau |
|--------|-------|-----|
| Phương pháp | Thuật toán thủ công VERSION "006" | Thư viện chính thức `agora-token` |
| Độ tương thích | Không hoạt động với SDK 4.x | Tương thích hoàn toàn |
| Bảo trì | Khó bảo trì, dễ lỗi | Cập nhật tự động từ thư viện |
| Token format | AccessToken cũ | AccessToken2 chuẩn |

---

## PHASE 2: Cải thiện xử lý lỗi

Thêm logging chi tiết và xử lý lỗi tốt hơn trong Edge Function để dễ debug trong tương lai.

```typescript
try {
  console.log(`[agora-token] Building token with RtcTokenBuilder`);
  console.log(`[agora-token] AppID: ${AGORA_APP_ID.substring(0, 8)}...`);
  console.log(`[agora-token] Channel: ${channelName}, UID: ${uid}, Role: ${role}`);
  
  const token = RtcTokenBuilder.buildTokenWithUid(...);
  
  console.log(`[agora-token] Token generated successfully, length: ${token.length}`);
} catch (error) {
  console.error(`[agora-token] Token generation failed:`, error);
  throw error;
}
```

---

## CODE SAU KHI CẬP NHẬT

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { RtcTokenBuilder, RtcRole } from "npm:agora-token";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check...
    
    const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID');
    const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE');

    const { channelName, uid, role = 1 } = await req.json();

    // Token expires in 24 hours
    const tokenExpireSeconds = 86400;
    const privilegeExpireSeconds = 86400;

    // Use official RtcTokenBuilder
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid || 0,
      role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
      tokenExpireSeconds,
      privilegeExpireSeconds
    );

    return new Response(
      JSON.stringify({ token, appId: AGORA_APP_ID, channel: channelName, uid: uid || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Error handling...
  }
});
```

---

## FILES CẦN SỬA

| File | Thay đổi |
|------|----------|
| `supabase/functions/agora-token/index.ts` | Thay thế thuật toán thủ công bằng thư viện `agora-token` |

---

## KẾT QUẢ MONG ĐỢI

1. **Livestream hoạt động** - Có thể phát trực tiếp mượt mà
2. **Video Call hoạt động** - Gọi video 1-1 và nhóm đều ổn định
3. **Không còn lỗi "invalid vendor key"** - Token được tạo đúng chuẩn
4. **Tương thích với mọi thiết bị** - Điện thoại, máy tính đều hoạt động

---

## THỜI GIAN THỰC HIỆN

- Phase 1 (Cập nhật Edge Function): ~10 phút
- Phase 2 (Testing): ~5 phút
- Deploy và kiểm tra: ~5 phút

**Tổng: ~20 phút**

