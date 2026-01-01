'use client'

import { useEffect, useRef, useState } from 'react'
import { Pose } from '@mediapipe/pose'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'

interface BodyDetectionCameraProps {
  width?: number
  height?: number
  enableDetection?: boolean
  theme?: 'dark' | 'light'
}

export default function BodyDetectionCamera({
  width = 640,
  height = 480,
  enableDetection = true,
  theme = 'dark'
}: BodyDetectionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const poseRef = useRef<Pose | null>(null)
  const isDetectingRef = useRef(isDetecting)
  const requestRef = useRef<number>()
  const connectingRef = useRef(false)

  // Use a unique session ID for cache busting per reload
  const sessionId = useRef(`v=${Date.now()}`).current

  useEffect(() => {
    isDetectingRef.current = isDetecting
  }, [isDetecting])

  useEffect(() => {
    let isMounted = true
    let animationFrameId: number
    let pose: Pose | null = null
    let activeStream: MediaStream | null = null

    const initializePose = async () => {
      // Allow multiple initializations (React Strict Mode compatibility)
      // but ensure we clean up the previous ones via the isMounted check

      try {
        if (connectingRef.current) return;
        connectingRef.current = true;

        console.log('Initializing MediaPipe Pose...')
        pose = new Pose({
          locateFile: (file) => {
            // Load from local assets with cache busting query param
            return `/mediapipe/pose/${file}?${sessionId}`
          },
        })

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        pose.onResults((results) => {
          if (!isMounted || !canvasRef.current || !canvasRef.current.getContext('2d')) return
          const canvasCtx = canvasRef.current.getContext('2d')!

          // Clear canvas (but preserve transform)
          // Note: clearRect needs to cover the entire logical space
          canvasCtx.save()
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

          // Visual Heartbeat (confirming loop is running)
          if (isDetectingRef.current) {
            canvasCtx.fillStyle = 'rgba(0, 255, 0, 0.5)'
            canvasCtx.beginPath()
            canvasCtx.arc(20, 20, 5, 0, 2 * Math.PI)
            canvasCtx.fill()
          }

          if (enableDetection && isDetectingRef.current && results.poseLandmarks) {
            console.log('Landmarks detected:', results.poseLandmarks.length)

            // Draw skeleton
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2,
            })
            drawLandmarks(canvasCtx, results.poseLandmarks, {
              color: '#FF0000',
              lineWidth: 1,
              radius: 3,
            })

            // Calculate and draw angles
            const landmarks = results.poseLandmarks
            const calculateAngle = (a: any, b: any, c: any) => {
              const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
              let angle = Math.abs(radians * 180.0 / Math.PI)
              if (angle > 180.0) angle = 360 - angle
              return Math.round(angle)
            }
            const drawAngle = (indexA: number, indexB: number, indexC: number) => {
              if (!landmarks[indexA] || !landmarks[indexB] || !landmarks[indexC]) return
              const angle = calculateAngle(landmarks[indexA], landmarks[indexB], landmarks[indexC])
              const x = landmarks[indexB].x * width
              const y = landmarks[indexB].y * height
              canvasCtx.fillStyle = 'white'
              canvasCtx.strokeStyle = 'black'
              canvasCtx.lineWidth = 3
              canvasCtx.font = 'bold 16px Arial'
              canvasCtx.strokeText(`${angle}°`, x + 10, y)
              canvasCtx.fillText(`${angle}°`, x + 10, y)
            }
            drawAngle(11, 13, 15); drawAngle(12, 14, 16); drawAngle(23, 25, 27); drawAngle(24, 26, 28);
          }
          canvasCtx.restore()
        })

        await pose.initialize()
        if (!isMounted) { pose.close(); return }
        poseRef.current = pose
        console.log('Pose initialized successfully')
      } catch (err: any) {
        console.error('Initialization error:', err)
        if (isMounted) {
          let msg = 'Failed to load AI model.'
          if (err.message && (err.message.includes('Aborted') || err.message.includes('Module.arguments'))) {
            msg = 'AI Model Error: Version compatibility issue. Retrying connection...'
            // Optionally retry? For now just show professional error.
          } else if (err.message) {
            msg = `AI Error: ${err.message}`
          }
          setError(msg)
        }
      }
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 } // Request specific resolution
        })
        activeStream = stream
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream

          videoRef.current.onloadedmetadata = () => {
            if (isMounted && videoRef.current) {
              videoRef.current.play().catch(e => console.error(e))
              detectFrame()
            }
          }
        } else {
          // Unmounted before camera started
          stream.getTracks().forEach(t => t.stop())
        }
      } catch (err: any) {
        console.error('Camera error:', err)
        if (isMounted) setError('Camera not accessible: ' + err.message)
      }
    }

    const detectFrame = async () => {
      if (!isMounted) return

      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        // Only send if we have a pose instance ready AND user wanted detection
        if (poseRef.current && isDetectingRef.current) {
          try {
            // Ensure the video has data
            if (videoRef.current.readyState >= 2) {
              await poseRef.current.send({ image: videoRef.current })
            }
          } catch (e) {
            console.error('Pose send error:', e)
          }
        }
      }
      animationFrameId = requestAnimationFrame(detectFrame)
    }

    // specific order: start camera immediately, load AI in background
    startCamera()
    initializePose()

    return () => {
      isMounted = false
      cancelAnimationFrame(animationFrameId)
      if (pose) pose.close()
      if (activeStream) activeStream.getTracks().forEach(track => track.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [enableDetection]) // Depend only on enableDetection stable prop
  // Removed isDetecting from deps

  const startDetection = () => {
    setIsDetecting(true)
    setError(null)
  }

  const stopDetection = () => {
    setIsDetecting(false)
    // Clear canvas when stopping
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  return (
    <div className={`flex flex-col items-center space-y-6 p-8 rounded-[32px] shadow-2xl transition-all duration-500 ${theme === 'light' ? 'bg-white border-gray-200 shadow-gray-200/50' : 'bg-[#0d0d12] border-red-900/40'}`}>
      <h3 className={`text-2xl font-black ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
        Body Detection Preview
      </h3>

      <div className="relative">
        <video
          ref={videoRef}
          className="rounded-lg"
          autoPlay
          playsInline
          muted
          style={{
            transform: 'scaleX(-1)', // Mirror the video
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-lg"
          style={{
            transform: 'scaleX(-1)', // Mirror the canvas to match video
            width: `${width}px`,
            height: `${height}px`,
          }}
          width={width}
          height={height}
        />
        {isDetecting && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
            Detecting Body
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={startDetection}
          disabled={!enableDetection || isDetecting}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!enableDetection || isDetecting
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20'
            }`}
        >
          Start Body Detection
        </button>
        <button
          onClick={stopDetection}
          disabled={!isDetecting}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!isDetecting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
            }`}
        >
          Stop Detection
        </button>
      </div>

      <div className="text-sm text-gray-600 text-center max-w-md">
        <p>
          {enableDetection
            ? 'Body detection is enabled. Click "Start Body Detection" to begin tracking your body pose.'
            : 'Body detection is currently disabled.'}
        </p>
        {isDetecting && (
          <p className="mt-2 text-green-600 font-semibold">
            ✓ Actively detecting body keypoints and pose
          </p>
        )}
      </div>
    </div>
  )
}

