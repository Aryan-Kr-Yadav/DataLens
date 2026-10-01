import os
import json
from groq import Groq
from typing import Dict, Any, List

# ============================================================
# LLM SERVICE
# Handles the direct communication with the Groq API.
# ============================================================

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or "dummy_key_for_init"
        self.base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        self.model = os.getenv("GROQ_MODEL", "llama3-70b-8192") # default OSS model if not openai matching
        
        # We will use the OpenAI compatible endpoint via the Groq client if needed,
        # but Groq python SDK defaults to their production API.
        # We'll just initialize standard Groq SDK and override base URL if possible.
        self.client = Groq(
            api_key=self.api_key,
            # base_url=self.base_url # some groq sdk versions may not support overriding base_url directly this way
        )

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Calls the LLM to get a JSON response. 
        Privacy: The full DataFrame is never sent to the model. 
        Only column schema and the user's question are transmitted.
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    }
                ],
                model=self.model,
                temperature=0,
                response_format={"type": "json_object"}
            )
            
            result_str = chat_completion.choices[0].message.content
            return json.loads(result_str)
        except json.JSONDecodeError:
            # Fallback for repair can be implemented here
            raise ValueError("Failed to parse JSON response from LLM")
        except Exception as e:
            raise RuntimeError(f"LLM API Error: {str(e)}")
