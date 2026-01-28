import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  onSend: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export function VoiceRecorder({ onSend, onCancel, isRecording, setIsRecording }: VoiceRecorderProps) {
  const { t } = useLanguage();
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(30).fill(0.1));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const MAX_DURATION = 120; // 2 minutes max

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Update waveform visualization
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 30 points from the frequency data
    const samples = 30;
    const step = Math.floor(dataArray.length / samples);
    const newWaveform = [];
    
    for (let i = 0; i < samples; i++) {
      const value = dataArray[i * step] / 255;
      newWaveform.push(Math.max(0.1, value));
    }
    
    setWaveformData(newWaveform);
    animationRef.current = requestAnimationFrame(updateWaveform);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start waveform animation
      updateWaveform();

    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

  const handleCancel = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
    setWaveformData(new Array(30).fill(0.1));
    onCancel();
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `voice_${user.id}_${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from("stories") // Using stories bucket for now, can create chat-audio bucket later
        .upload(`voice-notes/${fileName}`, audioBlob, {
          contentType: 'audio/webm'
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("stories")
        .getPublicUrl(`voice-notes/${fileName}`);

      onSend(publicUrl, recordingTime);
      handleCancel();
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {(isRecording || audioBlob) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="flex items-center gap-3 p-3 bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg"
        >
          {/* Recording indicator */}
          <motion.div
            animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
            className={`w-3 h-3 rounded-full ${isRecording ? 'bg-destructive' : 'bg-primary'}`}
          />

          {/* Waveform */}
          <div className="flex items-center gap-0.5 h-8 flex-1 min-w-[100px]">
            {waveformData.map((value, index) => (
              <motion.div
                key={index}
                className="w-1 bg-primary rounded-full"
                animate={{ height: `${value * 32}px` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Time display */}
          <span className="text-sm font-mono text-foreground min-w-[40px]">
            {formatTime(recordingTime)}
          </span>

          {/* Recording status text */}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {isRecording ? t('chat.recording') : t('chat.voiceNote')}
          </span>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {isRecording ? (
              <Button
                size="icon"
                variant="outline"
                onClick={stopRecording}
                className="h-9 w-9 rounded-full"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : audioBlob ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="h-9 w-9 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isUploading}
                  className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* Start recording button (when not recording) */}
      {!isRecording && !audioBlob && (
        <Button
          size="icon"
          variant="ghost"
          onClick={startRecording}
          className="h-9 w-9 rounded-full hover:bg-primary/10"
          title={t('chat.tapToRecord')}
        >
          <Mic className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}
    </AnimatePresence>
  );
}
