from services.llm_service import LLMService
import json

class IntentRouter:
    @staticmethod
    def classify_intent(question: str) -> str:
        """
        Uses the LLM to classify the user's intent.
        Possible intents:
        - DATASET_ANALYSIS: Needs Pandas query execution on the dataset.
        - DATASET_INFORMATION: Ask about metadata, number of rows/columns, column types.
        - DATA_CONCEPT: Ask about data analysis concepts (mean, standard deviation, pandas).
        - APP_HELP: Ask about DataLens app features, privacy, etc.
        - GENERAL_CHAT: Basic conversational greetings (Hello, thanks).
        """
        llm = LLMService()
        system_prompt = """You are an intent classifier for DataLens AI.
Classify the following user message into exactly one of these categories:
- DATASET_ANALYSIS: The user wants to calculate, filter, sort, chart, or analyze the actual CSV data (e.g., 'What is the average sales?', 'Show top 5 products').
- DATASET_INFORMATION: The user is asking about the dataset structure or metadata (e.g., 'How many rows?', 'What columns are there?', 'Any missing values?').
- DATA_CONCEPT: The user is asking to explain a data analysis or statistics concept (e.g., 'What is correlation?', 'What is a median?', 'What is pandas?').
- APP_HELP: The user is asking how to use the DataLens application or how it works (e.g., 'How do I load a CSV?', 'Does Groq see my data?').
- GENERAL_CHAT: The user is just saying hello, thanks, or asking general non-data questions.

Respond ONLY with a JSON object containing the key 'intent'.
Example: {"intent": "DATASET_ANALYSIS"}"""
        
        try:
            response = llm.generate_json(system_prompt, question)
            intent = response.get("intent", "DATASET_ANALYSIS")
            if intent not in ["DATASET_ANALYSIS", "DATASET_INFORMATION", "DATA_CONCEPT", "APP_HELP", "GENERAL_CHAT"]:
                return "DATASET_ANALYSIS"
            return intent
        except Exception:
            return "DATASET_ANALYSIS"  # fallback
