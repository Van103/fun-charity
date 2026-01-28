
# KẾ HOẠCH PHÁT TRIỂN TÍNH NĂNG VÍ & BẢO MẬT ADMIN + QUẢN LÝ NHÓM CỘNG ĐỒNG

---

## TỔNG QUAN

Dựa trên phân tích codebase hiện tại, cần phát triển 3 module chính:

1. **Wallet Integration Enhancement** - Nâng cấp kết nối ví với bảo mật cao
2. **Admin Security Protection** - Bảo vệ trang admin với xác thực 2FA
3. **Community Group Features** - Giao diện quản lý nhóm cộng đồng hoàn chỉnh

---

## PHẦN 1: WALLET INTEGRATION ENHANCEMENT

### 1.1 Hiện trạng

| Thành phần | Trạng thái | Ghi chú |
|------------|-----------|---------|
| `WalletConnectModal.tsx` | 95% | MetaMask, Bitget, WalletConnect OK |
| `WalletBalances.tsx` | 90% | ETH, WBTC, ERC20 custom tokens |
| `useWalletBalance.ts` | 80% | ETH + MATIC balance |
| Bảng `wallets` | Có | user_id, wallet_address, wallet_type, is_verified |
| Bảng `user_security_settings` | Có | 2FA, PIN, biometric (CHƯA DÙNG) |

### 1.2 Cần phát triển

**A. Tạo component `WalletSecuritySettings.tsx`**

```text
┌──────────────────────────────────────────────────────────┐
│  🔐 Bảo mật Ví                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ⬜ Bật xác minh 2 bước (2FA)           [Toggle Switch]  │
│     Yêu cầu mã OTP khi rút tiền                          │
│                                                          │
│  ⬜ Thiết lập mã PIN                    [Thiết lập >]    │
│     Mã PIN 6 chữ số để xác nhận giao dịch                │
│                                                          │
│  ⬜ Xác thực sinh trắc học              [Kích hoạt >]    │
│     Face ID / Touch ID / Windows Hello                   │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  📝 Lịch sử đăng nhập                   [Xem chi tiết]  │
│  🔔 Thông báo giao dịch                 [Toggle ON]      │
│  📍 Giới hạn rút tiền/ngày              [500 CAMLY]      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**B. Hook `useWalletSecurity.ts`**

```typescript
// Các chức năng cần có:
- enable2FA() / disable2FA()
- setPinCode(pin: string)
- verifyPinCode(pin: string)
- registerBiometric()
- verifyBiometric()
- getLoginHistory()
- setWithdrawalLimit(amount: number)
```

**C. Cập nhật `WithdrawModal.tsx`**

Thêm xác thực bảo mật trước khi rút tiền:
- Kiểm tra PIN/2FA nếu đã kích hoạt
- Hiển thị OTP input modal
- Verify biometric nếu enabled

---

## PHẦN 2: ADMIN SECURITY PROTECTION

### 2.1 Hiện trạng

| Thành phần | Trạng thái |
|------------|-----------|
| `useAdminCheck.ts` | OK - kiểm tra role admin/moderator |
| `is_admin()` RPC | OK - server-side check |
| `admin_actions` table | OK - logging |
| Admin route protection | OK - client-side redirect |

### 2.2 Cần phát triển

**A. Component `AdminSecurityGate.tsx`**

Middleware bảo vệ tất cả admin routes:

```text
┌──────────────────────────────────────────────────────────┐
│           🛡️ XÁC THỰC ADMIN                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│     [Logo Fun Charity]                                   │
│                                                          │
│     Nhập mã xác thực để tiếp tục                        │
│                                                          │
│     ┌─────────────────────────────────┐                 │
│     │  [__] [__] [__] [__] [__] [__]  │  OTP 6 số       │
│     └─────────────────────────────────┘                 │
│                                                          │
│     [ Gửi lại mã (59s) ]                                │
│                                                          │
│     ─────── hoặc ───────                                │
│                                                          │
│     [ 🔐 Xác thực sinh trắc học ]                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**B. Cập nhật các trang Admin**

Wrap tất cả admin pages với `AdminSecurityGate`:
- `/admin/moderation`
- `/admin/rewards`
- `/admin/users`
- `/admin/verify`

**C. Edge Function `admin-2fa-verify`**

```typescript
// Chức năng:
- Gửi OTP qua email
- Verify OTP code
- Log admin sessions
- Rate limiting (5 attempts/hour)
```

---

## PHẦN 3: COMMUNITY GROUP FEATURES

### 3.1 Hiện trạng Schema

```text
conversations:
  - id, participant1_id, participant2_id
  - is_group, name, created_by
  - avatar_url, is_pinned, is_archived

conversation_participants:
  - id, conversation_id, user_id, joined_at
  - THIẾU: role, added_by, nickname
```

### 3.2 Cần phát triển

**A. Database Migration**

```sql
-- Thêm cột role cho quản lý nhóm
ALTER TABLE conversation_participants 
ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
ADD COLUMN added_by UUID REFERENCES auth.users(id),
ADD COLUMN nickname TEXT;
```

**B. Component `GroupSettingsPanel.tsx`**

```text
┌──────────────────────────────────────────────────────────┐
│  ⚙️ Cài đặt nhóm              [X]                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [📷 Avatar nhóm]   Nhóm Từ Thiện ABC                   │
│                     12 thành viên                        │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  👥 Thành viên                              [Thêm +]    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [Avatar] Nguyễn A         Admin     [⚙️]           │ │
│  │ [Avatar] Trần B           Moderator [⚙️]           │ │
│  │ [Avatar] Lê C             Member    [⚙️]           │ │
│  │ [Avatar] Phạm D           Member    [⚙️]           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  📝 Tên nhóm                            [Chỉnh sửa]     │
│  📷 Ảnh nhóm                            [Thay đổi]      │
│  🔔 Thông báo                           [ON/OFF]        │
│  📌 Ghim đoạn chat                      [ON/OFF]        │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  🔐 Quyền Admin                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ⬜ Chỉ admin được thêm thành viên                   │ │
│  │ ⬜ Chỉ admin được đổi tên/ảnh nhóm                  │ │
│  │ ⬜ Phê duyệt thành viên mới                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [🚪 Rời nhóm]        [🗑️ Xóa nhóm (Admin)]           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**C. Component `ManageGroupMembers.tsx`**

```text
┌──────────────────────────────────────────────────────────┐
│  👥 Quản lý thành viên                    [X]            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 [Tìm thành viên...]                                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [Avatar] Nguyễn Văn A                              │ │
│  │ @nguyenvana • Admin                                │ │
│  │ ┌──────────────────────────────────────┐          │ │
│  │ │ ⭐ Đặt làm Admin                     │          │ │
│  │ │ 🛡️ Đặt làm Moderator                │          │ │
│  │ │ 👤 Đặt làm Member                    │          │ │
│  │ │ ────────────────────────────          │          │ │
│  │ │ 🚫 Xóa khỏi nhóm                     │          │ │
│  │ └──────────────────────────────────────┘          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [+] Thêm thành viên mới                            │ │
│  │     Chọn từ danh sách bạn bè                       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**D. Component `GroupAvatarEditor.tsx`**

- Upload avatar nhóm
- Crop/resize image
- Save to Supabase storage

**E. Hook `useGroupManagement.ts`**

```typescript
interface UseGroupManagement {
  // Member management
  addMember(userId: string): Promise<void>;
  removeMember(userId: string): Promise<void>;
  updateMemberRole(userId: string, role: 'admin' | 'moderator' | 'member'): Promise<void>;
  
  // Group settings
  updateGroupName(name: string): Promise<void>;
  updateGroupAvatar(avatarUrl: string): Promise<void>;
  updateGroupSettings(settings: GroupSettings): Promise<void>;
  
  // Permissions
  isGroupAdmin: boolean;
  isGroupModerator: boolean;
  canManageMembers: boolean;
  canEditGroup: boolean;
  
  // Leave/Delete
  leaveGroup(): Promise<void>;
  deleteGroup(): Promise<void>;
}
```

---

## PHẦN 4: FILES CẦN TẠO MỚI

| File | Mô tả |
|------|-------|
| `src/components/wallet/WalletSecuritySettings.tsx` | UI cài đặt bảo mật ví |
| `src/hooks/useWalletSecurity.ts` | Logic 2FA, PIN, biometric |
| `src/components/admin/AdminSecurityGate.tsx` | Gate bảo vệ admin routes |
| `src/components/chat/GroupSettingsPanel.tsx` | Panel cài đặt nhóm |
| `src/components/chat/ManageGroupMembers.tsx` | Quản lý thành viên |
| `src/components/chat/GroupAvatarEditor.tsx` | Upload avatar nhóm |
| `src/hooks/useGroupManagement.ts` | Logic quản lý nhóm |
| `supabase/functions/admin-2fa-verify/index.ts` | Edge function OTP |

---

## PHẦN 5: DATABASE MIGRATIONS

```sql
-- Migration 1: Add group member roles
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' 
  CHECK (role IN ('admin', 'moderator', 'member'));
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Migration 2: Add group settings
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "only_admins_can_add_members": false,
  "only_admins_can_edit": false,
  "require_approval": false
}'::jsonb;

-- Migration 3: Admin sessions logging
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own sessions" ON admin_sessions
  FOR SELECT TO authenticated
  USING (admin_id = auth.uid());
```

---

## PHẦN 6: THỜI GIAN TRIỂN KHAI

| Phase | Thời gian | Nội dung |
|-------|-----------|----------|
| 1 | 30 phút | Database migrations + RLS policies |
| 2 | 45 phút | Wallet Security Settings + Hook |
| 3 | 30 phút | Admin Security Gate + 2FA Edge Function |
| 4 | 60 phút | Group Settings Panel + Member Management |
| 5 | 30 phút | Integration vào Messages.tsx |
| 6 | 15 phút | Testing + Bug fixes |

**Tổng: ~3.5 giờ**

---

## PREVIEW KẾT QUẢ

### Wallet Security (trong Wallet Page)
```text
┌──────────────────────────────────────────────────────┐
│ 💰 Ví Thưởng                                         │
├──────────────────────────────────────────────────────┤
│ Balance: 1,234 CAMLY                                 │
│                                                      │
│ [Tabs: Số dư | Lịch sử | Bảo mật]                   │
│                                                      │
│ 🔐 Bảo mật Ví                                        │
│ ┌──────────────────────────────────────────────────┐│
│ │ ✅ 2FA đã kích hoạt                              ││
│ │ ✅ PIN đã thiết lập                              ││
│ │ ⬜ Sinh trắc học                                 ││
│ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Admin Gate (khi vào trang Admin)
```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│           🛡️ Xác thực Admin                          │
│                                                      │
│           Mã OTP đã gửi đến email                   │
│           tuong***@gmail.com                        │
│                                                      │
│           [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ]       │
│                                                      │
│           Còn 04:59 • Gửi lại mã                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Group Settings (trong FUN Chat)
```text
┌──────────────────────────────────────────────────────┐
│ Nhóm Từ Thiện ABC                        [⚙️] [X]   │
├──────────────────────────────────────────────────────┤
│ [📷] 12 thành viên • Bạn là Admin                   │
│                                                      │
│ 👥 Thành viên (12)                       [+ Thêm]   │
│ ┌──────────────────────────────────────────────────┐│
│ │ [Av] Nguyễn A    Admin     [⚙️ Quản lý]         ││
│ │ [Av] Trần B      Member    [⚙️ Quản lý]         ││
│ │ [Av] ...                                         ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ⚙️ Cài đặt nhóm                                     │
│ ├─ 📝 Đổi tên nhóm                                  │
│ ├─ 📷 Đổi ảnh nhóm                                  │
│ ├─ 🔔 Thông báo: BẬT                                │
│ └─ 🔐 Quyền Admin...                                │
│                                                      │
│ [🚪 Rời nhóm]                                       │
└──────────────────────────────────────────────────────┘
```
