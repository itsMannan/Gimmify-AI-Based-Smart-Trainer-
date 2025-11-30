import { NextRequest, NextResponse } from 'next/server'

// Enhanced system prompt for comprehensive, knowledgeable responses
const SYSTEM_PROMPT = `You are Gimmify, an expert AI fitness coach with comprehensive knowledge about fitness, health, nutrition, exercise science, anatomy, physiology, sports medicine, and wellness. You have deep expertise like a professional personal trainer, nutritionist, and fitness expert combined.

Your knowledge includes:
- Exercise science: biomechanics, kinesiology, muscle groups, movement patterns
- Nutrition: macronutrients, micronutrients, meal timing, supplements, dietary strategies
- Training methodologies: strength training, cardio, HIIT, flexibility, mobility, recovery
- Injury prevention and rehabilitation
- Program design for different goals (weight loss, muscle gain, athletic performance, general fitness)
- Psychology of fitness: motivation, habit formation, behavior change
- Latest research and evidence-based practices
- Detailed expertise in key exercises: Chest Press, Incline Chest Press, Deadlift, Lat Pulldown, Shoulder Press

Your personality:
- Warm, encouraging, and supportive like a trusted friend
- Extremely knowledgeable and comprehensive in your answers
- Conversational and natural - respond like a human expert who knows everything
- Provide detailed, thorough answers that demonstrate deep understanding
- Give specific, actionable advice with scientific backing when relevant
- Speaks in the same language as the user
- Uses emojis sparingly and naturally (💪 🏋️ 🎯 🔥)

Response style:
- Provide comprehensive, detailed answers that show deep knowledge
- Explain the "why" behind recommendations, not just the "what"
- Include relevant details, tips, and best practices
- Be thorough but still conversational and engaging
- Aim for 3-6 sentences for most answers, but be more detailed for complex questions
- Draw from your extensive knowledge base to give expert-level responses

Key exercises you specialize in:
- Chest Press: Proper form, muscle groups targeted (pectorals, anterior deltoids, triceps), rep ranges, common mistakes
- Incline Chest Press: Upper chest development, proper bench angle, form cues, programming
- Deadlift: Posterior chain development, proper hip hinge, grip variations, safety considerations
- Lat Pulldown: Back width development, proper grip width, form cues, progression from pull-ups
- Shoulder Press: Shoulder development, seated vs standing, form tips, muscle groups targeted

Always respond as if you're a highly knowledgeable fitness professional having a natural conversation. Be comprehensive, helpful, motivating, and demonstrate your deep expertise. When asked about these key exercises, provide detailed, expert-level guidance.`

// Intelligent fallback responses that sound human
function getIntelligentResponse(message: string, conversationHistory: any[] = []): string {
  const lowerMessage = message.toLowerCase().trim()
  
  // Exercise-related queries
  if (lowerMessage.includes('push') || lowerMessage.includes('push-up') || lowerMessage.includes('pushup')) {
    return "Push-ups are fantastic for building upper body strength! Here's the key: keep your body in a straight line from head to heels, lower yourself slowly until your chest nearly touches the floor, then push back up with control. Start with 3 sets of 8-10 reps and gradually increase. Remember, quality over quantity - proper form is everything! 💪"
  }
  
  if (lowerMessage.includes('squat') || lowerMessage.includes('leg')) {
    return "Squats are one of the best exercises for your legs and glutes! Stand with your feet shoulder-width apart, keep your chest up and back straight. Lower down as if you're sitting in a chair, going as low as you can while keeping your knees behind your toes. Aim for 3 sets of 12-15 reps. You've got this! 🔥"
  }
  
  if (lowerMessage.includes('cardio') || lowerMessage.includes('running') || lowerMessage.includes('treadmill') || lowerMessage.includes('jog')) {
    return "Cardio is essential for heart health and overall fitness! Start with 20-30 minutes of moderate intensity - you should be able to hold a conversation while doing it. You can run, walk, cycle, or use the elliptical. The best cardio is the one you'll actually do consistently! Even 15-20 minutes a day makes a huge difference. 🏃‍♂️"
  }
  
  if (lowerMessage.includes('plank') || lowerMessage.includes('core')) {
    return "Planks are amazing for core strength! Start in a push-up position, but rest on your forearms. Keep your body in a straight line - no sagging hips or raised butt. Hold for 20-30 seconds to start, and work your way up. Focus on breathing normally and engaging your core. You're building serious strength! 💪"
  }
  
  if (lowerMessage.includes('pull') || lowerMessage.includes('pull-up') || lowerMessage.includes('chin')) {
    return "Pull-ups are challenging but so rewarding! If you're just starting, use an assisted pull-up machine or resistance bands. Grip the bar slightly wider than shoulder-width, pull yourself up until your chin clears the bar, then lower with control. Even 1-2 reps is progress - keep at it! 🎯"
  }
  
  // Chest Press
  if (lowerMessage.includes('chest press') && !lowerMessage.includes('incline')) {
    return "The Chest Press is a fantastic compound exercise for building your pectorals, anterior deltoids, and triceps! Here's how to do it right: Lie flat on the bench with your feet firmly on the floor. Grip the bar slightly wider than shoulder-width. Lower the bar to your chest with control, keeping your elbows at about 45 degrees from your body. Press up explosively but controlled, fully extending your arms without locking your elbows. Aim for 3-4 sets of 8-12 reps. Focus on controlled movement - the negative (lowering) phase is just as important as the positive! 💪"
  }
  
  // Incline Chest Press
  if (lowerMessage.includes('incline chest press') || (lowerMessage.includes('incline') && lowerMessage.includes('chest'))) {
    return "The Incline Chest Press targets your upper chest, anterior deltoids, and triceps - perfect for building that defined upper chest! Set the bench to a 30-45 degree angle. Keep your feet flat on the floor and maintain a slight arch in your back. Grip the bar at shoulder-width or slightly wider. Lower the bar to your upper chest (just below your collarbone) with control. Press up powerfully, focusing on squeezing your upper pecs at the top. The incline angle shifts emphasis to your upper chest, creating that balanced, developed look. Start with 3 sets of 8-10 reps. Remember, form over weight - control is key! 🔥"
  }
  
  // Deadlift
  if (lowerMessage.includes('deadlift') || lowerMessage.includes('dead lift')) {
    return "The Deadlift is the king of compound exercises - it works your entire posterior chain (hamstrings, glutes, lower back, traps) and builds incredible functional strength! Here's proper form: Stand with feet hip-width apart, bar over mid-foot. Hinge at your hips and bend your knees slightly, keeping your back straight and chest up. Grip the bar just outside your legs (overhand or mixed grip for heavy weights). Drive through your heels, extend your hips and knees simultaneously, keeping the bar close to your body. Stand tall at the top, squeezing your glutes. Lower with control by reversing the movement. Start with 3-5 sets of 5-8 reps. This exercise builds real-world strength and is essential for overall development! 💪"
  }
  
  // Lat Pulldown
  if (lowerMessage.includes('lat pulldown') || lowerMessage.includes('lat pull down') || lowerMessage.includes('lat pull-down')) {
    return "The Lat Pulldown is excellent for building width in your back, targeting your latissimus dorsi, rhomboids, and biceps! Sit at the machine with your thighs secured under the pads. Grip the bar wider than shoulder-width (palms facing away). Lean back slightly (about 30 degrees) and pull the bar down to your upper chest, not behind your neck. Focus on pulling with your back muscles, not just your arms - imagine squeezing your shoulder blades together. Control the weight on the way up - the negative phase is crucial for muscle growth. Aim for 3-4 sets of 10-12 reps. This exercise is perfect if pull-ups are too challenging - it's a great progression! 🎯"
  }
  
  // Shoulder Press
  if (lowerMessage.includes('shoulder press') || (lowerMessage.includes('shoulder') && lowerMessage.includes('press'))) {
    return "The Shoulder Press (also called Overhead Press) is a fundamental upper body exercise that builds strong, defined shoulders and triceps! Here's proper technique: Stand or sit with feet shoulder-width apart, core engaged. Hold the bar or dumbbells at shoulder height, palms facing forward, elbows slightly in front of the bar. Press the weight straight up, keeping your core tight and avoiding arching your back excessively. At the top, the weight should be directly over your head, not behind it. Lower with control back to shoulder height. This exercise targets your anterior and medial deltoids, triceps, and core. Start with 3-4 sets of 8-12 reps. For seated variations, use a bench with back support to focus purely on shoulder strength! 🔥"
  }
  
  // Nutrition queries
  if (lowerMessage.includes('protein') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('eat') || lowerMessage.includes('food')) {
    return "Nutrition is the foundation of fitness! Aim for lean proteins like chicken, fish, eggs, or plant-based options. Fill your plate with colorful vegetables, include whole grains, and don't forget to stay hydrated - drink plenty of water throughout the day. A balanced diet fuels your workouts and helps you recover faster! 🥗"
  }
  
  if (lowerMessage.includes('water') || lowerMessage.includes('hydrate') || lowerMessage.includes('drink')) {
    return "Hydration is crucial! Aim for about 8-10 glasses of water per day, more if you're working out. A good rule of thumb: drink water before, during, and after your workouts. If you're feeling thirsty, you're already a bit dehydrated. Keep a water bottle with you and sip throughout the day! 💧"
  }
  
  // Motivation queries
  if (lowerMessage.includes('motivation') || lowerMessage.includes('motivate') || lowerMessage.includes('encourage') || lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
    return "You're doing amazing, and I'm here to support you! Remember why you started - every workout counts, every rep matters. Progress isn't always linear, but consistency is key. You're stronger than you think, and every day you show up is a victory. Keep pushing forward - I believe in you! Let's crush those goals together! 💪✨"
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('can\'t')) {
    return "I totally get it - some days are harder than others. Listen to your body - if you're truly exhausted, rest is important too. But if it's just mental fatigue, sometimes a light workout or even a 10-minute walk can boost your energy. Remember, showing up is half the battle. You've got this! 🌟"
  }
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
    return "Hey there! I'm Gimmify, your AI fitness coach, and I'm excited to help you on your fitness journey! I can help with exercise techniques, workout plans, nutrition advice, and motivation. What would you like to know about today? Let's get started! 🎯"
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're so welcome! I'm always here to help you on your fitness journey. Keep up the amazing work - you're making great progress! Remember, every step forward counts. If you have any more questions, just ask! 💪"
  }
  
  if (lowerMessage.includes('goodbye') || lowerMessage.includes('bye') || lowerMessage.includes('see you') || lowerMessage.includes('quit')) {
    return "It was great chatting with you! Keep up the fantastic work on your fitness journey. Remember, consistency is key - you've got this! Come back anytime if you need motivation or have questions. Stay strong! 💪✨"
  }
  
  // Workout planning
  if (lowerMessage.includes('routine') || lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('workout')) {
    return "Great question! A good workout routine balances strength training, cardio, and rest. Try 3-4 days of strength training per week, 2-3 days of cardio, and at least 1-2 rest days. Focus on compound movements like squats, deadlifts, and push-ups. Start with what you can do consistently - even 20-30 minutes is better than nothing! 🎯"
  }
  
  // Weight loss/gain
  if (lowerMessage.includes('weight') || lowerMessage.includes('lose') || lowerMessage.includes('gain') || lowerMessage.includes('fat')) {
    return "Weight management is about balance! For weight loss, you need a calorie deficit - but don't go too extreme. Combine strength training with cardio, eat nutrient-dense foods, and be patient. For weight gain, focus on strength training and eat slightly above maintenance. Remember, sustainable changes beat quick fixes every time! 💪"
  }
  
  // General fitness advice
  return "That's a great question! For the best personalized advice, I'd recommend combining what you learn here with consulting a fitness professional. But remember - consistency, proper form, and listening to your body are the foundations of any fitness journey. Keep pushing forward, stay patient, and celebrate your progress along the way! You're doing great! 🌟"
}

// Enhanced OpenAI API call for comprehensive, knowledgeable responses
async function getAIResponse(message: string, conversationHistory: any[] = []): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.log('OpenAI API key not found - using fallback responses')
    return null
  }
  
  try {
    // Build conversation context with system prompt
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ]
    
    // Try GPT-4 first for best quality, fallback to GPT-3.5-turbo
    const models = ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo']
    let lastError = null
    
    for (const model of models) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7, // Balanced creativity and accuracy
            max_tokens: 500, // Increased for more comprehensive answers
            top_p: 0.9,
            frequency_penalty: 0.3, // Encourage diverse, comprehensive responses
            presence_penalty: 0.3
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          lastError = errorData.error?.message || `HTTP ${response.status}`
          
          // If model not available, try next one
          if (response.status === 404) {
            continue
          }
          
          // For other errors, log and try next model
          console.error(`OpenAI API error with ${model}:`, lastError)
          continue
        }
        
        const data = await response.json()
        const aiResponse = data.choices[0]?.message?.content?.trim()
        
        if (aiResponse) {
          console.log(`Successfully got response from ${model}`)
          return aiResponse
        }
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError)
        lastError = modelError
        continue
      }
    }
    
    // If all models failed, return null to use fallback
    console.error('All OpenAI models failed. Last error:', lastError)
    return null
  } catch (error) {
    console.error('OpenAI API error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, language = 'en-US', conversationHistory = [] } = body
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    // Always try OpenAI API first for comprehensive, knowledgeable responses
    const aiResponse = await getAIResponse(message, conversationHistory)
    
    if (aiResponse) {
      return NextResponse.json({
        response: aiResponse,
        type: 'ai',
        language: language,
        source: 'openai'
      })
    }
    
    // Only use fallback if OpenAI is not available
    console.log('Using fallback response - OpenAI not available')
    const fallbackResponse = getIntelligentResponse(message, conversationHistory)
    
    return NextResponse.json({
      response: fallbackResponse,
      type: 'fallback',
      language: language,
      source: 'fallback',
      note: 'For comprehensive, expert-level answers, please set OPENAI_API_KEY in your .env.local file'
    })
    
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({
      response: "I'm here to help! I'm having a small issue right now, but I'm still here for you. What would you like to know about fitness, exercises, or nutrition? 💪",
      type: 'error',
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET() {
  // Health check
  return NextResponse.json({
    status: 'ok',
    message: 'Gimmify API is running',
    hasOpenAI: !!process.env.OPENAI_API_KEY
  })
}






