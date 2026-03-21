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
GROQ_MODEL = "llama-3.3-70b-versatile"

# ═══════════════════════════════════════
# PROMPT
# ═══════════════════════════════════════

def get_prompt(resume_text):
    return f"""You are a strict, professional ATS (Applicant Tracking System) scoring engine.

TASK: Analyze the resume below and provide an accurate ATS compatibility score.

SCORING RULES — Be strict and realistic:
- keyword_relevance (0-25): Does the resume contain industry-specific keywords? Generic resumes score 10-14.
- formatting (0-20): Is the formatting ATS-friendly? Tables, images, headers reduce score.
- section_completeness (0-15): Are all sections present? (Summary, Experience, Education, Skills, Contact)
- quantification (0-15): Are achievements backed by numbers/metrics? Most resumes score 3-8 here.
- action_verbs (0-10): Does each bullet start with a strong action verb?
- grammar_clarity (0-10): Is the writing clear, concise, and error-free?
- length_density (0-5): Is the resume the right length? (1-2 pages ideal)

IMPORTANT:
- The ats_score MUST equal the sum of all breakdown scores.
- Average resumes score 45-65. Only exceptional resumes score above 80.
- Be honest and critical. Do NOT default to high scores.
- A resume with generic descriptions and no metrics should score 40-55.
- A resume with some keywords but weak quantification should score 55-70.
- Only resumes with strong keywords, metrics, and perfect formatting score 75+.

Resume to analyze:
{resume_text[:3000]}

Respond with ONLY this JSON (no other text, no markdown, no code fences):
{{"ats_score": <SUM OF ALL BREAKDOWN SCORES>, "score_breakdown": {{"keyword_relevance": <0-25>, "formatting": <0-20>, "section_completeness": <0-15>, "quantification": <0-15>, "action_verbs": <0-10>, "grammar_clarity": <0-10>, "length_density": <0-5>}}, "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"], "weaknesses": ["specific weakness 1", "specific weakness 2", "specific weakness 3"], "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"], "improved_summary": "A rewritten professional summary tailored to this person"}}"""

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
        "temperature": 0.4,
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