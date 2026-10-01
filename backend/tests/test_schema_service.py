import unittest
import pandas as pd
from services.schema_service import SchemaService

class TestSchemaService(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "Name": ["Aarav", "Karan"],
            "Age": [22, 31],
            "Salary": [35000, 68000]
        })
        
    def test_extract_schema(self):
        schema = SchemaService.extract_schema(self.df)
        self.assertEqual(len(schema.columns), 3)
        
        # type checking
        types = {col.name: col.type for col in schema.columns}
        self.assertEqual(types["Name"], "string")
        self.assertEqual(types["Age"], "integer")
        self.assertEqual(types["Salary"], "integer") # could be integer or number depending on pandas version

    def test_build_ai_schema(self):
        schema = SchemaService.extract_schema(self.df)
        ai_schema = SchemaService.build_ai_schema(schema)
        
        # Privacy Check: No raw data should be in the AI schema
        schema_str = str(ai_schema)
        self.assertNotIn("Aarav", schema_str)
        self.assertNotIn("Karan", schema_str)
        self.assertNotIn("35000", schema_str)
        self.assertNotIn("68000", schema_str)
        
        self.assertIn("Name", schema_str)
        self.assertIn("Age", schema_str)
        self.assertIn("Salary", schema_str)

if __name__ == '__main__':
    unittest.main()
