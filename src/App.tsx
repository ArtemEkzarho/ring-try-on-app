import { useCamera } from './useCamera'

function App() {
  const { toggleCamera, cameraError, isCameraOn, videoRef } = useCamera()

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Ring Try-On</h1>
      </header>

      <div className="camera-container">
        {cameraError ? (
          <div className="camera-error">{cameraError}</div>
        ) : isCameraOn ? (
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
        ) : (
          <div className="camera-off">
            <p>Camera is off</p>
          </div>
        )}
      </div>

      <button onClick={toggleCamera} className="camera-toggle-btn">
        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
      </button>
    </div>
  )
}

export default App
