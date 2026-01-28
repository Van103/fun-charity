

# KẾ HOẠCH TRIỂN KHAI PHASE 0+ CHO FUN CHAT

---

## TỔNG QUAN

Triển khai 4 tính năng lớn cho FUN Chat:
1. **Voice Notes** - Ghi âm tin nhắn thoại với waveform visualization
2. **Edit Message** - Chỉnh sửa tin nhắn trong 30 phút
3. **Charity Global Hub** - USP của FUN Chat (Public channels, Share Deed, Light Points)
4. **Stories/Tin** - Upload story, xem story bạn bè, tự động xóa sau 24 giờ

---

## PHẦN 1: VOICE NOTES (Ghi âm tin nhắn thoại)

### 1.1 Database (Đã sẵn sàng)
Bảng `messages` đã có sẵn các cột:
- `audio_url` (TEXT) - URL file audio
- `audio_duration` (INTEGER) - Thời lượng ghi âm (giây)

### 1.2 Components mới

**File: `src/components/chat/VoiceRecorder.tsx`**
- Nút ghi âm (tap-to-record hoặc hold-to-record)
- Waveform visualization khi đang ghi
- Hiển thị thời gian ghi (max 2 phút)
- Nút cancel/send
- Sử dụng Web Audio API + MediaRecorder

**File: `src/components/chat/VoiceMessagePlayer.tsx`**
- Audio player nhỏ gọn trong bubble tin nhắn
- Waveform visualization
- Play/Pause button
- Hiển thị duration
- Progress indicator

### 1.3 Cập nhật Messages.tsx
- Thêm nút microphone bên cạnh nút gửi
- Tích hợp VoiceRecorder component
- Upload audio file lên Supabase Storage bucket "chat-audio"
- Hiển thị VoiceMessagePlayer cho tin nhắn có audio_url

### 1.4 Storage
- Tạo bucket "chat-audio" trong Supabase Storage (nếu chưa có)
- RLS policy cho phép authenticated users upload

---

## PHẦN 2: EDIT MESSAGE (Chỉnh sửa trong 30 phút)

### 2.1 Database Migration

```sql
-- Thêm cột cho edit message
ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN original_content TEXT;
```

### 2.2 Logic chỉnh sửa
- Chỉ cho phép edit tin nhắn của chính mình
- Thời gian cho phép: 30 phút sau khi gửi
- Lưu nội dung gốc vào `original_content`
- Đánh dấu `is_edited = true` và cập nhật `edited_at`
- Hiển thị label "(đã chỉnh sửa)" trên tin nhắn

### 2.3 Components
**File: `src/components/chat/EditMessageModal.tsx`**
- Modal hoặc inline edit
- Textarea với nội dung hiện tại
- Nút Lưu / Hủy
- Validation: không cho phép để trống

### 2.4 Cập nhật Messages.tsx
- Thêm option "Chỉnh sửa" vào dropdown menu tin nhắn
- Chỉ hiển thị nếu: sender là mình + trong vòng 30 phút
- Hiển thị indicator "(đã chỉnh sửa)" trên bubble

---

## PHẦN 3: CHARITY GLOBAL HUB (USP)

### 3.1 Database Schema

```sql
-- Kênh từ thiện công cộng
CREATE TABLE charity_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT CHECK (category IN ('education', 'health', 'environment', 'community', 'disaster', 'children')),
  member_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thành viên kênh
CREATE TABLE charity_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES charity_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Tin nhắn trong kênh
CREATE TABLE charity_channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES charity_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Việc tốt (Deeds) - Lan Tỏa Ánh Sáng
CREATE TABLE deeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  category TEXT CHECK (category IN ('helping', 'donation', 'volunteer', 'kindness', 'environment', 'other')),
  location TEXT,
  light_points INTEGER DEFAULT 10,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions cho Deeds
CREATE TABLE deed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deed_id UUID REFERENCES deeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'heart' CHECK (reaction_type IN ('heart', 'star', 'pray', 'inspire', 'grateful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deed_id, user_id)
);

-- Comments cho Deeds
CREATE TABLE deed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deed_id UUID REFERENCES deeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Light Points tracking
CREATE TABLE user_light_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  deeds_count INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Beginner',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE charity_channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE deeds;
ALTER PUBLICATION supabase_realtime ADD TABLE deed_reactions;
```

### 3.2 RLS Policies

```sql
-- charity_channels: public read, authenticated write
ALTER TABLE charity_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active channels" ON charity_channels FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can create channels" ON charity_channels FOR INSERT WITH CHECK (auth.uid() = created_by);

-- deeds: public read for public deeds, owner full access
ALTER TABLE deeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view public deeds" ON deeds FOR SELECT USING (visibility = 'public');
CREATE POLICY "Owner can manage own deeds" ON deeds FOR ALL USING (auth.uid() = user_id);

-- user_light_points: public read, system update
ALTER TABLE user_light_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view light points" ON user_light_points FOR SELECT USING (true);
CREATE POLICY "Owner can update own points" ON user_light_points FOR UPDATE USING (auth.uid() = user_id);
```

### 3.3 Components mới

**File: `src/components/chat/CharityGlobalTab.tsx`**
Thay thế ChatStoriesTab hoặc thêm tab mới:
- Header với search và filter
- Featured Channels carousel
- "Lan Tỏa Ánh Sáng" Feed (Latest Deeds)
- User's Light Points display
- FAB "Share Your Deed" button

**File: `src/components/charity/ChannelCard.tsx`**
- Hiển thị channel với cover image, name, member count
- Join/Leave button
- Category badge

**File: `src/components/charity/DeedCard.tsx`**
- Hiển thị deed với avatar, content, image/video
- Reactions (heart, star, pray, inspire, grateful)
- Comments count
- Light points earned
- Share button

**File: `src/components/charity/ShareDeedModal.tsx`**
- Form để chia sẻ việc tốt
- Upload image/video
- Chọn category
- Privacy setting (public/friends/private)
- Auto-calculate light points

**File: `src/components/charity/LightPointsCard.tsx`**
- Hiển thị tổng light points của user
- Rank badge (Beginner, Helper, Champion, Legend)
- Weekly/Monthly stats
- Progress to next rank

### 3.4 Hooks

**File: `src/hooks/useCharityChannels.ts`**
- Fetch channels list
- Join/Leave channel
- Realtime subscription

**File: `src/hooks/useDeeds.ts`**
- Fetch deeds feed
- Create deed
- React to deed
- Comment on deed
- Realtime subscription

**File: `src/hooks/useLightPoints.ts`**
- Fetch user's light points
- Calculate rank
- Leaderboard

### 3.5 Cập nhật ChatBottomTabs
Thêm tab mới hoặc thay đổi tab "Stories" thành "Charity":
```typescript
const tabs = [
  { id: "chats", icon: MessageCircle, labelKey: "chat.chats" },
  { id: "charity", icon: Heart, labelKey: "chat.charity" }, // Thay Stories
  { id: "notifications", icon: Bell, labelKey: "chat.notifications" },
  { id: "menu", icon: Menu, labelKey: "chat.menu" },
];
```

---

## PHẦN 4: STORIES/TIN (24-hour ephemeral content)

### 4.1 Database Schema

```sql
-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  background_color TEXT,
  text_overlay TEXT,
  text_position JSONB, -- {x, y, fontSize, color}
  duration INTEGER DEFAULT 5, -- seconds for image display
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story views tracking
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Story reactions (quick reactions)
CREATE TABLE story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'heart',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE story_views;

-- Create index for expired stories cleanup
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
```

### 4.2 RLS Policies

```sql
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- Public stories visible to friends or all
CREATE POLICY "Users can view non-expired stories" ON stories 
  FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Owner can manage own stories" ON stories 
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own story views" ON story_views 
  FOR SELECT USING (
    story_id IN (SELECT id FROM stories WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can record view" ON story_views 
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);
```

### 4.3 Database Function - Auto-delete expired stories

```sql
-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Can be called via cron job or Edge Function
```

### 4.4 Components mới

**File: `src/components/stories/StoriesCarousel.tsx`**
- Horizontal scrollable list ở đầu ChatStoriesTab
- User avatar + ring progress (seen/unseen)
- "Add Story" button đầu tiên
- Click để mở StoryViewer

**File: `src/components/stories/StoryViewer.tsx`**
- Fullscreen story viewer
- Swipe left/right để chuyển story
- Progress bar auto-advance (5s/image, video duration)
- Tap to pause/resume
- Reply input ở bottom
- Quick reactions

**File: `src/components/stories/CreateStoryModal.tsx`**
- Camera/Gallery picker
- Image/Video preview
- Text overlay editor
- Color picker cho background
- Caption input
- Post button

**File: `src/components/stories/StoryRing.tsx`**
- Circular progress ring quanh avatar
- Gradient ring nếu có story chưa xem
- Gray ring nếu đã xem hết

### 4.5 Hooks

**File: `src/hooks/useStories.ts`**
- Fetch friends' stories
- Create story
- Mark as viewed
- React to story
- Delete own story
- Realtime subscription

### 4.6 Cập nhật ChatStoriesTab.tsx
Thay thế placeholder hiện tại:
- StoriesCarousel ở top
- "Your Story" preview
- Friends' stories grid
- "Create Story" FAB

---

## PHẦN 5: TRANSLATIONS

Thêm vào `src/contexts/LanguageContext.tsx`:

```typescript
// Voice Notes
"chat.voiceNote": { en: "Voice note", vi: "Tin nhắn thoại", ... },
"chat.recording": { en: "Recording...", vi: "Đang ghi...", ... },
"chat.tapToRecord": { en: "Tap to record", vi: "Nhấn để ghi âm", ... },
"chat.holdToRecord": { en: "Hold to record", vi: "Giữ để ghi âm", ... },
"chat.releaseToSend": { en: "Release to send", vi: "Thả để gửi", ... },
"chat.slideToCancel": { en: "Slide to cancel", vi: "Trượt để hủy", ... },

// Edit Message
"chat.editMessage": { en: "Edit message", vi: "Chỉnh sửa tin nhắn", ... },
"chat.edited": { en: "edited", vi: "đã chỉnh sửa", ... },
"chat.editTimeExpired": { en: "Edit time expired", vi: "Đã hết thời gian chỉnh sửa", ... },
"chat.saveChanges": { en: "Save changes", vi: "Lưu thay đổi", ... },

// Charity Global Hub
"chat.charity": { en: "Charity", vi: "Từ thiện", ... },
"charity.globalHub": { en: "Charity Global Hub", vi: "Trung tâm Từ thiện Toàn cầu", ... },
"charity.featuredChannels": { en: "Featured Channels", vi: "Kênh nổi bật", ... },
"charity.joinChannel": { en: "Join", vi: "Tham gia", ... },
"charity.leaveChannel": { en: "Leave", vi: "Rời khỏi", ... },
"charity.shareDeed": { en: "Share Your Deed", vi: "Chia sẻ Việc Tốt", ... },
"charity.lightPoints": { en: "Light Points", vi: "Điểm Ánh Sáng", ... },
"charity.spreadLight": { en: "Spread the Light", vi: "Lan Tỏa Ánh Sáng", ... },
"charity.yourRank": { en: "Your Rank", vi: "Cấp bậc của bạn", ... },
"charity.deedCategories.helping": { en: "Helping Others", vi: "Giúp đỡ người khác", ... },
"charity.deedCategories.donation": { en: "Donation", vi: "Quyên góp", ... },
"charity.deedCategories.volunteer": { en: "Volunteering", vi: "Tình nguyện", ... },
"charity.deedCategories.kindness": { en: "Random Kindness", vi: "Lòng tốt ngẫu nhiên", ... },
"charity.deedCategories.environment": { en: "Environment", vi: "Môi trường", ... },

// Stories
"stories.yourStory": { en: "Your Story", vi: "Tin của bạn", ... },
"stories.addStory": { en: "Add Story", vi: "Thêm tin", ... },
"stories.viewedBy": { en: "Viewed by", vi: "Đã xem bởi", ... },
"stories.replyToStory": { en: "Reply to story...", vi: "Trả lời tin...", ... },
"stories.storyExpired": { en: "Story expired", vi: "Tin đã hết hạn", ... },
"stories.expiresIn": { en: "Expires in", vi: "Hết hạn trong", ... },
```

---

## TIMELINE TRIỂN KHAI

| Ngày | Phase | Tasks |
|------|-------|-------|
| 1 | Voice Notes | VoiceRecorder.tsx, VoiceMessagePlayer.tsx, Storage setup |
| 2 | Voice Notes + Edit | Tích hợp vào Messages.tsx, EditMessageModal.tsx |
| 3 | Edit Message | Database migration, logic 30 phút, UI indicator |
| 4-5 | Charity Hub | Database tables + RLS, CharityGlobalTab.tsx |
| 6-7 | Charity Hub | DeedCard.tsx, ShareDeedModal.tsx, ChannelCard.tsx |
| 8 | Charity Hub | Hooks, Light Points, Leaderboard |
| 9-10 | Stories | Database tables, StoriesCarousel.tsx, StoryViewer.tsx |
| 11 | Stories | CreateStoryModal.tsx, auto-delete logic |
| 12 | Testing + Polish | Bug fixes, animations, translations hoàn chỉnh |

**Tổng: ~12 ngày phát triển**

---

## FILES TẠO MỚI (Tổng: 16 files)

1. `src/components/chat/VoiceRecorder.tsx`
2. `src/components/chat/VoiceMessagePlayer.tsx`
3. `src/components/chat/EditMessageModal.tsx`
4. `src/components/chat/CharityGlobalTab.tsx`
5. `src/components/charity/ChannelCard.tsx`
6. `src/components/charity/DeedCard.tsx`
7. `src/components/charity/ShareDeedModal.tsx`
8. `src/components/charity/LightPointsCard.tsx`
9. `src/components/stories/StoriesCarousel.tsx`
10. `src/components/stories/StoryViewer.tsx`
11. `src/components/stories/CreateStoryModal.tsx`
12. `src/components/stories/StoryRing.tsx`
13. `src/hooks/useCharityChannels.ts`
14. `src/hooks/useDeeds.ts`
15. `src/hooks/useLightPoints.ts`
16. `src/hooks/useStories.ts`

---

## FILES CẬP NHẬT

1. `src/pages/Messages.tsx` - Tích hợp Voice, Edit, hiển thị các tab mới
2. `src/components/chat/ChatBottomTabs.tsx` - Thêm/thay đổi tab Charity
3. `src/components/chat/ChatStoriesTab.tsx` - Hoàn thiện Stories UI
4. `src/contexts/LanguageContext.tsx` - Thêm 50+ translations mới

---

## UI PREVIEW

### Voice Notes Recording
```
┌────────────────────────────────────────┐
│  ●  0:15  ████████████░░░░░  [Cancel]  │
│           Đang ghi âm...               │
│                          [Send Arrow]  │
└────────────────────────────────────────┘
```

### Charity Global Hub
```
┌────────────────────────────────────────┐
│ Charity Global Hub           [Search] │
├────────────────────────────────────────┤
│ ⭐ Light Points: 1,234  |  Rank: Hero  │
├────────────────────────────────────────┤
│ Featured Channels ──────────────────── │
│ [🌍 Fun Charity WW] [📚 Education]     │
├────────────────────────────────────────┤
│ Lan Tỏa Ánh Sáng ───────────────────── │
│ [Avatar] Nguyễn A đã giúp đỡ...        │
│          ❤️ 234  💬 56  +10 points     │
├────────────────────────────────────────┤
│              [+ Share Deed]            │
└────────────────────────────────────────┘
```

### Stories View
```
┌────────────────────────────────────────┐
│ Stories ─────────────────────────────── │
│ [+] [🟣A] [🟣B] [⚪C] [⚪D] [🟣E] >>>   │
│  Add   Unread stories   Viewed         │
├────────────────────────────────────────┤
│            Full-screen Story           │
│         [Image/Video content]          │
│                                        │
│ ▂▂▂▂▃▃▃▃▄▄▄▄▄▅▅▅▅▆▆▆▆▇▇▇▇  Progress    │
│                                        │
│ [❤️] [😍] [🔥] [Reply...]   [Share]    │
└────────────────────────────────────────┘
```

