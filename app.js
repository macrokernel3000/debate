const STORAGE_KEY = "yunan-cup-score-records";
const CLOUD_ENDPOINT_KEY = "yunan-cup-cloud-endpoint";
const CLOUD_ENABLED = false;
const DEFAULT_CLOUD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzzYV2pMKqdHeTf77PN-yWVLZKTGcAP2Cw7006DTrJkxSvSLzY2_mUoULmf95fXq7RmmA/exec";
const SIDES = ["affirmative", "negative"];
const SIDE_LABELS = {
  affirmative: "正方",
  negative: "反方",
};
const SCORE_FIELDS = ["speech", "question", "defense"];
const MIN_SCORE = -10;
const MAX_SCORE = 100;

const els = {
  matchPeriod: document.querySelector("#matchPeriod"),
  matchVenue: document.querySelector("#matchVenue"),
  competitionName: document.querySelector("#competitionName"),
  matchDate: document.querySelector("#matchDate"),
  matchJudge: document.querySelector("#matchJudge"),
  matchRecorder: document.querySelector("#matchRecorder"),
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
  matchRankings: document.querySelector("#matchRankings"),
  seasonRankings: document.querySelector("#seasonRankings"),
  saveStatus: document.querySelector("#saveStatus"),
  saveMatch: document.querySelector("#saveMatch"),
  resetForm: document.querySelector("#resetForm"),
  exportRecords: document.querySelector("#exportRecords"),
  exportSpreadsheet: document.querySelector("#exportSpreadsheet"),
  clearRecords: document.querySelector("#clearRecords"),
  matchSummaryList: document.querySelector("#matchSummaryList"),
  matchSummaryCount: document.querySelector("#matchSummaryCount"),
  recordsList: document.querySelector("#recordsList"),
  recordCount: document.querySelector("#recordCount"),
  rowTemplate: document.querySelector("#playerRowTemplate"),
  tabButtons: document.querySelectorAll(".tab-button"),
  appViews: document.querySelectorAll(".app-view"),
  cycleType: document.querySelector("#cycleType"),
  cycleCompetition: document.querySelector("#cycleCompetition"),
  cycleMatchSelects: document.querySelectorAll(".cycle-match-select"),
  cycleStatus: document.querySelector("#cycleStatus"),
  cycleResult: document.querySelector("#cycleResult"),
};

function formatNumber(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function numericValue(input) {
  const value = Number.parseFloat(input.value);
  if (!Number.isFinite(value)) return 0;
  return clampScore(value);
}

function boundedIntegerValue(input, fallback, min, max) {
  const value = Number.parseInt(input.value, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampScore(value) {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));
}

function normalizeScoreInput(input) {
  if (input.type !== "number" || !input.hasAttribute("max")) return;
  if (input.value === "") return;

  const clamped = clampScore(Number.parseFloat(input.value));
  if (String(clamped) !== input.value) {
    input.value = String(clamped);
  }
}

function normalizeIntegerInput(input) {
  if (input.type !== "number" || !input.hasAttribute("data-integer-range")) return;
  if (input.value === "") return;

  const min = Number.parseInt(input.min, 10);
  const max = Number.parseInt(input.max, 10);
  const value = Number.parseInt(input.value, 10);
  if (!Number.isFinite(value)) return;
  const clamped = Math.min(max, Math.max(min, value));
  if (String(clamped) !== input.value) {
    input.value = String(clamped);
  }
}

function getMatchLabel(record) {
  if (record.period && record.venue) return `時段 ${record.period}｜會場 ${record.venue}`;
  return record.matchName || "未命名場次";
}

function getMatchKey(record) {
  return `${record.competitionName || "未命名盃賽"}｜${record.period || record.matchName || "未命名時段"}｜${record.venue || "未命名會場"}`;
}

function getJudgeBallotKey(record) {
  const judge = (record.judge || "").trim();
  if (!judge) return "";
  return `${getMatchKey(record)}｜${judge}`;
}

function createRows() {
  SIDES.forEach((side) => {
    const tbody = els[`${side}Rows`];
    for (let i = 0; i < 3; i += 1) {
      const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
      row.dataset.side = side;
      row.dataset.index = String(i);
      row.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
          normalizeScoreInput(input);
          calculate();
        });
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
  const rankedPlayers = getRankedMatchPlayers(players, teams);

  if (!rankedPlayers.length) return [];
  const topScore = rankedPlayers[0].total;
  return rankedPlayers.filter((player) => player.total === topScore);
}

function getRankedMatchPlayers(players, teams) {
  return SIDES.flatMap((side) =>
    (players?.[side] || []).map((player, index) => ({
      name: player.name || `${SIDE_LABELS[side]}第 ${index + 1} 位`,
      side,
      sideLabel: SIDE_LABELS[side],
      team: teams?.[side] || SIDE_LABELS[side],
      total: Number(player.total) || 0,
    }))
  )
    .filter((player) => player.total > 0)
    .sort((a, b) => b.total - a.total || a.sideLabel.localeCompare(b.sideLabel) || a.name.localeCompare(b.name));
}

function formatBestPlayers(bestPlayers) {
  if (!bestPlayers.length) return "尚未產生";
  return bestPlayers
    .map((player) => `${player.name}（${player.sideLabel}，${formatNumber(player.total)}）`)
    .join("、");
}

function renderRankingList(list, players, formatter) {
  list.innerHTML = "";
  if (!players.length) {
    const item = document.createElement("li");
    item.textContent = "尚未產生";
    list.append(item);
    return;
  }

  players.forEach((player, index) => {
    const item = document.createElement("li");
    item.textContent = formatter(player, index);
    list.append(item);
  });
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
  const rankedPlayers = getRankedMatchPlayers(players, teams);
  els.bestPlayers.textContent = formatBestPlayers(getBestPlayers(players, teams));
  renderRankingList(els.matchRankings, rankedPlayers.slice(0, 6), (player) =>
    `${player.name}（${player.sideLabel}，${formatNumber(player.total)}）`
  );
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
  renderMatchSummaries(records);
  renderRecords();
  renderSeasonRankings(records);
  renderCycleControls(records);
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
    competitionName: els.competitionName.value.trim() || "未命名盃賽",
    period: boundedIntegerValue(els.matchPeriod, 1, 1, 8),
    venue: boundedIntegerValue(els.matchVenue, 1, 1, 20),
    matchDate: els.matchDate.value,
    judge: els.matchJudge.value.trim(),
    recorder: els.matchRecorder.value.trim(),
    note: "",
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
  const duplicateKey = getJudgeBallotKey(record);
  const duplicateIndex = duplicateKey
    ? records.findIndex((existing) => getJudgeBallotKey(existing) === duplicateKey)
    : -1;

  if (duplicateIndex >= 0) {
    const oldRecord = records[duplicateIndex];
    const confirmed = window.confirm(
      `這位裁判已經在同一時段、同一會場儲存過一張裁判表。\n\n` +
      `盃賽：${record.competitionName}\n` +
      `${getMatchLabel(record)}\n` +
      `裁判：${record.judge}\n\n` +
      `是否要用目前這張新表取代舊表？`
    );

    if (!confirmed) {
      flashStatus("已取消儲存");
      return;
    }

    record.id = oldRecord.id;
    record.replacedAt = new Date().toISOString();
  }

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

    writeRecords(upsertRecord(records, record, duplicateIndex));
  } catch (error) {
    record.cloudError = error instanceof Error ? error.message : "cloud save failed";
    writeRecords(upsertRecord(records, record, duplicateIndex));
    flashStatus("雲端儲存失敗，已保留本機紀錄");
  } finally {
    els.saveMatch.disabled = false;
    els.saveMatch.textContent = "儲存本場";
  }
}

function upsertRecord(records, record, duplicateIndex) {
  if (duplicateIndex < 0) return [record, ...records];
  return [record, ...records.filter((_, index) => index !== duplicateIndex)];
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

function exportSpreadsheet() {
  const records = readRecords();
  const exportRecords = records.length ? records : [buildMatchRecord()];
  const csv = buildSpreadsheetCsv(exportRecords);
  downloadTextFile(csv, `debate-score-records-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
  flashStatus("已匯出試算表");
}

function getCloudEndpoint() {
  if (!CLOUD_ENABLED) return "";
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
    const competitionText = record.competitionName ? `${record.competitionName}｜` : "";
    const matchLabel = getMatchLabel(record);
    const dateText = record.matchDate ? `｜${record.matchDate}` : "";
    const judgeText = record.judge ? `｜裁判：${record.judge}` : "";
    const recorderText = record.recorder ? `｜記錄員：${record.recorder}` : "";
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
          <h3>${escapeHtml(matchLabel)}</h3>
          <p class="record-meta">${escapeHtml(competitionText)}${escapeHtml(record.winner)}${escapeHtml(dateText)}${escapeHtml(judgeText)}${escapeHtml(recorderText)}</p>
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

function getMatchSummaries(records) {
  const summaries = new Map();

  records.forEach((record) => {
    const key = getMatchKey(record);
    const existing = summaries.get(key) || {
      key,
      competitionName: record.competitionName || "未命名盃賽",
      matchLabel: getMatchLabel(record),
      period: record.period || "",
      venue: record.venue || "",
      date: record.matchDate || "",
      affirmativeTeam: record.teams?.affirmative || "正方",
      negativeTeam: record.teams?.negative || "反方",
      affirmativeVotes: 0,
      negativeVotes: 0,
      unresolvedVotes: 0,
      ballots: 0,
      judges: [],
      affirmativeArgumentTotal: 0,
      negativeArgumentTotal: 0,
    };

    existing.ballots += 1;
    if (record.judge) existing.judges.push(record.judge);
    existing.affirmativeArgumentTotal += Number(record.argumentScores?.affirmative) || 0;
    existing.negativeArgumentTotal += Number(record.argumentScores?.negative) || 0;

    if (record.winner === "正方勝") {
      existing.affirmativeVotes += 1;
    } else if (record.winner === "反方勝") {
      existing.negativeVotes += 1;
    } else {
      existing.unresolvedVotes += 1;
    }

    summaries.set(key, existing);
  });

  return [...summaries.values()].sort((a, b) =>
    a.competitionName.localeCompare(b.competitionName) ||
    String(a.period).localeCompare(String(b.period), "zh-Hant", { numeric: true }) ||
    String(a.venue).localeCompare(String(b.venue), "zh-Hant", { numeric: true })
  );
}

function getSummaryWinner(summary) {
  if (summary.affirmativeVotes === summary.negativeVotes) return "尚未分出";
  return summary.affirmativeVotes > summary.negativeVotes ? "正方勝" : "反方勝";
}

function getCycleMatchCount() {
  const type = els.cycleType.value;
  if (type === "single") return 1;
  if (type === "mutual") return 2;
  return 3;
}

function renderCycleControls(records = readRecords()) {
  const summaries = getMatchSummaries(records);
  const competitions = [...new Set(summaries.map((summary) => summary.competitionName))];
  const currentCompetition = els.cycleCompetition.value;

  els.cycleCompetition.innerHTML = "";
  if (!competitions.length) {
    els.cycleCompetition.append(new Option("尚無已儲存場次", ""));
  } else {
    competitions.forEach((competition) => {
      els.cycleCompetition.append(new Option(competition, competition));
    });
    if (competitions.includes(currentCompetition)) {
      els.cycleCompetition.value = currentCompetition;
    }
  }

  renderCycleMatchOptions(summaries);
  calculateCycle();
}

function renderCycleMatchOptions(summaries = getMatchSummaries(readRecords())) {
  const competition = els.cycleCompetition.value;
  const filtered = summaries.filter((summary) => summary.competitionName === competition);
  const selectedValues = [...els.cycleMatchSelects].map((select) => select.value);
  const requiredCount = getCycleMatchCount();

  els.cycleMatchSelects.forEach((select, index) => {
    select.innerHTML = "";
    select.disabled = index >= requiredCount;
    select.append(new Option(index < requiredCount ? "請選擇場次" : "此類型不需要", ""));
    filtered.forEach((summary) => {
      const label = `${summary.matchLabel}｜${summary.affirmativeTeam} ${summary.affirmativeVotes}:${summary.negativeVotes} ${summary.negativeTeam}`;
      select.append(new Option(label, summary.key));
    });
    if (selectedValues[index] && [...select.options].some((option) => option.value === selectedValues[index])) {
      select.value = selectedValues[index];
    }
  });
}

function calculateCycle() {
  const summaries = getMatchSummaries(readRecords());
  const summaryByKey = new Map(summaries.map((summary) => [summary.key, summary]));
  const requiredCount = getCycleMatchCount();
  const selectedKeys = [...els.cycleMatchSelects]
    .slice(0, requiredCount)
    .map((select) => select.value)
    .filter(Boolean);
  const uniqueKeys = [...new Set(selectedKeys)];
  const selectedSummaries = uniqueKeys.map((key) => summaryByKey.get(key)).filter(Boolean);

  els.cycleStatus.textContent = `${selectedSummaries.length}/${requiredCount} 場`;

  if (selectedSummaries.length < requiredCount) {
    els.cycleResult.innerHTML = `<p class="empty-records">請先選滿 ${requiredCount} 場已儲存的比賽。</p>`;
    return;
  }

  const teams = new Map();
  selectedSummaries.forEach((summary) => {
    addCycleTeamResult(teams, summary.affirmativeTeam, {
      matchWin: getSummaryWinner(summary) === "正方勝" ? 1 : 0,
      ballotWins: summary.affirmativeVotes,
      argumentPoints: summary.affirmativeArgumentTotal,
    });
    addCycleTeamResult(teams, summary.negativeTeam, {
      matchWin: getSummaryWinner(summary) === "反方勝" ? 1 : 0,
      ballotWins: summary.negativeVotes,
      argumentPoints: summary.negativeArgumentTotal,
    });
  });

  const ranking = [...teams.values()].sort((a, b) =>
    b.matchWins - a.matchWins ||
    b.ballotWins - a.ballotWins ||
    b.argumentPoints - a.argumentPoints ||
    a.team.localeCompare(b.team)
  );

  renderCycleResult(ranking);
}

function addCycleTeamResult(teams, team, result) {
  const existing = teams.get(team) || {
    team,
    matchWins: 0,
    ballotWins: 0,
    argumentPoints: 0,
  };
  existing.matchWins += result.matchWin;
  existing.ballotWins += result.ballotWins;
  existing.argumentPoints += result.argumentPoints;
  teams.set(team, existing);
}

function renderCycleResult(ranking) {
  const rows = ranking.map((team, index) => `
    <tr class="${index === 0 ? "is-winner" : ""}">
      <td>${index + 1}</td>
      <td>${escapeHtml(team.team)}</td>
      <td>${team.matchWins}</td>
      <td>${team.ballotWins}</td>
      <td>${formatNumber(team.argumentPoints)}</td>
    </tr>
  `).join("");

  els.cycleResult.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>隊伍</th>
          <th>勝場數</th>
          <th>評分單張數</th>
          <th>論點分</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function switchView(viewId) {
  els.appViews.forEach((view) => {
    view.classList.toggle("is-hidden", view.id !== viewId);
  });
  els.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewId);
  });
  if (viewId === "cycleView") {
    renderCycleControls();
  }
}

function renderMatchSummaries(records = readRecords()) {
  const summaries = getMatchSummaries(records);
  els.matchSummaryCount.textContent = `${summaries.length} 場`;
  els.matchSummaryList.innerHTML = "";

  if (!summaries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-records";
    empty.textContent = "儲存裁判表後，這裡會自動統計同一場比賽的票數。";
    els.matchSummaryList.append(empty);
    return;
  }

  summaries.forEach((summary) => {
    const article = document.createElement("article");
    article.className = "match-summary";
    const winner = getSummaryWinner(summary);
    const judges = [...new Set(summary.judges)].join("、") || "未填";
    const dateText = summary.date ? `｜${summary.date}` : "";

    article.innerHTML = `
      <div>
        <h3>${escapeHtml(summary.matchLabel)}</h3>
        <p class="record-meta">${escapeHtml(summary.competitionName)}${escapeHtml(dateText)}｜裁判表 ${summary.ballots} 張｜裁判：${escapeHtml(judges)}</p>
      </div>
      <div class="summary-votes">
        <div class="${winner === "正方勝" ? "is-winner" : ""}">
          <p>${escapeHtml(summary.affirmativeTeam)}</p>
          <strong>${summary.affirmativeVotes}</strong>
          <span>單勝</span>
        </div>
        <div class="${winner === "反方勝" ? "is-winner" : ""}">
          <p>${escapeHtml(summary.negativeTeam)}</p>
          <strong>${summary.negativeVotes}</strong>
          <span>單勝</span>
        </div>
        <div>
          <p>整場結果</p>
          <strong>${escapeHtml(winner)}</strong>
          <span>${summary.unresolvedVotes ? `未決 ${summary.unresolvedVotes}` : "票數統計"}</span>
        </div>
      </div>
    `;
    els.matchSummaryList.append(article);
  });
}

function buildReportHtml(records) {
  const generatedAt = new Date().toLocaleString("zh-Hant-TW");
  const summarySections = buildReportSummaryHtml(records);
  const recordSections = records.map((record) => buildReportRecordHtml(record)).join("");
  const title = records.length === 1
    ? records[0].competitionName || "辯論比賽"
    : "辯論賽計分紀錄";

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}紀錄報表</title>
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
        <p class="eyebrow">小果仁思辨教育</p>
        <h1>${escapeHtml(title)}紀錄報表</h1>
        <p class="generated">產生時間：${escapeHtml(generatedAt)}</p>
      </header>
      ${summarySections}
      ${recordSections}
    </main>
  </body>
</html>`;
}

function buildReportSummaryHtml(records) {
  const summaries = getMatchSummaries(records);
  if (!summaries.length) return "";
  const rows = summaries.map((summary) => `<tr>
    <td>${escapeHtml(summary.competitionName)}</td>
    <td>${escapeHtml(summary.matchLabel)}</td>
    <td>${escapeHtml(summary.affirmativeTeam)}</td>
    <td class="number">${summary.affirmativeVotes}</td>
    <td>${escapeHtml(summary.negativeTeam)}</td>
    <td class="number">${summary.negativeVotes}</td>
    <td>${escapeHtml(getSummaryWinner(summary))}</td>
    <td class="number">${summary.ballots}</td>
  </tr>`).join("");

  return `<article>
    <h2>場次勝負統計</h2>
    <table>
      <thead>
        <tr>
          <th>盃賽名稱</th>
          <th>時段/會場</th>
          <th>正方</th>
          <th class="number">正方單勝</th>
          <th>反方</th>
          <th class="number">反方單勝</th>
          <th>整場結果</th>
          <th class="number">裁判表</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </article>`;
}

function buildReportRecordHtml(record) {
  const bestPlayers = record.bestPlayers?.length
    ? record.bestPlayers
    : getBestPlayers(record.players, record.teams);
  const dateText = record.matchDate ? `｜${record.matchDate}` : "";
  const judgeText = record.judge ? `｜裁判：${record.judge}` : "";
  const recorderText = record.recorder ? `｜記錄員：${record.recorder}` : "";
  const competitionText = record.competitionName ? `${record.competitionName}｜` : "";
  const affirmativeWon = record.winner === "正方勝";
  const negativeWon = record.winner === "反方勝";

  return `<article>
    <h2>${escapeHtml(getMatchLabel(record))}</h2>
    <p class="meta">${escapeHtml(competitionText)}${escapeHtml(record.winner)}${escapeHtml(dateText)}${escapeHtml(judgeText)}${escapeHtml(recorderText)}</p>
    <p class="best">單場最佳：${escapeHtml(formatBestPlayers(bestPlayers))}</p>
    ${buildReportRankingHtml(record)}
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

function buildReportRankingHtml(record) {
  const rankedPlayers = getRankedMatchPlayers(record.players, record.teams).slice(0, 6);
  if (!rankedPlayers.length) return "";
  const items = rankedPlayers
    .map((player) => `<li>${escapeHtml(player.name)}（${escapeHtml(player.sideLabel)}，${formatNumber(player.total)}）</li>`)
    .join("");
  return `<ol class="best">${items}</ol>`;
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

function buildSpreadsheetCsv(records) {
  const summariesByKey = new Map(getMatchSummaries(records).map((summary) => [summary.key, summary]));
  const rows = [[
    "盃賽名稱",
    "時段",
    "會場",
    "日期",
    "裁判",
    "記錄員",
    "勝方",
    "正方單勝",
    "反方單勝",
    "整場結果",
    "裁判表數",
    "正方隊伍",
    "反方隊伍",
    "正方論點分",
    "反方論點分",
    "正方總分",
    "反方總分",
    "單場最佳",
    "單場排名",
    "單場名次分",
    "方別",
    "隊伍",
    "選手序號",
    "選手姓名",
    "申論",
    "質詢",
    "答辯",
    "個人總分",
    "選手備註",
  ]];

  records.forEach((record) => {
    const rankByPlayerKey = getMatchRankingMap(record);
    const summaryKey = getMatchKey(record);
    const matchSummary = summariesByKey.get(summaryKey);
    SIDES.forEach((side) => {
      const sidePlayers = record.players?.[side] || [];
      const team = record.teams?.[side] || SIDE_LABELS[side];
      sidePlayers.forEach((player, index) => {
        const rankInfo = rankByPlayerKey.get(getPlayerKey(player.name, team));
        rows.push([
          record.competitionName || "",
          record.period || "",
          record.venue || "",
          record.matchDate || "",
          record.judge || "",
          record.recorder || "",
          record.winner || "",
          matchSummary?.affirmativeVotes ?? "",
          matchSummary?.negativeVotes ?? "",
          matchSummary ? getSummaryWinner(matchSummary) : "",
          matchSummary?.ballots ?? "",
          record.teams?.affirmative || "",
          record.teams?.negative || "",
          record.argumentScores?.affirmative ?? 0,
          record.argumentScores?.negative ?? 0,
          record.totals?.affirmative ?? 0,
          record.totals?.negative ?? 0,
          formatBestPlayers(record.bestPlayers?.length ? record.bestPlayers : getBestPlayers(record.players, record.teams)),
          rankInfo?.rank ?? "",
          rankInfo?.rankPoints ?? "",
          SIDE_LABELS[side],
          team,
          index + 1,
          player.name || "",
          player.speech || 0,
          player.question || 0,
          player.defense || 0,
          player.total || 0,
          player.note || "",
        ]);
      });
    });
  });

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadTextFile(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getSeasonRankings(records) {
  const players = new Map();

  records.forEach((record) => {
    const rankedPlayers = getRankedMatchPlayers(record.players, record.teams);
    rankedPlayers.forEach((player, index) => {
      const rankPoints = index + 1;
      const key = getPlayerKey(player.name, player.team);
      const existing = players.get(key) || {
        name: player.name,
        team: player.team,
        appearances: 0,
        rankPoints: 0,
        scoreTotal: 0,
        bestRank: rankPoints,
      };
      existing.appearances += 1;
      existing.rankPoints += rankPoints;
      existing.scoreTotal += player.total;
      existing.bestRank = Math.min(existing.bestRank, rankPoints);
      players.set(key, existing);
    });
  });

  return [...players.values()]
    .map((player) => ({
      ...player,
      averageRank: player.rankPoints / player.appearances,
      averageScore: player.scoreTotal / player.appearances,
    }))
    .sort((a, b) =>
      a.averageRank - b.averageRank ||
      a.rankPoints - b.rankPoints ||
      b.appearances - a.appearances ||
      b.averageScore - a.averageScore ||
      a.name.localeCompare(b.name)
    );
}

function renderSeasonRankings(records = readRecords()) {
  const activeCompetition = getActiveCompetitionName();
  const rankings = getSeasonRankings(
    records.filter((record) => (record.competitionName || "未命名盃賽") === activeCompetition)
  ).slice(0, 6);
  renderRankingList(els.seasonRankings, rankings, (player) =>
    `${player.name}（${player.team}，平均名次 ${formatNumber(player.averageRank)}，總名次分 ${formatNumber(player.rankPoints)}，${player.appearances} 場）`
  );
}

function getActiveCompetitionName() {
  return els.competitionName.value.trim() || "未命名盃賽";
}

function getPlayerKey(name, team) {
  return `${String(name || "").trim()}｜${String(team || "").trim()}`;
}

function getMatchRankingMap(record) {
  const rankings = new Map();
  getRankedMatchPlayers(record.players, record.teams).forEach((player, index) => {
    rankings.set(getPlayerKey(player.name, player.team), {
      rank: index + 1,
      rankPoints: index + 1,
    });
  });
  return rankings;
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
    input.addEventListener("input", () => {
      normalizeIntegerInput(input);
      normalizeScoreInput(input);
      calculate();
      if (input === els.competitionName) renderSeasonRankings();
    });
  });
  els.saveMatch.addEventListener("click", saveMatch);
  els.saveCloudEndpoint.addEventListener("click", saveCloudEndpoint);
  els.resetForm.addEventListener("click", resetForm);
  els.exportRecords.addEventListener("click", exportRecords);
  els.exportSpreadsheet.addEventListener("click", exportSpreadsheet);
  els.clearRecords.addEventListener("click", clearRecords);
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  els.cycleType.addEventListener("change", () => {
    renderCycleMatchOptions();
    calculateCycle();
  });
  els.cycleCompetition.addEventListener("change", () => {
    renderCycleMatchOptions();
    calculateCycle();
  });
  els.cycleMatchSelects.forEach((select) => {
    select.addEventListener("change", calculateCycle);
  });
  calculate();
  renderMatchSummaries();
  renderRecords();
  renderSeasonRankings();
  renderCycleControls();
  updateCloudStatus();
}

init();
