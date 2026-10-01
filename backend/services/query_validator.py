import ast
import re

# ============================================================
# PANDAS QUERY SECURITY
# Validates Groq-generated Pandas queries using AST.
# Rejects dangerous terms, imports, function calls, and arbitrary execution.
# ============================================================

class QueryValidator:
    SAFE_ATTRIBUTES = {
        'mean', 'sum', 'median', 'min', 'max', 'count', 'nunique',
        'nlargest', 'nsmallest', 'groupby', 'sort_values', 'head', 'tail',
        'idxmax', 'idxmin', 'value_counts', 'corr', 'isna', 'isnull',
        'notna', 'dropna', 'astype', 'str', 'contains', 'round', 'reset_index',
        'between', 'isin', 'shape', 'loc', 'iloc', 'size', 'columns', 'index',
        'values', 'T', 'apply', 'agg', 'aggregate'
    }

    BLOCKED_TERMS = [
        '__', 'import', 'open(', 'eval(', 'exec(', 'os.', 'sys.', 
        'subprocess', 'requests', 'pathlib', 'read_csv', 'read_excel',
        'to_csv', 'to_excel', 'pickle', 'system('
    ]

    @staticmethod
    def validate(query: str) -> bool:
        # Check against blocked terms textually
        for term in QueryValidator.BLOCKED_TERMS:
            if term in query:
                return False

        try:
            tree = ast.parse(query, mode='eval')
        except Exception:
            return False

        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # We only allow method calls on objects
                if not isinstance(node.func, ast.Attribute):
                    return False
                if node.func.attr not in QueryValidator.SAFE_ATTRIBUTES:
                    return False
            elif isinstance(node, ast.Attribute):
                if node.attr not in QueryValidator.SAFE_ATTRIBUTES and not node.attr.isidentifier():
                     return False
                # Disallow private attributes
                if node.attr.startswith('_'):
                    return False
            elif isinstance(node, ast.Name):
                # Allow only 'df' as the base identifier, or basic constants in calls
                if node.id not in ['df', 'True', 'False', 'None'] and not isinstance(node.ctx, ast.Load):
                    return False
            elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                return False
            elif isinstance(node, ast.Lambda):
                return False

        return True
