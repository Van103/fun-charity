
# KẾ HOẠCH TỐI ƯU HÓA PERFORMANCE CHO FUN CHARITY

## TỔNG QUAN VẤN ĐỀ

Hiện tại FUN Charity có thời gian tải trang chậm do các yếu tố sau:

1. **Video nền hero-bg.mp4** tải ngay khi mở trang (không có preload/poster)
2. **3 Canvas animation layers** chạy đồng thời: AnimatedBackground, EnergyBokeh, CustomCursor
3. **FlyingAngel component** xử lý image phức tạp (flood-fill algorithm)
4. **Hình ảnh không có lazy loading** (FeaturedCampaigns, avatars)
5. **Thiếu preload cho critical assets**
6. **React forwardRef warnings** trong Navbar

---

## PHASE 1: CRITICAL - Tối ưu Video Background (Giảm 2-3s load time)

### 1.1 Thêm Video Poster & Lazy Load

Thay vì tải video ngay lập tức, sử dụng ảnh poster tĩnh và chỉ tải video khi cần:

```text
┌─────────────────────────────────────────────────┐
│           CURRENT STATE                         │
│  ┌─────────────────────────────────────┐       │
│  │  Page Load → Video Download (5MB+)  │       │
│  │         → Render                    │       │
│  └─────────────────────────────────────┘       │
│                   ↓                             │
│           OPTIMIZED STATE                       │
│  ┌─────────────────────────────────────┐       │
│  │  Page Load → Poster Image (50KB)    │       │
│  │         → Render immediately        │       │
│  │         → Lazy load video in bg     │       │
│  └─────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

**Thay đổi trong HeroSection.tsx:**
- Thêm `poster` attribute với ảnh tĩnh từ video frame đầu
- Thêm `preload="none"` hoặc `preload="metadata"` 
- Lazy load video chỉ khi component đã mounted

### 1.2 Preload Critical Assets trong index.html

Thêm preload cho video poster:
```html
<link rel="preload" href="/images/hero-poster.webp" as="image" type="image/webp" />
```

---

## PHASE 2: Animation Performance (Giảm 40% CPU usage)

### 2.1 Defer EnergyBokeh Loading

Hiện tại EnergyBokeh canvas render ngay khi app load. Cải thiện:
- Delay khởi tạo 1-2 giây sau khi page visible
- Giảm particle count mặc định từ 50 → 30
- Thêm "Performance Mode" option tắt tất cả effects

**Thay đổi trong App.tsx:**
```tsx
// Lazy load EnergyBokeh after initial render
const [showBokeh, setShowBokeh] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowBokeh(true), 1500);
  return () => clearTimeout(timer);
}, []);

// Only render when ready
{showBokeh && <EnergyBokeh />}
```

### 2.2 Simplify AnimatedBackground on Mobile

Giảm thêm 50% số elements trên mobile và tắt shimmer overlay:
- Mobile: Chỉ giữ 1 parallax layer thay vì 3
- Tắt shimmer animation trên mobile hoàn toàn

### 2.3 Optimize FlyingAngel Component

FlyingAngel hiện đang chạy flood-fill algorithm mỗi khi thay đổi fairy color. Cải thiện:
- Pre-process và cache tất cả fairy images khi app init
- Giảm sparkle limit từ 8 → 5
- Giảm trail limit từ 10 → 6
- Giảm light ray limit từ 12 → 8

---

## PHASE 3: Image Lazy Loading (Giảm initial payload 60%)

### 3.1 Native Lazy Loading cho Images

Thêm `loading="lazy"` cho tất cả images:

**Files cần sửa:**
- `FeaturedCampaigns.tsx` - Campaign images
- `TestimonialsSection.tsx` - Avatar images
- `TeamSection.tsx` - Team member photos
- `PartnersSection.tsx` - Partner logos
- `SocialPostCard.tsx` - Post images/avatars

### 3.2 Tạo OptimizedImage Component

```tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // true = no lazy loading
}

const OptimizedImage = ({ src, alt, className, priority = false }: OptimizedImageProps) => (
  <img 
    src={src} 
    alt={alt}
    className={className}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
  />
);
```

---

## PHASE 4: Bundle & Loading Optimizations

### 4.1 React Query Stale Time Increase

Tăng stale time để giảm re-fetch:
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (từ 1 minute)
      gcTime: 1000 * 60 * 10,   // 10 minutes (từ 5 minutes)
    },
  },
});
```

### 4.2 Prefetch Critical Data

Prefetch transparent stats và campaigns khi hover menu:
```tsx
// Prefetch on hover
onMouseEnter={() => {
  queryClient.prefetchQuery(['campaigns', 'featured']);
  queryClient.prefetchQuery(['transparency-stats']);
}}
```

---

## PHASE 5: Fix React Warnings

### 5.1 Fix forwardRef Warnings in Navbar

Console hiển thị warnings về components không có forwardRef:
- Xác định component nào trong Navbar cần forwardRef
- Wrap với React.forwardRef để fix warning

---

## PHASE 6: Performance Mode Setting

### 6.1 Thêm "Performance Mode" Toggle

Cho phép user tắt tất cả animations trong 1 click:

```tsx
// Trong MotionContext
performanceMode: boolean; // Tắt tất cả: bokeh, background, cursor effects, flying angel
setPerformanceMode: (value: boolean) => void;
```

UI: Thêm toggle trong settings với label "Chế độ tiết kiệm pin 🔋"

---

## TÓM TẮT CÁC FILE CẦN SỬA

| File | Thay đổi |
|------|----------|
| `index.html` | Thêm preload cho poster image |
| `src/components/home/HeroSection.tsx` | Video poster + lazy load |
| `src/App.tsx` | Defer EnergyBokeh loading |
| `src/components/background/AnimatedBackground.tsx` | Giảm layers mobile |
| `src/components/background/EnergyBokeh.tsx` | Giảm default particles |
| `src/components/cursor/FlyingAngel.tsx` | Cache processed images, giảm effects |
| `src/components/cursor/CustomCursor.tsx` | Giảm particle limits |
| `src/components/home/FeaturedCampaigns.tsx` | Native lazy loading |
| `src/components/home/TestimonialsSection.tsx` | Native lazy loading |
| `src/components/home/TeamSection.tsx` | Native lazy loading |
| `src/contexts/MotionContext.tsx` | Thêm Performance Mode |
| `src/components/layout/Navbar.tsx` | Fix forwardRef warnings |

---

## KẾT QUẢ MONG ĐỢI

| Metric | Trước | Sau |
|--------|-------|-----|
| First Contentful Paint | ~3.5s | ~1.2s |
| Largest Contentful Paint | ~5.0s | ~2.0s |
| Time to Interactive | ~6.0s | ~2.5s |
| CPU Usage (animations) | ~40% | ~15% |
| Initial Payload | ~8MB | ~3MB |

---

## TIMELINE THỰC HIỆN

1. **Phase 1** (Video): ~20 phút
2. **Phase 2** (Animations): ~30 phút  
3. **Phase 3** (Images): ~15 phút
4. **Phase 4** (Bundle): ~10 phút
5. **Phase 5** (Warnings): ~10 phút
6. **Phase 6** (Performance Mode): ~15 phút

**Tổng: ~1.5-2 giờ**
