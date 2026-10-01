from fastapi import APIRouter, HTTPException, Body
from services.dataset_service import DatasetService
from pydantic import BaseModel
from typing import Optional, Dict, Any
import pandas as pd
from datetime import datetime
import numpy as np

router = APIRouter()

class ReportConfig(BaseModel):
    theme: Optional[str] = "system"  # "dark", "light", or "system"
    title: Optional[str] = "Dataset Analysis Report"
    subtitle: Optional[str] = None
    include_timestamps: Optional[bool] = True
    include_methodology: Optional[bool] = True
    sections: Optional[Dict[str, bool]] = None

@router.post("/{dataset_id}/reports")
async def generate_report(dataset_id: str, config: Optional[ReportConfig] = Body(default=None)):
    """
    Generates a theme-aware HTML report for the dataset based on local Pandas calculations.
    Seamlessly adapts to system dark/light mode and matches DataLens AI design aesthetics.
    """
    try:
        if config is None:
            config = ReportConfig()
            
        df = DatasetService.load_dataframe(dataset_id)
        
        rows = len(df)
        cols = len(df.columns)
        total_cells = rows * cols
        missing_count = int(df.isnull().sum().sum())
        missing_pct = round((missing_count / total_cells * 100), 2) if total_cells > 0 else 0.0
        duplicate_rows = int(df.duplicated().sum())
        
        try:
            mem_bytes = df.memory_usage(deep=True).sum()
            if mem_bytes > 1024 * 1024:
                memory_str = f"{mem_bytes / (1024 * 1024):.2f} MB"
            else:
                memory_str = f"{mem_bytes / 1024:.1f} KB"
        except Exception:
            memory_str = "N/A"

        sections = config.sections or {
            "executive": True,
            "overview": True,
            "schema": True,
            "quality": True,
            "charts": True,
            "privacy": True
        }

        # Date & Subtitle
        timestamp_str = datetime.now().strftime("%B %d, %Y • %H:%M:%S UTC")
        report_title = config.title or "Dataset Analysis Report"
        report_subtitle = config.subtitle or f"Comprehensive evaluation and schema audit ({rows:,} rows, {cols} columns)"

        # Theme class attribute
        theme_class = ""
        if config.theme == "dark":
            theme_class = "dark"
        elif config.theme == "light":
            theme_class = "light"

        # ----------------------------------------------------
        # 1. Executive Summary HTML
        # ----------------------------------------------------
        executive_html = ""
        if sections.get("executive", True):
            health_color = "var(--badge-green-text)"
            health_bg = "var(--badge-green-bg)"
            health_border = "var(--badge-green-border)"
            health_status = "Optimal"
            if missing_pct > 15 or duplicate_rows > (rows * 0.1):
                health_color = "var(--badge-red-text)"
                health_bg = "var(--badge-red-bg)"
                health_border = "var(--badge-red-border)"
                health_status = "Action Needed"
            elif missing_pct > 5 or duplicate_rows > 0:
                health_color = "var(--badge-amber-text)"
                health_bg = "var(--badge-amber-bg)"
                health_border = "var(--badge-amber-border)"
                health_status = "Moderate"

            executive_html = f"""
            <div class="report-section">
                <div class="section-header">
                    <h2 class="section-title">Executive Summary</h2>
                    <span class="status-pill" style="background: {health_bg}; color: {health_color}; border-color: {health_border};">
                        Data Health: {health_status}
                    </span>
                </div>
                <div class="card p-5">
                    <p class="summary-text">
                        This automated audit was generated locally by <strong>DataLens AI</strong>. The dataset consists of <strong>{rows:,}</strong> records distributed across <strong>{cols}</strong> attributes, encompassing a total of <strong>{total_cells:,}</strong> observed cells.
                        The dataset exhibits an overall null rate of <strong>{missing_pct}%</strong> with <strong>{duplicate_rows}</strong> duplicate rows detected.
                        {"All features have populated records without missing values." if missing_count == 0 else f"A total of {missing_count:,} missing values were detected and cataloged in the quality section below."}
                    </p>
                </div>
            </div>
            """

        # ----------------------------------------------------
        # 2. Dataset Overview KPI Cards HTML
        # ----------------------------------------------------
        overview_html = ""
        if sections.get("overview", True):
            overview_html = f"""
            <div class="report-section">
                <div class="section-header">
                    <h2 class="section-title">Dataset Overview</h2>
                </div>
                <div class="grid-4">
                    <div class="stat-card">
                        <div class="stat-label">Total Rows</div>
                        <div class="stat-value">{rows:,}</div>
                        <div class="stat-desc">Sample observation count</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Columns</div>
                        <div class="stat-value">{cols:,}</div>
                        <div class="stat-desc">Attributes & features</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Missing Values</div>
                        <div class="stat-value" style="color: {'var(--badge-red-text)' if missing_count > 0 else 'var(--badge-green-text)'}">{missing_count:,}</div>
                        <div class="stat-desc">{missing_pct}% of total cells</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Memory Footprint</div>
                        <div class="stat-value" style="color: var(--brand-accent)">{memory_str}</div>
                        <div class="stat-desc">{duplicate_rows} duplicate rows</div>
                    </div>
                </div>
            </div>
            """

        # ----------------------------------------------------
        # 3. Schema Definition Table HTML
        # ----------------------------------------------------
        schema_html = ""
        if sections.get("schema", True):
            rows_schema = []
            for idx, col_name in enumerate(df.columns, start=1):
                col_type = str(df[col_name].dtype)
                col_nulls = int(df[col_name].isnull().sum())
                col_null_pct = round((col_nulls / rows * 100), 1) if rows > 0 else 0
                col_unique = int(df[col_name].nunique())
                
                type_badge_class = "badge-blue"
                if "int" in col_type or "float" in col_type:
                    type_badge_class = "badge-blue"
                elif "datetime" in col_type:
                    type_badge_class = "badge-amber"
                elif "bool" in col_type:
                    type_badge_class = "badge-green"
                else:
                    type_badge_class = "badge-purple"

                null_badge = f'<span class="badge badge-green">0</span>' if col_nulls == 0 else f'<span class="badge badge-red">{col_nulls:,} ({col_null_pct}%)</span>'

                rows_schema.append(f"""
                <tr>
                    <td class="text-muted font-mono" style="width: 40px;">#{idx}</td>
                    <td class="font-medium text-main">{col_name}</td>
                    <td><span class="badge {type_badge_class}">{col_type}</span></td>
                    <td class="font-mono">{col_unique:,}</td>
                    <td>{null_badge}</td>
                </tr>
                """)

            schema_html = f"""
            <div class="report-section">
                <div class="section-header">
                    <h2 class="section-title">Schema & Feature Dictionary</h2>
                    <span class="text-muted text-xs font-mono">{cols} Features</span>
                </div>
                <div class="card overflow-hidden">
                    <div class="table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Feature Name</th>
                                    <th>Data Type</th>
                                    <th>Unique Values</th>
                                    <th>Missing (Nulls)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {"".join(rows_schema)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            """

        # ----------------------------------------------------
        # 4. Numeric Statistics HTML
        # ----------------------------------------------------
        stats_html = ""
        numeric_df = df.select_dtypes(include=['number'])
        if sections.get("charts", True) and not numeric_df.empty:
            stats = numeric_df.describe().round(2)
            headers = "".join([f'<th class="text-right">{c}</th>' for c in stats.columns])
            stat_rows = []
            for metric, row in stats.iterrows():
                vals = "".join([f'<td class="text-right font-mono">{val:,.2f}' if isinstance(val, (int, float)) and not np.isnan(val) else f'<td class="text-right font-mono">{val}' + '</td>' for val in row])
                stat_rows.append(f"""
                <tr>
                    <td class="font-semibold text-main uppercase text-xs tracking-wider">{metric}</td>
                    {vals}
                </tr>
                """)

            stats_html = f"""
            <div class="report-section">
                <div class="section-header">
                    <h2 class="section-title">Numeric Distribution & Summary Statistics</h2>
                    <span class="text-muted text-xs font-mono">{len(numeric_df.columns)} Numeric Features</span>
                </div>
                <div class="card overflow-hidden">
                    <div class="table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    {headers}
                                </tr>
                            </thead>
                            <tbody>
                                {"".join(stat_rows)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            """

        # ----------------------------------------------------
        # 5. Data Quality Section HTML
        # ----------------------------------------------------
        quality_html = ""
        if sections.get("quality", True):
            null_cols = df.columns[df.isnull().any()].tolist()
            if null_cols:
                null_list = "".join([
                    f'<li class="quality-item"><span class="font-medium text-main">{c}</span>: <span class="text-danger font-mono font-semibold">{int(df[c].isnull().sum()):,} missing</span> ({round(int(df[c].isnull().sum())/rows*100, 1)}%)</li>'
                    for c in null_cols
                ])
            else:
                null_list = '<li class="quality-item text-success">✓ Perfect completeness: Zero missing values across all features.</li>'

            dup_text = f"✓ No duplicate rows detected in dataset." if duplicate_rows == 0 else f"⚠️ {duplicate_rows:,} duplicate records observed in data."

            quality_html = f"""
            <div class="report-section">
                <div class="section-header">
                    <h2 class="section-title">Data Quality & Completeness Audit</h2>
                </div>
                <div class="grid-2">
                    <div class="card p-5">
                        <h3 class="card-subtitle mb-3">Missing Value Breakdown</h3>
                        <ul class="quality-list">
                            {null_list}
                        </ul>
                    </div>
                    <div class="card p-5">
                        <h3 class="card-subtitle mb-3">Integrity & Redundancy Check</h3>
                        <p class="summary-text mb-2">{dup_text}</p>
                        <p class="text-muted text-xs">Calculated by local row hash comparisons without external transmission.</p>
                    </div>
                </div>
            </div>
            """

        # ----------------------------------------------------
        # 6. Privacy & Methodology Footer HTML
        # ----------------------------------------------------
        privacy_html = ""
        if config.include_methodology and sections.get("privacy", True):
            privacy_html = f"""
            <div class="privacy-card">
                <div class="privacy-header">
                    <div class="privacy-icon">🛡️</div>
                    <div>
                        <h3 class="privacy-title">Local Privacy & Processing Guarantee</h3>
                        <p class="privacy-desc">
                            Generated natively via DataLens AI local engine using Pandas analytical routines. Raw CSV row data is never uploaded or transferred to third-party language models.
                        </p>
                    </div>
                </div>
            </div>
            """

        # Complete Document Assembly
        timestamp_badge = f'<div class="header-badge">🕒 {timestamp_str}</div>' if config.include_timestamps else ""

        html_content = f"""<!DOCTYPE html>
<html lang="en" class="{theme_class}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{report_title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {{
            color-scheme: light dark;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-mono: 'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace;
            
            /* Default: System Light */
            --bg-page: #F8F9FB;
            --bg-card: #FFFFFF;
            --bg-card-subtle: #F4F4F6;
            --bg-card-hover: #EFEFEF;
            --border-subtle: #E4E4E7;
            --border-strong: #D4D4D8;
            
            --text-main: #18181B;
            --text-secondary: #52525B;
            --text-muted: #71717A;
            
            --brand-accent: #6759E8;
            --brand-accent-bg: rgba(103, 89, 232, 0.08);
            --brand-accent-border: rgba(103, 89, 232, 0.2);
            
            --table-head-bg: #F4F4F6;
            --table-border: #E4E4E7;
            --table-hover: #F8F9FA;
            
            --badge-bg: #F4F4F6;
            --badge-text: #3F3F46;
            --badge-border: #E4E4E7;
            
            --badge-blue-bg: #EFF6FF;
            --badge-blue-text: #1D4ED8;
            --badge-blue-border: #BFDBFE;
            
            --badge-purple-bg: #FAF5FF;
            --badge-purple-text: #7E22CE;
            --badge-purple-border: #E9D5FF;
            
            --badge-green-bg: #F0FDF4;
            --badge-green-text: #15803D;
            --badge-green-border: #BBF7D0;
            
            --badge-amber-bg: #FFFBEB;
            --badge-amber-text: #B45309;
            --badge-amber-border: #FDE68A;
            
            --badge-red-bg: #FEF2F2;
            --badge-red-text: #B91C1C;
            --badge-red-border: #FECACA;
            
            --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
            --shadow-float: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
        }}

        @media (prefers-color-scheme: dark) {{
            :root:not(.light) {{
                --bg-page: #09090B;
                --bg-card: #111113;
                --bg-card-subtle: #18181B;
                --bg-card-hover: #1F1F23;
                --border-subtle: #27272A;
                --border-strong: #3F3F46;
                
                --text-main: #FAFAFA;
                --text-secondary: #A1A1AA;
                --text-muted: #71717A;
                
                --brand-accent: #7C6CF6;
                --brand-accent-bg: rgba(124, 108, 246, 0.12);
                --brand-accent-border: rgba(124, 108, 246, 0.25);
                
                --table-head-bg: #18181B;
                --table-border: #27272A;
                --table-hover: #161619;
                
                --badge-bg: #1F1F23;
                --badge-text: #D4D4D8;
                --badge-border: #27272A;
                
                --badge-blue-bg: rgba(59, 130, 246, 0.12);
                --badge-blue-text: #93C5FD;
                --badge-blue-border: rgba(59, 130, 246, 0.25);
                
                --badge-purple-bg: rgba(168, 85, 247, 0.12);
                --badge-purple-text: #D8B4FE;
                --badge-purple-border: rgba(168, 85, 247, 0.25);
                
                --badge-green-bg: rgba(34, 197, 94, 0.12);
                --badge-green-text: #86EFAC;
                --badge-green-border: rgba(34, 197, 94, 0.25);
                
                --badge-amber-bg: rgba(245, 158, 11, 0.12);
                --badge-amber-text: #FDE68A;
                --badge-amber-border: rgba(245, 158, 11, 0.25);
                
                --badge-red-bg: rgba(239, 68, 68, 0.12);
                --badge-red-text: #FCA5A5;
                --badge-red-border: rgba(239, 68, 68, 0.25);
                
                --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.35);
                --shadow-float: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
            }}
        }}

        html.dark {{
            --bg-page: #09090B;
            --bg-card: #111113;
            --bg-card-subtle: #18181B;
            --bg-card-hover: #1F1F23;
            --border-subtle: #27272A;
            --border-strong: #3F3F46;
            
            --text-main: #FAFAFA;
            --text-secondary: #A1A1AA;
            --text-muted: #71717A;
            
            --brand-accent: #7C6CF6;
            --brand-accent-bg: rgba(124, 108, 246, 0.12);
            --brand-accent-border: rgba(124, 108, 246, 0.25);
            
            --table-head-bg: #18181B;
            --table-border: #27272A;
            --table-hover: #161619;
            
            --badge-bg: #1F1F23;
            --badge-text: #D4D4D8;
            --badge-border: #27272A;
            
            --badge-blue-bg: rgba(59, 130, 246, 0.12);
            --badge-blue-text: #93C5FD;
            --badge-blue-border: rgba(59, 130, 246, 0.25);
            
            --badge-purple-bg: rgba(168, 85, 247, 0.12);
            --badge-purple-text: #D8B4FE;
            --badge-purple-border: rgba(168, 85, 247, 0.25);
            
            --badge-green-bg: rgba(34, 197, 94, 0.12);
            --badge-green-text: #86EFAC;
            --badge-green-border: rgba(34, 197, 94, 0.25);
            
            --badge-amber-bg: rgba(245, 158, 11, 0.12);
            --badge-amber-text: #FDE68A;
            --badge-amber-border: rgba(245, 158, 11, 0.25);
            
            --badge-red-bg: rgba(239, 68, 68, 0.12);
            --badge-red-text: #FCA5A5;
            --badge-red-border: rgba(239, 68, 68, 0.25);
            
            --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.35);
            --shadow-float: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }}

        html.light {{
            --bg-page: #F8F9FB;
            --bg-card: #FFFFFF;
            --bg-card-subtle: #F4F4F6;
            --bg-card-hover: #EFEFEF;
            --border-subtle: #E4E4E7;
            --border-strong: #D4D4D8;
            
            --text-main: #18181B;
            --text-secondary: #52525B;
            --text-muted: #71717A;
            
            --brand-accent: #6759E8;
            --brand-accent-bg: rgba(103, 89, 232, 0.08);
            --brand-accent-border: rgba(103, 89, 232, 0.2);
            
            --table-head-bg: #F4F4F6;
            --table-border: #E4E4E7;
            --table-hover: #F8F9FA;
            
            --badge-bg: #F4F4F6;
            --badge-text: #3F3F46;
            --badge-border: #E4E4E7;
            
            --badge-blue-bg: #EFF6FF;
            --badge-blue-text: #1D4ED8;
            --badge-blue-border: #BFDBFE;
            
            --badge-purple-bg: #FAF5FF;
            --badge-purple-text: #7E22CE;
            --badge-purple-border: #E9D5FF;
            
            --badge-green-bg: #F0FDF4;
            --badge-green-text: #15803D;
            --badge-green-border: #BBF7D0;
            
            --badge-amber-bg: #FFFBEB;
            --badge-amber-text: #B45309;
            --badge-amber-border: #FDE68A;
            
            --badge-red-bg: #FEF2F2;
            --badge-red-text: #B91C1C;
            --badge-red-border: #FECACA;
            
            --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
            --shadow-float: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }}

        body {{
            font-family: var(--font-family);
            background-color: var(--bg-page);
            color: var(--text-main);
            line-height: 1.5;
            padding: 2.5rem 1.5rem;
            -webkit-font-smoothing: antialiased;
        }}

        .report-wrapper {{
            max-width: 960px;
            margin: 0 auto;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 16px;
            box-shadow: var(--shadow-card);
            overflow: hidden;
            padding: 2.5rem;
        }}

        /* Header */
        .report-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-subtle);
            margin-bottom: 2.5rem;
            position: relative;
        }}

        .brand-pill {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--brand-accent-bg);
            border: 1px solid var(--brand-accent-border);
            color: var(--brand-accent);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 4px 10px;
            border-radius: 9999px;
            margin-bottom: 0.75rem;
        }}

        .report-title {{
            font-size: 1.85rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            color: var(--text-main);
            margin-bottom: 0.4rem;
        }}

        .report-subtitle {{
            font-size: 0.95rem;
            color: var(--text-secondary);
            max-width: 600px;
        }}

        .header-meta {{
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
        }}

        .header-badge {{
            font-size: 11px;
            font-family: var(--font-mono);
            color: var(--text-muted);
            background: var(--bg-card-subtle);
            border: 1px solid var(--border-subtle);
            padding: 4px 10px;
            border-radius: 6px;
        }}

        .theme-toggle-btn {{
            cursor: pointer;
            background: var(--bg-card-subtle);
            border: 1px solid var(--border-subtle);
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }}
        .theme-toggle-btn:hover {{
            background: var(--bg-card-hover);
            color: var(--text-main);
            border-color: var(--border-strong);
        }}

        /* Section Layouts */
        .report-section {{
            margin-bottom: 2.5rem;
        }}

        .section-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }}

        .section-title {{
            font-size: 1.15rem;
            font-weight: 700;
            letter-spacing: -0.015em;
            color: var(--text-main);
        }}

        /* Cards & Grids */
        .card {{
            background: var(--bg-card-subtle);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
        }}

        .p-5 {{ padding: 1.25rem; }}

        .grid-4 {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }}

        .grid-2 {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1rem;
        }}

        .stat-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: var(--shadow-card);
        }}

        .stat-label {{
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.35rem;
        }}

        .stat-value {{
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.02em;
            line-height: 1.2;
            margin-bottom: 0.35rem;
        }}

        .stat-desc {{
            font-size: 12px;
            color: var(--text-secondary);
        }}

        .card-subtitle {{
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--text-main);
        }}

        .summary-text {{
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.6;
        }}

        /* Table */
        .overflow-hidden {{ overflow: hidden; }}
        .table-container {{
            width: 100%;
            overflow-x: auto;
        }}

        .report-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            text-align: left;
        }}

        .report-table th {{
            background: var(--table-head-bg);
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.85rem 1rem;
            border-bottom: 1px solid var(--table-border);
        }}

        .report-table td {{
            padding: 0.85rem 1rem;
            border-bottom: 1px solid var(--table-border);
            color: var(--text-secondary);
        }}

        .report-table tbody tr:hover {{
            background: var(--table-hover);
        }}

        .report-table tbody tr:last-child td {{
            border-bottom: none;
        }}

        .text-right {{ text-align: right; }}

        /* Badges & Pills */
        .badge {{
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            font-family: var(--font-mono);
            border: 1px solid var(--badge-border);
            background: var(--badge-bg);
            color: var(--badge-text);
        }}

        .badge-blue {{
            background: var(--badge-blue-bg);
            color: var(--badge-blue-text);
            border-color: var(--badge-blue-border);
        }}

        .badge-purple {{
            background: var(--badge-purple-bg);
            color: var(--badge-purple-text);
            border-color: var(--badge-purple-border);
        }}

        .badge-green {{
            background: var(--badge-green-bg);
            color: var(--badge-green-text);
            border-color: var(--badge-green-border);
        }}

        .badge-amber {{
            background: var(--badge-amber-bg);
            color: var(--badge-amber-text);
            border-color: var(--badge-amber-border);
        }}

        .badge-red {{
            background: var(--badge-red-bg);
            color: var(--badge-red-text);
            border-color: var(--badge-red-border);
        }}

        .status-pill {{
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            border: 1px solid transparent;
        }}

        /* Quality List */
        .quality-list {{
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }}

        .quality-item {{
            font-size: 0.85rem;
            color: var(--text-secondary);
        }}

        /* Privacy Box */
        .privacy-card {{
            background: var(--brand-accent-bg);
            border: 1px solid var(--brand-accent-border);
            border-radius: 12px;
            padding: 1.25rem;
            margin-top: 2rem;
        }}

        .privacy-header {{
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }}

        .privacy-icon {{
            font-size: 1.5rem;
            line-height: 1;
        }}

        .privacy-title {{
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--brand-accent);
            margin-bottom: 0.25rem;
        }}

        .privacy-desc {{
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }}

        /* Utilities */
        .font-mono {{ font-family: var(--font-mono); }}
        .font-medium {{ font-weight: 500; }}
        .font-semibold {{ font-weight: 600; }}
        .text-main {{ color: var(--text-main); }}
        .text-muted {{ color: var(--text-muted); }}
        .text-success {{ color: var(--badge-green-text); }}
        .text-danger {{ color: var(--badge-red-text); }}
        .mb-2 {{ margin-bottom: 0.5rem; }}
        .mb-3 {{ margin-bottom: 0.75rem; }}

        @media print {{
            body {{
                background: #FFFFFF !important;
                color: #000000 !important;
                padding: 0 !important;
            }}
            .report-wrapper {{
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                max-width: 100% !important;
            }}
            .theme-toggle-btn {{ display: none !important; }}
            .card, .stat-card {{
                border: 1px solid #E5E7EB !important;
                background: #FFFFFF !important;
            }}
            .report-table th {{
                background: #F9FAFB !important;
                color: #374151 !important;
            }}
            .report-table td {{
                color: #1F2937 !important;
            }}
        }}
    </style>
</head>
<body>
    <div class="report-wrapper">
        <header class="report-header">
            <div>
                <div class="brand-pill">
                    <span>⚡ DataLens AI</span>
                    <span>•</span>
                    <span>Local Analytics</span>
                </div>
                <h1 class="report-title">{report_title}</h1>
                <p class="report-subtitle">{report_subtitle}</p>
            </div>
            <div class="header-meta">
                <button type="button" class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
                    <span id="theme-icon">🌓</span> <span id="theme-label">Theme</span>
                </button>
                {timestamp_badge}
            </div>
        </header>

        {executive_html}
        {overview_html}
        {schema_html}
        {stats_html}
        {quality_html}
        {privacy_html}
    </div>

    <script>
        function updateThemeButton() {{
            const isDark = document.documentElement.classList.contains('dark') || 
                (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
            const icon = document.getElementById('theme-icon');
            const label = document.getElementById('theme-label');
            if (icon && label) {{
                icon.textContent = isDark ? '🌙' : '☀️';
                label.textContent = isDark ? 'Dark' : 'Light';
            }}
        }}

        function toggleTheme() {{
            const isDark = document.documentElement.classList.contains('dark') || 
                (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.remove('dark', 'light');
            document.documentElement.classList.add(isDark ? 'light' : 'dark');
            updateThemeButton();
        }}

        // Listen for postMessage from parent app (e.g. DataLens AI UI)
        window.addEventListener('message', function(event) {{
            if (event.data && event.data.type === 'SET_THEME') {{
                document.documentElement.classList.remove('dark', 'light');
                if (event.data.theme === 'dark' || event.data.theme === 'light') {{
                    document.documentElement.classList.add(event.data.theme);
                }}
                updateThemeButton();
            }}
        }});

        // Listen for system theme changes if no explicit class set
        if (window.matchMedia) {{
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {{
                if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {{
                    updateThemeButton();
                }}
            }});
        }}

        updateThemeButton();
    </script>
</body>
</html>
        """
        return {"report_html": html_content}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

