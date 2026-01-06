import { useState } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import './App.css';

function App() {
  const {
    connectMicrophone,
    connectFile,
    disconnectAudio,
    getAudioData,
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

  const handleStop = () => {
    disconnectAudio();
    setMode(null);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="app-container">
      <ThreeCanvas getAudioData={getAudioData} />

      <div className="ui-overlay">
        <header className="header">
          <h1>VIBE</h1>
          <p>Audio Visualizer</p>
        </header>

        <main className="controls-center">
          {!mode && (
            <div className="start-menu">
              <button className="primary-btn" onClick={handleMicClick}>
                <span className="icon">🎤</span> Live Microphone
              </button>

              <div className="file-input-wrapper">
                <button className="primary-btn">
                  <span className="icon">📁</span> Upload Audio
                </button>
                <input type="file" accept="audio/*" onChange={handleFileChange} />
              </div>
            </div>
          )}

          {mode && (
            <div className="active-controls">
              <div className="control-group">
                <button className="circle-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <button className="circle-btn stop-btn" onClick={handleStop} title="Stop & Exit">
                  ⏹
                </button>
              </div>

              <div className="volume-slider-container">
                <span className="icon-small">�</span>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                />
                <span className="icon-small">🔊</span>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          {mode === 'mic' && <p>Listening to ambient audio</p>}
          {mode === 'file' && <p>Playing local file</p>}
          {!mode && <p>Select a source to begin</p>}
        </footer>
      </div>
    </div>
  );
}

export default App;
