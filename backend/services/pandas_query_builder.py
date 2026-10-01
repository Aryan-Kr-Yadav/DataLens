from schemas.analysis import AnalysisPlan

# ============================================================
# PANDAS QUERY BUILDER
# Converts a structured AnalysisPlan into an equivalent Pandas code string
# for explainability purposes. Does NOT evaluate arbitrary code.
# ============================================================

class PandasQueryBuilder:
    @staticmethod
    def build_query_string(plan: AnalysisPlan) -> str:
        code = "df"
        
        for f in plan.filters:
            if f.operator == "==":
                code += f"[df['{f.column}'] == {repr(f.value)}]"
            elif f.operator == "!=":
                code += f"[df['{f.column}'] != {repr(f.value)}]"
            elif f.operator == ">":
                code += f"[df['{f.column}'] > {repr(f.value)}]"
            elif f.operator == "<":
                code += f"[df['{f.column}'] < {repr(f.value)}]"
            elif f.operator == ">=":
                code += f"[df['{f.column}'] >= {repr(f.value)}]"
            elif f.operator == "<=":
                code += f"[df['{f.column}'] <= {repr(f.value)}]"
            elif f.operator == "contains":
                code += f"[df['{f.column}'].str.contains({repr(f.value)}, na=False)]"
            elif f.operator == "starts_with":
                code += f"[df['{f.column}'].str.startswith({repr(f.value)}, na=False)]"
            elif f.operator == "ends_with":
                code += f"[df['{f.column}'].str.endswith({repr(f.value)}, na=False)]"
            elif f.operator == "in":
                code += f"[df['{f.column}'].isin({repr(f.value)})]"
            elif f.operator == "between":
                code += f"[df['{f.column}'].between({repr(f.value)}, {repr(f.value_end)})]"
                
        if plan.group_by:
            group_cols = plan.group_by if len(plan.group_by) > 1 else f"'{plan.group_by[0]}'"
            code += f".groupby({group_cols})"
            
            if plan.metric:
                code += f"['{plan.metric}']"
            elif plan.metrics:
                code += f"[{plan.metrics}]"
                
            if plan.aggregation:
                code += f".{plan.aggregation}()"
        else:
            if plan.aggregation and plan.metric:
                code += f"['{plan.metric}'].{plan.aggregation}()"
            elif plan.aggregation and plan.metrics:
                code += f"[{plan.metrics}].{plan.aggregation}()"
            elif plan.aggregation:
                code += f".{plan.aggregation}()"
                
        if plan.sort:
            asc = "True" if plan.sort.direction == "asc" else "False"
            if plan.group_by and not plan.metrics and plan.metric:
                code += f".sort_values(ascending={asc})"
            else:
                code += f".sort_values(by='{plan.sort.column}', ascending={asc})"
                
        if plan.limit:
            code += f".head({plan.limit})"
            
        if plan.intent == "correlation" and len(plan.metrics) == 2:
            code = f"df['{plan.metrics[0]}'].corr(df['{plan.metrics[1]}'])"
            
        return code
