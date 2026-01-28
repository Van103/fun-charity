
# KẾ HOẠCH TÍCH HỢP CÁC TÍNH NĂNG VÀO MESSAGES.TSX

## TỔNG QUAN

Tích hợp 4 tính năng đã tạo vào trang FUN Chat:
1. **Voice Notes** - Ghi âm và phát tin nhắn thoại
2. **Edit Message** - Chỉnh sửa tin nhắn trong 30 phút  
3. **Charity Global Hub** - Tab từ thiện toàn cầu (USP)
4. **Voice Message Player** - Hiển thị audio player trong message bubbles

---

## PHẦN 1: THÊM IMPORTS VÀ STATE

### 1.1 Imports mới cần thêm

```typescript
// Thêm vào đầu file Messages.tsx
import { VoiceRecorder } from "@/components/chat/VoiceRecorder";
import { VoiceMessagePlayer } from "@/components/chat/VoiceMessagePlayer";
import { EditMessageModal, canEditMessage } from "@/components/chat/EditMessageModal";
import { CharityGlobalTab } from "@/components/chat/CharityGlobalTab";
import { Mic, Edit2 } from "lucide-react"; // Icons cho Voice và Edit
```

### 1.2 State mới cần thêm

```typescript
// Trong function Messages()
const [isVoiceRecording, setIsVoiceRecording] = useState(false);
const [editingMessage, setEditingMessage] = useState<{
  id: string;
  content: string;
} | null>(null);
```

---

## PHẦN 2: TÍCH HỢP CHARITY GLOBAL TAB

### Vị trí: Lines 960, 1000 (Tab content areas)

Thêm render condition cho tab "charity":

```typescript
// Desktop tab content (line ~960)
{activeChatTab === "charity" && <CharityGlobalTab />}

// Mobile tab content (line ~1000)
{activeChatTab === "charity" && <CharityGlobalTab />}
```

### Cập nhật header title (lines 948, 988):

```typescript
{activeChatTab === "charity" && t('chat.charity')}
```

---

## PHẦN 3: TÍCH HỢP VOICE NOTES

### 3.1 Thêm VoiceRecorder vào Message Input

**Vị trí: Lines 1725-1800 (Message input area)**

Thêm VoiceRecorder component bên cạnh các nút khác:

```typescript
// Trong div "flex items-center gap-1" của left action buttons
<VoiceRecorder
  isRecording={isVoiceRecording}
  setIsRecording={setIsVoiceRecording}
  onSend={handleVoiceSend}
  onCancel={() => setIsVoiceRecording(false)}
/>
```

### 3.2 Thêm function handleVoiceSend

```typescript
const handleVoiceSend = async (audioUrl: string, duration: number) => {
  if (!activeConversation || !currentUserId) return;

  try {
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: currentUserId,
      content: "",
      audio_url: audioUrl,
      audio_duration: duration,
      reply_to_id: replyTo?.id || null
    });

    if (error) throw error;

    // Update last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", activeConversation.id);

    setReplyTo(null);
  } catch (error) {
    console.error("Error sending voice message:", error);
    toast({
      title: t('common.error'),
      description: t('chat.voiceSendFailed'),
      variant: "destructive"
    });
  }
};
```

### 3.3 Hiển thị VoiceMessagePlayer trong message bubbles

**Vị trí: Lines 1614-1636 (Message content area)**

Thêm condition để hiển thị audio player:

```typescript
{/* Voice Message - trước image_url check */}
{msg.audio_url && (
  <div className="p-2">
    <VoiceMessagePlayer 
      audioUrl={msg.audio_url}
      duration={msg.audio_duration || 0}
      isOwnMessage={isCurrentUser}
    />
  </div>
)}

{/* Image/Video - giữ nguyên logic hiện tại */}
{msg.image_url && !msg.audio_url && (
  // ... existing image/video code
)}
```

---

## PHẦN 4: TÍCH HỢP EDIT MESSAGE

### 4.1 Thêm option "Chỉnh sửa" vào dropdown menu

**Vị trí: Lines 1488-1523 (DropdownMenuContent cho own messages)**

Thêm DropdownMenuItem mới cho Edit:

```typescript
{/* Chỉ hiển thị Edit nếu trong vòng 30 phút */}
{canEditMessage(msg.created_at, msg.sender_id, currentUserId) && msg.content && !msg.audio_url && (
  <DropdownMenuItem 
    onClick={() => setEditingMessage({
      id: msg.id,
      content: msg.content
    })}
    className="cursor-pointer"
  >
    <Edit2 className="w-4 h-4 mr-2" />
    {t('chat.editMessage')}
  </DropdownMenuItem>
)}
```

### 4.2 Hiển thị indicator "(đã chỉnh sửa)"

**Vị trí: Lines 1631-1635 (Sau message content)**

```typescript
{msg.content && (
  <div className={`px-4 py-2 ${msg.content === '👍' ? 'text-4xl py-1' : ''}`}>
    <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
    {/* Edited indicator */}
    {(msg as any).is_edited && (
      <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">
        ({t('chat.edited')})
      </span>
    )}
  </div>
)}
```

### 4.3 Render EditMessageModal

**Vị trí: Cuối file, trước closing tags (~line 1943)**

```typescript
{/* Edit Message Modal */}
{editingMessage && (
  <EditMessageModal
    isOpen={!!editingMessage}
    onClose={() => setEditingMessage(null)}
    messageId={editingMessage.id}
    currentContent={editingMessage.content}
    onSuccess={() => {
      loadMessages(activeConversation?.id || "");
      setEditingMessage(null);
    }}
  />
)}
```

---

## PHẦN 5: CẬP NHẬT MESSAGE INTERFACE

### 5.1 Mở rộng Message interface

**Vị trí: Lines 78-94**

```typescript
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  reply_to_id?: string | null;
  audio_url?: string | null;
  audio_duration?: number | null;
  is_edited?: boolean;           // Thêm mới
  edited_at?: string | null;     // Thêm mới
  senderProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replyToMessage?: Message | null;
}
```

---

## PHẦN 6: THÊM TRANSLATIONS

### Thêm vào LanguageContext.tsx

```typescript
"chat.voiceSendFailed": { 
  en: "Failed to send voice message", 
  vi: "Không thể gửi tin nhắn thoại" 
},
```

---

## TÓM TẮT CÁC FILE CẦN CẬP NHẬT

| File | Thay đổi |
|------|----------|
| `src/pages/Messages.tsx` | Import components, thêm state, tích hợp Voice/Edit/Charity, update Message interface |
| `src/contexts/LanguageContext.tsx` | Thêm translation "voiceSendFailed" |

---

## PREVIEW SAU KHI HOÀN THÀNH

### Message Input Area
```
┌────────────────────────────────────────────────────────────┐
│  [+] [📷] [🎁] [GIF] │ Aa...              │ [🎤] [👍/→]  │
│                       │                    │              │
│  Voice Recording:     └────────────────────┘              │
│  ● 0:15 ████████░░░░ [■] [Cancel] [Send]                  │
└────────────────────────────────────────────────────────────┘
```

### Message Bubble with Voice Note
```
┌─────────────────────────────────────────┐
│  [▶]  ▁▂▃▅▆▅▃▂▁▂▃▅▆▅▃▂▁   0:15/0:45    │
│       ──────────●─────────              │
└─────────────────────────────────────────┘
```

### Message with Edit Indicator
```
┌─────────────────────────────────────────┐
│  Xin chào! Đây là tin nhắn đã sửa      │
│  (đã chỉnh sửa)                         │
└─────────────────────────────────────────┘
```

### Charity Global Tab
```
┌────────────────────────────────────────┐
│ Charity Global Hub           [🔍]      │
├────────────────────────────────────────┤
│ ⭐ Light Points: 1,234  |  Rank: Hero  │
├────────────────────────────────────────┤
│ Featured Channels ───────────────────  │
│ [🌍 Fun Charity] [📚 Education]        │
├────────────────────────────────────────┤
│ Lan Tỏa Ánh Sáng ────────────────────  │
│ [Avatar] Nguyễn A đã giúp đỡ...       │
│          ❤️ 234  💬 56  +10 points    │
├────────────────────────────────────────┤
│ 💬    📷    ❤️    🔔    ☰             │
│ Chats Tin Charity Thông Menu          │
│            ━━━━━━   báo               │
└────────────────────────────────────────┘
```

---

## THỜI GIAN TRIỂN KHAI

| Bước | Thời gian | Mô tả |
|------|-----------|-------|
| 1 | 2 phút | Thêm imports và state mới |
| 2 | 2 phút | Tích hợp CharityGlobalTab vào tabs |
| 3 | 5 phút | Tích hợp VoiceRecorder vào input + handleVoiceSend |
| 4 | 3 phút | Hiển thị VoiceMessagePlayer trong message bubbles |
| 5 | 3 phút | Thêm Edit option vào dropdown + indicator |
| 6 | 2 phút | Render EditMessageModal |
| 7 | 1 phút | Thêm translations |

**Tổng: ~18 phút**
