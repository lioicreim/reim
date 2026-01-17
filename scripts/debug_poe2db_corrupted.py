import requests
from bs4 import BeautifulSoup

url = "https://poe2db.tw/kr/Corrupted"
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

print(f"Total tables found: {len(soup.find_all('table'))}")

for i, table in enumerate(soup.find_all('table')[:10]):
    rows = table.find_all('tr')
    if not rows: continue
    
    header = [h.get_text(strip=True) for h in rows[0].find_all(['th', 'td'])]
    print(f"\n--- Table {i} ({len(header)} cols) ---")
    print(f"  Header: {header}")
    if len(rows) > 1:
        data = [d.get_text(strip=True) for d in rows[1].find_all('td')]
        print(f"  Data 1: {data}")
