import { useState } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import './App.css';

function App() {
  const {
    connectMicrophone,
    connectFile,
    getAudioData,
    isReady,
    isPlaying,
    togglePlay,
    volume,
    setVolume
  } = useAudioAnalyzer();

  const [mode, setMode] = useState(null);

  const handleMicClick = async () => {
    await connectMicrophone();
    setMode('mic');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      connectFile(file);
      setMode('file');
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="app-container">
      <ThreeCanvas getAudioData={getAudioData} />

      <div className="ui-overlay">
        <div className="header">
          <h1>VIBE ANALYZER</h1>
          <p>Audio Reactive Visualizer</p>
        </div>

        <div className="controls-container">
          {!mode && <div className="start-prompt">Choose Audio Source to Start</div>}

          <div className="source-controls">
            <button className={`btn ${mode === 'mic' ? 'active' : ''}`} onClick={handleMicClick}>
              🎤 Mic
            </button>

            <div className="file-input-wrapper">
              <button className={`btn ${mode === 'file' ? 'active' : ''}`}>
                📁 local file
              </button>
              <input type="file" accept="audio/*" onChange={handleFileChange} />
            </div>
          </div>

          {mode && (
            <div className="playback-controls">
              <button className="icon-btn" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div className="volume-control">
                <span>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="footer">
          {mode === 'mic' && <p>Listening...</p>}
          {mode === 'file' && <p>{isPlaying ? 'Playing' : 'Paused'}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
