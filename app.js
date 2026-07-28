const elements = {
  lastUpdate: document.querySelector("#lastUpdate"),
  baekseokNo2: document.querySelector("#baekseokNo2"),
  baekseokNo2Grade: document.querySelector("#baekseokNo2Grade"),
  baekseokNo2Image: document.querySelector("#baekseokNo2Image"),
  baekseokPm25: document.querySelector("#baekseokPm25"),
  baekseokPm25Grade: document.querySelector("#baekseokPm25Grade"),
  baekseokPm25Image: document.querySelector("#baekseokPm25Image"),
  no2Chart: document.querySelector("#no2Chart"),
  pm25Chart: document.querySelector("#pm25Chart"),
  statusText: document.querySelector("#statusText"),
  refreshButton: document.querySelector("#refreshButton"),
};

const chartColors = {
  baekseok: "#315fcb",
  susin: "#d17b2f",
  grid: "#dbe4de",
  text: "#18201d",
  muted: "#66736d",
};

const gradeImages = {
  good: "./image/verygood.png",
  normal: "./image/good.png",
  bad: "./image/bad.png",
  veryBad: "./image/verybad.png",
  unknown: "./image/good.png",
};

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function compactTimeLabel(dataTime) {
  if (!dataTime) return "";
  const match = dataTime.match(/\d{4}-(\d{2})-(\d{2})\s+(\d{2}):/);
  return match ? `${Number(match[1])}/${Number(match[2])} ${Number(match[3])}시` : dataTime;
}

function formatKoreanDateTime(dataTime) {
  if (!dataTime) return "-년 -월 -일 -시";
  const match = dataTime.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return dataTime;
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일 ${Number(match[4])}시`;
}

function getPm25Grade(value) {
  if (value === null) return { key: "unknown", label: "확인 불가" };
  if (value <= 15) return { key: "good", label: "좋음" };
  if (value <= 35) return { key: "normal", label: "보통" };
  if (value <= 75) return { key: "bad", label: "나쁨" };
  return { key: "veryBad", label: "매우나쁨" };
}

function getNo2Grade(value) {
  if (value === null) return { key: "unknown", label: "확인 불가" };
  if (value <= 0.03) return { key: "good", label: "좋음" };
  if (value <= 0.06) return { key: "normal", label: "보통" };
  if (value <= 0.2) return { key: "bad", label: "나쁨" };
  return { key: "veryBad", label: "매우나쁨" };
}

function updateMetricStatus({ value, unit, pollutantName, valueElement, gradeElement, imageElement, grade }) {
  valueElement.textContent = value === null ? "-" : value;
  gradeElement.textContent = grade.label;
  imageElement.src = gradeImages[grade.key];
  imageElement.alt = `${pollutantName} ${grade.label}`;
  imageElement.parentElement.dataset.grade = grade.key;
  valueElement.nextElementSibling.textContent = unit;
}

function alignSeries(baekseokItems, susinItems, key) {
  const susinByTime = new Map(susinItems.map((item) => [item.dataTime, parseNumber(item[key])]));
  return baekseokItems
    .map((item) => ({
      label: compactTimeLabel(item.dataTime),
      baekseok: parseNumber(item[key]),
      susin: susinByTime.get(item.dataTime) ?? null,
    }))
    .filter((point) => point.baekseok !== null || point.susin !== null)
    .slice(-8);
}

function drawLineChart(canvas, points, config) {
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, cssWidth, cssHeight);

  const isMobileChart = cssWidth < 520;
  const pad = isMobileChart
    ? { top: 38, right: 12, bottom: 42, left: 38 }
    : { top: 40, right: 24, bottom: 50, left: 48 };
  const width = cssWidth - pad.left - pad.right;
  const height = cssHeight - pad.top - pad.bottom;
  const values = points.flatMap((point) => [point.baekseok, point.susin]).filter((value) => value !== null);
  const maxValue = values.length ? Math.max(...values) : 1;
  const minValue = values.length ? Math.min(...values) : 0;
  const span = Math.max(maxValue - minValue, config.minSpan);
  const yMin = Math.max(0, minValue - span * 0.22);
  const yMax = maxValue + span * 0.26;
  const xStep = points.length > 1 ? width / (points.length - 1) : width;

  context.font = `${isMobileChart ? 10 : 12}px Malgun Gothic, Arial, sans-serif`;
  context.lineWidth = 1;
  context.strokeStyle = chartColors.grid;
  context.fillStyle = chartColors.muted;

  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (height / 4) * i;
    const value = yMax - ((yMax - yMin) / 4) * i;
    context.beginPath();
    context.moveTo(pad.left, y);
    context.lineTo(pad.left + width, y);
    context.stroke();
    context.fillText(config.formatTick(value), 8, y + 4);
  }

  context.strokeStyle = "#aab6af";
  context.beginPath();
  context.moveTo(pad.left, pad.top);
  context.lineTo(pad.left, pad.top + height);
  context.lineTo(pad.left + width, pad.top + height);
  context.stroke();

  function toPoint(point, index, seriesKey) {
    const raw = point[seriesKey];
    if (raw === null) return null;
    return {
      x: pad.left + xStep * index,
      y: pad.top + height - ((raw - yMin) / (yMax - yMin || 1)) * height,
    };
  }

  function drawSeries(seriesKey, color) {
    const coords = points.map((point, index) => toPoint(point, index, seriesKey));
    let started = false;
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    coords.forEach((coord) => {
      if (!coord) return;
      if (!started) {
        context.moveTo(coord.x, coord.y);
        started = true;
      } else {
        context.lineTo(coord.x, coord.y);
      }
    });
    context.stroke();
    context.fillStyle = color;
    coords.forEach((coord) => {
      if (!coord) return;
      context.beginPath();
      context.arc(coord.x, coord.y, 4, 0, Math.PI * 2);
      context.fill();
    });
  }

  drawSeries("baekseok", chartColors.baekseok);
  drawSeries("susin", chartColors.susin);

  context.font = `bold ${isMobileChart ? 11 : 12}px Malgun Gothic, Arial, sans-serif`;
  context.fillStyle = chartColors.baekseok;
  context.fillRect(pad.left, 14, 10, 10);
  context.fillText("백석동", pad.left + 16, 23);
  context.fillStyle = chartColors.susin;
  context.fillRect(pad.left + 78, 14, 10, 10);
  context.fillText("수신면", pad.left + 94, 23);

  context.fillStyle = chartColors.text;
  context.font = `${isMobileChart ? 9 : 11}px Malgun Gothic, Arial, sans-serif`;
  points.forEach((point, index) => {
    const x = pad.left + xStep * index;
    context.save();
    context.translate(x, pad.top + height + (isMobileChart ? 14 : 18));
    context.rotate(isMobileChart ? -0.55 : -0.35);
    context.fillText(point.label, isMobileChart ? -24 : -20, 0);
    context.restore();
  });
}

async function loadAirData() {
  elements.refreshButton.classList.add("is-loading");
  elements.statusText.textContent = "데이터를 불러오는 중...";

  try {
    const response = await fetch("/api/air", { cache: "no-store" });
    if (!response.ok) throw new Error("API 응답을 불러오지 못했습니다.");
    const data = await response.json();
    const latest = data.baekseok.items.at(-1);
    const no2Value = parseNumber(latest?.no2Value);
    const pm25Value = parseNumber(latest?.pm25Value);

    elements.lastUpdate.textContent = formatKoreanDateTime(latest?.dataTime);
    updateMetricStatus({
      value: no2Value === null ? null : latest.no2Value,
      unit: "ppm",
      pollutantName: "질소 산화물",
      valueElement: elements.baekseokNo2,
      gradeElement: elements.baekseokNo2Grade,
      imageElement: elements.baekseokNo2Image,
      grade: getNo2Grade(no2Value),
    });
    updateMetricStatus({
      value: pm25Value === null ? null : latest.pm25Value,
      unit: "㎍/㎥",
      pollutantName: "초미세먼지",
      valueElement: elements.baekseokPm25,
      gradeElement: elements.baekseokPm25Grade,
      imageElement: elements.baekseokPm25Image,
      grade: getPm25Grade(pm25Value),
    });

    drawLineChart(elements.no2Chart, alignSeries(data.baekseok.items, data.susin.items, "no2Value"), {
      minSpan: 0.01,
      formatTick: (value) => value.toFixed(3),
    });
    drawLineChart(elements.pm25Chart, alignSeries(data.baekseok.items, data.susin.items, "pm25Value"), {
      minSpan: 10,
      formatTick: (value) => Math.round(value).toString(),
    });

    elements.statusText.textContent = "API는 1시간 간격으로 업데이트 됩니다.";
  } catch (error) {
    elements.statusText.textContent = "데이터를 불러오지 못했습니다. API 키와 Vercel 환경변수를 확인해 주세요.";
    console.error(error);
  } finally {
    elements.refreshButton.classList.remove("is-loading");
  }
}

let resizeTimer;
elements.refreshButton.addEventListener("click", loadAirData);
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(loadAirData, 160);
});
loadAirData();
