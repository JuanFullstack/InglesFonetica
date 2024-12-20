import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { CsvRow } from '../types/csv';
import { parseCsvFile } from '../utils/csvHelpers';
import { padWordsToMatch, speak, pauseSpeech, resumeSpeech, stopSpeech } from '../utils/textUtils';
import StyledButton from './StyledButton';
import AudioRecorder from './AudioRecorder';

interface AudioRecord {
  rowId: string;
  audioBlob: Blob;
}

const CsvViewer: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<CsvRow[]>([]);
  const [originalData, setOriginalData] = useState<CsvRow[]>([]);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [showSpanish, setShowSpanish] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [font, setFont] = useState<string>('Arial');
  const [isFirstWordRemoved, setIsFirstWordRemoved] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [globalWordIndex, setGlobalWordIndex] = useState<number>(-1);
  const [audioRecordings, setAudioRecordings] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices.filter(voice => voice.lang.startsWith('en')));
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    const savedRecordings = localStorage.getItem(`audioRecordings_${id}`);
    if (savedRecordings) {
      setAudioRecordings(JSON.parse(savedRecordings));
    }
  }, [id]);

  useEffect(() => {
    const loadCsv = async () => {
      try {
        const files = JSON.parse(localStorage.getItem('csvFiles') || '[]');
        const selectedFile = files.find((f: any) => f.id.toString() === id);
        
        if (!selectedFile) {
          setError('File not found');
          return;
        }

        const fileContent = localStorage.getItem(`file_${selectedFile.id}`);
        if (!fileContent) {
          setError('File content not found');
          return;
        }

        const base64Response = await fetch(`data:text/csv;base64,${fileContent}`);
        const blob = await base64Response.blob();
        const file = new File([blob], selectedFile.name, { type: 'text/csv' });

        const parsedData = await parseCsvFile(file);
        setData(parsedData);
        setOriginalData(parsedData);
      } catch (err) {
        setError('Error loading file');
        console.error('Error:', err);
      }
    };

    loadCsv();
  }, [id]);

  const handlePlayPause = () => {
    if (isReading) {
      if (isPaused) {
        resumeSpeech();
        setIsPaused(false);
      } else {
        pauseSpeech();
        setIsPaused(true);
      }
    }
  };

  const handleSaveAudio = (audioBlob: Blob, rowId: string) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      setAudioRecordings(prev => {
        const newRecordings = {
          ...prev,
          [rowId]: base64Audio
        };
        localStorage.setItem(`audioRecordings_${id}`, JSON.stringify(newRecordings));
        return newRecordings;
      });
    };
  };

  const handleDeleteAudio = (rowId: string) => {
    setAudioRecordings(prev => {
      const newRecordings = { ...prev };
      delete newRecordings[rowId];
      localStorage.setItem(`audioRecordings_${id}`, JSON.stringify(newRecordings));
      return newRecordings;
    });
  };

  const handleReadLine = async (text: string, paragraphIndex: number) => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
      setActiveWordIndex(-1);
      return;
    }

    setIsReading(true);
    setIsPaused(false);
    setCurrentParagraphIndex(paragraphIndex);
    
    try {
      await speak(text, setActiveWordIndex, speed, selectedVoice);
    } finally {
      setIsReading(false);
      setActiveWordIndex(-1);
    }
  };

  const handleReadAll = async () => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
      setGlobalWordIndex(-1);
      setCurrentParagraphIndex(0);
      return;
    }

    setIsReading(true);
    setIsPaused(false);
    
    const allText = data.map(row => row.english).join('. ');
    
    const wordOffsets = data.reduce((acc: number[], row, index) => {
      const previousTotal = index > 0 ? acc[index - 1] : 0;
      acc.push(previousTotal + row.english.split(' ').length);
      return acc;
    }, []);

    const handleWordIndexUpdate = (wordIndex: number) => {
      setGlobalWordIndex(wordIndex);
      
      const paragraphIndex = wordOffsets.findIndex(offset => wordIndex < offset);
      if (paragraphIndex !== -1) {
        setCurrentParagraphIndex(paragraphIndex);
        const previousOffset = paragraphIndex > 0 ? wordOffsets[paragraphIndex - 1] : 0;
        setActiveWordIndex(wordIndex - previousOffset);
      }
    };

    try {
      await speak(allText, handleWordIndexUpdate, speed, selectedVoice);
    } finally {
      setIsReading(false);
      setGlobalWordIndex(-1);
      setActiveWordIndex(-1);
      setCurrentParagraphIndex(0);
    }
  };

  const toggleFirstWord = () => {
    if (isFirstWordRemoved) {
      setData(originalData);
    } else {
      setData(prevData => 
        prevData.map(row => ({
          english: row.english.split(' ').slice(1).join(' '),
          phonetic: row.phonetic.split(' ').slice(1).join(' '),
          spanish: row.spanish.split(' ').slice(1).join(' ')
        }))
      );
    }
    setIsFirstWordRemoved(!isFirstWordRemoved);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <StyledButton
            active={showEnglish}
            onClick={() => setShowEnglish(!showEnglish)}
            className="bg-blue-500 text-white"
          >
            English
          </StyledButton>
          <StyledButton
            active={showPhonetic}
            onClick={() => setShowPhonetic(!showPhonetic)}
            className="bg-green-500 text-white"
          >
            Phonetic
          </StyledButton>
          <StyledButton
            active={showSpanish}
            onClick={() => setShowSpanish(!showSpanish)}
            className="bg-purple-500 text-white"
          >
            Spanish
          </StyledButton>
          <StyledButton
            active={!isFirstWordRemoved}
            onClick={toggleFirstWord}
            className="bg-red-500 text-white"
          >
            Remove
          </StyledButton>
          <StyledButton
            active={isReading}
            onClick={handleReadAll}
            className="bg-indigo-500 text-white"
          >
            {isReading ? 'Stop Reading' : 'Read All'}
          </StyledButton>
        </div>

        <div className="flex space-x-4 items-center">
          <label htmlFor="voice-select" className="text-gray-700">Voice:</label>
          <select
            id="voice-select"
            className="p-2 border rounded"
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = voices.find(v => v.name === e.target.value);
              setSelectedVoice(voice || null);
            }}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name}
              </option>
            ))}
          </select>

          <label htmlFor="font-select" className="text-gray-700">Font:</label>
          <select
            id="font-select"
            className="p-2 border rounded"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((row, rowIndex) => {
          const [paddedEnglish, paddedPhonetic] = padWordsToMatch(
            row.english.split(' '),
            row.phonetic.split(' ')
          );

          const rowId = `${id}_${rowIndex}`;

          return (
            <div 
              key={rowIndex}
              className={`p-4 rounded ${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
              style={{ fontFamily: font }}
            >
              {showEnglish && (
                <div className="mb-2">
                 <div className="flex items-center gap-2 mb-2">
                  <StyledButton
                    active={true}
                    onClick={() => handleReadLine(row.english, rowIndex)}
                    className="bg-blue-500 text-white text-xs px-2 py-1"
                  >
                    {isReading && currentParagraphIndex === rowIndex ? 'Stop' : 'Read'}
                  </StyledButton>
                  <AudioRecorder
                    rowId={rowId}
                    onSave={handleSaveAudio}
                    onDelete={handleDeleteAudio}
                    existingAudioUrl={audioRecordings[rowId]}
                  />
                  {audioRecordings[rowId] && (
                    <audio controls={false}>
                      <source src={audioRecordings[rowId]} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
                  <p className="text-blue-600">
                  {paddedEnglish.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={`
                      ${(isReading && currentParagraphIndex === rowIndex && activeWordIndex === wordIndex)
                        ? 'bg-yellow-300 px-1 py-0.5 rounded'
                        : ''}
                      ${wordIndex % 2 === 0 ? 'text-blue-600' : 'text-blue-400'}
                    `}
                  >
                    {word}{' '}
                  </span>
                ))}
                  </p>
                </div>
              )}
              {showPhonetic && (
                <p className="text-green-600">
                  {paddedPhonetic.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={wordIndex % 2 === 0 ? 'text-green-600' : 'text-green-400'}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </p>
              )}
              {showSpanish && (
                <p className="text-purple-600 mt-2">
                  {row.spanish}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {isReading && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white p-6 flex justify-center items-center rounded-t-lg shadow-lg">
          <button
            className="w-14 h-14 rounded-full shadow-inner flex items-center justify-center text-lg"
            style={{ backgroundColor: isPaused ? '#10B981' : '#3B82F6' }}
            onClick={handlePlayPause}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <div className="flex space-x-4 mx-4">
            {[0.3, 0.5, 1].map(speedOption => (
              <button
                key={speedOption}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  speed === speedOption ? 'bg-green-500' : 'bg-gray-700'
                }`}
                onClick={() => setSpeed(speedOption)}
              >
                {speedOption}x
              </button>
            ))}
          </div>
          <button
            className="w-14 h-14 bg-red-500 rounded-full shadow-inner flex items-center justify-center text-lg"
            onClick={() => {
              stopSpeech();
              setIsReading(false);
              setActiveWordIndex(-1);
            }}
          >
            ⬛
          </button>
        </div>
      )}
    </div>
  );
};

export default CsvViewer;