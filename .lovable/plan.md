

# KẾ HOẠCH CẬP NHẬT SIDEBAR FUN CHARITY

## TÓM TẮT YÊU CẦU

1. **Thêm logo CAMLY COIN** - sử dụng hình vàng đã upload
2. **Màu chữ CAMLY COIN** - đổi sang tím hồng gradient
3. **Cập nhật tất cả các chữ sang IN HOA**:
   - FUN ECOSYSTEM PLATFORMS
   - FUN PROFILE
   - FUN FARM
   - FUN PLANET
   - FUN PLAY
   - FUN WALLET (đã có)
   - FUN ACADEMY
   - FUN TREASURY (đã có)
   - GREEN EARTH (đã có)
   - FUN CHAT
   - FUN LEGAL

---

## PHASE 1: Copy Logo CAMLY COIN vào dự án

Sao chép hình ảnh từ user-uploads vào thư mục assets:

```
user-uploads://image-278.png → src/assets/camly-coin-logo.png
```

---

## PHASE 2: Cập nhật LanguageContext.tsx - Chữ IN HOA

### 2.1 Tiêu đề Ecosystem - IN HOA

| Key | Trước | Sau |
|-----|-------|-----|
| `sidebar.ecosystem` | F.U. Ecosystem Platforms | FUN ECOSYSTEM PLATFORMS |

### 2.2 Các menu items - IN HOA

| Key | Trước | Sau |
|-----|-------|-----|
| `menu.profile` | Fun Profile | FUN PROFILE |
| `menu.farm` | Fun Farm | FUN FARM |
| `menu.planet` | Fun Planet | FUN PLANET |
| `menu.play` | Fun Play | FUN PLAY |
| `menu.academy` | Fun Academy | FUN ACADEMY |
| `menu.chat` | Fun Chat | FUN CHAT |
| `menu.legal` | Fun Legal | FUN LEGAL |

(menu.wallet, menu.treasury, menu.greenearth đã là IN HOA)

---

## PHASE 3: Cập nhật LeftSidebar.tsx

### 3.1 Import logo CAMLY COIN

```tsx
import camlyCoinLogo from "@/assets/camly-coin-logo.png";
```

### 3.2 Thay đổi icon CAMLY COIN thành hình ảnh logo

**Trước:**
```tsx
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-champagne to-gold-light flex items-center justify-center shadow-md">
  <Coins className="w-4 h-4 text-white" />
</div>
<span className="text-sm font-medium text-foreground">CAMLY COIN</span>
```

**Sau:**
```tsx
<div className="relative">
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-champagne via-yellow-300 to-gold-dark opacity-50 blur-[1px] scale-105" />
  <img 
    src={camlyCoinLogo} 
    alt="CAMLY COIN" 
    className="relative w-10 h-10 rounded-full object-cover ring-2 ring-gold-champagne/40 shadow-md" 
  />
</div>
<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500" style={{ fontSize: '16px' }}>
  CAMLY COIN
</span>
```

### 3.3 Đổi tiêu đề Ecosystem sang tím hồng

**Trước:**
```tsx
<h3 className="font-semibold mb-1 text-[#4C1D95]" style={{ fontSize: '20px' }}>
```

**Sau:**
```tsx
<h3 className="font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500" style={{ fontSize: '20px' }}>
```

---

## SO SÁNH TRƯỚC VÀ SAU

| Yếu tố | Trước | Sau |
|--------|-------|-----|
| CAMLY COIN icon | Icon Coins | Logo hình ảnh vàng |
| CAMLY COIN text | `text-foreground`, text-sm | Tím hồng gradient, 16px, bold |
| Ecosystem title | `text-[#4C1D95]` | Tím hồng gradient |
| FUN PROFILE | Fun Profile | FUN PROFILE |
| FUN FARM | Fun Farm | FUN FARM |
| FUN PLANET | Fun Planet | FUN PLANET |
| FUN PLAY | Fun Play | FUN PLAY |
| FUN ACADEMY | Fun Academy | FUN ACADEMY |
| FUN CHAT | Fun Chat | FUN CHAT |
| FUN LEGAL | Fun Legal | FUN LEGAL |

---

## FILES CẦN SỬA

| File | Thay đổi |
|------|----------|
| `src/assets/camly-coin-logo.png` | Copy logo từ user-uploads |
| `src/contexts/LanguageContext.tsx` | Cập nhật 8 translation keys sang IN HOA |
| `src/components/social/LeftSidebar.tsx` | Thêm logo CAMLY COIN, đổi màu chữ tím hồng |

---

## KẾT QUẢ MONG ĐỢI

1. Logo CAMLY COIN hiển thị hình vàng đẹp với viền ánh kim
2. Chữ CAMLY COIN màu tím hồng gradient nổi bật
3. Tất cả các tên menu FUN Ecosystem là chữ IN HOA
4. Tiêu đề "FUN ECOSYSTEM PLATFORMS" IN HOA và màu tím hồng
5. Giao diện đồng bộ, sang trọng và chuyên nghiệp

---

## THỜI GIAN THỰC HIỆN

- Phase 1 (Copy logo): ~1 phút
- Phase 2 (Translation keys): ~5 phút
- Phase 3 (LeftSidebar): ~5 phút

**Tổng: ~11 phút**

