import requests
import json
url_B = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=f341b41a75fff847a9043475edd6be9cc7691c5740449a41bfd4d7ba03e9655a&returnType=json&numOfRows=1&pageNo=1&stationName=%EB%B0%B1%EC%84%9D%EB%8F%99&dataTerm=DAILY&ver=1.0"
url_A = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=f341b41a75fff847a9043475edd6be9cc7691c5740449a41bfd4d7ba03e9655a&returnType=json&numOfRows=1&pageNo=1&stationName=%EC%88%98%EC%8B%A0%EB%A9%B4&dataTerm=DAILY&ver=1.0"

reqB = requests.get(url_B)
reqA = requests.get(url_A)


jB = reqB.json()
jBO = json.dumps(jB)
jBToDict = json.loads(jBO)

jA = reqA.json()
jAO = json.dumps(jA)
jAToDict = json.loads(jAO)

print(jBToDict['response']['body']['items'][0]['dataTime'])
print("BS no2 value:" ,jBToDict['response']['body']['items'][0]['no2Value'])
print("BS pm25 value:" ,jBToDict['response']['body']['items'][0]['pm25Value'])
print("SS no2 value:" ,jAToDict['response']['body']['items'][0]['no2Value'])
print("SS pm25 value:" ,jAToDict['response']['body']['items'][0]['pm25Value'])
