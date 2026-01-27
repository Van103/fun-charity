
# KẾ HOẠCH CẬP NHẬT LOGO VÀ LINK HỆ SINH THÁI FUN

## TỔNG QUAN

Cập nhật toàn bộ logo và đường link của các nền tảng FUN ecosystem trong FUN Charity để đảm bảo liên kết mượt mà, thông suốt.

---

## DANH SÁCH CÁC FUN PLATFORMS CẦN CẬP NHẬT

| Platform | URL Mới | Logo (từ ảnh upload) | Trạng thái hiện tại |
|----------|---------|---------------------|---------------------|
| Fun Profile | `https://fun.rich` | Giữ logo hiện tại | Đã có |
| Fun Play | `https://play.fun.rich` | image-268.png | Đã có, cần cập nhật logo |
| Fun Farm | `https://farm.fun.rich` | image-269.png | Sai URL (funfarm.life), cần sửa |
| Fun Wallet | `https://wallet.fun.rich` | image-270.png | Chưa có external link |
| Fun Planet | `https://planet.fun.rich` | Giữ logo hiện tại | Đã có |
| Fun Charity | `https://charity.fun.rich` | image-265.png | Logo mới (trang hiện tại) |
| Fun Academy | `https://academy.fun.rich` | image-266.png | Thiếu logo custom |
| Fun Treasury | `https://treasury.fun.rich` | image-271.png | Chưa có |
| Fun Green Earth | `https://greenearth-fun.lovable.app` | image-272.png | Chưa có |

---

## PHASE 1: Copy Logo Files vào Project

Sao chép các logo từ user-uploads vào `src/assets/`:

```text
user-uploads://image-265.png → src/assets/fun-charity-logo-web3.png
user-uploads://image-266.png → src/assets/fun-academy-logo.png
user-uploads://image-267.png → src/assets/fun-bank-logo.png
user-uploads://image-268.png → src/assets/fun-play-logo-new.png
user-uploads://image-269.png → src/assets/fun-farm-logo-new.png
user-uploads://image-270.png → src/assets/fun-wallet-logo.png
user-uploads://image-271.png → src/assets/fun-treasury-logo.png
user-uploads://image-272.png → src/assets/fun-greenearth-logo.png
```

---

## PHASE 2: Cập nhật LeftSidebar.tsx

### 2.1 Thêm import cho các logo mới

```tsx
import funAcademyLogo from "@/assets/fun-academy-logo.png";
import funWalletLogo from "@/assets/fun-wallet-logo.png";
import funTreasuryLogo from "@/assets/fun-treasury-logo.png";
import funGreenEarthLogo from "@/assets/fun-greenearth-logo.png";
```

### 2.2 Cập nhật menuItems array

Menu items sẽ được cấu trúc lại với các link và logo chính xác:

| Item | URL | Logo |
|------|-----|------|
| Fun Profile | https://fun.rich | funProfileLogo (giữ nguyên) |
| Fun Farm | https://farm.fun.rich | funFarmLogo (cập nhật) |
| Fun Planet | https://planet.fun.rich | funPlanetLogo (giữ nguyên) |
| Fun Play | https://play.fun.rich | funPlayLogo (cập nhật) |
| Fun Wallet | https://wallet.fun.rich | funWalletLogo (mới) |
| Fun Academy | https://academy.fun.rich | funAcademyLogo (mới) |
| Fun Treasury | https://treasury.fun.rich | funTreasuryLogo (mới) |
| Fun Green Earth | https://greenearth-fun.lovable.app | funGreenEarthLogo (mới) |
| Chat | /messages (internal) | MessageCircle icon |
| Legal | /legal (internal) | Scale icon |

### 2.3 Loại bỏ các link không còn sử dụng

- Trading (https://trading.fun.rich) - Loại bỏ
- Investment (https://investment.fun.rich) - Loại bỏ
- Life (https://life.fun.rich) - Loại bỏ

---

## PHASE 3: Cập nhật MobileBottomNav.tsx

Đồng bộ cấu trúc menuItems với LeftSidebar để đảm bảo tính nhất quán giữa desktop và mobile.

---

## PHASE 4: Cập nhật Logo chính của FUN Charity

### 4.1 Thay thế Logo Component

Sử dụng logo mới (image-265.png - FUN CHARITY WEB3 với vương miện kim cương) cho:
- Navbar Logo
- Footer Logo
- Các vị trí khác sử dụng `<Logo />` component

---

## FILES CẦN CHỈNH SỬA

| File | Thay đổi |
|------|----------|
| `src/assets/` | Thêm 8 logo files mới |
| `src/components/social/LeftSidebar.tsx` | Cập nhật imports và menuItems |
| `src/components/layout/MobileBottomNav.tsx` | Đồng bộ menuItems |
| `src/components/brand/Logo.tsx` | Tùy chọn: cập nhật logo chính |
| `src/assets/fun-charity-logo-new.jpg` | Thay bằng image-265.png |

---

## KẾT QUẢ MONG ĐỢI

1. Tất cả link FUN ecosystem mở đúng trang web external
2. Mỗi platform có logo riêng biệt, đẹp mắt
3. Thống nhất giữa desktop sidebar và mobile menu
4. Loại bỏ các link không còn hoạt động (Trading, Investment, Life)
5. Thêm các nền tảng mới: Treasury, Green Earth, Wallet (external)

---

## DANH SÁCH LINK FINAL

```text
┌────────────────────┬─────────────────────────────────┐
│ Platform           │ URL                             │
├────────────────────┼─────────────────────────────────┤
│ Fun Profile        │ https://fun.rich                │
│ Fun Farm           │ https://farm.fun.rich           │
│ Fun Planet         │ https://planet.fun.rich         │
│ Fun Play           │ https://play.fun.rich           │
│ Fun Wallet         │ https://wallet.fun.rich         │
│ Fun Academy        │ https://academy.fun.rich        │
│ Fun Treasury       │ https://treasury.fun.rich       │
│ Fun Green Earth    │ https://greenearth-fun.lovable.app │
│ Fun Charity        │ (trang hiện tại)                │
└────────────────────┴─────────────────────────────────┘
```

---

## THỜI GIAN THỰC HIỆN

- Phase 1 (Copy logos): ~5 phút
- Phase 2 (LeftSidebar): ~10 phút
- Phase 3 (MobileBottomNav): ~10 phút
- Phase 4 (Main Logo): ~5 phút

**Tổng: ~30 phút**
