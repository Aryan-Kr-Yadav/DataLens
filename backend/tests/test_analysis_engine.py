import unittest
import pandas as pd
from schemas.analysis import AnalysisPlan, FilterCondition, SortCondition
from services.analysis_engine import AnalysisEngine

class TestAnalysisEngine(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "Name": ["Aarav", "Karan", "Meera", "Vikram"],
            "Age": [22, 31, 29, 30],
            "Salary": [35000, 68000, 58000, 62000]
        })
        
    def test_mean_calculation(self):
        plan = AnalysisPlan(
            intent="aggregation",
            metric="Salary",
            aggregation="mean"
        )
        result = AnalysisEngine.execute_plan(self.df, plan)
        self.assertEqual(result.scalar, 55750.0)
        
    def test_sum_calculation(self):
        plan = AnalysisPlan(
            intent="aggregation",
            metric="Salary",
            aggregation="sum"
        )
        result = AnalysisEngine.execute_plan(self.df, plan)
        self.assertEqual(result.scalar, 223000)

    def test_filter_calculation(self):
        plan = AnalysisPlan(
            intent="aggregation",
            metric="Salary",
            aggregation="count",
            filters=[FilterCondition(column="Age", operator=">", value=25)]
        )
        result = AnalysisEngine.execute_plan(self.df, plan)
        self.assertEqual(result.scalar, 3) # Karan, Meera, Vikram

    def test_top_n(self):
        plan = AnalysisPlan(
            intent="top_n",
            sort=SortCondition(column="Salary", direction="desc"),
            limit=2
        )
        result = AnalysisEngine.execute_plan(self.df, plan)
        self.assertEqual(len(result.rows), 2)
        self.assertEqual(result.rows[0]["Name"], "Karan")
        self.assertEqual(result.rows[1]["Name"], "Vikram")
        
if __name__ == '__main__':
    unittest.main()
