import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))
# pyrefly: ignore [missing-import]
from services.query_validator import QueryValidator
print("Valid:", QueryValidator.validate("df[df['Age'] > 25].shape[0]"))
