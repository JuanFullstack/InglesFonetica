import React from 'react';

type VoiceControlsProps = {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  currentSpeed: number;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
};

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isPlaying,
  onPlayPause,
  onSpeedChange,
  onVoiceChange,
  currentSpeed,
  voices,
  selectedVoice,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={onPlayPause}
          className={`px-4 py-2 text-white rounded ${
            isPlaying ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label htmlFor="speed" className="text-sm font-medium text-gray-700">
          Speed:
        </label>
        <input
          id="speed"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={currentSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full"
        />
        <span>{currentSpeed.toFixed(1)}x</span>
      </div>

      <div className="flex items-center space-x-4">
        <label htmlFor="voices" className="text-sm font-medium text-gray-700">
          Voice:
        </label>
        <select
          id="voices"
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const selected = voices.find((v) => v.name === e.target.value);
            onVoiceChange(selected || null);
          }}
          className="p-2 border border-gray-300 rounded"
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VoiceControls;
