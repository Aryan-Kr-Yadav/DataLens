import requests
import json

base_url = "http://localhost:8000/api"

print("1. Testing Local File Load (employees.csv)")
res = requests.post(f"{base_url}/local-files/load", json={"filename": "employees.csv"})
if res.status_code == 200:
    dataset_id = res.json()["dataset_id"]
    print(f"Loaded: {dataset_id}")
    
    questions = [
        "What is Pandas?",
        "How many rows are in the dataset?",
        "What is the average salary?",
        "Who has the highest salary?"
    ]
    
    for q in questions:
        print(f"\nAsk Data: {q}")
        ask_res = requests.post(f"{base_url}/datasets/{dataset_id}/ask", json={"question": q})
        print(ask_res.status_code, json.dumps(ask_res.json(), indent=2)[:300] + "...")
else:
    print("Failed to load dataset", res.text)
