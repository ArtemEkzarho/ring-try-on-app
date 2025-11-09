import { useEffect, useRef, useState } from 'react'

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraError, setCameraError] = useState('')
  const [isCameraOn, setIsCameraOn] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      setCameraError('')
      setIsCameraOn(true)
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

  return {
    stopCamera,
    startCamera,
    toggleCamera,
    cameraError,
    isCameraOn,
    streamRef,
    videoRef,
  }
}
