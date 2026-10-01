from fastapi import APIRouter, HTTPException
from schemas.chat import ChatRequest
from schemas.analysis import AnalysisResult
from schemas.dataset import DatasetSchema
from services.dataset_service import DatasetService
from services.schema_service import SchemaService
from services.analysis_planner import AnalysisPlanner
from services.analysis_engine import AnalysisEngine
from services.intent_router import IntentRouter
from services.chat_service import ChatService
from schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

# ============================================================
# ANALYSIS API ROUTES
# Handles natural language questions.
# ============================================================

@router.post("/{dataset_id}/ask", response_model=ChatResponse)
async def ask_question(dataset_id: str, request: ChatRequest):
    try:
        # 1. Classify Intent
        intent = IntentRouter.classify_intent(request.question)
        
        # If no dataset is loaded
        if dataset_id == "none":
            if intent in ["GENERAL_CHAT", "DATA_CONCEPT", "APP_HELP"]:
                # Proceed without df
                pass
            else:
                return ChatResponse(
                    response_type="error",
                    message="No dataset is currently loaded. Load a CSV and I can calculate that for you."
                )
        
        df = None
        if dataset_id != "none":
            try:
                df = DatasetService.load_dataframe(dataset_id)
            except FileNotFoundError:
                return ChatResponse(response_type="error", message="Dataset not found.")
        

        # 2. Handle non-analysis intents
        if intent == "DATASET_INFORMATION":
            if df is not None:
                msg = ChatService.handle_dataset_information(df, request.question)
            else:
                msg = "No dataset loaded."
            return ChatResponse(response_type="information", message=msg)
        elif intent == "DATA_CONCEPT":
            msg = ChatService.handle_data_concept(request.question)
            return ChatResponse(response_type="information", message=msg)
        elif intent == "APP_HELP":
            msg = ChatService.handle_app_help(request.question)
            return ChatResponse(response_type="information", message=msg)
        elif intent == "GENERAL_CHAT":
            msg = ChatService.handle_general_chat(request.question)
            return ChatResponse(response_type="conversation", message=msg)
            
        # 3. Handle DATASET_ANALYSIS
        raw_schema = SchemaService.extract_schema(df)
        ai_schema = SchemaService.build_ai_schema(raw_schema, include_descriptions=True)
        
        try:
            planner = AnalysisPlanner()
            plan = planner.build_analysis_plan(ai_schema, request.question)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Planning Error: {str(e)}")
            
        try:
            result = AnalysisEngine.execute_plan(df, plan)
            if result.answer_type == "error" and "security validation" in result.error_message:
                try:
                    fallback_question = request.question + "\n\nNote: Previous generated query was rejected by security validator. Generate a simpler safe Pandas expression using only whitelisted functions."
                    plan = planner.build_analysis_plan(ai_schema, fallback_question)
                    result = AnalysisEngine.execute_plan(df, plan)
                except Exception:
                    pass
                if result.answer_type == "error" and "security validation" in result.error_message:
                    result.answer = "DataLens couldn't safely generate this analysis."
                    result.error_message = "DataLens couldn't safely generate this analysis."
            
            # Map AnalysisResult to ChatResponse
            analysis_dict = {
                "scalar": result.scalar,
                "table": result.table,
                "rows_analyzed": result.rows_analyzed,
                "columns_used": result.columns_used,
                "calculation_steps": result.calculation_steps,
                "error_message": result.error_message
            }
            
            return ChatResponse(
                response_type="analysis" if result.answer_type != "error" else "error",
                message=result.answer,
                analysis=analysis_dict,
                chart=result.chart_config,
                pandas_query=result.equivalent_pandas,
                execution_location=result.execution_location
            )
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Execution Error: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
