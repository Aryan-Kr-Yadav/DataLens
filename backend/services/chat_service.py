from services.llm_service import LLMService
import pandas as pd

class ChatService:
    @staticmethod
    def handle_dataset_information(df: pd.DataFrame, question: str) -> str:
        """Handles questions about dataset metadata locally without complex LLM parsing when possible, or uses LLM just to format."""
        llm = LLMService()
        
        # Gather local metadata
        rows = len(df)
        cols = len(df.columns)
        columns_list = ", ".join(df.columns)
        numeric_cols = ", ".join(df.select_dtypes(include='number').columns)
        missing_total = int(df.isnull().sum().sum())
        
        context = f"""
Dataset Metadata:
- Total rows: {rows}
- Total columns: {cols}
- Columns: {columns_list}
- Numeric columns: {numeric_cols}
- Total missing values: {missing_total}
"""
        
        system_prompt = f"""You are DataLens AI. Answer the user's question about the dataset using ONLY the provided metadata. Keep it concise and natural.
{context}"""
        
        # We can just use the standard LLM completion for formatting the answer
        try:
            # We need a text response, but LLMService currently enforces JSON.
            # We can use the json format and ask for a 'message' key.
            res = llm.generate_json(system_prompt, question + "\nRespond with JSON containing a 'message' key.")
            return res.get("message", "I couldn't retrieve that information.")
        except:
            return f"Based on local metadata, the dataset has {rows} rows and {cols} columns."

    @staticmethod
    def handle_data_concept(question: str) -> str:
        llm = LLMService()
        system_prompt = """You are DataLens AI, a data analysis assistant. Explain the data science or statistical concept asked by the user clearly and concisely. Respond in JSON format with a 'message' key."""
        try:
            res = llm.generate_json(system_prompt, question)
            return res.get("message", "I'm sorry, I couldn't explain that concept.")
        except:
            return "A data concept was requested, but I couldn't generate the response."

    @staticmethod
    def handle_app_help(question: str) -> str:
        llm = LLMService()
        system_prompt = """You are DataLens AI. Answer the user's question about how to use the DataLens application, its features, or its privacy model.
Key facts about DataLens:
- Fully local execution using Pandas. The raw CSV is NEVER sent to any LLM.
- Only the column schema is sent to Groq/LLM to generate a Pandas query.
- Features include Ask Data (chat), Visualize (charts), Data Quality (missing values/outliers), and Reports (HTML summaries).
Respond in JSON format with a 'message' key."""
        try:
            res = llm.generate_json(system_prompt, question)
            return res.get("message", "DataLens is a privacy-first local data analysis tool.")
        except:
            return "DataLens is a privacy-first local data analysis tool."

    @staticmethod
    def handle_general_chat(question: str) -> str:
        llm = LLMService()
        system_prompt = """You are DataLens AI, a helpful data analysis assistant. Respond to the user's greeting or general question politely. Keep it short. Inform them you can help analyze datasets. Respond in JSON format with a 'message' key."""
        try:
            res = llm.generate_json(system_prompt, question)
            return res.get("message", "Hello! I am DataLens AI. How can I help you analyze your data today?")
        except:
            return "Hello! I am DataLens AI. I'm ready to help you analyze your dataset."
