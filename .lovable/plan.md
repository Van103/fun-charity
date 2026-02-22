
# KE HOACH TOI UU HIEU SUAT VA NANG CAP THONG BAO REAL-TIME

---

## VAN DE PHAT HIEN

### 1. Loi Hieu Suat Nghiem Trong: Polygon RPC Spam
Trang `/social` dang gui **hang chuc request** toi `polygon-rpc.com` moi giay, tat ca deu tra ve loi **401 (API key disabled)**. Day la nguyen nhan chinh lam cham ung dung.

- **Nguon goc**: `useWalletBalance.ts` va `WalletConnectModal.tsx` goi RPC endpoint lien tuc
- **Tac dong**: ~30+ request loi moi 3 giay, chiem bang thong va lam cham render

### 2. Thieu Badge Thong Bao Tren Mobile Bottom Nav
- MobileBottomNav chi co badge tin nhan chua doc, khong co badge thong bao tong hop
- Khong hien thi so thong bao chua doc (reactions, comments, friend requests, donations)

### 3. Trung Lap Realtime Channels
- Navbar dong thoi subscribe 3 hook thong bao rieng biet (friend, post, donation)
- Moi hook tao 2-3 Supabase channels rieng, tong cong ~8 channels chi cho thong bao
- `NotificationDropdown` cung subscribe them channel rieng

---

## PHAN 1: TOI UU HIEU SUAT

### 1.1 Sua `useWalletBalance.ts` - Ngung spam RPC

**Van de**: Hook goi RPC ngay khi mount, ke ca khi user khong co vi crypto nao.

**Giai phap**: 
- Chi goi RPC khi user thuc su click "Lam moi" hoac mo Wallet page
- Them debounce va retry logic
- Cache ket qua trong 5 phut
- Khong tu dong goi khi mount

### 1.2 Sua `WalletConnectModal.tsx` - Lazy fetch balance

**Van de**: Modal fetch balance ngay khi mount.

**Giai phap**: Chi fetch khi modal duoc mo va co wallet address hop le.

### 1.3 Sua `WalletBalances.tsx` - Them error boundary

**Giai phap**: Khong goi balance neu MetaMask khong available, hien thi message thay vi spam error.

---

## PHAN 2: NANG CAP HE THONG THONG BAO

### 2.1 Tao hook `useUnifiedNotifications.ts`

Hook tong hop thay the 3 hook rieng le:

```text
useUnifiedNotifications(userId)
  |
  ├── Subscribe: friendships (INSERT/UPDATE/DELETE)
  ├── Subscribe: feed_reactions (INSERT) 
  ├── Subscribe: feed_comments (INSERT)
  ├── Subscribe: donations (INSERT/UPDATE)
  |
  └── Output: { unreadCount, notifications }
```

Loi ich:
- Giam tu 8 channels xuong 4 channels
- 1 hook thay vi 3 hooks
- Toi uu render performance

### 2.2 Cap nhat `MobileBottomNav.tsx` - Them notification badge

Them badge do cho tab "Home" hoac them icon "Bell" vao bottom nav de hien thi so thong bao chua doc.

```text
Mobile Bottom Nav:
[Home] [Campaigns] [Community] [Chat(3)] [Menu]
  (2)                                       
  ^-- badge do hien thi 2 thong bao chua doc
```

### 2.3 Cap nhat `Navbar.tsx` - Su dung unified hook

Thay the 3 hook rieng le bang `useUnifiedNotifications` duy nhat.

---

## PHAN 3: CHI TIET KY THUAT

### Files can sua:

| File | Thay doi | Muc do |
|------|----------|--------|
| `src/hooks/useWalletBalance.ts` | Them cache, chi fetch on-demand | Nho |
| `src/components/wallet/WalletBalances.tsx` | Guard MetaMask, khong auto-fetch | Nho |
| `src/hooks/useUnifiedNotifications.ts` | Tao moi - gop 3 hooks | Trung binh |
| `src/components/layout/MobileBottomNav.tsx` | Them notification badge | Nho |
| `src/components/layout/Navbar.tsx` | Dung unified hook | Nho |

### useWalletBalance.ts - Thay doi chinh:

```typescript
// TRUOC: Tu dong fetch khi mount
useEffect(() => {
  if (walletAddress) {
    fetchBalances(); // SPAM!
  }
}, [walletAddress, fetchBalances]);

// SAU: Chi fetch khi duoc goi, co cache
const [lastFetch, setLastFetch] = useState(0);
const CACHE_DURATION = 5 * 60 * 1000; // 5 phut

const fetchBalances = useCallback(async (force = false) => {
  if (!force && Date.now() - lastFetch < CACHE_DURATION) return;
  // ... fetch logic with try/catch
}, [walletAddress, lastFetch]);

// KHONG tu dong fetch khi mount
```

### useUnifiedNotifications.ts - Cau truc:

```typescript
export function useUnifiedNotifications(userId: string | null) {
  // 1 channel duy nhat subscribe nhieu bang
  const channel = supabase.channel(`unified-notifs-${userId}`)
    .on('postgres_changes', { event: 'INSERT', table: 'friendships' }, handleFriend)
    .on('postgres_changes', { event: 'INSERT', table: 'feed_reactions' }, handleReaction) 
    .on('postgres_changes', { event: 'INSERT', table: 'feed_comments' }, handleComment)
    .on('postgres_changes', { event: 'INSERT', table: 'donations' }, handleDonation)
    .subscribe();

  return { unreadCount };
}
```

### MobileBottomNav - Them badge:

Them so thong bao chua doc tren icon Home hoac them icon Bell rieng.

---

## THOI GIAN TRIEN KHAI

| Phase | Thoi gian | Noi dung |
|-------|-----------|----------|
| 1 | 15 phut | Fix wallet RPC spam |
| 2 | 25 phut | Tao useUnifiedNotifications |
| 3 | 15 phut | Cap nhat MobileBottomNav + Navbar |
| 4 | 10 phut | Testing |

**Tong: ~1 gio**
