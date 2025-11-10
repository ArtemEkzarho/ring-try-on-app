import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands'
import type { Results } from '@mediapipe/hands'
import { useEffect, useRef, useState } from 'react'

export const useHandDetection = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isEnabled: boolean
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<Hands | null>(null)
  const [handsDetected, setHandsDetected] = useState<number>(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const onResults = (results: Results) => {
    if (!canvasRef.current) return

    const canvasCtx = canvasRef.current.getContext('2d')
    if (!canvasCtx) return

    // Update detected hands count
    setHandsDetected(results.multiHandLandmarks?.length || 0)

    // Clear canvas
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw hand landmarks if detected
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw connections (bones)
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2,
        })

        // Draw landmarks (joints)
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        })
      }
    }

    canvasCtx.restore()
  }

  useEffect(() => {
    if (!isEnabled || !videoRef.current || !canvasRef.current) return

    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      },
    })

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    hands.onResults(onResults)
    handsRef.current = hands

    // Start detection loop
    const detectHands = async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && handsRef.current) {
        try {
          await handsRef.current.send({ image: videoRef.current })
        } catch (err) {
          console.error('Hand detection error:', err)
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectHands)
    }

    detectHands()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (handsRef.current) {
        handsRef.current.close()
      }
    }
  }, [isEnabled, videoRef])

  return {
    canvasRef,
    handsDetected,
  }
}
