import os
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase configuration
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_ANON_KEY", "")
supabase: Client = create_client(url, key)

class UserProfile(BaseModel):
    id: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: str
    gender: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    workoutFrequency: Optional[int] = None
    experienceLevel: Optional[str] = None
    injury: Optional[str] = None
    feedbackPreference: Optional[str] = None
    onboardingCompleted: bool = False

def clean_name(name: str) -> str:
    return re.sub(r'[^a-zA-Z]', '', name)

def extract_name_from_email(email: str) -> Dict[str, str]:
    if not email:
        return {"firstName": "User", "lastName": ""}
    
    prefix = email.split('@')[0]
    parts = re.split(r'[._-]', prefix)
    
    first_name = clean_name(parts[0]) if parts else "User"
    if not first_name:
        first_name = "User"
        
    last_name = " ".join([clean_name(p) for p in parts[1:] if clean_name(p)])
    
    return {"firstName": first_name, "lastName": last_name}

@router.get("/profile/{user_id}")
async def fetch_user_profile(user_id: str):
    print(f"Fetching profile for user: {user_id}")
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        data = response.data
        
        if not data:
            print(f"No profile found for user: {user_id}")
            return None
        
        data = data[0] if isinstance(data, list) and len(data) > 0 else data
        if not data:
            return None
        
        # Automatic Name Extraction logic
        first_name = data.get("first_name")
        email = data.get("email")
        
        if (not first_name or first_name == "User") and email:
            extracted = extract_name_from_email(email)
            first_name = extracted["firstName"]
            last_name = data.get("last_name") or extracted["lastName"]
            
            # Update DB immediately
            supabase.table("profiles").update({
                "first_name": first_name,
                "last_name": last_name
            }).eq("id", user_id).execute()
            
            data["first_name"] = first_name
            data["last_name"] = last_name

        return {
            "id": data.get("id"),
            "firstName": data.get("first_name") or data.get("firstName") or "User",
            "lastName": data.get("last_name") or data.get("lastName") or "",
            "email": data.get("email"),
            "gender": data.get("gender"),
            "age": data.get("age"),
            "height": data.get("height"),
            "weight": data.get("weight"),
            "workoutFrequency": data.get("workout_frequency") or data.get("workoutFrequency"),
            "experienceLevel": data.get("experience_level") or data.get("experienceLevel"),
            "injury": data.get("injury"),
            "feedbackPreference": data.get("feedback_preference") or data.get("feedbackPreference"),
            "onboardingCompleted": data.get("onboarding_completed") or data.get("onboardingCompleted", False)
        }
    except Exception as e:
        print(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile")
async def create_user_profile(profile: UserProfile):
    print(f"Creating profile for: {profile.id} ({profile.email})")
    try:
        data = {
            "id": profile.id,
            "first_name": profile.firstName,
            "last_name": profile.lastName,
            "email": profile.email,
            "onboarding_completed": False
        }
        print(f"Upserting data: {data}")
        response = supabase.table("profiles").upsert(data).execute()
        print(f"Upsert response: {response.data}")
        return response.data
    except Exception as e:
        print(f"Error creating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/profile/{user_id}")
async def update_user_profile(user_id: str, profile_update: Dict[str, Any]):
    print(f"Updating profile for user {user_id}: {profile_update}")
    try:
        # Strict mapping from Frontend (camelCase) to Database (snake_case)
        # We must NOT send keys that don't exist in the table, or Supabase will error.
        mapping = {
            "firstName": "first_name",
            "lastName": "last_name",
            "gender": "gender",
            "age": "age",
            "height": "height",
            "weight": "weight",
            "workoutFrequency": "workout_frequency",
            "experienceLevel": "experience_level",
            "injury": "injury",
            "feedbackPreference": "feedback_preference",
            "onboardingCompleted": "onboarding_completed"
        }
        
        db_update = {}
        for key, value in profile_update.items():
            # If key is in our mapping, translate it
            if key in mapping:
                db_update[mapping[key]] = value
            # Handle special case if it comes in as weeklyWorkoutFrequency
            elif key == "weeklyWorkoutFrequency":
                db_update["workout_frequency"] = value
            # If the key is ALREADY snake_case (e.g. from a raw payload), utilize it if it's a valid column
            # For safety, we only accept keys that match the values in our mapping or are clearly intended
            elif key in mapping.values():
                db_update[key] = value

        print(f"Database update payload: {db_update}")
        
        # Use UPSERT to create the profile if it doesn't exist.
        # We need to ensure 'id' is in the payload for a valid upsert.
        db_update['id'] = user_id
        
        # Note: If a column doesn't exist, Supabase might error. 
        # But we have validated our keys against the mapping now.
        response = supabase.table("profiles").upsert(db_update).execute()
            
        print(f"Database response: {response.data}")
        return response.data
    except Exception as e:
        print(f"Error updating/upserting profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))
