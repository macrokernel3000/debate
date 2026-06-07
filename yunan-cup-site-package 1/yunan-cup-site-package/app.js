const STORAGE_KEY = "yunan-cup-score-records";
const CLOUD_ENDPOINT_KEY = "yunan-cup-cloud-endpoint";
const DEFAULT_CLOUD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzzYV2pMKqdHeTf77PN-yWVLZKTGcAP2Cw7006DTrJkxSvSLzY2_mUoULmf95fXq7RmmA/exec";
const SIDES = ["affirmative", "negative"];
const SIDE_LABELS = {
  affirmative: "正方",
  negative: "反方",
};
const SCORE_FIELDS = ["speech", "question", "defense"];

const els = {
  matchName: document.querySelector("#matchName"),
  matchDate: document.querySelector("#matchDate"),
  matchNote: document.querySelector("#matchNote"),
  cloudEndpoint: document.querySelector("#cloudEndpoint"),
  cloudStatus: document.querySelector("#cloudStatus"),
  saveCloudEndpoint: document.querySelector("#saveCloudEndpoint"),
  affirmativeTeam: document.querySelector("#affirmativeTeam"),
  negativeTeam: document.querySelector("#negativeTeam"),
  affirmativeArgument: document.querySelector("#affirmativeArgument"),
  negativeArgument: document.querySelector("#negativeArgument"),
  affirmativeRows: document.querySelector("#affirmativeRows"),
  negativeRows: document.querySelector("#negativeRows"),
  affirmativeTotal: document.querySelector("#affirmativeTotal"),
  negativeTotal: document.querySelector("#negativeTotal"),
  affirmativeBadge: document.querySelector("#affirmativeBadge"),
  negativeBadge: document.querySelector("#negativeBadge"),
  winnerText: document.querySelector("#winnerText"),
  bestPlayers: document.querySelector("#bestPlayers"),
  saveStatus: document.querySelector("#saveStatus"),
  saveMatch: document.querySelector("#saveMatch"),
  resetForm: document.querySelector("#resetForm"),
  exportRecords: document.querySelector("#exportRecords"),
  clearRecords: document.querySelector("#clearRecords"),
  recordsList: document.querySelector("#recordsList"),
  recordCount: document.querySelector("#recordCount"),
  rowTemplate: document.querySelector("#playerRowTemplate"),
};

function formatNumber(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function numericValue(input) {
  return Number.parseFloat(input.value) || 0;
}

function createRows() {
  SIDES.forEach((side) => {
    const tbody = els[`${side}Rows`];
    for (let i = 0; i < 3; i += 1) {
      const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
      row.dataset.side = side;
      row.dataset.index = String(i);
      row.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", calculate);
      });
      tbody.append(row);
    }
  });
}

function getPlayers(side) {
  return [...els[`${side}Rows`].querySelectorAll("tr")].map((row) => {
    const player = {};
    row.querySelectorAll("input").forEach((input) => {
      const field = input.dataset.field;
      player[field] = SCORE_FIELDS.includes(field) ? numericValue(input) : input.value.trim();
    });
    player.total = SCORE_FIELDS.reduce((sum, field) => sum + player[field], 0);
    return player;
  });
}

function getSideTotal(side) {
  const playerTotal = getPlayers(side).reduce((sum, player) => sum + player.total, 0);
  return playerTotal + numericValue(els[`${side}Argument`]);
}

function getBestPlayers(players, teams) {
  const candidates = SIDES.flatMap((side) =>
    (players?.[side] || []).map((player, index) => ({
      name: player.name || `${SIDE_LABELS[side]}第 ${index + 1} 位`,
      side,
      sideLabel: SIDE_LABELS[side],
      team: teams?.[side] || SIDE_LABELS[side],
      total: Number(player.total) || 0,
    }))
  ).filter((player) => player.total > 0);

  if (!candidates.length) return [];
  const topScore = Math.max(...candidates.map((player) => player.total));
  return candidates.filter((player) => player.total === topScore);
}

function formatBestPlayers(bestPlayers) {
  if (!bestPlayers.length) return "尚未產生";
  return bestPlayers
    .map((player) => `${player.name}（${player.sideLabel}，${formatNumber(player.total)}）`)
    .join("、");
}

function determineWinner(affirmativeTotal, negativeTotal) {
  if (affirmativeTotal === 0 && negativeTotal === 0) return "尚未判定";
  if (affirmativeTotal === negativeTotal) return "平手";
  return affirmativeTotal > negativeTotal ? "正方勝" : "反方勝";
}

function calculate() {
  const totals = {};

  SIDES.forEach((side) => {
    let sideTotal = 0;
    els[`${side}Rows`].querySelectorAll("tr").forEach((row) => {
      const playerTotal = SCORE_FIELDS.reduce((sum, field) => {
        const input = row.querySelector(`[data-field="${field}"]`);
        return sum + numericValue(input);
      }, 0);
      row.querySelector('[data-field="total"]').value = formatNumber(playerTotal);
      sideTotal += playerTotal;
    });
    sideTotal += numericValue(els[`${side}Argument`]);
    totals[side] = sideTotal;
    els[`${side}Total`].textContent = formatNumber(sideTotal);
  });

  const winner = determineWinner(totals.affirmative, totals.negative);
  els.winnerText.textContent = winner;
  const players = {
    affirmative: getPlayers("affirmative"),
    negative: getPlayers("negative"),
  };
  const teams = {
    affirmative: els.affirmativeTeam.value.trim() || "正方",
    negative: els.negativeTeam.value.trim() || "反方",
  };
  els.bestPlayers.textContent = formatBestPlayers(getBestPlayers(players, teams));
  updateBadges(totals.affirmative, totals.negative);
}

function updateBadges(affirmativeTotal, negativeTotal) {
  const affirmativeCard = document.querySelector(".side-summary.affirmative");
  const negativeCard = document.querySelector(".side-summary.negative");
  affirmativeCard.classList.remove("is-leading");
  negativeCard.classList.remove("is-leading");

  els.affirmativeBadge.textContent = "待輸入";
  els.negativeBadge.textContent = "待輸入";

  if (affirmativeTotal === 0 && negativeTotal === 0) return;
  if (affirmativeTotal === negativeTotal) {
    els.affirmativeBadge.textContent = "平手";
    els.negativeBadge.textContent = "平手";
    return;
  }

  if (affirmativeTotal > negativeTotal) {
    affirmativeCard.classList.add("is-leading");
    els.affirmativeBadge.textContent = "領先";
    els.negativeBadge.textContent = "落後";
  } else {
    negativeCard.classList.add("is-leading");
    els.negativeBadge.textContent = "領先";
    els.affirmativeBadge.textContent = "落後";
  }
}

function readRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  renderRecords();
}

function buildMatchRecord() {
  const affirmativeTotal = getSideTotal("affirmative");
  const negativeTotal = getSideTotal("negative");
  const teams = {
    affirmative: els.affirmativeTeam.value.trim() || "正方",
    negative: els.negativeTeam.value.trim() || "反方",
  };
  const players = {
    affirmative: getPlayers("affirmative"),
    negative: getPlayers("negative"),
  };
  const bestPlayers = getBestPlayers(players, teams);

  return {
    id: crypto.randomUUID(),
    matchName: els.matchName.value.trim() || "未命名場次",
    matchDate: els.matchDate.value,
    note: els.matchNote.value.trim(),
    createdAt: new Date().toISOString(),
    teams,
    players,
    argumentScores: {
      affirmative: numericValue(els.affirmativeArgument),
      negative: numericValue(els.negativeArgument),
    },
    totals: {
      affirmative: affirmativeTotal,
      negative: negativeTotal,
    },
    winner: determineWinner(affirmativeTotal, negativeTotal),
    bestPlayers,
  };
}

async function saveMatch() {
  const records = readRecords();
  const record = buildMatchRecord();
  const endpoint = getCloudEndpoint();

  els.saveMatch.disabled = true;
  els.saveMatch.textContent = "儲存中";

  try {
    if (endpoint) {
      await saveRecordToCloud(record, endpoint);
      record.cloudSavedAt = new Date().toISOString();
      flashStatus("已送出到 Google Sheet");
    } else {
      flashStatus("尚未設定雲端，已先存本機");
    }

    records.unshift(record);
    writeRecords(records);
  } catch (error) {
    record.cloudError = error instanceof Error ? error.message : "cloud save failed";
    records.unshift(record);
    writeRecords(records);
    flashStatus("雲端儲存失敗，已保留本機紀錄");
  } finally {
    els.saveMatch.disabled = false;
    els.saveMatch.textContent = "儲存本場";
  }
}

function resetForm() {
  document.querySelectorAll("input").forEach((input) => {
    if (input.type === "date") return;
    input.value = "";
  });
  els.matchDate.value = new Date().toISOString().slice(0, 10);
  calculate();
  flashStatus("已清空輸入");
}

function deleteRecord(id) {
  writeRecords(readRecords().filter((record) => record.id !== id));
  flashStatus("已刪除一筆紀錄");
}

function clearRecords() {
  if (!readRecords().length) return;
  const confirmed = window.confirm("確定要刪除全部紀錄嗎？這個動作不能復原。");
  if (!confirmed) return;
  writeRecords([]);
  flashStatus("已刪除全部紀錄");
}

function exportRecords() {
  const savedRecords = readRecords();
  const records = savedRecords.length ? savedRecords : [buildMatchRecord()];
  openReport(records, savedRecords.length ? "已開啟全部報表" : "已開啟目前輸入報表");
}

function getCloudEndpoint() {
  return localStorage.getItem(CLOUD_ENDPOINT_KEY) || DEFAULT_CLOUD_ENDPOINT;
}

function saveCloudEndpoint() {
  const endpoint = els.cloudEndpoint.value.trim();
  if (endpoint) {
    localStorage.setItem(CLOUD_ENDPOINT_KEY, endpoint);
    flashStatus("已儲存雲端連線");
  } else {
    localStorage.removeItem(CLOUD_ENDPOINT_KEY);
    flashStatus("已清除雲端連線");
  }
  updateCloudStatus();
}

function updateCloudStatus() {
  const endpoint = getCloudEndpoint();
  els.cloudEndpoint.value = endpoint;
  els.cloudStatus.textContent = endpoint ? "已設定 Google Sheet 連線" : "尚未連線 Google Sheet";
  els.saveStatus.textContent = endpoint ? "資料會送到 Google Sheet" : "資料儲存在此瀏覽器";
}

async function saveRecordToCloud(record, endpoint) {
  const response = await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "saveMatch",
      record,
    }),
  });

  return response;
}

function exportRecord(id) {
  const record = readRecords().find((item) => item.id === id);
  if (!record) return;
  openReport([record], "已開啟單場報表");
}

function openReport(records, successMessage) {
  const reportWindow = window.open("", "_blank");
  const reportHtml = buildReportHtml(records);

  if (!reportWindow) {
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yunan-cup-report-${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(url);
    flashStatus("已匯出報表檔");
    return;
  }

  reportWindow.document.write(reportHtml);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.setTimeout(() => reportWindow.print(), 300);
  flashStatus(successMessage);
}

function renderRecords() {
  const records = readRecords();
  els.recordCount.textContent = `${records.length} 筆`;
  els.recordsList.innerHTML = "";

  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "empty-records";
    empty.textContent = "還沒有儲存的比賽。";
    els.recordsList.append(empty);
    return;
  }

  records.forEach((record) => {
    const article = document.createElement("article");
    article.className = "record";
    const dateText = record.matchDate ? `｜${record.matchDate}` : "";
    const noteText = record.note ? `｜${record.note}` : "";
    const affirmativeWon = record.winner === "正方勝";
    const negativeWon = record.winner === "反方勝";
    const affirmativeArgument = record.argumentScores?.affirmative ?? 0;
    const negativeArgument = record.argumentScores?.negative ?? 0;
    const bestPlayers = record.bestPlayers?.length
      ? record.bestPlayers
      : getBestPlayers(record.players, record.teams);

    article.innerHTML = `
      <div class="record-top">
        <div>
          <h3>${escapeHtml(record.matchName)}</h3>
          <p class="record-meta">${escapeHtml(record.winner)}${escapeHtml(dateText)}${escapeHtml(noteText)}</p>
        </div>
        <div class="record-actions">
          <button class="small-action" type="button" data-export="${record.id}">匯出</button>
          <button class="small-action" type="button" data-delete="${record.id}">刪除</button>
        </div>
      </div>
      <div class="record-result">
        <div class="record-score ${affirmativeWon ? "is-winner" : ""}">
          <p>${escapeHtml(record.teams.affirmative)}</p>
          <span>論點 ${formatNumber(affirmativeArgument)}</span>
          <strong>${formatNumber(record.totals.affirmative)}</strong>
        </div>
        <div class="record-score ${negativeWon ? "is-winner" : ""}">
          <p>${escapeHtml(record.teams.negative)}</p>
          <span>論點 ${formatNumber(negativeArgument)}</span>
          <strong>${formatNumber(record.totals.negative)}</strong>
        </div>
      </div>
      <p class="record-best">單場最佳：${escapeHtml(formatBestPlayers(bestPlayers))}</p>
    `;
    article.querySelector("[data-export]").addEventListener("click", () => exportRecord(record.id));
    article.querySelector("[data-delete]").addEventListener("click", () => deleteRecord(record.id));
    els.recordsList.append(article);
  });
}

function buildReportHtml(records) {
  const generatedAt = new Date().toLocaleString("zh-Hant-TW");
  const recordSections = records.map((record) => buildReportRecordHtml(record)).join("");

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <title>育南盃中文教育辯論比賽紀錄報表</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #17212e;
        font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
        background: #f4f7fb;
      }
      main { max-width: 1040px; margin: 0 auto; padding: 28px; }
      header { margin-bottom: 18px; }
      .eyebrow { margin: 0 0 4px; color: #8b6508; font-size: 13px; font-weight: 700; }
      h1 { margin: 0; font-size: 28px; }
      .generated { margin: 8px 0 0; color: #667085; font-size: 13px; }
      article {
        break-inside: avoid;
        margin: 18px 0;
        border: 1px solid #d9e1ea;
        border-radius: 8px;
        padding: 18px;
        background: #fff;
      }
      h2 { margin: 0; font-size: 21px; }
      .meta, .best { margin: 6px 0 0; color: #667085; }
      .summary {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        margin: 14px 0;
      }
      .box { border-radius: 8px; padding: 12px; background: #f4f7fb; }
      .box p { margin: 0; color: #667085; font-size: 13px; font-weight: 700; }
      .box strong { display: block; margin-top: 4px; font-size: 24px; }
      .winner { background: #e8f5ef; color: #11724d; }
      table { width: 100%; margin-top: 12px; border-collapse: collapse; table-layout: fixed; }
      caption { margin: 12px 0 6px; text-align: left; font-weight: 800; }
      th, td { border: 1px solid #d9e1ea; padding: 8px; text-align: left; vertical-align: top; }
      th { color: #667085; background: #f8fafc; font-size: 13px; }
      td.number, th.number { text-align: right; }
      @media print {
        body { background: #fff; }
        main { max-width: none; padding: 0; }
        article { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">育南盃中文教育辯論比賽</p>
        <h1>辯論賽計分紀錄報表</h1>
        <p class="generated">產生時間：${escapeHtml(generatedAt)}</p>
      </header>
      ${recordSections}
    </main>
  </body>
</html>`;
}

function buildReportRecordHtml(record) {
  const bestPlayers = record.bestPlayers?.length
    ? record.bestPlayers
    : getBestPlayers(record.players, record.teams);
  const dateText = record.matchDate ? `｜${record.matchDate}` : "";
  const noteText = record.note ? `｜${record.note}` : "";
  const affirmativeWon = record.winner === "正方勝";
  const negativeWon = record.winner === "反方勝";

  return `<article>
    <h2>${escapeHtml(record.matchName)}</h2>
    <p class="meta">${escapeHtml(record.winner)}${escapeHtml(dateText)}${escapeHtml(noteText)}</p>
    <p class="best">單場最佳：${escapeHtml(formatBestPlayers(bestPlayers))}</p>
    <div class="summary">
      <div class="box ${affirmativeWon ? "winner" : ""}">
        <p>${escapeHtml(record.teams.affirmative)}</p>
        <strong>${formatNumber(record.totals.affirmative)}</strong>
      </div>
      <div class="box">
        <p>結果</p>
        <strong>${escapeHtml(record.winner)}</strong>
      </div>
      <div class="box ${negativeWon ? "winner" : ""}">
        <p>${escapeHtml(record.teams.negative)}</p>
        <strong>${formatNumber(record.totals.negative)}</strong>
      </div>
    </div>
    ${buildReportTeamTable(record, "affirmative")}
    ${buildReportTeamTable(record, "negative")}
  </article>`;
}

function buildReportTeamTable(record, side) {
  const players = record.players?.[side] || [];
  const argumentScore = record.argumentScores?.[side] ?? 0;
  const teamName = record.teams?.[side] || SIDE_LABELS[side];
  const rows = players.map((player) => `<tr>
    <td>${escapeHtml(player.name || "")}</td>
    <td class="number">${formatNumber(player.speech)}</td>
    <td class="number">${formatNumber(player.question)}</td>
    <td class="number">${formatNumber(player.defense)}</td>
    <td class="number">${formatNumber(player.total)}</td>
    <td>${escapeHtml(player.note || "")}</td>
  </tr>`).join("");

  return `<table>
    <caption>${escapeHtml(SIDE_LABELS[side])}｜${escapeHtml(teamName)}｜論點 ${formatNumber(argumentScore)}</caption>
    <thead>
      <tr>
        <th>選手</th>
        <th class="number">申論</th>
        <th class="number">質詢</th>
        <th class="number">答辯</th>
        <th class="number">個人總分</th>
        <th>備註</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function flashStatus(message) {
  els.saveStatus.textContent = message;
  window.clearTimeout(flashStatus.timer);
  flashStatus.timer = window.setTimeout(() => {
    els.saveStatus.textContent = getCloudEndpoint() ? "資料會送到 Google Sheet" : "資料儲存在此瀏覽器";
  }, 1800);
}

function init() {
  createRows();
  els.matchDate.value = new Date().toISOString().slice(0, 10);
  document.querySelectorAll(".match-meta input, .panel-heading input").forEach((input) => {
    input.addEventListener("input", calculate);
  });
  els.saveMatch.addEventListener("click", saveMatch);
  els.saveCloudEndpoint.addEventListener("click", saveCloudEndpoint);
  els.resetForm.addEventListener("click", resetForm);
  els.exportRecords.addEventListener("click", exportRecords);
  els.clearRecords.addEventListener("click", clearRecords);
  calculate();
  renderRecords();
  updateCloudStatus();
}

init();
