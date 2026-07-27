import requests
import json
url = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=f341b41a75fff847a9043475edd6be9cc7691c5740449a41bfd4d7ba03e9655a&returnType=json&numOfRows=1&pageNo=1&stationName=%EB%B0%B1%EC%84%9D%EB%8F%99&dataTerm=DAILY&ver=1.0"

params ={'serviceKey' : 'f341b41a75fff847a9043475edd6be9cc7691c5740449a41bfd4d7ba03e9655a', 'returnType' : 'json', 'numOfRows' : '1', 'pageNo' : '1', 'searchDate' : '2026-07-27', 'InformCode' : 'NO2' }
req = requests.get(url, params=params)

j = req.json()
json_output = json.dumps(j)
jToDict = json.loads(json_output)

print(jToDict['response']['body']['items'][0]['dataTime'])
print(jToDict['response']['body']['items'][0]['no2Value'])
