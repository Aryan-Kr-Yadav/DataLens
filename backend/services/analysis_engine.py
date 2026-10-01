import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from schemas.analysis import AnalysisResult, GroqResponse
from services.query_validator import QueryValidator

# ============================================================
# SECURE LOCAL EXECUTION
# Validates the generated Pandas expression before executing
# it against the locally stored DataFrame.
# ============================================================

class AnalysisEngine:
    @staticmethod
    def execute_plan(df: pd.DataFrame, plan: GroqResponse) -> AnalysisResult:
        query = plan.pandas_query
        
        if not QueryValidator.validate(query):
            return AnalysisResult(
                answer="Failed to execute safely.",
                answer_type="error",
                error_message="Query failed security validation."
            )
            
        try:
            # We execute in a restricted dictionary
            restricted_globals = {
                "__builtins__": {},
                "pd": pd,
                "np": np
            }
            local_vars = {"df": df.copy()}
            
            # Using eval to get the result of the expression
            result = eval(query, restricted_globals, local_vars)
            
            answer_type = "scalar"
            scalar_val = None
            table_data = None
            columns = []
            
            if isinstance(result, (pd.DataFrame, pd.Series)):
                if isinstance(result, pd.Series):
                    result = result.reset_index()
                
                # Replace NaNs with None for JSON serialization
                result = result.where(pd.notnull(result), None)
                columns = list(result.columns)
                table_data = result.to_dict(orient="records")
                answer_type = "table"
                rows_analyzed = len(result)
            else:
                # handle numpy types
                if isinstance(result, np.integer):
                    scalar_val = int(result)
                elif isinstance(result, np.floating):
                    scalar_val = float(result)
                else:
                    scalar_val = result
                rows_analyzed = len(df)
            
            # Formulate friendly text answer
            answer_text = plan.explanation
            
            return AnalysisResult(
                answer=answer_text,
                answer_type=answer_type,
                scalar=scalar_val,
                table=table_data,
                rows_analyzed=rows_analyzed,
                columns_used=columns,
                calculation_steps=[plan.explanation],
                equivalent_pandas=query,
                execution_location="local",
                dataset_sent_to_llm=False,
                chart_config={"type": plan.chart, "x": plan.chart_x, "y": plan.chart_y} if plan.chart and plan.chart != "none" else None
            )
            
        except Exception as e:
            return AnalysisResult(
                answer="Execution Error",
                answer_type="error",
                error_message=str(e)
            )
