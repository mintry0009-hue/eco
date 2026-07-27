const SERVICE_KEY =
  process.env.AIRKOREA_SERVICE_KEY ||
  "f341b41a75fff847a9043475edd6be9cc7691c5740449a41bfd4d7ba03e9655a";

const ENDPOINT =
  "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";

const STATIONS = {
  baekseok: "백석동",
  susin: "수신면",
};

function buildUrl(stationName) {
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    returnType: "json",
    numOfRows: "24",
    pageNo: "1",
    stationName,
    dataTerm: "DAILY",
    ver: "1.0",
  });
  return `${ENDPOINT}?${params.toString()}`;
}

async function fetchStation(stationName) {
  const response = await fetch(buildUrl(stationName), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`${stationName} API request failed: ${response.status}`);
  }

  const data = await response.json();
  const items = data?.response?.body?.items;
  if (!Array.isArray(items)) {
    throw new Error(`${stationName} API response has no items`);
  }

  return items
    .map((item) => ({
      stationName: item.stationName,
      dataTime: item.dataTime,
      no2Value: item.no2Value,
      pm25Value: item.pm25Value,
    }))
    .reverse();
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");

  try {
    const [baekseokItems, susinItems] = await Promise.all([
      fetchStation(STATIONS.baekseok),
      fetchStation(STATIONS.susin),
    ]);

    response.status(200).json({
      source: "한국환경공단 에어코리아 공공데이터 API",
      updatedHourly: true,
      baekseok: {
        stationName: STATIONS.baekseok,
        items: baekseokItems,
      },
      susin: {
        stationName: STATIONS.susin,
        items: susinItems,
      },
    });
  } catch (error) {
    response.status(500).json({
      message: "Failed to load air quality data",
      detail: error.message,
    });
  }
};
