import { useEffect, useRef, useState } from 'react'

type FacingMode = 'user' | 'environment'

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraError, setCameraError] = useState('')
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [facingMode, setFacingMode] = useState<FacingMode>('user')
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async (mode: FacingMode = facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      setCameraError('')
      setIsCameraOn(true)
      setFacingMode(mode)
    } catch (err) {
      setCameraError('Unable to access camera. Please grant camera permissions.')
      console.error('Camera access error:', err)
      setIsCameraOn(false)
    }
  }

  // Attach stream to video element when camera turns on
  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCameraOn])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  const switchCamera = async () => {
    if (!isCameraOn) return

    // Stop current camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Switch to the other camera
    const newMode: FacingMode = facingMode === 'user' ? 'environment' : 'user'
    await startCamera(newMode)
  }

  return {
    stopCamera,
    startCamera,
    toggleCamera,
    switchCamera,
    cameraError,
    isCameraOn,
    facingMode,
    streamRef,
    videoRef,
  }
}
