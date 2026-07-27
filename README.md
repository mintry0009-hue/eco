# 백석동 대기 정보 웹페이지

백석동과 수신면의 질소 산화물(NO2), 초미세먼지(PM2.5)를 한국환경공단 에어코리아 공공데이터 API에서 가져와 보여주는 Vercel용 웹페이지입니다.

## 파일 구조

- `index.html`: 화면 구조
- `styles.css`: 사진과 비슷한 모바일 중심 레이아웃
- `app.js`: 화면 데이터 표시와 그래프 렌더링
- `api/air.js`: Vercel 서버리스 API 함수

## Vercel 배포

Vercel에서 이 폴더를 프로젝트로 연결하면 됩니다. API 키를 숨기려면 Vercel 환경변수에 `AIRKOREA_SERVICE_KEY`를 추가하세요.

```text
AIRKOREA_SERVICE_KEY=공공데이터포털_서비스키
```

환경변수를 설정하지 않아도 현재 `main.py`에 있던 키를 기본값으로 사용합니다.
