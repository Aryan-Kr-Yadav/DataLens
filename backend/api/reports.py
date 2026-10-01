from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from services.dataset_service import DatasetService
import pandas as pd

router = APIRouter()

@router.post("/{dataset_id}/reports")
async def generate_report(dataset_id: str):
    """
    Generates a simple HTML report for the dataset based on local Pandas calculations.
    """
    try:
        df = DatasetService.load_dataframe(dataset_id)
        
        rows = len(df)
        cols = len(df.columns)
        missing = int(df.isnull().sum().sum())
        # Generate some numeric statistics
        numeric_df = df.select_dtypes(include=['number'])
        stats_html = ""
        if not numeric_df.empty:
            stats = numeric_df.describe().round(2)
            stats_html = f"""
            <h2 class="text-xl font-bold text-zinc-100 mb-4 mt-8 border-b border-zinc-800 pb-2">Numeric Statistics</h2>
            <div class="overflow-x-auto rounded-lg border border-zinc-800">
                <table class="min-w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-zinc-900 uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800">
                        <tr>
                            <th class="px-6 py-3">Metric</th>
                            {"".join([f'<th class="px-6 py-3">{c}</th>' for c in stats.columns])}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-800 bg-zinc-950/50">
                        {"".join([
                            f'<tr class="hover:bg-zinc-800"><td class="px-6 py-4 font-medium text-zinc-200">{idx}</td>' + 
                            "".join([f'<td class="px-6 py-4 text-zinc-300">{val}</td>' for val in row]) +
                            '</tr>' 
                            for idx, row in stats.iterrows()
                        ])}
                    </tbody>
                </table>
            </div>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>DataLens AI Report</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body {{ font-family: 'Inter', system-ui, sans-serif; background-color: #09090B; }}
                    .print-break {{ page-break-before: always; }}
                </style>
            </head>
            <body class="p-8 md:p-16 max-w-5xl mx-auto bg-[#111113] shadow-2xl min-h-screen my-8 border border-zinc-800 rounded-lg text-zinc-100">
                
                <header class="mb-10 text-center border-b border-zinc-800 pb-8">
                    <h1 class="text-4xl font-extrabold text-blue-500 tracking-tight mb-2">Dataset Analysis Report</h1>
                    <p class="text-zinc-400 text-lg">Generated securely by <span class="font-semibold text-zinc-300">DataLens AI</span></p>
                </header>
                
                <section class="mb-10">
                    <h2 class="text-xl font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Dataset Overview</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-sm text-center">
                            <div class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Total Rows</div>
                            <div class="text-4xl font-black text-white">{rows:,}</div>
                        </div>
                        <div class="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-sm text-center">
                            <div class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Total Columns</div>
                            <div class="text-4xl font-black text-white">{cols:,}</div>
                        </div>
                        <div class="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-sm text-center">
                            <div class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Missing Values</div>
                            <div class="text-4xl font-black {'text-red-400' if missing > 0 else 'text-green-400'}">{missing:,}</div>
                        </div>
                    </div>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-xl font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Schema Definition</h2>
                    <div class="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
                        <table class="min-w-full text-left text-sm">
                            <thead class="bg-zinc-900 text-zinc-300 border-b border-zinc-800">
                                <tr>
                                    <th class="px-6 py-3 font-semibold">Column Name</th>
                                    <th class="px-6 py-3 font-semibold">Data Type</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-800">
                                {"".join([f'<tr class="bg-transparent hover:bg-zinc-800"><td class="px-6 py-4 font-medium text-zinc-200">{c}</td><td class="px-6 py-4 text-blue-400 font-mono text-xs">{str(df[c].dtype)}</td></tr>' for c in df.columns])}
                            </tbody>
                        </table>
                    </div>
                </section>
                
                {stats_html}
                
                <footer class="mt-16 pt-8 border-t border-zinc-800 text-sm text-zinc-400">
                    <h3 class="text-md font-bold text-zinc-300 mb-2">Privacy & Methodology</h3>
                    <p class="leading-relaxed">
                        This report was generated completely locally using Pandas. The raw CSV rows were <strong class="text-zinc-200">never transmitted</strong> to any external AI service. Only column schemas are utilized for query planning to ensure 100% data privacy.
                    </p>
                </footer>
            </body>
        </html>
        """
        return {"report_html": html_content}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
