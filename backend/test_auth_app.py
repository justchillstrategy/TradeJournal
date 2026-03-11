import urllib.request, json
try:
    req = urllib.request.Request('http://localhost:5000/api/auth/login', data=json.dumps({'email': 'p@gmail.com', 'password': 'prajwal'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
    print("LOG:", urllib.request.urlopen(req).read().decode())
except Exception as e:
    print("LOG ERR:", e.read().decode() if hasattr(e, 'read') else str(e))
