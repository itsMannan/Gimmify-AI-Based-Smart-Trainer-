'use client'

import { useEffect, useRef, useState } from 'react'

interface BodyDetectionCameraProps {
  width?: number
  height?: number
  enableDetection?: boolean
  theme?: 'dark' | 'light'
}

// Keypoint indices for MediaPipe
const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [24, 26], [26, 28] // Lower body
]

export default function BodyDetectionCamera({
  width = 640,
  height = 480,
  enableDetection = true,
  theme = 'dark'
}: BodyDetectionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiStatus, setAiStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [diagInfo, setDiagInfo] = useState('Loading scripts...')

  // Global instances (using any to avoid type conflicts with missing npm types)
  const poseRef = useRef<any>(null)
  const isDetectingRef = useRef(false)
  const animationFrameId = useRef<number>()

  useEffect(() => {
    isDetectingRef.current = isDetecting
  }, [isDetecting])

  useEffect(() => {
    let isMounted = true
    let activeStream: MediaStream | null = null

    const loadScripts = async () => {
      try {
        setDiagInfo('Connecting to AI Engine...')

        // Dynamically load MediaPipe from CDN to ensure JS and WASM versions are PERFECT matches
        // This is the only way to fix the "Aborted(Module.arguments)" error definitively
        const scripts = [
          'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
        ]

        for (const src of scripts) {
          if (!document.querySelector(`script[src="${src}"]`)) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = src
              script.async = true
              script.onload = resolve
              script.onerror = reject
              document.head.appendChild(script)
            })
          }
        }

        if (!isMounted) return
        initializeAI()
      } catch (err) {
        if (isMounted) {
          setError('Could not load AI scripts. Please check your internet connection.')
          setAiStatus('error')
        }
      }
    }

    const initializeAI = async () => {
      try {
        setDiagInfo('Starting AI Model...')

        // Use Global Pose from the loaded script
        const Pose = (window as any).Pose
        if (!Pose) throw new Error('Pose not found in window')

        const pose = new Pose({
          locateFile: (file: string) => {
            // Point to matched CDN assets
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          },
        })

        pose.setOptions({
          modelComplexity: 0, // Lite for stability
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })

        pose.onResults((results: any) => {
          if (!isMounted || !canvasRef.current || !isDetectingRef.current) return

          const canvasCtx = canvasRef.current.getContext('2d')
          if (!canvasCtx) return

          setDiagInfo(results.poseLandmarks ? `Body Active: ${results.poseLandmarks.length} points` : 'Searching for body...')

          canvasCtx.save()
          canvasCtx.clearRect(0, 0, width, height)

          if (results.poseLandmarks) {
            const landmarks = results.poseLandmarks

            // Draw Connections
            canvasCtx.strokeStyle = '#00FF00'
            canvasCtx.lineWidth = 4
            CONNECTIONS.forEach(([i, j]) => {
              const p1 = landmarks[i], p2 = landmarks[j]
              if (p1 && p2 && (p1.visibility || 0) > 0.4 && (p2.visibility || 0) > 0.4) {
                canvasCtx.beginPath()
                canvasCtx.moveTo(p1.x * width, p1.y * height)
                canvasCtx.lineTo(p2.x * width, p2.y * height)
                canvasCtx.stroke()
              }
            })

            // Draw Joints
            canvasCtx.fillStyle = '#FF0000'
            landmarks.forEach((p: any) => {
              if ((p.visibility || 0) > 0.4) {
                canvasCtx.beginPath()
                canvasCtx.arc(p.x * width, p.y * height, 5, 0, 2 * Math.PI)
                canvasCtx.fill()
              }
            })

            // Calculate & Draw Angles
            const getAngle = (a: any, b: any, c: any) => {
              const r = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
              let ang = Math.abs(r * 180 / Math.PI)
              return Math.round(ang > 180 ? 360 - ang : ang)
            }

            const showAngle = (iA: number, iB: number, iC: number) => {
              const pA = landmarks[iA], pB = landmarks[iB], pC = landmarks[iC]
              if (!pA || !pB || !pC || (pB.visibility || 0) < 0.4) return
              const angle = getAngle(pA, pB, pC)
              const x = pB.x * width, y = pB.y * height
              canvasCtx.fillStyle = 'rgba(0,0,0,0.8)'
              canvasCtx.fillRect(x + 5, y - 22, 55, 26)
              canvasCtx.fillStyle = 'white'
              canvasCtx.font = 'bold 18px Arial'
              canvasCtx.fillText(`${angle}°`, x + 10, y)
            }

            showAngle(11, 13, 15); showAngle(12, 14, 16); // Elbows
            showAngle(23, 25, 27); showAngle(24, 26, 28); // Knees
          }
          canvasCtx.restore()
        })

        await pose.initialize()
        poseRef.current = pose
        setAiStatus('ready')
        setDiagInfo('AI Ready')
      } catch (err: any) {
        console.error('AI Init Err:', err)
        setAiStatus('error')
        // If the module fails, it's often a browser cache issue
        setError('AI Load Error. Please try refreshing your browser window.')
      }
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width, height } })
        activeStream = stream
        if (videoRef.current && isMounted) videoRef.current.srcObject = stream
      } catch (e: any) {
        setError('Camera blocked. Please allow camera access in your browser.')
      }
    }

    const detectionLoop = async () => {
      if (!isMounted) return
      if (videoRef.current && poseRef.current && isDetectingRef.current) {
        if (videoRef.current.readyState >= 2) {
          try {
            await poseRef.current.send({ image: videoRef.current })
          } catch (e) {
            // Silently ignore transient errors
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(detectionLoop)
    }

    startCamera()
    loadScripts()
    detectionLoop()

    return () => {
      isMounted = false
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      if (poseRef.current) poseRef.current.close()
      if (activeStream) activeStream.getTracks().forEach(t => t.stop())
    }
  }, [width, height])

  return (
    <div className={`flex flex-col items-center space-y-4 p-6 rounded-3xl ${theme === 'light' ? 'bg-white' : 'bg-[#0d0d12] border border-red-900/20'}`}>
      <h3 className="text-xl font-black text-white uppercase tracking-wider">Detection Preview</h3>

      <div className="relative overflow-hidden rounded-2xl bg-black shadow-inner" style={{ width, height }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Modern Status Indicator */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <div className={`w-2.5 h-2.5 rounded-full ${aiStatus === 'ready' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : aiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-[11px] font-bold text-gray-200 uppercase tracking-tight">{diagInfo}</span>
        </div>

        {isDetecting && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase animate-pulse">
            Recording
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-xs w-full text-center">
          {error}
        </div>
      )}

      <div className="flex space-x-4 w-full justify-center">
        <button
          onClick={() => setIsDetecting(true)}
          disabled={isDetecting || aiStatus !== 'ready'}
          className={`flex-1 max-w-[200px] py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isDetecting || aiStatus !== 'ready' ? 'bg-gray-800 text-gray-500' : 'bg-green-600 text-white hover:bg-green-500 hover:scale-105 active:scale-95 shadow-lg shadow-green-900/40'}`}
        >
          {aiStatus === 'loading' ? 'Loading AI...' : 'Start Tracking'}
        </button>
        <button
          onClick={() => {
            setIsDetecting(false)
            canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height)
          }}
          disabled={!isDetecting}
          className="flex-1 max-w-[120px] py-4 rounded-xl font-black uppercase tracking-widest text-xs bg-red-600 text-white disabled:bg-gray-800 disabled:text-gray-500 transition-all hover:bg-red-500 hover:scale-105 active:scale-95 shadow-lg shadow-red-900/40"
        >
          Stop
        </button>
      </div>

      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
        Ensure your full body is visible for accurate tracking
      </p>
    </div>
  )
}
