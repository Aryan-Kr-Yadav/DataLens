import requests
import json

base_url = "http://localhost:8000/api/datasets"

# 1. Upload CSV
with open("sample-data/employees.csv", "rb") as f:
    files = {"file": ("employees.csv", f, "text/csv")}
    res = requests.post(f"{base_url}/upload", files=files)
    
if res.status_code != 200:
    print(f"Upload failed: {res.text}")
    exit(1)

dataset_id = res.json()["dataset_id"]
print(f"Uploaded dataset: {dataset_id}")

# 2. Get Summary
res = requests.get(f"{base_url}/{dataset_id}/summary")
print("Summary:")
print(json.dumps(res.json(), indent=2))

# 3. Ask questions
questions = [
    "What is the average salary?",
    "Who has the highest salary?",
    "How many people are older than 25?",
    "Who are the top 3 highest-paid people?"
]

for q in questions:
    print(f"\nQ: {q}")
    res = requests.post(f"{base_url}/{dataset_id}/ask", json={"question": q})
    if res.status_code == 200:
        data = res.json()
        print(f"Answer type: {data.get('answer_type')}")
        if data.get('answer_type') == 'scalar':
            print(f"Result: {data.get('scalar')}")
        elif data.get('answer_type') == 'table':
            print(f"Result rows: {len(data.get('rows', []))}")
            print(f"First row: {data.get('rows', [])[0] if data.get('rows') else None}")
        print(f"Pandas logic: {data.get('equivalent_pandas')}")
    else:
        print(f"Error: {res.text}")

