import os
import json
import inspect
from typing import Dict, Any, List
import httpx

# In httpx >= 0.28.0, 'proxies' was removed in favor of 'proxy'.
# Older groq SDK versions (like 0.4.2) still pass 'proxies' into httpx.Client.
# This defensive shim guarantees compatibility across any installed httpx version.
_orig_httpx_client_init = httpx.Client.__init__
if "proxies" not in inspect.signature(_orig_httpx_client_init).parameters:
    def _patched_httpx_client_init(self, *args, **kwargs):
        if "proxies" in kwargs:
            p = kwargs.pop("proxies")
            if p and "proxy" not in kwargs:
                kwargs["proxy"] = p
        return _orig_httpx_client_init(self, *args, **kwargs)
    httpx.Client.__init__ = _patched_httpx_client_init

from groq import Groq

# ============================================================
# LLM SERVICE
# Handles the direct communication with the Groq API.
# ============================================================

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or "dummy_key_for_init"
        self.base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com").rstrip("/")
        if "api.groq.com" in self.base_url:
            self.base_url = self.base_url.removesuffix("/openai/v1")
        self.model = os.getenv("GROQ_MODEL", "llama3-70b-8192") # default OSS model if not openai matching

        self.client = Groq(
            api_key=self.api_key,
            base_url=self.base_url,
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
