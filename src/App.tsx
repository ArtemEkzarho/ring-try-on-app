import { useEffect, useState } from 'react'
import { useCamera } from './useCamera'
import { useHandDetection } from './useHandDetection'

function App() {
  const { toggleCamera, switchCamera, cameraError, isCameraOn, facingMode, videoRef } = useCamera()
  const [isHandDetectionEnabled, setIsHandDetectionEnabled] = useState(false)
  const { canvasRef, handsDetected } = useHandDetection(
    videoRef,
    isHandDetectionEnabled && isCameraOn
  )

  // Sync canvas size with video
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    const updateCanvasSize = () => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
      }
    }

    videoRef.current.addEventListener('loadedmetadata', updateCanvasSize)
    return () => {
      videoRef.current?.removeEventListener('loadedmetadata', updateCanvasSize)
    }
  }, [videoRef, canvasRef])

  const toggleHandDetection = () => {
    setIsHandDetectionEnabled(!isHandDetectionEnabled)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Ring Try-On</h1>
        {isCameraOn && isHandDetectionEnabled && (
          <p className="hand-status">{`Hands detected: ${handsDetected}`}</p>
        )}
      </header>

      <div className="camera-container">
        {cameraError ? (
          <div className="camera-error">{cameraError}</div>
        ) : isCameraOn ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            {isHandDetectionEnabled && <canvas ref={canvasRef} className="hand-canvas" />}
          </>
        ) : (
          <div className="camera-off">
            <p>Camera is off</p>
          </div>
        )}
      </div>

      <div className="controls">
        <button onClick={toggleCamera} className="camera-toggle-btn">
          {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>

        {isCameraOn && (
          <>
            <button onClick={switchCamera} className="camera-switch-btn">
              Switch to {facingMode === 'user' ? 'Back' : 'Front'} Camera
            </button>

            <button onClick={toggleHandDetection} className="hand-detection-btn">
              {isHandDetectionEnabled ? 'Disable' : 'Enable'} Hand Detection
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
