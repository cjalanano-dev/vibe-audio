# VIBE: Audio-Reactive Visualizer

VIBE is an immersive, 3D audio-reactive web application that transforms sound into a mesmerizing visual experience. Built with React, Three.js, and the Web Audio API, it processes audio frequencies in real-time to drive dynamic geometries and lighting effects.

## Features

*   **Real-time Audio Analysis**: Uses the Web Audio API (AnalyserNode) to break down audio into Bass, Mid, and Treble frequencies.
*   **Dual Input Modes**:
    *   **Microphone**: Visualize your voice or ambient music in the room.
    *   **File Upload**: Play and visualize your local MP3/Audio files.
*   **3D Visuals**:
    *   **Bass**: A central sphere that pulses and shifts color with low-end frequencies.
    *   **Mids**: A rotating torus ring that spins faster with the beat.
    *   **Treble**: Floating elements that react to high-end frequencies.
*   **Premium Aesthetics**:
    *   Dark mode design.
    *   Glassmorphism UI overlay.
    *   Bloom post-processing effects (glow).
    *   Custom SVG icons.
*   **Playback Controls**:
    *   Play/Pause toggle.
    *   Volume slider.
    *   Stop/Disconnect button to release audio resources.

## Tech Stack

*   **Vite**: Fast build tool and dev server.
*   **React**: UI library.
*   **Three.js (@react-three/fiber)**: 3D rendering engine.
*   **@react-three/drei**: Useful helpers for Three.js.
*   **@react-three/postprocessing**: For the Bloom effect.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the app**:
    Navigate to `http://localhost:5173` in your browser.

## Usage

1.  **Choose Source**: Click "Live Microphone" or "Upload Audio".
2.  **Grant Permission**: If using the mic, allow the browser to access it.
3.  **Enjoy**: Watch the visuals react to the sound.
4.  **Control**: Use the floating controls island to pause, adjust volume, or stop the session.
