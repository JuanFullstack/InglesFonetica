// AudioRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import StyledButton from './StyledButton';

interface AudioRecorderProps {
  rowId: string;
  onSave: (audioBlob: Blob, rowId: string) => void;
  onDelete: (rowId: string) => void;
  existingAudioUrl?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  rowId, 
  onSave, 
  onDelete,
  existingAudioUrl 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [showControls, setShowControls] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setShowControls(true);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleSave = () => {
    if (chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
      onSave(audioBlob, rowId);
      setShowControls(false);
    }
  };

  const handleCancel = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setShowControls(false);
    chunksRef.current = [];
  };

  const handleDelete = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    onDelete(rowId);
  };

  return (
    <div className="flex items-center space-x-2">
      {!isRecording && !audioUrl && (
        <StyledButton
          active={false}
          onClick={startRecording}
          className="bg-red-500 text-white text-xs px-2 py-1"
        >
          Record
        </StyledButton>
      )}

      {isRecording && (
        <>
          <StyledButton
            active={true}
            onClick={togglePause}
            className="bg-yellow-500 text-white text-xs px-2 py-1"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </StyledButton>
          <StyledButton
            active={true}
            onClick={stopRecording}
            className="bg-red-500 text-white text-xs px-2 py-1"
          >
            Stop
          </StyledButton>
        </>
      )}

      {audioUrl && (
        <div className="flex items-center space-x-2">
          <audio controls src={audioUrl} className="h-8" />
          {showControls ? (
            <>
              <StyledButton
                active={true}
                onClick={handleSave}
                className="bg-green-500 text-white text-xs px-2 py-1"
              >
                Save
              </StyledButton>
              <StyledButton
                active={true}
                onClick={handleCancel}
                className="bg-gray-500 text-white text-xs px-2 py-1"
              >
                Cancel
              </StyledButton>
            </>
          ) : (
            <StyledButton
              active={true}
              onClick={handleDelete}
              className="bg-red-500 text-white text-xs px-2 py-1"
            >
              Delete
            </StyledButton>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;