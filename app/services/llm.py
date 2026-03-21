import requests
import json
import os

# ═══════════════════════════════════════
# CONFIGURATION — Switch between Local and Cloud
# ═══════════════════════════════════════

# Set to "ollama" for local development, "groq" for production
AI_MODE = os.environ.get("AI_MODE", "ollama")

# Ollama (local)
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.1:8b"

# Groq (cloud — free tier)
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-70b-versatile"

# ═══════════════════════════════════════
# PROMPT
# ═══════════════════════════════════════

def get_prompt(resume_text):
    return f"""
You are a professional ATS (Applicant Tracking System) expert and career coach.
Analyze the following resume and respond ONLY with a valid JSON object.
No explanation outside the JSON. No extra text. Just the JSON.

Resume Text:
{resume_text}

Respond with exactly this JSON structure:
{{
    "ats_score": <number between 0-100>,
    "score_breakdown": {{
        "keyword_relevance": <0-25>,
        "formatting": <0-20>,
        "section_completeness": <0-15>,
        "quantification": <0-15>,
        "action_verbs": <0-10>,
        "grammar_clarity": <0-10>,
        "length_density": <0-5>
    }},
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
    "improved_summary": "A rewritten improved professional summary for this resume"
}}
"""

# ═══════════════════════════════════════
# OLLAMA (Local)
# ═══════════════════════════════════════

def analyze_with_ollama(resume_text):
    prompt = get_prompt(resume_text)
    response = requests.post(OLLAMA_URL, json={
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }, timeout=120)
    result = response.json()
    return result.get("response", "")

# ═══════════════════════════════════════
# GROQ (Cloud — Free)
# ═══════════════════════════════════════

def analyze_with_groq(resume_text):
    prompt = get_prompt(resume_text)
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an ATS expert. Respond only with valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1024
    }
    response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
    result = response.json()
    return result["choices"][0]["message"]["content"]

# ═══════════════════════════════════════
# MAIN FUNCTION
# ═══════════════════════════════════════

def analyze_resume(resume_text):
    try:
        print(f"Using AI mode: {AI_MODE}")

        if AI_MODE == "groq":
            raw_text = analyze_with_groq(resume_text)
        else:
            raw_text = analyze_with_ollama(resume_text)

        print("Response received ✅")

        # Extract JSON from response
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        json_str = raw_text[start:end]

        return json.loads(json_str)

    except json.JSONDecodeError:
        print("JSON parsing failed ❌")
        return {
            "ats_score": 0,
            "score_breakdown": {},
            "strengths": [],
            "weaknesses": [],
            "suggestions": ["Could not parse LLM response. Please try again."],
            "improved_summary": ""
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}