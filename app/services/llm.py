import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.1:8b"

def analyze_resume(resume_text: str) -> dict:
    """Send resume to Ollama and get ATS analysis"""

    prompt = f"""
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

    try:
        print("Sending resume to Ollama... please wait")
        
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }, timeout=120)

        result = response.json()
        raw_text = result.get("response", "")

        print("Response received from Ollama ✅")

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