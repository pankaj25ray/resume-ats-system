import requests
import json
import os
import re

# ═══════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════

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
    return f"""You are a professional ATS (Applicant Tracking System) expert.
Analyze the following resume text and return ONLY a valid JSON object with no extra text, no markdown, no code fences.

Resume:
{resume_text[:3000]}

Return ONLY this exact JSON structure (no other text before or after):
{{"ats_score": 72, "score_breakdown": {{"keyword_relevance": 18, "formatting": 16, "section_completeness": 12, "quantification": 10, "action_verbs": 8, "grammar_clarity": 6, "length_density": 2}}, "strengths": ["strength 1", "strength 2", "strength 3"], "weaknesses": ["weakness 1", "weakness 2", "weakness 3"], "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"], "improved_summary": "An improved professional summary"}}

Replace the example values with your actual analysis. Return ONLY the JSON object."""

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
            {"role": "system", "content": "You are an ATS expert. You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no explanation. Just pure JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 1024
    }
    response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
    result = response.json()
    return result["choices"][0]["message"]["content"]

# ═══════════════════════════════════════
# JSON PARSER (robust)
# ═══════════════════════════════════════

def extract_json(raw_text):
    # Remove markdown code fences if present
    cleaned = raw_text.strip()
    cleaned = re.sub(r'^```json\s*', '', cleaned)
    cleaned = re.sub(r'^```\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()
    
    # Try parsing directly
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    
    # Try finding JSON object in the text
    try:
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start != -1 and end > start:
            json_str = cleaned[start:end]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    
    return None

# ═══════════════════════════════════════
# MAIN FUNCTION
# ═══════════════════════════════════════

def analyze_resume(resume_text):
    try:
        print(f"Using AI mode: {AI_MODE}")
        print(f"Groq API key present: {bool(GROQ_API_KEY)}")

        if AI_MODE == "groq":
            raw_text = analyze_with_groq(resume_text)
        else:
            raw_text = analyze_with_ollama(resume_text)

        print(f"Raw response length: {len(raw_text)}")
        print(f"Raw response preview: {raw_text[:200]}")

        # Parse JSON from response
        parsed = extract_json(raw_text)
        
        if parsed and "ats_score" in parsed:
            print(f"Successfully parsed! ATS Score: {parsed['ats_score']}")
            return parsed
        
        print("JSON parsing failed — returning fallback")
        return {
            "ats_score": 0,
            "score_breakdown": {},
            "strengths": [],
            "weaknesses": [],
            "suggestions": ["Could not parse AI response. Please try again."],
            "improved_summary": ""
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "ats_score": 0,
            "score_breakdown": {},
            "strengths": [],
            "weaknesses": [],
            "suggestions": [f"Error: {str(e)}"],
            "improved_summary": ""
        }