# Gimmify - Voice Chat Bot (Next.js)

A fully integrated voice chatbot built entirely in Next.js with no external dependencies. The bot uses browser-native Web Speech API for voice input/output and provides intelligent, human-like responses.

## Features

✅ **Fully in Next.js** - No Python server needed  
✅ **Voice Input/Output** - Uses browser Web Speech API  
✅ **Multilingual Support** - 12+ languages  
✅ **AI-Powered** - Optional OpenAI integration for enhanced responses  
✅ **Intelligent Fallbacks** - Works without API keys  
✅ **Conversation Context** - Maintains conversation history  
✅ **Natural Responses** - Human-like, conversational replies  

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Scroll to the "Voice Chat Bot" section
   - Start chatting!

## How It Works

### Architecture

1. **Next.js API Route** (`app/api/chat/route.ts`) - Handles all bot logic
   - Uses OpenAI API if available (optional)
   - Provides intelligent fallback responses
   - Maintains conversation context

2. **Web Component** (`app/components/VoiceChatBot.tsx`) - Frontend interface
   - Uses Web Speech API for voice recognition
   - Uses Web Speech API for text-to-speech
   - Displays conversation history
   - Supports text and voice input

### No External Servers Required

Everything runs in your browser and Next.js server. No Python, no Flask, no separate services needed!

## Enhanced AI Responses (Highly Recommended)

For comprehensive, expert-level responses like a knowledgeable fitness professional who knows everything, add your OpenAI API key:

1. **Get your OpenAI API key:**
   - Visit: https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key

2. **Create a `.env.local` file** in the project root:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

### What You Get with OpenAI:

✅ **Comprehensive Knowledge** - Expert-level answers on fitness, nutrition, exercise science, anatomy, physiology  
✅ **Detailed Responses** - Thorough explanations with scientific backing and best practices  
✅ **Context Understanding** - Remembers conversation history for natural flow  
✅ **Natural Conversations** - Responds like a knowledgeable human expert who knows everything  
✅ **Multi-language Support** - Works in all supported languages with deep knowledge  
✅ **Advanced Models** - Uses GPT-4 when available, falls back to GPT-3.5-turbo  

**Note:** The bot works without an API key using intelligent fallback responses, but for the best experience with comprehensive, expert-level answers like a person who knows everything, the OpenAI API key is highly recommended.

## Supported Languages

- English (US) - `en-US`
- Spanish - `es-ES`
- French - `fr-FR`
- German - `de-DE`
- Italian - `it-IT`
- Portuguese (Brazil) - `pt-BR`
- Hindi - `hi-IN`
- Chinese (Mandarin) - `zh-CN`
- Japanese - `ja-JP`
- Korean - `ko-KR`
- Arabic - `ar-SA`
- Russian - `ru-RU`

## Usage

### Voice Input
1. Click "Start Talking" button
2. Allow microphone access when prompted
3. Speak your question
4. The bot will respond with both text and voice

### Text Input
1. Type your message in the text input field
2. Press Enter or click "Send"
3. The bot will respond with both text and voice

## Features in Detail

### 1. Speech Recognition
- Uses browser-native Web Speech API
- Supports multiple languages
- Works in Chrome, Edge, and Safari
- No additional libraries needed

### 2. Text-to-Speech
- Uses browser-native Speech Synthesis API
- Natural voice selection based on language
- Adjustable speech rate and pitch
- Works offline (browser voices)

### 3. AI Integration
- Optional OpenAI GPT-3.5-turbo integration
- Intelligent fallback responses when API unavailable
- Maintains conversation context (last 10 messages)
- Specialized for fitness coaching

### 4. Conversation Management
- Maintains conversation history
- Context-aware responses
- Natural, human-like interactions
- Error handling with graceful fallbacks

## Troubleshooting

### Speech Recognition Not Working

1. **Browser Support**: Use Chrome or Edge for best results
2. **Microphone Permissions**: Allow microphone access when prompted
3. **HTTPS**: Some browsers require HTTPS (localhost is exempt)
4. **Check Browser Console**: Look for any error messages

### Text-to-Speech Not Working

1. **Browser Voices**: Ensure your browser has voices installed
2. **Language Support**: Some languages may have limited voice options
3. **Check Console**: Look for speech synthesis errors

### API Errors

- The bot works without an OpenAI API key
- If you see errors, check your `.env.local` file
- Fallback responses will be used automatically

## File Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Next.js API route (bot logic)
│   ├── components/
│   │   └── VoiceChatBot.tsx    # Voice chatbot component
│   └── page.tsx                # Main page
├── .env.local                  # Optional: OpenAI API key
└── package.json               # Dependencies
```

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

The chatbot can be deployed to any platform that supports Next.js:

- **Vercel** (Recommended) - Automatic deployments
- **Netlify** - Easy Next.js support
- **AWS Amplify** - Full Next.js support
- **Railway** - Simple deployment
- **Any Node.js hosting** - Standard Next.js deployment

## Environment Variables

Optional environment variables (in `.env.local`):

- `OPENAI_API_KEY` - OpenAI API key for enhanced responses (optional)

## Notes

- ✅ No Python dependencies
- ✅ No external servers needed
- ✅ Works entirely in browser + Next.js
- ✅ Offline-capable (fallback responses)
- ✅ Production-ready
- ✅ Fully self-contained

## Support

For issues or questions:
1. Check browser console for errors
2. Verify microphone permissions
3. Ensure you're using a supported browser (Chrome/Edge recommended)
4. Check that Next.js server is running

## License

This project is private and proprietary.
