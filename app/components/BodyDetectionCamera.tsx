'use client'

import { useEffect, useRef, useState } from 'react'
import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'

interface BodyDetectionCameraProps {
  width?: number
  height?: number
  enableDetection?: boolean
}

export default function BodyDetectionCamera({
  width = 640,
  height = 480,
  enableDetection = true
}: BodyDetectionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const poseRef = useRef<Pose | null>(null)
  const cameraRef = useRef<Camera | null>(null)

  useEffect(() => {
    let isActive = true
    let camera: Camera | null = null
    let pose: Pose | null = null

    if (!videoRef.current || !canvasRef.current) return

    const canvasCtx = canvasRef.current.getContext('2d')
    if (!canvasCtx) return

    const onResults = (results: any) => {
      // Check if component is still active before drawing
      if (!isActive || !canvasRef.current || !canvasCtx) return

      canvasCtx.save()
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      // Draw detection
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2,
        })
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        })
      }
      canvasCtx.restore()
    }

    const init = async () => {
      if (!isActive) return

      pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
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

      pose.onResults(onResults)

      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            // CRITICAL: Check isActive AND pose existence before sending
            // This prevents "Cannot pass deleted object" error
            if (isActive && pose && isDetecting) {
              await pose.send({ image: videoRef.current! })
            }
          },
          width: width,
          height: height,
        })

        if (isActive && isDetecting) {
          try {
            await camera.start()
          } catch (e: any) {
            if (isActive) setError(`Camera error: ${e.message}`)
          }
        }
      }
    }

    init()

    return () => {
      isActive = false // Immediately stop any future operations
      if (camera) {
        camera.stop()
      }
      if (pose) {
        pose.close()
      }
    }
  }, [width, height, isDetecting])

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
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Body Detection Camera
      </h3>

      <div className="relative">
        <video
          ref={videoRef}
          className="rounded-lg"
          style={{
            transform: 'scaleX(-1)', // Mirror the video
            width: `${width}px`,
            height: `${height}px`,
          }}
          playsInline
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
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
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

