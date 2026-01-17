import requests
from bs4 import BeautifulSoup
import json

url = "https://poe2db.tw/kr/Bows"
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

scripts = soup.find_all('script')
print(f"Total scripts found: {len(scripts)}")

for i, script in enumerate(scripts):
    content = script.string if script.string else ""
    if len(content) > 500:
        print(f"\n--- Script {i} (Length: {len(content)}) ---")
        print(content[:500] + "...")
        if 'mod' in content.lower() or 'table' in content.lower():
            print("  !!!! Likely contains data !!!!")
