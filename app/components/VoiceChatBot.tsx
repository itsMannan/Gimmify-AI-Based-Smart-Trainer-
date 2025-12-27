'use client'

import { useState, useEffect, useRef } from 'react'

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface Message {
  role: 'user' | 'bot' | 'system'
  text: string
  timestamp: Date
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface VoiceChatBotProps {
  theme?: 'dark' | 'light'
}

export default function VoiceChatBot({ theme = 'dark' }: VoiceChatBotProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [language, setLanguage] = useState('en-US')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [hasOpenAI, setHasOpenAI] = useState(false)
  const conversationHistoryRef = useRef<ConversationMessage[]>([])

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      if (recognitionRef.current) {
        // Enable continuous listening for natural conversation
        recognitionRef.current.continuous = true
        // Enable interim results to show what's being heard in real-time
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = language

        let finalTranscript = ''

        recognitionRef.current.onresult = (event: any) => {
          let interim = ''

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              // Final result - add to final transcript
              finalTranscript += transcript + ' '
            } else {
              // Interim result - show in real-time
              interim += transcript
            }
          }

          // Update interim transcript for real-time display
          setInterimTranscript(interim)

          // If we have a final transcript, process it
          if (finalTranscript.trim()) {
            setInterimTranscript('') // Clear interim
            handleUserMessage(finalTranscript.trim(), true) // true = voice input
            finalTranscript = '' // Reset
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)

          if (event.error === 'not-allowed') {
            setIsListening(false)
            setInterimTranscript('')
            alert('Microphone permission denied. Please allow microphone access to use voice features.')
          } else if (event.error === 'no-speech') {
            // No speech detected - this is normal, keep listening
            setInterimTranscript('')
            // Don't stop listening, just clear interim
          } else if (event.error === 'aborted') {
            // Recognition was aborted (user stopped it)
            setIsListening(false)
            setInterimTranscript('')
          } else {
            // Other errors - stop listening
            setIsListening(false)
            setInterimTranscript('')
          }
        }

        recognitionRef.current.onend = () => {
          // Auto-restart if still in listening mode (for continuous listening)
          if (isListening) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              // Recognition already started or stopped
              setIsListening(false)
            }
          } else {
            setIsListening(false)
            setInterimTranscript('')
          }
        }

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setInterimTranscript('')
        }
      }
    }

    synthRef.current = window.speechSynthesis

    // Check API connection
    checkConnection()

    // Initial greeting
    const greeting: Message = {
      role: 'bot',
      text: "Hey there! I'm Gimmify, your AI fitness coach, and I'm excited to help you on your fitness journey! I can help with exercise techniques, workout plans, nutrition advice, and motivation. Click the microphone to start talking! 🎯",
      timestamp: new Date()
    }
    setMessages([greeting])

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [language])

  useEffect(() => {
    // Safety timeout to prevent infinite loops if onend calls start immediately
    let restartTimeout: NodeJS.Timeout

    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Small delay before restarting to prevent browser throttling
          restartTimeout = setTimeout(() => {
            try {
              if (isListening) recognitionRef.current.start()
            } catch (error) {
              console.error('Failed to restart recognition:', error)
              setIsListening(false)
            }
          }, 300)
        } else {
          setIsListening(false)
          setInterimTranscript('')
        }
      }
    }

    return () => {
      clearTimeout(restartTimeout)
    }
  }, [isListening])

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      setIsConnected(response.ok)
      setHasOpenAI(data.hasOpenAI || false)
    } catch (error) {
      // API is always available (runs in Next.js)
      setIsConnected(true)
      setHasOpenAI(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.')
      return
    }

    if (!recognitionRef.current) {
      // Try to re-initialize if lost
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = language
      } else {
        alert('Speech recognition initialization failed. Please refresh the page.')
        return
      }
    }

    try {
      recognitionRef.current.lang = language
      recognitionRef.current.start()
      setIsListening(true)
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please verify your browser permissions.')
      } else if (error.name === 'InvalidStateError') {
        // Already started
        setIsListening(true)
      } else {
        console.error('Error starting recognition:', error)
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
    setIsListening(false)
    setInterimTranscript('')
  }

  const handleUserMessage = async (text: string, isVoiceInput: boolean = false) => {
    if (!text.trim()) return

    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      role: 'user',
      text: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Add to conversation history
    conversationHistoryRef.current.push({
      role: 'user',
      content: text
    })

    // Get bot response from API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          language: language,
          conversationHistory: conversationHistoryRef.current.slice(-10) // Last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      const data = await response.json()
      const botResponse = data.response || data.message || "I'm here to help! What would you like to know about fitness, exercises, or nutrition? 💪"

      // Add bot message
      const botMessage: Message = {
        role: 'bot',
        text: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])

      // Add to conversation history
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: botResponse
      })

      // Only speak the response if input was from voice
      if (isVoiceInput) {
        speakText(botResponse)
      }

    } catch (error) {
      console.error('Error getting bot response:', error)
      const errorMessage: Message = {
        role: 'bot',
        text: "I'm here to help! I'm having a small issue right now, but I'm still here for you. What would you like to know about fitness, exercises, or nutrition? 💪",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      // Only speak error if input was from voice
      if (isVoiceInput) {
        speakText(errorMessage.text)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = (text: string) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Remove emojis for better speech synthesis
    const cleanText = text.replace(/[^\w\s.,!?;:()\-']/g, ' ').trim()

    const utterance = new SpeechSynthesisUtterance(cleanText || text)
    utterance.lang = language

    // More natural speech settings
    utterance.rate = 0.95 // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to get a more natural voice
    const voices = synthRef.current.getVoices()
    const preferredVoices = voices.filter(voice =>
      language.startsWith('en')
        ? voice.lang.startsWith('en') && (voice.name.includes('Samantha') || voice.name.includes('Alex') || voice.name.includes('Daniel'))
        : voice.lang.startsWith(language.split('-')[0])
    )

    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0]
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error)
      setIsSpeaking(false)
    }

    synthRef.current.speak(utterance)
  }

  // Load voices when available
  useEffect(() => {
    if (synthRef.current) {
      const loadVoices = () => {
        // Voices are loaded asynchronously
        const voices = synthRef.current?.getVoices() || []
        if (voices.length > 0) {
          // Voices loaded
        }
      }

      loadVoices()
      synthRef.current.onvoiceschanged = loadVoices
    }
  }, [])

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'ru-RU', name: 'Russian' },
  ]

  return (
    <div className={`border rounded-[32px] shadow-2xl p-6 md:p-8 max-w-4xl mx-auto transition-colors duration-500 ${theme === 'light' ? 'bg-white border-gray-200 shadow-gray-200/50 text-gray-900' : 'bg-[#0d0d12] border-red-900/40 text-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-black tracking-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          🎤 AI Voice Assistant
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${hasOpenAI ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className="text-sm text-gray-400">
            {hasOpenAI ? 'AI Enhanced' : 'Basic Mode'}
          </span>
        </div>
      </div>

      <p className="text-gray-300 mb-6 text-center">
        Talk to Gimmify in any language! Ask about exercises, nutrition, or get motivation.
      </p>

      {/* Language Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Language / Idioma / Langue:
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          disabled={isListening}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-4 mb-6 h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 ${message.role === 'user'
                ? 'bg-[#cc2d2d] text-white shadow-lg'
                : theme === 'light' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-[#1a1a24] text-gray-100 border border-gray-800'
                }`}
            >
              <p className="text-sm font-medium leading-relaxed">{message.text}</p>
              <p className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Real-time speech indicator */}
        {isListening && interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-red-400/80 text-white opacity-90">
              <p className="text-sm italic">
                {interimTranscript}
                <span className="animate-pulse">▊</span>
              </p>
              <p className="text-xs opacity-70 mt-1">Listening...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
          className={`px-8 py-4 rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg ${isListening
            ? 'bg-red-700 hover:bg-red-800 ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900'
            : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'
            } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <>
              <span className="animate-pulse">🔴</span>
              Stop Listening
            </>
          ) : (
            <>
              🎤 Start Talking
            </>
          )}
        </button>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="px-6 py-4 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition-all border border-gray-600"
          >
            Stop Speaking
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          <strong>Instructions:</strong>
          <br />• <strong>Voice Mode:</strong> Click "Start Talking" and speak naturally - the bot continuously listens and understands full sentences. You'll see what it's hearing in real-time. The bot will respond with voice and text.
          <br />• <strong>Text Mode:</strong> Type your message - the bot will respond with text only (no voice).
          <br />Works entirely in your browser - no additional servers needed! For best results, use Chrome or Edge browser.
        </p>
        {!hasOpenAI && (
          <div className="mt-3 p-3 bg-gray-900 border border-yellow-900/50 rounded-lg">
            <p className="text-xs text-yellow-500">
              <strong>💡 Upgrade to AI-Enhanced Mode:</strong> Add your OpenAI API key to <code className="bg-gray-700 px-2 py-0.5 rounded font-mono text-xs text-yellow-200">.env.local</code> for expert-level, comprehensive answers.
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline ml-1"
              >
                Get your API key →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Text Input Option */}
      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && textInput.trim()) {
                handleUserMessage(textInput, false) // false = text input
                setTextInput('')
              }
            }}
            placeholder="Or type your message here..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-500"
            disabled={isLoading || isListening}
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                handleUserMessage(textInput, false) // false = text input
                setTextInput('')
              }
            }}
            disabled={isLoading || isListening || !textInput.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}






