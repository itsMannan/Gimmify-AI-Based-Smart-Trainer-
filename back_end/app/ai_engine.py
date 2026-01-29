import os
import httpx
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Core AI logic for Gimmify
# This file is separated from the frontend to allow for independent backend development.

# Enhanced system prompt for comprehensive, knowledgeable responses
SYSTEM_PROMPT = """You are Gimmify, an expert AI fitness coach with comprehensive knowledge about fitness, health, nutrition, exercise science, anatomy, physiology, sports medicine, and wellness. You have deep expertise like a professional personal trainer, nutritionist, and fitness expert combined.

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

Always respond as if you're a highly knowledgeable fitness professional having a natural conversation. Be comprehensive, helpful, motivating, and demonstrate your deep expertise. When asked about these key exercises, provide detailed, expert-level guidance."""

def get_intelligent_response(message: str, conversation_history: List[Dict[str, str]] = []) -> str:
    lower_message = message.lower().strip()
    
    # Exercise-related queries
    if any(keyword in lower_message for keyword in ['push', 'push-up', 'pushup']):
        return "Push-ups are fantastic for building upper body strength! Here's the key: keep your body in a straight line from head to heels, lower yourself slowly until your chest nearly touches the floor, then push back up with control. Start with 3 sets of 8-10 reps and gradually increase. Remember, quality over quantity - proper form is everything! 💪"
    
    if any(keyword in lower_message for keyword in ['squat', 'leg']):
        return "Squats are one of the best exercises for your legs and glutes! Stand with your feet shoulder-width apart, keep your chest up and back straight. Lower down as if you're sitting in a chair, going as low as you can while keeping your knees behind your toes. Aim for 3 sets of 12-15 reps. You've got this! 🔥"
    
    if any(keyword in lower_message for keyword in ['cardio', 'running', 'treadmill', 'jog']):
        return "Cardio is essential for heart health and overall fitness! Start with 20-30 minutes of moderate intensity - you should be able to hold a conversation while doing it. You can run, walk, cycle, or use the elliptical. The best cardio is the one you'll actually do consistently! Even 15-20 minutes a day makes a huge difference. 🏃‍♂️"
    
    if any(keyword in lower_message for keyword in ['plank', 'core']):
        return "Planks are amazing for core strength! Start in a push-up position, but rest on your forearms. Keep your body in a straight line - no sagging hips or raised butt. Hold for 20-30 seconds to start, and work your way up. Focus on breathing normally and engaging your core. You're building serious strength! 💪"
    
    if any(keyword in lower_message for keyword in ['pull', 'pull-up', 'chin']):
        return "Pull-ups are challenging but so rewarding! If you're just starting, use an assisted pull-up machine or resistance bands. Grip the bar slightly wider than shoulder-width, pull yourself up until your chin clears the bar, then lower with control. Even 1-2 reps is progress - keep at it! 🎯"
    
    # Chest Press
    if 'chest press' in lower_message and 'incline' not in lower_message:
        return "The Chest Press is a fantastic compound exercise for building your pectorals, anterior deltoids, and triceps! Here's how to do it right: Lie flat on the bench with your feet firmly on the floor. Grip the bar slightly wider than shoulder-width. Lower the bar to your chest with control, keeping your elbows at about 45 degrees from your body. Press up explosively but controlled, fully extending your arms without locking your elbows. Aim for 3-4 sets of 8-12 reps. Focus on controlled movement - the negative (lowering) phase is just as important as the positive! 💪"
    
    # Incline Chest Press
    if 'incline chest press' in lower_message or ('incline' in lower_message and 'chest' in lower_message):
        return "The Incline Chest Press targets your upper chest, anterior deltoids, and triceps - perfect for building that defined upper chest! Set the bench to a 30-45 degree angle. Keep your feet flat on the floor and maintain a slight arch in your back. Grip the bar at shoulder-width or slightly wider. Lower the bar to your upper chest (just below your collarbone) with control. Press up powerfully, focusing on squeezing your upper pecs at the top. The incline angle shifts emphasis to your upper chest, creating that balanced, developed look. Start with 3 sets of 8-10 reps. Remember, form over weight - control is key! 🔥"
    
    # Deadlift
    if 'deadlift' in lower_message or 'dead lift' in lower_message:
        return "The Deadlift is the king of compound exercises - it works your entire posterior chain (hamstrings, glutes, lower back, traps) and builds incredible functional strength! Here's proper form: Stand with feet hip-width apart, bar over mid-foot. Hinge at your hips and bend your knees slightly, keeping your back straight and chest up. Grip the bar just outside your legs (overhand or mixed grip for heavy weights). Drive through your heels, extend your hips and knees simultaneously, keeping the bar close to your body. Stand tall at the top, squeezing your glutes. Lower with control by reversing the movement. Start with 3-5 sets of 5-8 reps. This exercise builds real-world strength and is essential for overall development! 💪"
    
    # Lat Pulldown
    if any(keyword in lower_message for keyword in ['lat pulldown', 'lat pull down', 'lat pull-down']):
        return "The Lat Pulldown is excellent for building width in your back, targeting your latissimus dorsi, rhomboids, and biceps! Sit at the machine with your thighs secured under the pads. Grip the bar wider than shoulder-width (palms facing away). Lean back slightly (about 30 degrees) and pull the bar down to your upper chest, not behind your neck. Focus on pulling with your back muscles, not just your arms - imagine squeezing your shoulder blades together. Control the weight on the way up - the negative phase is crucial for muscle growth. Aim for 3-4 sets of 10-12 reps. This exercise is perfect if pull-ups are too challenging - it's a great progression! 🎯"
    
    # Shoulder Press
    if 'shoulder press' in lower_message or ('shoulder' in lower_message and 'press' in lower_message):
        return "The Shoulder Press (also called Overhead Press) is a fundamental upper body exercise that builds strong, defined shoulders and triceps! Here's proper technique: Stand or sit with feet shoulder-width apart, core engaged. Hold the bar or dumbbells at shoulder height, palms facing forward, elbows slightly in front of the bar. Press the weight straight up, keeping your core tight and avoiding arching your back excessively. At the top, the weight should be directly over your head, not behind it. Lower with control back to shoulder height. This exercise targets your anterior and medial deltoids, triceps, and core. Start with 3-4 sets of 8-12 reps. For seated variations, use a bench with back support to focus purely on shoulder strength! 🔥"
    
    # Nutrition queries
    if any(keyword in lower_message for keyword in ['protein', 'nutrition', 'diet', 'eat', 'food']):
        return "Nutrition is the foundation of fitness! Aim for lean proteins like chicken, fish, eggs, or plant-based options. Fill your plate with colorful vegetables, include whole grains, and don't forget to stay hydrated - drink plenty of water throughout the day. A balanced diet fuels your workouts and helps you recover faster! 🥗"
    
    if any(keyword in lower_message for keyword in ['water', 'hydrate', 'drink']):
        return "Hydration is crucial! Aim for about 8-10 glasses of water per day, more if you're working out. A good rule of thumb: drink water before, during, and after your workouts. If you're feeling thirsty, you're already a bit dehydrated. Keep a water bottle with you and sip throughout the day! 💧"
    
    # Motivation queries
    if any(keyword in lower_message for keyword in ['motivation', 'motivate', 'encourage', 'help', 'stuck']):
        return "You're doing amazing, and I'm here to support you! Remember why you started - every workout counts, every rep matters. Progress isn't always linear, but consistency is key. You're stronger than you think, and every day you show up is a victory. Keep pushing forward - I believe in you! Let's crush those goals together! 💪✨"
    
    if any(keyword in lower_message for keyword in ['tired', 'exhausted', "can't"]):
        return "I totally get it - some days are harder than others. Listen to your body - if you're truly exhausted, rest is important too. But if it's just mental fatigue, sometimes a light workout or even a 10-minute walk can boost your energy. Remember, showing up is half the battle. You've got this! 🌟"
    
    # Greetings
    if any(keyword in lower_message for keyword in ['hello', 'hi', 'hey', 'start', 'begin']):
        return "Hey there! I'm Gimmify, your AI fitness coach, and I'm excited to help you on your fitness journey! I can help with exercise techniques, workout plans, nutrition advice, and motivation. What would you like to know about today? Let's get started! 🎯"
    
    if any(keyword in lower_message for keyword in ['thank', 'thanks']):
        return "You're so welcome! I'm always here to help you on your fitness journey. Keep up the amazing work - you're making great progress! Remember, every step forward counts. If you have any more questions, just ask! 💪"
    
    if any(keyword in lower_message for keyword in ['goodbye', 'bye', 'see you', 'quit']):
        return "It was great chatting with you! Keep up the fantastic work on your fitness journey. Remember, consistency is key - you've got this! Come back anytime if you need motivation or have questions. Stay strong! 💪✨"
    
    # Workout planning
    if any(keyword in lower_message for keyword in ['routine', 'plan', 'schedule', 'workout']):
        return "Great question! A good workout routine balances strength training, cardio, and rest. Try 3-4 days of strength training per week, 2-3 days of cardio, and at least 1-2 rest days. Focus on compound movements like squats, deadlifts, and push-ups. Start with what you can do consistently - even 20-30 minutes is better than nothing! 🎯"
    
    # Weight loss/gain
    if any(keyword in lower_message for keyword in ['weight', 'lose', 'gain', 'fat']):
        return "Weight management is about balance! For weight loss, you need a calorie deficit - but don't go too extreme. Combine strength training with cardio, eat nutrient-dense foods, and be patient. For weight gain, focus on strength training and eat slightly above maintenance. Remember, sustainable changes beat quick fixes every time! 💪"
    
    # General fitness advice
    return "That's a great question! For the best personalized advice, I'd recommend combining what you learn here with consulting a fitness professional. But remember - consistency, proper form, and listening to your body are the foundations of any fitness journey. Keep pushing forward, stay patient, and celebrate your progress along the way! You're doing great! 🌟"

async def get_ai_response(message: str, conversation_history: List[Dict[str, str]] = []) -> Optional[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("OpenAI API key not found - using fallback responses")
        return None
    
    try:
        # Build conversation context with system prompt
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        # Add limited history
        messages.extend(conversation_history[-10:])
        
        # Add user message
        messages.append({"role": "user", "content": message})
        
        # Try GPT-4 first for best quality, fallback to GPT-3.5-turbo
        models = ["gpt-4", "gpt-4-turbo-preview", "gpt-3.5-turbo"]
        last_error = None
        
        async with httpx.AsyncClient() as client:
            for model in models:
                try:
                    response = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {api_key}"
                        },
                        json={
                            "model": model,
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 500,
                            "top_p": 0.9,
                            "frequency_penalty": 0.3,
                            "presence_penalty": 0.3
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code != 200:
                        error_data = response.json()
                        last_error = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
                        
                        if response.status_code == 404:
                            continue
                        
                        print(f"OpenAI API error with {model}: {last_error}")
                        continue
                    
                    data = response.json()
                    ai_response = data["choices"][0]["message"]["content"].strip()
                    
                    if ai_response:
                        print(f"Successfully got response from {model}")
                        return ai_response
                except Exception as model_error:
                    print(f"Error with model {model}: {model_error}")
                    last_error = model_error
                    continue
        
        print(f"All OpenAI models failed. Last error: {last_error}")
        return None
    except Exception as error:
        print(f"OpenAI API error: {error}")
        return None
