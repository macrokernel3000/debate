const STORAGE_KEY = "yunan-cup-score-records";
const ROSTER_STORAGE_KEY = "yunan-cup-team-rosters";
const PLAYER_GROWTH_STORAGE_KEY = "yunan-cup-player-growth-records";
const COMPETITION_MARKER_TEAM = "__COMPETITION_MARKER__";
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
const PHOTO_MAX_SIZE = 1600;
const PHOTO_QUALITY = 0.82;
const CYCLE_RANK_RULES = {
  matchWins: { label: "勝場數", direction: "desc" },
  ballotWins: { label: "評分單張數", direction: "desc" },
  argumentPoints: { label: "論點單張數", direction: "desc" },
  speakerRankPoints: { label: "辯士排名加總", direction: "asc" },
  totalScore: { label: "總分加總", direction: "desc" },
};

let currentBallotPhoto = null;
let formDirty = false;
const recordFilters = { competition: "", period: "", venue: "" };

const els = {
  matchPeriod: document.querySelector("#matchPeriod"),
  matchVenue: document.querySelector("#matchVenue"),
  competitionName: document.querySelector("#competitionName"),
  competitionNewRosterPrompt: document.querySelector("#competitionNewRosterPrompt"),
  matchDate: document.querySelector("#matchDate"),
  matchJudge: document.querySelector("#matchJudge"),
  matchRecorder: document.querySelector("#matchRecorder"),
  judgeNameOptions: document.querySelector("#judgeNameOptions"),
  recorderNameOptions: document.querySelector("#recorderNameOptions"),
  competitionNameOptions: document.querySelector("#competitionNameOptions"),
  playerNameOptions: document.querySelector("#playerNameOptions"),
  affirmativePlayerNameOptions: document.querySelector("#affirmativePlayerNameOptions"),
  negativePlayerNameOptions: document.querySelector("#negativePlayerNameOptions"),
  teamNameOptions: document.querySelector("#teamNameOptions"),
  ballotPhotoInput: document.querySelector("#ballotPhotoInput"),
  ballotPhotoStatus: document.querySelector("#ballotPhotoStatus"),
  ballotPhotoPreview: document.querySelector("#ballotPhotoPreview"),
  removeBallotPhoto: document.querySelector("#removeBallotPhoto"),
  cloudEndpoint: document.querySelector("#cloudEndpoint"),
  cloudStatus: document.querySelector("#cloudStatus"),
  saveCloudEndpoint: document.querySelector("#saveCloudEndpoint"),
  affirmativeTeam: document.querySelector("#affirmativeTeam"),
  negativeTeam: document.querySelector("#negativeTeam"),
  affirmativeArgument: document.querySelector("#affirmativeArgument"),
  negativeArgument: document.querySelector("#negativeArgument"),
  affirmativeClosing: document.querySelector("#affirmativeClosing"),
  negativeClosing: document.querySelector("#negativeClosing"),
  affirmativeRows: document.querySelector("#affirmativeRows"),
  negativeRows: document.querySelector("#negativeRows"),
  affirmativeTotal: document.querySelector("#affirmativeTotal"),
  negativeTotal: document.querySelector("#negativeTotal"),
  winnerText: document.querySelector("#winnerText"),
  bestPlayers: document.querySelector("#bestPlayers"),
  matchRankings: document.querySelector("#matchRankings"),
  seasonRankings: document.querySelector("#seasonRankings"),
  saveStatus: document.querySelector("#saveStatus"),
  saveMatch: document.querySelector("#saveMatch"),
  swapSides: document.querySelector("#swapSides"),
  resetForm: document.querySelector("#resetForm"),
  exportRecords: document.querySelector("#exportRecords"),
  exportSpreadsheet: document.querySelector("#exportSpreadsheet"),
  showSpreadsheetText: document.querySelector("#showSpreadsheetText"),
  copySpreadsheetText: document.querySelector("#copySpreadsheetText"),
  spreadsheetTextPanel: document.querySelector("#spreadsheetTextPanel"),
  spreadsheetTextOutput: document.querySelector("#spreadsheetTextOutput"),
  importSpreadsheet: document.querySelector("#importSpreadsheet"),
  importGlobalSpreadsheet: document.querySelector("#importGlobalSpreadsheet"),
  exportRosterData: document.querySelector("#exportRosterData"),
  importRosterSpreadsheet: document.querySelector("#importRosterSpreadsheet"),
  clearRecords: document.querySelector("#clearRecords"),
  matchSummaryList: document.querySelector("#matchSummaryList"),
  matchSummaryCount: document.querySelector("#matchSummaryCount"),
  exportFilteredSpreadsheet: document.querySelector("#exportFilteredSpreadsheet"),
  recordCompetitionFilter: document.querySelector("#recordCompetitionFilter"),
  recordPeriodFilter: document.querySelector("#recordPeriodFilter"),
  recordVenueFilter: document.querySelector("#recordVenueFilter"),
  clearRecordFilters: document.querySelector("#clearRecordFilters"),
  recordsList: document.querySelector("#recordsList"),
  recordCount: document.querySelector("#recordCount"),
  rowTemplate: document.querySelector("#playerRowTemplate"),
  rosterCompetition: document.querySelector("#rosterCompetition"),
  rosterTeam: document.querySelector("#rosterTeam"),
  rosterPlayers: document.querySelector("#rosterPlayers"),
  saveRosterTeam: document.querySelector("#saveRosterTeam"),
  affirmativeRosterSelect: document.querySelector("#affirmativeRosterSelect"),
  negativeRosterSelect: document.querySelector("#negativeRosterSelect"),
  loadAffirmativeRoster: document.querySelector("#loadAffirmativeRoster"),
  loadNegativeRoster: document.querySelector("#loadNegativeRoster"),
  affirmativeRosterPlayers: document.querySelector("#affirmativeRosterPlayers"),
  negativeRosterPlayers: document.querySelector("#negativeRosterPlayers"),
  affirmativeNewPlayerPrompt: document.querySelector("#affirmativeNewPlayerPrompt"),
  negativeNewPlayerPrompt: document.querySelector("#negativeNewPlayerPrompt"),
  affirmativeNewTeamPrompt: document.querySelector("#affirmativeNewTeamPrompt"),
  negativeNewTeamPrompt: document.querySelector("#negativeNewTeamPrompt"),
  rosterList: document.querySelector("#rosterList"),
  playerSelfName: document.querySelector("#playerSelfName"),
  playerSelfCompetition: document.querySelector("#playerSelfCompetition"),
  playerSelfDate: document.querySelector("#playerSelfDate"),
  playerSelfMatch: document.querySelector("#playerSelfMatch"),
  playerSelfSpeech: document.querySelector("#playerSelfSpeech"),
  playerSelfQuestion: document.querySelector("#playerSelfQuestion"),
  playerSelfDefense: document.querySelector("#playerSelfDefense"),
  playerSelfNote: document.querySelector("#playerSelfNote"),
  savePlayerSelfRecord: document.querySelector("#savePlayerSelfRecord"),
  playerGrowthTeam: document.querySelector("#playerGrowthTeam"),
  playerGrowthName: document.querySelector("#playerGrowthName"),
  playerGrowthMetric: document.querySelector("#playerGrowthMetric"),
  playerGrowthCompetition: document.querySelector("#playerGrowthCompetition"),
  playerGrowthTeamOptions: document.querySelector("#playerGrowthTeamOptions"),
  renderPlayerGrowth: document.querySelector("#renderPlayerGrowth"),
  rankingCompetition: document.querySelector("#rankingCompetition"),
  rankingMinAppearances: document.querySelector("#rankingMinAppearances"),
  rankingBestCount: document.querySelector("#rankingBestCount"),
  rankSumLeaders: document.querySelector("#rankSumLeaders"),
  speechLeaders: document.querySelector("#speechLeaders"),
  questionLeaders: document.querySelector("#questionLeaders"),
  defenseLeaders: document.querySelector("#defenseLeaders"),
  playerGameCount: document.querySelector("#playerGameCount"),
  playerLatestScore: document.querySelector("#playerLatestScore"),
  playerTrendText: document.querySelector("#playerTrendText"),
  playerStageText: document.querySelector("#playerStageText"),
  playerChartCaption: document.querySelector("#playerChartCaption"),
  playerTrendChart: document.querySelector("#playerTrendChart"),
  playerInsightText: document.querySelector("#playerInsightText"),
  playerRecordCount: document.querySelector("#playerRecordCount"),
  playerRecordsTable: document.querySelector("#playerRecordsTable"),
  tabButtons: document.querySelectorAll(".tab-button"),
  appViews: document.querySelectorAll(".app-view"),
  cycleType: document.querySelector("#cycleType"),
  cycleCompetition: document.querySelector("#cycleCompetition"),
  cycleMatchSelects: document.querySelectorAll(".cycle-match-select"),
  cycleRankSelects: document.querySelectorAll(".cycle-rank-select"),
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
  return clampScore(value, input);
}

function boundedIntegerValue(input, fallback, min, max) {
  const value = Number.parseInt(input.value, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampScore(value, input) {
  const min = input?.hasAttribute("min") ? Number.parseFloat(input.min) : MIN_SCORE;
  const max = input?.hasAttribute("max") ? Number.parseFloat(input.max) : MAX_SCORE;
  return Math.min(max, Math.max(min, value));
}

function normalizeScoreInput(input) {
  if (input.type !== "number" || !input.hasAttribute("max")) return;
  if (input.value === "") return;

  const clamped = clampScore(Number.parseFloat(input.value), input);
  if (String(clamped) !== input.value) {
    input.value = String(clamped);
  }
}

function prepareNumericInput(input) {
  if (input.type !== "number") return;
  input.autocomplete = "off";
  input.lang = "en";
  input.addEventListener("focus", () => input.select());
  input.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;
    const allowedKeys = ["Backspace", "Delete", "Tab", "Enter", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (allowedKeys.includes(event.key)) return;
    const allowsNegative = Number.parseFloat(input.min) < 0;
    const isAllowedNumber = /^[0-9.]$/.test(event.key) || (allowsNegative && event.key === "-");
    if (!isAllowedNumber) event.preventDefault();
  });
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
        prepareNumericInput(input);
        input.addEventListener("input", () => {
          normalizeScoreInput(input);
          calculate();
          markDirty();
        });
        if (input.dataset.field === "name") {
          input.setAttribute("list", `${side}PlayerNameOptions`);
          input.addEventListener("focus", () => renderSidePlayerSuggestions(side));
          input.addEventListener("input", () => renderSidePlayerSuggestions(side));
          input.addEventListener("blur", () => checkUnknownPlayerForRoster(side, input));
        }
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
  return playerTotal + numericValue(els[`${side}Argument`]) + numericValue(els[`${side}Closing`]);
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
  if (!list) return;
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

function determineWinner(affirmativeTotal, negativeTotal, affirmativeArgument = 0, negativeArgument = 0) {
  if (affirmativeTotal === 0 && negativeTotal === 0) return "尚未判定";
  if (affirmativeTotal === negativeTotal) {
    if (affirmativeArgument > negativeArgument) return "正方勝";
    if (negativeArgument > affirmativeArgument) return "反方勝";
    return "平手";
  }
  return affirmativeTotal > negativeTotal ? "正方勝" : "反方勝";
}

function getRecordWinner(record) {
  return determineWinner(
    Number(record.totals?.affirmative) || 0,
    Number(record.totals?.negative) || 0,
    Number(record.argumentScores?.affirmative) || 0,
    Number(record.argumentScores?.negative) || 0
  );
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
    sideTotal += numericValue(els[`${side}Argument`]) + numericValue(els[`${side}Closing`]);
    totals[side] = sideTotal;
    els[`${side}Total`].textContent = formatNumber(sideTotal);
  });

  const winner = determineWinner(
    totals.affirmative,
    totals.negative,
    numericValue(els.affirmativeArgument),
    numericValue(els.negativeArgument)
  );
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
  if (els.bestPlayers) els.bestPlayers.textContent = formatBestPlayers(getBestPlayers(players, teams));
  if (els.matchRankings) {
    renderRankingList(els.matchRankings, rankedPlayers.slice(0, 6), (player) =>
      `${player.name}（${player.sideLabel}，${formatNumber(player.total)}）`
    );
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
  renderNameSuggestions(records);
  renderMatchSummaries(records);
  renderRecords();
  renderSeasonRankings(records);
  renderCycleControls(records);
  renderPlayerGrowthOptions();
  renderPlayerGrowth();
  renderTournamentRankingOptions(records);
}

function renderNameSuggestions(records = readRecords()) {
  const judges = new Set();
  const recorders = new Set();
  const players = new Set();
  const teams = new Set();
  const competitions = new Set();
  const activeCompetition = normalizeCompetitionName(els.competitionName?.value || els.rosterCompetition?.value || "");

  records.forEach((record) => {
    addSuggestion(judges, record.judge);
    addSuggestion(recorders, record.recorder);
    addSuggestion(competitions, record.competitionName);
    SIDES.forEach((side) => {
      if (!activeCompetition || normalizeCompetitionName(record.competitionName) === activeCompetition) {
        addSuggestion(teams, record.teams?.[side]);
      }
      (record.players?.[side] || []).forEach((player) => addSuggestion(players, player.name));
    });
  });

  readRosters().forEach((roster) => {
    addSuggestion(competitions, roster.competitionName);
    if (isCompetitionMarker(roster)) return;
    if (!activeCompetition || normalizeCompetitionName(roster.competitionName) === activeCompetition) {
      addSuggestion(teams, roster.team);
    }
    (roster.players || []).forEach((player) => addSuggestion(players, player));
  });

  fillDatalist(els.judgeNameOptions, judges);
  fillDatalist(els.recorderNameOptions, recorders);
  fillDatalist(els.competitionNameOptions, competitions);
  fillDatalist(els.playerNameOptions, players);
  fillDatalist(els.teamNameOptions, teams);
  SIDES.forEach(renderSidePlayerSuggestions);
}

function renderSidePlayerSuggestions(side) {
  const datalist = els[`${side}PlayerNameOptions`];
  if (!datalist) return;
  const players = new Set();
  const roster = getRosterForSide(side);
  if (roster?.players?.length) {
    roster.players.forEach((player) => addSuggestion(players, player));
  } else {
    readRosters().forEach((candidate) => {
      if (!isCompetitionMarker(candidate)) (candidate.players || []).forEach((player) => addSuggestion(players, player));
    });
  }
  fillDatalist(datalist, players);
}
function markDirty() {
  formDirty = true;
}

function markClean() {
  formDirty = false;
}

function hasMeaningfulInput() {
  if (currentBallotPhoto) return true;
  const inputs = [
    els.competitionName, els.matchPeriod, els.matchVenue, els.matchJudge, els.matchRecorder,
    els.affirmativeTeam, els.negativeTeam, els.affirmativeArgument, els.negativeArgument,
    els.affirmativeClosing, els.negativeClosing,
  ];
  if (inputs.some((input) => String(input.value || "").trim())) return true;
  return SIDES.some((side) => [...els[`${side}Rows`].querySelectorAll("input")].some((input) => String(input.value || "").trim()));
}

function confirmDiscardUnsaved(actionText = "帶入其他資料") {
  if (!formDirty || !hasMeaningfulInput()) return true;
  return window.confirm(`目前表單有尚未儲存的資料。\n\n確定要${actionText}嗎？`);
}

function addSuggestion(set, value) {
  const text = String(value || "").trim();
  if (text) set.add(text);
}

function fillDatalist(datalist, values) {
  datalist.innerHTML = "";
  [...values]
    .sort((a, b) => a.localeCompare(b, "zh-Hant"))
    .forEach((value) => datalist.append(new Option(value)));
}

function setScoreTabOrder() {
  let tabIndex = 1;
  const setNext = (element) => {
    if (!element) return;
    element.tabIndex = tabIndex;
    tabIndex += 1;
  };

  [
    els.competitionName,
    els.matchPeriod,
    els.matchVenue,
    els.matchDate,
    els.matchJudge,
    els.matchRecorder,
    els.affirmativeTeam,
    els.negativeTeam,
  ].forEach(setNext);

  SIDES.forEach((side) => {
    const rows = [...els[`${side}Rows`].querySelectorAll("tr")];
    rows.forEach((row) => setNext(row.querySelector('[data-field="name"]')));
    rows.forEach((row) => {
      ["speech", "question", "defense"].forEach((field) => {
        setNext(row.querySelector(`[data-field="${field}"]`));
      });
    });
    setNext(els[`${side}Closing`]);
    setNext(els[`${side}Argument`]);
  });

  SIDES.forEach((side) => {
    els[`${side}Rows`].querySelectorAll('[data-field="note"]').forEach(setNext);
  });

  [
    els.saveMatch,
    els.resetForm,
    els.exportRecords,
    els.exportSpreadsheet,
    els.showSpreadsheetText,
    els.clearRecords,
  ].forEach(setNext);
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
    ballotPhoto: currentBallotPhoto ? { ...currentBallotPhoto } : null,
    createdAt: new Date().toISOString(),
    teams,
    players,
    argumentScores: {
      affirmative: numericValue(els.affirmativeArgument),
      negative: numericValue(els.negativeArgument),
    },
    closingScores: {
      affirmative: numericValue(els.affirmativeClosing),
      negative: numericValue(els.negativeClosing),
    },
    totals: {
      affirmative: affirmativeTotal,
      negative: negativeTotal,
    },
    winner: determineWinner(
      affirmativeTotal,
      negativeTotal,
      numericValue(els.affirmativeArgument),
      numericValue(els.negativeArgument)
    ),
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
    markClean();
    flashSaveButton();
  } catch (error) {
    record.cloudError = error instanceof Error ? error.message : "cloud save failed";
    writeRecords(upsertRecord(records, record, duplicateIndex));
    markClean();
    flashSaveButton();
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
  setBallotPhoto(null);
  calculate();
  markClean();
  flashStatus("已清空輸入");
}

function swapSides() {
  [els.affirmativeTeam.value, els.negativeTeam.value] = [els.negativeTeam.value, els.affirmativeTeam.value];

  for (let index = 0; index < 3; index += 1) {
    const affirmativeName = els.affirmativeRows.querySelector(`tr[data-index="${index}"] [data-field="name"]`);
    const negativeName = els.negativeRows.querySelector(`tr[data-index="${index}"] [data-field="name"]`);
    [affirmativeName.value, negativeName.value] = [negativeName.value, affirmativeName.value];
  }

  calculate();
  renderSeasonRankings();
  flashStatus("已交換正反方隊伍與選手姓名");
}

function loadRecordToForm(id) {
  if (!confirmDiscardUnsaved("帶入舊紀錄")) return;
  const record = readRecords().find((item) => item.id === id);
  if (!record) return;

  els.competitionName.value = record.competitionName || "";
  els.matchPeriod.value = record.period || "";
  els.matchVenue.value = record.venue || "";
  els.matchDate.value = record.matchDate || new Date().toISOString().slice(0, 10);
  els.matchJudge.value = record.judge || "";
  els.matchRecorder.value = record.recorder || "";
  els.affirmativeTeam.value = record.teams?.affirmative || "";
  els.negativeTeam.value = record.teams?.negative || "";
  els.affirmativeArgument.value = formatInputNumber(record.argumentScores?.affirmative);
  els.negativeArgument.value = formatInputNumber(record.argumentScores?.negative);
  els.affirmativeClosing.value = formatInputNumber(record.closingScores?.affirmative);
  els.negativeClosing.value = formatInputNumber(record.closingScores?.negative);

  SIDES.forEach((side) => {
    const rows = els[`${side}Rows`].querySelectorAll("tr");
    rows.forEach((row, index) => {
      const player = record.players?.[side]?.[index] || {};
      row.querySelector('[data-field="name"]').value = player.name || "";
      row.querySelector('[data-field="speech"]').value = formatInputNumber(player.speech);
      row.querySelector('[data-field="question"]').value = formatInputNumber(player.question);
      row.querySelector('[data-field="defense"]').value = formatInputNumber(player.defense);
      const noteInput = row.querySelector('[data-field="note"]');
      if (noteInput) noteInput.value = player.note || "";
    });
  });

  setBallotPhoto(record.ballotPhoto?.dataUrl ? { ...record.ballotPhoto } : null);
  calculate();
  renderSeasonRankings();
  markClean();
  flashStatus("已帶入紀錄，可繼續編輯");
}

function formatInputNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "";
  return formatNumber(number);
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
  const filteredRecords = getFilteredRecords(records);
  const exportRecords = records.length ? filteredRecords : [buildMatchRecord()];
  if (records.length && !exportRecords.length) {
    flashStatus("目前篩選沒有可匯出的資料");
    return;
  }
  const csv = buildSpreadsheetCsv(exportRecords, getFilteredRostersForExport());
  downloadTextFile(csv, `debate-score-data-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
  flashStatus(`已匯出 ${exportRecords.length} 張裁判表與檢錄名單`);
}

function showSpreadsheetText() {
  const records = readRecords();
  const filteredRecords = getFilteredRecords(records);
  const exportRecords = records.length ? filteredRecords : [buildMatchRecord()];
  if (records.length && !exportRecords.length) {
    flashStatus("目前篩選沒有可顯示的資料");
    return;
  }
  els.spreadsheetTextOutput.value = buildSpreadsheetTsv(exportRecords, getFilteredRostersForExport());
  els.spreadsheetTextPanel.classList.remove("is-hidden");
  els.spreadsheetTextOutput.focus();
  els.spreadsheetTextOutput.select();
  flashStatus("已顯示計分紀錄與檢錄名單表格");
}

function getFilteredRostersForExport() {
  const rosters = readRosters();
  if (!recordFilters.competition) return rosters;
  return rosters.filter((roster) => (roster.competitionName || "未命名盃賽") === recordFilters.competition);
}

async function copySpreadsheetText() {
  if (!els.spreadsheetTextOutput.value) showSpreadsheetText();
  els.spreadsheetTextOutput.focus();
  els.spreadsheetTextOutput.select();

  try {
    await navigator.clipboard.writeText(els.spreadsheetTextOutput.value);
    flashStatus("已複製貼上用表格");
  } catch {
    flashStatus("已選取文字，請按 Command+C 複製");
  }
}

async function importSpreadsheet(event) {
  const input = event?.target || els.importSpreadsheet;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedRecords = buildRecordsFromSpreadsheetCsv(text);
    const importedRosters = buildRostersFromSpreadsheetCsv(text);
    if (!importedRecords.length && !importedRosters.length) {
      flashStatus("沒有可匯入的紀錄或檢錄名單");
      return;
    }

    const records = readRecords();
    const rosters = readRosters();
    const duplicateCount = importedRecords.filter((record) => {
      const key = getJudgeBallotKey(record);
      return key && records.some((existing) => getJudgeBallotKey(existing) === key);
    }).length;
    const duplicateRosterCount = importedRosters.filter((roster) =>
      rosters.some((existing) => existing.id === roster.id)
    ).length;

    if (duplicateCount || duplicateRosterCount) {
      const confirmed = window.confirm(
        `這份試算表有 ${duplicateCount} 張裁判表、${duplicateRosterCount} 份檢錄名單已經存在。\n\n` +
        `是否要用匯入資料更新舊資料？`
      );
      if (!confirmed) {
        flashStatus("已取消匯入");
        return;
      }
    }

    if (importedRecords.length) writeRecords(mergeImportedRecords(records, importedRecords));
    if (importedRosters.length) writeRosters(mergeImportedRosters(rosters, importedRosters));
    if (!importedRecords.length) {
      renderNameSuggestions();
      renderRosters();
    }
    flashStatus(`已匯入 ${importedRecords.length} 張裁判表、${importedRosters.length} 份檢錄名單`);
  } catch (error) {
    flashStatus("匯入失敗，請確認是本系統匯出的 CSV");
  } finally {
    input.value = "";
  }
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

function buildRecordsFromSpreadsheetCsv(text) {
  const table = parseCsv(text);
  if (table.length < 2) return [];
  const headers = table[0].map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const requiredHeaders = ["盃賽名稱", "時段", "會場", "方別", "選手序號", "選手姓名"];
  if (!requiredHeaders.every((header) => headerIndex.has(header))) return [];
  const hasTypeHeader = headerIndex.has("資料類型");

  const grouped = new Map();
  table.slice(1).forEach((row) => {
    if (!row.some((value) => String(value || "").trim())) return;
    const get = (header) => row[headerIndex.get(header)] ?? "";
    const dataType = hasTypeHeader ? stringValue(get("資料類型")) : "裁判表";
    if (dataType && dataType !== "裁判表") return;
    const competitionName = stringValue(get("盃賽名稱")) || "未命名盃賽";
    const period = integerOrBlank(get("時段"));
    const venue = integerOrBlank(get("會場"));
    const matchDate = stringValue(get("日期"));
    const judge = stringValue(get("裁判"));
    const recorder = stringValue(get("記錄員"));
    const affirmativeTeam = stringValue(get("正方隊伍")) || "正方";
    const negativeTeam = stringValue(get("反方隊伍")) || "反方";
    const key = [
      competitionName,
      period,
      venue,
      matchDate,
      judge,
      recorder,
      affirmativeTeam,
      negativeTeam,
    ].join("｜");

    const record = grouped.get(key) || {
      id: crypto.randomUUID(),
      competitionName,
      period,
      venue,
      matchDate,
      judge,
      recorder,
      note: "",
      ballotPhoto: null,
      importedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      teams: {
        affirmative: affirmativeTeam,
        negative: negativeTeam,
      },
      players: {
        affirmative: [],
        negative: [],
      },
      argumentScores: {
        affirmative: numberValue(get("正方論點分")),
        negative: numberValue(get("反方論點分")),
      },
      closingScores: {
        affirmative: numberValue(get("正方結辯分")),
        negative: numberValue(get("反方結辯分")),
      },
      totals: {
        affirmative: numberValue(get("正方總分")),
        negative: numberValue(get("反方總分")),
      },
      winner: stringValue(get("勝方")),
      bestPlayers: [],
    };

    const side = sideFromLabel(get("方別"));
    if (side) {
      const playerIndex = Math.max(0, (Number.parseInt(get("選手序號"), 10) || record.players[side].length + 1) - 1);
      record.players[side][playerIndex] = {
        name: stringValue(get("選手姓名")),
        speech: numberValue(get("申論")),
        question: numberValue(get("質詢")),
        defense: numberValue(get("答辯")),
        total: numberValue(get("個人總分")),
        note: stringValue(get("選手備註")),
      };
    }

    grouped.set(key, record);
  });

  return [...grouped.values()].map((record) => {
    SIDES.forEach((side) => {
      record.players[side] = record.players[side].filter(Boolean);
      record.players[side].forEach((player) => {
        if (!Number.isFinite(player.total) || player.total === 0) {
          player.total = player.speech + player.question + player.defense;
        }
      });
      const calculatedTotal = record.players[side].reduce((sum, player) => sum + player.total, 0)
        + numberValue(record.argumentScores[side])
        + numberValue(record.closingScores?.[side]);
      if (!Number.isFinite(record.totals[side]) || record.totals[side] === 0) {
        record.totals[side] = calculatedTotal;
      }
    });
    record.winner = getRecordWinner(record);
    record.bestPlayers = getBestPlayers(record.players, record.teams);
    return record;
  });
}

function mergeImportedRecords(records, importedRecords) {
  const merged = [...records];
  importedRecords.forEach((record) => {
    const key = getJudgeBallotKey(record);
    const duplicateIndex = key
      ? merged.findIndex((existing) => getJudgeBallotKey(existing) === key)
      : -1;

    if (duplicateIndex >= 0) {
      record.id = merged[duplicateIndex].id;
      record.replacedAt = new Date().toISOString();
      merged.splice(duplicateIndex, 1);
    }
    merged.unshift(record);
  });
  return merged;
}

function buildRostersFromSpreadsheetCsv(text) {
  const table = parseCsv(text);
  if (table.length < 2) return [];
  const headers = table[0].map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const requiredHeaders = ["資料類型", "盃賽名稱", "隊伍", "選手序號", "選手姓名"];
  if (!requiredHeaders.every((header) => headerIndex.has(header))) return [];

  const grouped = new Map();
  table.slice(1).forEach((row) => {
    if (!row.some((value) => String(value || "").trim())) return;
    const get = (header) => row[headerIndex.get(header)] ?? "";
    const dataType = stringValue(get("資料類型"));
    if (dataType !== "檢錄名單" && dataType !== "盃賽檢錄") return;

    const competitionName = stringValue(get("盃賽名稱")) || "未命名盃賽";
    const team = dataType === "盃賽檢錄" ? COMPETITION_MARKER_TEAM : stringValue(get("隊伍"));
    if (dataType === "檢錄名單" && !team) return;

    const id = `${competitionName}｜${team}`;
    const roster = grouped.get(id) || {
      id,
      kind: dataType === "盃賽檢錄" ? "competition-marker" : "team-roster",
      competitionName,
      team,
      playerSlots: [],
      updatedAt: new Date().toISOString(),
    };
    const playerName = stringValue(get("選手姓名"));
    if (playerName) {
      const playerIndex = Math.max(0, (Number.parseInt(get("選手序號"), 10) || roster.playerSlots.length + 1) - 1);
      roster.playerSlots[playerIndex] = playerName;
    }
    grouped.set(id, roster);
  });

  return [...grouped.values()].map((roster) => {
    const players = roster.playerSlots
      .filter(Boolean)
      .filter((player, index, list) => list.findIndex((candidate) => normalizePersonName(candidate) === normalizePersonName(player)) === index);
    const normalized = {
      id: roster.id,
      competitionName: roster.competitionName,
      team: roster.team,
      players,
      updatedAt: roster.updatedAt,
    };
    if (roster.kind === "competition-marker") normalized.kind = "competition-marker";
    return normalized;
  });
}

function mergeImportedRosters(rosters, importedRosters) {
  const merged = [...rosters];
  importedRosters.forEach((roster) => {
    const duplicateIndex = merged.findIndex((existing) => existing.id === roster.id);
    if (duplicateIndex >= 0) {
      merged.splice(duplicateIndex, 1);
    }
    merged.unshift(roster);
  });
  return merged;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (quoted) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function stringValue(value) {
  return String(value ?? "").trim();
}

function numberValue(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function integerOrBlank(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : "";
}

function sideFromLabel(label) {
  const text = stringValue(label);
  if (text === "正方" || text === "affirmative") return "affirmative";
  if (text === "反方" || text === "negative") return "negative";
  return "";
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

function getFilteredRecords(records) {
  return records.filter((record) => {
    const competition = record.competitionName || "未命名盃賽";
    const period = record.period ? String(record.period) : "";
    const venue = record.venue ? String(record.venue) : "";
    return (!recordFilters.competition || competition === recordFilters.competition)
      && (!recordFilters.period || period === recordFilters.period)
      && (!recordFilters.venue || venue === recordFilters.venue);
  });
}

function renderRecordFilters(records) {
  if (!els.recordCompetitionFilter) return;
  fillSelect(els.recordCompetitionFilter, uniqueSorted(records.map((record) => record.competitionName || "未命名盃賽")), "全部盃賽", recordFilters.competition);
  fillSelect(els.recordPeriodFilter, uniqueSorted(records.map((record) => record.period).filter(Boolean).map(String), true), "全部時段", recordFilters.period);
  fillSelect(els.recordVenueFilter, uniqueSorted(records.map((record) => record.venue).filter(Boolean).map(String), true), "全部會場", recordFilters.venue);
}

function uniqueSorted(values, numeric = false) {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.sort((a, b) => numeric ? Number(a) - Number(b) : a.localeCompare(b, "zh-Hant"));
}

function fillSelect(select, values, emptyLabel, selectedValue = "") {
  const current = selectedValue;
  select.innerHTML = "";
  select.append(new Option(emptyLabel, ""));
  values.forEach((value) => select.append(new Option(value, value)));
  select.value = values.includes(current) ? current : "";
}

function renderRecords() {
  const allRecords = readRecords();
  renderRecordFilters(allRecords);
  const records = getFilteredRecords(allRecords);
  els.recordCount.textContent = recordFilters.competition || recordFilters.period || recordFilters.venue
    ? `${records.length} / ${allRecords.length} 筆`
    : `${allRecords.length} 筆`;
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
    const recordWinner = getRecordWinner(record);
    const affirmativeWon = recordWinner === "正方勝";
    const negativeWon = recordWinner === "反方勝";
    const affirmativeArgument = record.argumentScores?.affirmative ?? 0;
    const negativeArgument = record.argumentScores?.negative ?? 0;
    const affirmativeClosing = record.closingScores?.affirmative ?? 0;
    const negativeClosing = record.closingScores?.negative ?? 0;
    const bestPlayers = record.bestPlayers?.length
      ? record.bestPlayers
      : getBestPlayers(record.players, record.teams);
    const photoHtml = buildRecordPhotoHtml(record);

    article.innerHTML = `
      <div class="record-top">
        <div>
          <h3>${escapeHtml(matchLabel)}</h3>
          <p class="record-meta">${escapeHtml(competitionText)}${escapeHtml(recordWinner)}${escapeHtml(dateText)}${escapeHtml(judgeText)}${escapeHtml(recorderText)}</p>
        </div>
        <div class="record-actions">
          <button class="small-action" type="button" data-load="${record.id}">帶入</button>
          <button class="small-action" type="button" data-export="${record.id}">匯出</button>
          <button class="small-action" type="button" data-delete="${record.id}">刪除</button>
        </div>
      </div>
      <div class="record-result">
        <div class="record-score ${affirmativeWon ? "is-winner" : ""}">
          <p>${escapeHtml(record.teams.affirmative)}</p>
          <span>論點 ${formatNumber(affirmativeArgument)}｜結辯 ${formatNumber(affirmativeClosing)}</span>
          <strong>${formatNumber(record.totals.affirmative)}</strong>
        </div>
        <div class="record-score ${negativeWon ? "is-winner" : ""}">
          <p>${escapeHtml(record.teams.negative)}</p>
          <span>論點 ${formatNumber(negativeArgument)}｜結辯 ${formatNumber(negativeClosing)}</span>
          <strong>${formatNumber(record.totals.negative)}</strong>
        </div>
      </div>
      <p class="record-best">單場最佳：${escapeHtml(formatBestPlayers(bestPlayers))}</p>
      ${photoHtml}
    `;
    article.querySelector("[data-load]").addEventListener("click", () => loadRecordToForm(record.id));
    article.querySelector("[data-export]").addEventListener("click", () => exportRecord(record.id));
    article.querySelector("[data-delete]").addEventListener("click", () => deleteRecord(record.id));
    els.recordsList.append(article);
  });
}

function refreshFilteredRecordViews() {
  renderMatchSummaries();
  renderRecords();
}

function buildRecordPhotoHtml(record) {
  if (!record.ballotPhoto?.dataUrl) return "";
  return `<div class="record-photo">
    <img src="${escapeHtml(record.ballotPhoto.dataUrl)}" alt="評分單照片" loading="lazy" />
    <a class="small-action" href="${escapeHtml(record.ballotPhoto.dataUrl)}" target="_blank" rel="noreferrer">查看照片</a>
  </div>`;
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
      affirmativeArgumentVotes: 0,
      negativeArgumentVotes: 0,
      affirmativeTotalScore: 0,
      negativeTotalScore: 0,
      affirmativeSpeakerRankPoints: 0,
      negativeSpeakerRankPoints: 0,
      speakerRankPlayers: new Map(),
    };

    existing.ballots += 1;
    if (record.judge) existing.judges.push(record.judge);
    const affirmativeArgument = Number(record.argumentScores?.affirmative) || 0;
    const negativeArgument = Number(record.argumentScores?.negative) || 0;
    existing.affirmativeArgumentTotal += affirmativeArgument;
    existing.negativeArgumentTotal += negativeArgument;
    if (affirmativeArgument > negativeArgument) {
      existing.affirmativeArgumentVotes += 1;
    } else if (negativeArgument > affirmativeArgument) {
      existing.negativeArgumentVotes += 1;
    }
    existing.affirmativeTotalScore += Number(record.totals?.affirmative) || 0;
    existing.negativeTotalScore += Number(record.totals?.negative) || 0;
    const speakerRankPoints = getTeamSpeakerRankPoints(record);
    existing.affirmativeSpeakerRankPoints += speakerRankPoints.affirmative;
    existing.negativeSpeakerRankPoints += speakerRankPoints.negative;
    addRecordSpeakerRanksToSummary(existing, record);

    const recordWinner = getRecordWinner(record);
    if (recordWinner === "正方勝") {
      existing.affirmativeVotes += 1;
    } else if (recordWinner === "反方勝") {
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

function addRecordSpeakerRanksToSummary(summary, record) {
  getRankedMatchPlayers(record.players, record.teams).forEach((player, index) => {
    const key = getPlayerKey(player.name, player.team);
    const existing = summary.speakerRankPlayers.get(key) || {
      name: player.name,
      team: player.team,
      rankPoints: 0,
      appearances: 0,
      scoreTotal: 0,
    };
    existing.rankPoints += index + 1;
    existing.appearances += 1;
    existing.scoreTotal += Number(player.total) || 0;
    summary.speakerRankPlayers.set(key, existing);
  });
}

function getSummarySpeakerRanking(summary) {
  return [...(summary.speakerRankPlayers?.values() || [])]
    .sort((a, b) =>
      a.rankPoints - b.rankPoints ||
      b.appearances - a.appearances ||
      b.scoreTotal - a.scoreTotal ||
      a.name.localeCompare(b.name)
    );
}

function getSummaryBestSpeakers(summary) {
  const ranking = getSummarySpeakerRanking(summary);
  if (!ranking.length) return [];
  const bestRankPoints = ranking[0].rankPoints;
  return ranking.filter((player) => player.rankPoints === bestRankPoints);
}

function formatSummaryBestSpeakers(summary) {
  const bestSpeakers = getSummaryBestSpeakers(summary);
  if (!bestSpeakers.length) return "尚未產生";
  return bestSpeakers
    .map((player) => `${player.name}（${player.team}，名次加總 ${formatNumber(player.rankPoints)}）`)
    .join("、");
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
      argumentPoints: summary.affirmativeArgumentVotes,
      speakerRankPoints: summary.affirmativeSpeakerRankPoints,
      totalScore: summary.affirmativeTotalScore,
    });
    addCycleTeamResult(teams, summary.negativeTeam, {
      matchWin: getSummaryWinner(summary) === "反方勝" ? 1 : 0,
      ballotWins: summary.negativeVotes,
      argumentPoints: summary.negativeArgumentVotes,
      speakerRankPoints: summary.negativeSpeakerRankPoints,
      totalScore: summary.negativeTotalScore,
    });
  });

  const rankingRules = getCycleRankingRules();
  const ranking = [...teams.values()].sort((a, b) => compareCycleTeams(a, b, rankingRules));

  renderCycleResult(ranking, rankingRules);
}

function addCycleTeamResult(teams, team, result) {
  const existing = teams.get(team) || {
    team,
    matchWins: 0,
    ballotWins: 0,
    argumentPoints: 0,
    speakerRankPoints: 0,
    totalScore: 0,
  };
  existing.matchWins += result.matchWin;
  existing.ballotWins += result.ballotWins;
  existing.argumentPoints += result.argumentPoints;
  existing.speakerRankPoints += result.speakerRankPoints;
  existing.totalScore += result.totalScore;
  teams.set(team, existing);
}

function getTeamSpeakerRankPoints(record) {
  const points = {
    affirmative: 0,
    negative: 0,
  };
  const teams = record.teams || {};
  getRankedMatchPlayers(record.players, teams).forEach((player, index) => {
    points[player.side] += index + 1;
  });
  return points;
}

function getCycleRankingRules() {
  const selected = [...els.cycleRankSelects].map((select) => select.value).filter(Boolean);
  return selected.length ? selected : ["matchWins", "ballotWins", "argumentPoints"];
}

function compareCycleTeams(a, b, rules) {
  for (const rule of rules) {
    const config = CYCLE_RANK_RULES[rule];
    if (!config) continue;
    const difference = config.direction === "asc"
      ? a[rule] - b[rule]
      : b[rule] - a[rule];
    if (difference !== 0) return difference;
  }
  return a.team.localeCompare(b.team);
}

function renderCycleResult(ranking, rankingRules) {
  const rows = ranking.map((team, index) => `
    <tr class="${index === 0 ? "is-winner" : ""}">
      <td>${index + 1}</td>
      <td>${escapeHtml(team.team)}</td>
      <td>${team.matchWins}</td>
      <td>${team.ballotWins}</td>
      <td>${formatNumber(team.argumentPoints)}</td>
      <td>${formatNumber(team.speakerRankPoints)}</td>
      <td>${formatNumber(team.totalScore)}</td>
    </tr>
  `).join("");
  const ruleText = rankingRules
    .map((rule) => CYCLE_RANK_RULES[rule]?.label)
    .filter(Boolean)
    .join(" > ");

  els.cycleResult.innerHTML = `
    <p class="cycle-rank-summary">目前排序：${escapeHtml(ruleText)}</p>
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>隊伍</th>
          <th>勝場數</th>
          <th>評分單張數</th>
          <th>論點單張數</th>
          <th>辯士排名加總</th>
          <th>總分加總</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}


function readPlayerGrowthRecords() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_GROWTH_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writePlayerGrowthRecords(records) {
  localStorage.setItem(PLAYER_GROWTH_STORAGE_KEY, JSON.stringify(records));
  renderPlayerGrowthOptions();
  renderPlayerGrowth();
}

function getMetricLabel(metric) {
  return {
    totalAverage: "總分平均",
    winRate: "盃賽勝率",
    speechAverage: "申論平均",
    questionAverage: "質詢平均",
    defenseAverage: "答辯平均",
    total: "個人總分",
    speech: "申論",
    question: "質詢",
    defense: "答辯",
  }[metric] || "總分平均";
}

function getMetricValue(entry, metric) {
  if (metric === "winRate") return (Number(entry.winRate) || 0) * 100;
  return Number(entry[metric]) || 0;
}

function getAllPlayerGrowthEntries() {
  return readRecords().flatMap((record) =>
    SIDES.flatMap((side) =>
      (record.players?.[side] || [])
        .filter((player) => (player.name || "").trim())
        .map((player) => ({
          id: `${record.id}-${side}-${player.name}`,
          source: "比賽紀錄",
          name: player.name.trim(),
          competitionName: record.competitionName || "未命名盃賽",
          matchDate: record.matchDate || record.createdAt?.slice(0, 10) || "",
          matchLabel: `${getMatchLabel(record)}｜${record.teams?.[side] || SIDE_LABELS[side]}`,
          team: record.teams?.[side] || "",
          side,
          speech: Number(player.speech) || 0,
          question: Number(player.question) || 0,
          defense: Number(player.defense) || 0,
          total: Number(player.total) || 0,
          win: getRecordWinner(record) === SIDE_LABELS[side] + "勝" ? 1 : 0,
          matchKey: getMatchKey(record),
          note: player.note || "",
        }))
    )
  ).sort((a, b) => {
    const dateCompare = String(a.matchDate || "").localeCompare(String(b.matchDate || ""));
    if (dateCompare !== 0) return dateCompare;
    return String(a.competitionName || "").localeCompare(String(b.competitionName || ""));
  });
}

function getPlayerWinRateEntries(playerName, competitionFilter = "", teamFilter = "") {
  const normalizedPlayer = normalizeName(playerName);
  const normalizedTeam = normalizeTeamName(teamFilter);
  if (!normalizedPlayer) return [];

  const summariesByKey = new Map(getMatchSummaries(readRecords()).map((summary) => [summary.key, summary]));
  const matches = new Map();

  readRecords().forEach((record) => {
    if (competitionFilter && normalizeCompetitionName(record.competitionName) !== normalizeCompetitionName(competitionFilter)) return;

    SIDES.forEach((side) => {
      if (normalizedTeam && normalizeTeamName(record.teams?.[side]) !== normalizedTeam) return;
      const hasPlayer = (record.players?.[side] || []).some((player) => normalizeName(player.name) === normalizedPlayer);
      if (!hasPlayer) return;

      const key = `${getMatchKey(record)}｜${side}`;
      if (matches.has(key)) return;

      const summary = summariesByKey.get(getMatchKey(record));
      const matchWinner = summary ? getSummaryWinner(summary) : getRecordWinner(record);
      matches.set(key, {
        competitionName: record.competitionName || "未命名盃賽",
        matchDate: record.matchDate || record.createdAt?.slice(0, 10) || "",
        win: matchWinner === `${SIDE_LABELS[side]}勝` ? 1 : 0,
      });
    });
  });

  const competitions = new Map();
  [...matches.values()].forEach((match) => {
    const key = normalizeCompetitionName(match.competitionName);
    const existing = competitions.get(key) || {
      id: key,
      name: playerName,
      competitionName: match.competitionName,
      matchDate: match.matchDate,
      matchLabel: "盃賽勝率",
      wins: 0,
      matches: 0,
    };
    existing.wins += match.win;
    existing.matches += 1;
    if (!existing.matchDate || (match.matchDate && match.matchDate < existing.matchDate)) {
      existing.matchDate = match.matchDate;
    }
    competitions.set(key, existing);
  });

  return [...competitions.values()]
    .map((entry) => ({
      ...entry,
      winRate: entry.wins / Math.max(1, entry.matches),
      ballots: entry.matches,
    }))
    .sort((a, b) => {
      const dateCompare = String(a.matchDate || "").localeCompare(String(b.matchDate || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(a.competitionName || "").localeCompare(String(b.competitionName || ""), "zh-Hant");
    });
}

function getPlayerTimelineEntries(entries) {
  const grouped = new Map();

  entries.forEach((entry) => {
    const key = [
      normalizeName(entry.name),
      normalizeCompetitionName(entry.competitionName),
      entry.matchKey || entry.matchLabel || "",
      entry.matchDate || "",
      normalizeTeamName(entry.team || ""),
    ].join("｜");
    const existing = grouped.get(key) || {
      id: key,
      source: entry.source,
      name: entry.name,
      competitionName: entry.competitionName,
      matchDate: entry.matchDate,
      matchLabel: entry.matchLabel,
      team: entry.team,
      ballots: 0,
      speechTotal: 0,
      questionTotal: 0,
      defenseTotal: 0,
      totalScoreTotal: 0,
      winTotal: 0,
      note: entry.note || "",
    };

    existing.ballots += 1;
    existing.speechTotal += Number(entry.speech) || 0;
    existing.questionTotal += Number(entry.question) || 0;
    existing.defenseTotal += Number(entry.defense) || 0;
    existing.totalScoreTotal += Number(entry.total) || 0;
    existing.winTotal += Number(entry.win) || 0;
    grouped.set(key, existing);
  });

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      speechAverage: entry.speechTotal / Math.max(1, entry.ballots),
      questionAverage: entry.questionTotal / Math.max(1, entry.ballots),
      defenseAverage: entry.defenseTotal / Math.max(1, entry.ballots),
      totalAverage: entry.totalScoreTotal / Math.max(1, entry.ballots),
      winAverage: entry.winTotal / Math.max(1, entry.ballots),
      speech: entry.speechTotal / Math.max(1, entry.ballots),
      question: entry.questionTotal / Math.max(1, entry.ballots),
      defense: entry.defenseTotal / Math.max(1, entry.ballots),
      total: entry.totalScoreTotal / Math.max(1, entry.ballots),
    }))
    .sort((a, b) => {
      const dateCompare = String(a.matchDate || "").localeCompare(String(b.matchDate || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(a.matchLabel || "").localeCompare(String(b.matchLabel || ""), "zh-Hant", { numeric: true });
    });
}

function getPlayerStage(entries, playerName, competitionName, metric) {
  if (!competitionName) return "請先選擇盃賽";
  const normalizedPlayer = normalizeName(playerName);
  const pool = entries
    .filter((entry) => normalizeCompetitionName(entry.competitionName) === normalizeCompetitionName(competitionName))
    .filter((entry) => Number(getMetricValue(entry, metric)) > 0);
  if (pool.length < 5) return "同盃賽資料不足";

  const bestByPlayer = new Map();
  pool.forEach((entry) => {
    const key = normalizeName(entry.name);
    const value = Number(getMetricValue(entry, metric)) || 0;
    if (!bestByPlayer.has(key) || value > bestByPlayer.get(key).value) {
      bestByPlayer.set(key, { name: entry.name, value });
    }
  });
  const ranking = [...bestByPlayer.values()].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const index = ranking.findIndex((entry) => normalizeName(entry.name) === normalizedPlayer);
  if (index < 0) return "此盃賽尚無該選手紀錄";
  const ratio = (index + 1) / ranking.length;
  if (ratio <= 0.2) return `第 5 階段（前 20%，第 ${index + 1}/${ranking.length}）`;
  if (ratio <= 0.4) return `第 4 階段（前 20–40%，第 ${index + 1}/${ranking.length}）`;
  if (ratio <= 0.6) return `第 3 階段（中段，第 ${index + 1}/${ranking.length}）`;
  if (ratio <= 0.8) return `第 2 階段（後 40%，第 ${index + 1}/${ranking.length}）`;
  return `第 1 階段（後 20%，第 ${index + 1}/${ranking.length}）`;
}

function describeTrend(playerEntries, metric) {
  if (playerEntries.length < 3) return "累積 3 場後判斷";
  const split = Math.max(1, Math.floor(playerEntries.length / 2));
  const early = playerEntries.slice(0, split);
  const recent = playerEntries.slice(split);
  const average = (items) => items.reduce((sum, entry) => sum + getMetricValue(entry, metric), 0) / Math.max(1, items.length);
  const delta = average(recent) - average(early);
  const threshold = metric === "winRate" ? 5 : 3;
  const unit = metric === "winRate" ? "%" : "";
  if (delta >= threshold) return `正在上升（近幾場平均 +${formatNumber(delta)}${unit}）`;
  if (delta <= -threshold) return `需要留意（近幾場平均 ${formatNumber(delta)}${unit}）`;
  return "大致持平";
}

function renderTrendChart(entries, metric) {
  if (!els.playerTrendChart) return;
  els.playerTrendChart.innerHTML = "";
  if (!entries.length) {
    els.playerTrendChart.textContent = "尚無資料";
    return;
  }
  const width = 720;
  const height = 260;
  const padding = 36;
  const values = entries.map((entry) => getMetricValue(entry, metric));
  const min = Math.min(...values, 0);
  const baselineMax = getMetricChartMax(metric);
  const max = Math.max(...values, baselineMax);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => {
    const x = entries.length === 1 ? width / 2 : padding + (index * (width - padding * 2)) / (entries.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  const circles = values.map((value, index) => {
    const x = entries.length === 1 ? width / 2 : padding + (index * (width - padding * 2)) / (entries.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `<circle cx="${x}" cy="${y}" r="4"><title>${entries[index].competitionName}｜${entries[index].matchLabel}｜${formatNumber(value)}${metric === "winRate" ? "%" : ""}</title></circle>`;
  }).join("");
  const pointLabels = values.map((value, index) => {
    const x = entries.length === 1 ? width / 2 : padding + (index * (width - padding * 2)) / (entries.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    const safeY = Math.max(18, y - 10);
    return `<text x="${x}" y="${safeY}" class="chart-point-label">${formatNumber(value)}${metric === "winRate" ? "%" : ""}</text>`;
  }).join("");
  els.playerTrendChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${getMetricLabel(metric)}趨勢圖">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart-axis" />
      <polyline points="${points}" class="trend-line" />
      ${circles}
      ${pointLabels}
      <text x="${padding}" y="24" class="chart-label">最高 ${formatNumber(max)}${metric === "winRate" ? "%" : ""}</text>
      <text x="${padding}" y="${height - 8}" class="chart-label">最低 ${formatNumber(min)}${metric === "winRate" ? "%" : ""}</text>
    </svg>
  `;
}

function getMetricChartMax(metric) {
  if (metric === "winRate") return 100;
  if (metric === "speechAverage" || metric === "questionAverage") return 20;
  if (metric === "defenseAverage") return 10;
  return 100;
}

function getPlayerGrowthTeamOptions(entries = getAllPlayerGrowthEntries()) {
  const teams = new Set();
  const competition = normalizeCompetitionName(els.playerGrowthCompetition?.value || "");
  entries.forEach((entry) => {
    if (competition && normalizeCompetitionName(entry.competitionName) !== competition) return;
    addSuggestion(teams, entry.team);
  });
  readRosters().forEach((roster) => {
    if (isCompetitionMarker(roster)) return;
    if (competition && normalizeCompetitionName(roster.competitionName) !== competition) return;
    addSuggestion(teams, roster.team);
  });
  return teams;
}

function getPlayerGrowthPlayerOptions(entries = getAllPlayerGrowthEntries()) {
  const players = new Set();
  const team = normalizeTeamName(els.playerGrowthTeam?.value || "");
  const competition = normalizeCompetitionName(els.playerGrowthCompetition?.value || "");
  if (!team) return players;

  entries.forEach((entry) => {
    if (competition && normalizeCompetitionName(entry.competitionName) !== competition) return;
    if (normalizeTeamName(entry.team) === team) addSuggestion(players, entry.name);
  });
  readRosters().forEach((roster) => {
    if (isCompetitionMarker(roster)) return;
    if (competition && normalizeCompetitionName(roster.competitionName) !== competition) return;
    if (normalizeTeamName(roster.team) !== team) return;
    (roster.players || []).forEach((player) => addSuggestion(players, player));
  });
  return players;
}

function renderPlayerGrowthSuggestions(entries = getAllPlayerGrowthEntries()) {
  if (els.playerGrowthTeamOptions) fillDatalist(els.playerGrowthTeamOptions, getPlayerGrowthTeamOptions(entries));
  if (!els.playerGrowthName) return;
  const current = els.playerGrowthName.value;
  const players = [...getPlayerGrowthPlayerOptions(entries)].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  els.playerGrowthName.innerHTML = "";
  const hasTeam = Boolean((els.playerGrowthTeam?.value || "").trim());
  els.playerGrowthName.append(new Option(hasTeam ? "選擇選手" : "請先選隊伍／學校", ""));
  players.forEach((player) => els.playerGrowthName.append(new Option(player, player)));
  els.playerGrowthName.value = players.includes(current) ? current : "";
}

function renderPlayerGrowthOptions() {
  if (!els.playerGrowthCompetition) return;
  const entries = getAllPlayerGrowthEntries();
  const competitions = [...new Set(entries.map((entry) => entry.competitionName).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const current = els.playerGrowthCompetition.value;
  els.playerGrowthCompetition.innerHTML = '<option value="">全部盃賽</option>' + competitions.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  if (competitions.includes(current)) els.playerGrowthCompetition.value = current;
  renderPlayerGrowthSuggestions(entries);
}

function renderPlayerGrowth() {
  if (!els.playerGrowthName) return;
  const name = els.playerGrowthName.value.trim() || els.playerSelfName?.value.trim() || "";
  const team = els.playerGrowthTeam?.value.trim() || "";
  const metric = els.playerGrowthMetric.value || "totalAverage";
  const competition = els.playerGrowthCompetition.value || "";
  const entries = getAllPlayerGrowthEntries();
  const matchingEntries = entries.filter((entry) =>
    normalizeName(entry.name) === normalizeName(name) &&
    (!team || normalizeTeamName(entry.team) === normalizeTeamName(team))
  );
  let playerEntries = metric === "winRate"
    ? getPlayerWinRateEntries(name, competition, team)
    : getPlayerTimelineEntries(matchingEntries);
  if (competition && metric !== "winRate") {
    playerEntries = playerEntries.filter((entry) => normalizeCompetitionName(entry.competitionName) === normalizeCompetitionName(competition));
  }

  els.playerGameCount.textContent = String(playerEntries.length);
  const latest = playerEntries[playerEntries.length - 1];
  els.playerLatestScore.textContent = latest ? `${formatNumber(getMetricValue(latest, metric))}${metric === "winRate" ? "%" : ""}` : "—";
  els.playerTrendText.textContent = name ? describeTrend(playerEntries, metric) : "尚未選擇選手";
  els.playerStageText.textContent = metric === "winRate"
    ? "以盃賽勝率觀察"
    : (name ? getPlayerStage(getPlayerTimelineEntries(entries), name, competition || latest?.competitionName || "", metric) : "尚未分析");
  els.playerChartCaption.textContent = name ? `${name} 的${getMetricLabel(metric)}趨勢` : "請先選擇選手。";
  renderTrendChart(playerEntries, metric);

  if (!name) {
    els.playerInsightText.textContent = "請先輸入或選擇選手姓名。";
  } else if (playerEntries.length < 3) {
    els.playerInsightText.textContent = "目前資料還少，先累積三場以上，就能看出比較穩定的上升或下降趨勢。";
  } else {
    els.playerInsightText.textContent = `${name} 目前${getMetricLabel(metric)}${describeTrend(playerEntries, metric)}。五階段判讀會用同盃賽選手資料估算，資料越完整越準。`;
  }

  els.playerRecordCount.textContent = `${playerEntries.length} 筆`;
  if (!playerEntries.length) {
    els.playerRecordsTable.innerHTML = '<p class="empty-note">尚無此選手紀錄。</p>';
    return;
  }
  els.playerRecordsTable.innerHTML = `
    <table>
      <thead><tr><th>日期</th><th>盃賽</th><th>場次</th><th>申論平均</th><th>質詢平均</th><th>答辯平均</th><th>總分平均</th><th>盃賽勝率</th><th>資料數</th></tr></thead>
      <tbody>${playerEntries.map((entry) => `
        <tr>
          <td>${escapeHtml(entry.matchDate || "—")}</td>
          <td>${escapeHtml(entry.competitionName || "—")}</td>
          <td>${escapeHtml(entry.matchLabel || "—")}</td>
          <td>${entry.speechAverage == null ? "—" : formatNumber(entry.speechAverage)}</td>
          <td>${entry.questionAverage == null ? "—" : formatNumber(entry.questionAverage)}</td>
          <td>${entry.defenseAverage == null ? "—" : formatNumber(entry.defenseAverage)}</td>
          <td>${entry.totalAverage == null ? "—" : formatNumber(entry.totalAverage)}</td>
          <td>${entry.winRate == null ? "—" : `${formatNumber(entry.winRate * 100)}%`}</td>
          <td>${entry.ballots || entry.matches || 0}</td>
        </tr>`).join("")}</tbody>
    </table>`;
}

function getRankingCompetitions(records = readRecords()) {
  return [...new Set(records.map((record) => record.competitionName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function renderTournamentRankingOptions(records = readRecords()) {
  if (!els.rankingCompetition) return;
  const competitions = getRankingCompetitions(records);
  const current = els.rankingCompetition.value;
  els.rankingCompetition.innerHTML = '<option value="">全部盃賽</option>' + competitions
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
  if (competitions.includes(current)) {
    els.rankingCompetition.value = current;
  }
  renderTournamentRankings(records);
}

function getRankingPlayerEntry(map, player, fallbackTeam) {
  const name = (player.name || "").trim();
  if (!name) return null;
  const team = (player.team || fallbackTeam || "").trim();
  const key = getPlayerKey(name, team);
  if (!map.has(key)) {
    map.set(key, {
      name,
      team,
      ranks: [],
      speech: [],
      question: [],
      defense: [],
    });
  }
  return map.get(key);
}

function getTournamentRankingData(records, competitionFilter) {
  const normalizedCompetition = normalizeCompetitionName(competitionFilter || "");
  const players = new Map();
  records
    .filter((record) => !normalizedCompetition || normalizeCompetitionName(record.competitionName) === normalizedCompetition)
    .forEach((record) => {
      const teams = record.teams || {};
      getRankedMatchPlayers(record.players, teams).forEach((player, index) => {
        const entry = getRankingPlayerEntry(players, player, player.team);
        if (entry) entry.ranks.push(index + 1);
      });

      SIDES.forEach((side) => {
        (record.players?.[side] || []).forEach((player) => {
          const entry = getRankingPlayerEntry(players, player, teams[side] || SIDE_LABELS[side]);
          if (!entry) return;
          SCORE_FIELDS.forEach((field) => {
            const value = Number(player[field]);
            if (Number.isFinite(value)) entry[field].push(value);
          });
        });
      });
    });
  return [...players.values()];
}

function getSelectedRankingValues(values, direction, bestCount) {
  const sorted = [...values].sort((a, b) => direction === "asc" ? a - b : b - a);
  return bestCount > 0 ? sorted.slice(0, bestCount) : sorted;
}

function buildRankSumLeaders(players, minAppearances, bestCount) {
  return players
    .filter((player) => player.ranks.length >= minAppearances)
    .map((player) => {
      const selected = getSelectedRankingValues(player.ranks, "asc", bestCount);
      const sum = selected.reduce((total, rank) => total + rank, 0);
      return {
        ...player,
        value: sum,
        selectedText: selected.join("、"),
        count: player.ranks.length,
      };
    })
    .sort((a, b) => a.value - b.value || b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
}

function buildScoreLeaders(players, field, minAppearances, bestCount) {
  return players
    .filter((player) => player[field].length >= minAppearances)
    .map((player) => {
      const selected = getSelectedRankingValues(player[field], "desc", bestCount);
      const average = selected.reduce((total, score) => total + score, 0) / Math.max(1, selected.length);
      return {
        ...player,
        value: average,
        selectedText: selected.map(formatNumber).join("、"),
        count: player[field].length,
      };
    })
    .sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 3);
}

function renderRankingTable(container, rows, valueLabel, emptyText, valueFormatter = formatNumber) {
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = `<p class="empty-note">${escapeHtml(emptyText)}</p>`;
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>選手</th>
          <th>隊伍</th>
          <th>${escapeHtml(valueLabel)}</th>
          <th>採計</th>
          <th>資料數</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.name || "—")}</td>
            <td>${escapeHtml(row.team || "—")}</td>
            <td>${escapeHtml(valueFormatter(row.value))}</td>
            <td>${escapeHtml(row.selectedText || "—")}</td>
            <td>${row.count}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderTournamentRankings(records = readRecords()) {
  if (!els.rankingCompetition) return;
  const competition = els.rankingCompetition.value || "";
  const minAppearances = Number.parseInt(els.rankingMinAppearances?.value || "3", 10);
  const bestCount = Number.parseInt(els.rankingBestCount?.value || "3", 10);
  const players = getTournamentRankingData(records, competition);
  const emptySuffix = competition ? "此盃賽目前沒有符合門檻的資料。" : "目前沒有符合門檻的資料。";

  renderRankingTable(
    els.rankSumLeaders,
    buildRankSumLeaders(players, minAppearances, bestCount),
    "名次加總",
    emptySuffix,
    (value) => String(value)
  );
  renderRankingTable(
    els.speechLeaders,
    buildScoreLeaders(players, "speech", minAppearances, bestCount),
    "平均分",
    emptySuffix
  );
  renderRankingTable(
    els.questionLeaders,
    buildScoreLeaders(players, "question", minAppearances, bestCount),
    "平均分",
    emptySuffix
  );
  renderRankingTable(
    els.defenseLeaders,
    buildScoreLeaders(players, "defense", minAppearances, bestCount),
    "平均分",
    emptySuffix
  );
}

function savePlayerSelfRecord() {
  const name = els.playerSelfName.value.trim();
  if (!name) {
    flashStatus("請先輸入選手姓名");
    return;
  }
  const speech = numericValue(els.playerSelfSpeech);
  const question = numericValue(els.playerSelfQuestion);
  const defense = numericValue(els.playerSelfDefense);
  const record = {
    id: crypto.randomUUID(),
    name,
    competitionName: els.playerSelfCompetition.value.trim() || "自填練習紀錄",
    matchDate: els.playerSelfDate.value || new Date().toISOString().slice(0, 10),
    matchLabel: els.playerSelfMatch.value.trim() || "自填場次",
    speech,
    question,
    defense,
    total: speech + question + defense,
    note: els.playerSelfNote.value.trim(),
    createdAt: new Date().toISOString(),
  };
  writePlayerGrowthRecords([record, ...readPlayerGrowthRecords()]);
  els.playerGrowthName.value = name;
  els.playerGrowthCompetition.value = record.competitionName;
  [els.playerSelfMatch, els.playerSelfSpeech, els.playerSelfQuestion, els.playerSelfDefense, els.playerSelfNote].forEach((input) => { input.value = ""; });
    flashStatus("已儲存選手紀錄");
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
  if (viewId === "rosterView") {
    renderRosters();
  }
  if (viewId === "playerView") {
    renderPlayerGrowthOptions();
    renderPlayerGrowth();
    renderTournamentRankingOptions();
  }
}

function renderMatchSummaries(records = readRecords()) {
  const filteredRecords = getFilteredRecords(records);
  const summaries = getMatchSummaries(filteredRecords);
  const allSummaries = getMatchSummaries(records);
  els.matchSummaryCount.textContent = recordFilters.competition || recordFilters.period || recordFilters.venue
    ? `${summaries.length} / ${allSummaries.length} 場`
    : `${summaries.length} 場`;
  els.matchSummaryList.innerHTML = "";

  if (!summaries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-records";
    empty.textContent = records.length ? "目前篩選沒有符合的場次。" : "儲存裁判表後，這裡會自動統計同一場比賽的票數。";
    els.matchSummaryList.append(empty);
    return;
  }

  summaries.forEach((summary) => {
    const article = document.createElement("article");
    article.className = "match-summary";
    const winner = getSummaryWinner(summary);
    const judges = [...new Set(summary.judges)].join("、") || "未填";
    const dateText = summary.date ? `｜${summary.date}` : "";
    const bestSpeakerText = formatSummaryBestSpeakers(summary);

    article.innerHTML = `
      <div>
        <h3>${escapeHtml(summary.matchLabel)}</h3>
        <p class="record-meta">${escapeHtml(summary.competitionName)}${escapeHtml(dateText)}｜裁判表 ${summary.ballots} 張｜裁判：${escapeHtml(judges)}</p>
        <p class="summary-scoreline">評分單：${summary.affirmativeVotes}：${summary.negativeVotes}${summary.unresolvedVotes ? `｜未決 ${summary.unresolvedVotes}` : ""}</p>
        <p class="summary-best-speaker">該場最佳辯手：${escapeHtml(bestSpeakerText)}</p>
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
          <p>${escapeHtml(summary.affirmativeTeam)}</p>
          <strong>${formatNumber(summary.affirmativeSpeakerRankPoints)}</strong>
          <span>辯士排名加總</span>
        </div>
        <div>
          <p>${escapeHtml(summary.negativeTeam)}</p>
          <strong>${formatNumber(summary.negativeSpeakerRankPoints)}</strong>
          <span>辯士排名加總</span>
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
      .ballot-photo {
        margin-top: 14px;
        border: 1px solid #d9e1ea;
        border-radius: 8px;
        padding: 12px;
        background: #f8fafc;
      }
      .ballot-photo p { margin: 0 0 8px; color: #667085; font-weight: 800; }
      .ballot-photo img {
        display: block;
        width: 100%;
        max-height: 520px;
        object-fit: contain;
        border-radius: 6px;
        background: #fff;
      }
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
    <td class="number">${formatNumber(summary.affirmativeSpeakerRankPoints)}</td>
    <td class="number">${formatNumber(summary.negativeSpeakerRankPoints)}</td>
    <td>${escapeHtml(formatSummaryBestSpeakers(summary))}</td>
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
          <th class="number">正方辯士加總</th>
          <th class="number">反方辯士加總</th>
          <th>該場最佳辯手</th>
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
  const recordWinner = getRecordWinner(record);
  const affirmativeWon = recordWinner === "正方勝";
  const negativeWon = recordWinner === "反方勝";

  return `<article>
    <h2>${escapeHtml(getMatchLabel(record))}</h2>
    <p class="meta">${escapeHtml(competitionText)}${escapeHtml(recordWinner)}${escapeHtml(dateText)}${escapeHtml(judgeText)}${escapeHtml(recorderText)}</p>
    <p class="best">單場最佳：${escapeHtml(formatBestPlayers(bestPlayers))}</p>
    ${buildReportRankingHtml(record)}
    <div class="summary">
      <div class="box ${affirmativeWon ? "winner" : ""}">
        <p>${escapeHtml(record.teams.affirmative)}</p>
        <strong>${formatNumber(record.totals.affirmative)}</strong>
      </div>
      <div class="box">
        <p>結果</p>
        <strong>${escapeHtml(recordWinner)}</strong>
      </div>
      <div class="box ${negativeWon ? "winner" : ""}">
        <p>${escapeHtml(record.teams.negative)}</p>
        <strong>${formatNumber(record.totals.negative)}</strong>
      </div>
    </div>
    ${buildReportTeamTable(record, "affirmative")}
    ${buildReportTeamTable(record, "negative")}
    ${buildReportPhotoHtml(record)}
  </article>`;
}

function buildReportPhotoHtml(record) {
  if (!record.ballotPhoto?.dataUrl) return "";
  const name = record.ballotPhoto.name ? `｜${record.ballotPhoto.name}` : "";
  return `<div class="ballot-photo">
    <p>評分單照片${escapeHtml(name)}</p>
    <img src="${escapeHtml(record.ballotPhoto.dataUrl)}" alt="評分單照片" />
  </div>`;
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
  const closingScore = record.closingScores?.[side] ?? 0;
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
    <caption>${escapeHtml(SIDE_LABELS[side])}｜${escapeHtml(teamName)}｜論點 ${formatNumber(argumentScore)}｜結辯 ${formatNumber(closingScore)}</caption>
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

function buildSpreadsheetCsv(records, rosters = readRosters()) {
  return `\uFEFF${buildSpreadsheetRows(records, rosters).map((row) => row.map(csvCell).join(",")).join("\n")}`;
}

function buildSpreadsheetTsv(records, rosters = readRosters()) {
  return buildSpreadsheetRows(records, rosters).map((row) => row.map(tsvCell).join("\t")).join("\n");
}

function buildSpreadsheetRows(records, rosters = readRosters()) {
  const summariesByKey = new Map(getMatchSummaries(records).map((summary) => [summary.key, summary]));
  const rows = [[
    "資料類型",
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
    "正方結辯分",
    "反方結辯分",
    "正方總分",
    "反方總分",
    "單場最佳",
    "評分單照片",
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
          "裁判表",
          record.competitionName || "",
          record.period || "",
          record.venue || "",
          record.matchDate || "",
          record.judge || "",
          record.recorder || "",
          getRecordWinner(record),
          matchSummary?.affirmativeVotes ?? "",
          matchSummary?.negativeVotes ?? "",
          matchSummary ? getSummaryWinner(matchSummary) : "",
          matchSummary?.ballots ?? "",
          record.teams?.affirmative || "",
          record.teams?.negative || "",
          record.argumentScores?.affirmative ?? 0,
          record.argumentScores?.negative ?? 0,
          record.closingScores?.affirmative ?? 0,
          record.closingScores?.negative ?? 0,
          record.totals?.affirmative ?? 0,
          record.totals?.negative ?? 0,
          formatBestPlayers(record.bestPlayers?.length ? record.bestPlayers : getBestPlayers(record.players, record.teams)),
          record.ballotPhoto?.dataUrl ? record.ballotPhoto.name || "有" : "無",
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

  rosters.forEach((roster) => {
    const players = roster.players?.length ? roster.players : [""];
    players.forEach((playerName, index) => {
      rows.push([
        isCompetitionMarker(roster) ? "盃賽檢錄" : "檢錄名單",
        roster.competitionName || "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        roster.team === COMPETITION_MARKER_TEAM ? "" : roster.team || "",
        index + 1,
        playerName || "",
        "",
        "",
        "",
        "",
        "",
      ]);
    });
  });

  return rows;
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function tsvCell(value) {
  return String(value ?? "")
    .replaceAll("\t", " ")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ");
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

async function handleBallotPhotoChange() {
  const file = els.ballotPhotoInput.files?.[0];
  if (!file) {
    setBallotPhoto(null);
    return;
  }

  if (!file.type.startsWith("image/")) {
    setBallotPhoto(null);
    flashStatus("請選擇圖片檔");
    return;
  }

  if (els.ballotPhotoStatus) els.ballotPhotoStatus.textContent = "照片處理中";
  els.removeBallotPhoto.disabled = true;

  try {
    const dataUrl = await resizeImageFile(file);
    setBallotPhoto({
      name: file.name || "評分單照片",
      type: "image/jpeg",
      dataUrl,
      savedAt: new Date().toISOString(),
    });
    markDirty();
    flashStatus("已附加評分單照片");
  } catch {
    setBallotPhoto(null);
    flashStatus("照片讀取失敗，請換一張再試");
  }
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function setBallotPhoto(photo) {
  currentBallotPhoto = photo;
  els.ballotPhotoInput.value = "";
  els.removeBallotPhoto.disabled = !photo;

  if (!photo?.dataUrl) {
    if (els.ballotPhotoStatus) els.ballotPhotoStatus.textContent = "尚未附加照片";
    els.ballotPhotoPreview.classList.add("is-empty");
    els.ballotPhotoPreview.innerHTML = "<span>照片預覽</span>";
    return;
  }

  if (els.ballotPhotoStatus) els.ballotPhotoStatus.textContent = photo.name || "已附加照片";
  els.ballotPhotoPreview.classList.remove("is-empty");
  els.ballotPhotoPreview.innerHTML = `<img src="${escapeHtml(photo.dataUrl)}" alt="評分單照片預覽" />`;
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
  ).slice(0, 5);
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

function readRosters() {
  try {
    return JSON.parse(localStorage.getItem(ROSTER_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function isCompetitionMarker(roster) {
  return roster?.team === COMPETITION_MARKER_TEAM || roster?.kind === "competition-marker";
}

function writeRosters(rosters) {
  localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(rosters));
  renderRosters();
  renderNameSuggestions();
}

function saveRosterTeam() {
  const competitionName = els.rosterCompetition.value.trim() || els.competitionName.value.trim() || "未命名盃賽";
  const team = els.rosterTeam.value.trim();
  const players = els.rosterPlayers.value.split(/\n|、|,|，/).map((name) => name.trim()).filter(Boolean).slice(0, 12);
  if (!team || !players.length) {
    flashStatus("請先填隊伍名稱與至少一位選手");
    return;
  }
  const roster = { id: `${competitionName}｜${team}`, competitionName, team, players, updatedAt: new Date().toISOString() };
  const rosters = readRosters().filter((item) => item.id !== roster.id);
  writeRosters([roster, ...rosters]);
  els.rosterTeam.value = "";
  els.rosterPlayers.value = "";
  if (normalizeCompetitionName(competitionName) === normalizeCompetitionName(els.competitionName.value)) {
    hideNewCompetitionPrompt();
  }
  flashStatus("已儲存選手名單");
}

function getSelectedRoster(side) {
  const select = els[`${side}RosterSelect`];
  if (!select?.value) return null;
  return readRosters().find((item) => item.id === select.value) || null;
}

function normalizePersonName(name) {
  return String(name || "").trim().replace(/\s+/g, "");
}

function normalizeName(name) {
  return normalizePersonName(name);
}

function normalizeTeamName(name) {
  return String(name || "").trim().replace(/\s+/g, "");
}

function findRosterByTeam(competitionName, teamName) {
  const cleanTeam = normalizeTeamName(teamName);
  if (!cleanTeam) return null;
  const rosters = readRosters().filter((roster) => !isCompetitionMarker(roster));
  return rosters.find((roster) => {
    const sameTeam = normalizeTeamName(roster.team) === cleanTeam;
    const sameCompetition = !competitionName || roster.competitionName === competitionName;
    return sameTeam && sameCompetition;
  }) || rosters.find((roster) => normalizeTeamName(roster.team) === cleanTeam) || null;
}

function getRosterForSide(side) {
  const selectedRoster = getSelectedRoster(side);
  if (selectedRoster) return selectedRoster;

  const competitionName = els.competitionName.value.trim();
  const teamName = els[`${side}Team`].value.trim();
  if (!teamName) return null;

  return findRosterByTeam(competitionName, teamName);
}


function normalizeCompetitionName(name) {
  return String(name || "").trim().replace(/\s+/g, "");
}

function hasRosterForCompetition(competitionName) {
  const cleanCompetition = normalizeCompetitionName(competitionName);
  if (!cleanCompetition) return true;
  return readRosters().some((roster) => normalizeCompetitionName(roster.competitionName) === cleanCompetition);
}

function hideNewCompetitionPrompt() {
  const prompt = els.competitionNewRosterPrompt;
  if (!prompt) return;
  prompt.classList.add("is-hidden");
  prompt.innerHTML = "";
}

function createCompetitionRosterMarker(competitionName) {
  const cleanCompetition = String(competitionName || "").trim();
  if (!cleanCompetition) return null;
  if (hasRosterForCompetition(cleanCompetition)) return null;
  const marker = {
    id: `${cleanCompetition}｜${COMPETITION_MARKER_TEAM}`,
    kind: "competition-marker",
    competitionName: cleanCompetition,
    team: COMPETITION_MARKER_TEAM,
    players: [],
    updatedAt: new Date().toISOString(),
  };
  writeRosters([marker, ...readRosters()]);
  return marker;
}

function showNewCompetitionPrompt(competitionName) {
  const prompt = els.competitionNewRosterPrompt;
  if (!prompt || !competitionName) return;
  prompt.classList.remove("is-hidden");
  prompt.innerHTML = "";

  const message = document.createElement("span");
  message.textContent = `偵測到「${competitionName}」尚未建立賽事檢錄，要先檢錄嗎？`;

  const createButton = document.createElement("button");
  createButton.type = "button";
  createButton.textContent = "直接建立盃賽檢錄";
  createButton.addEventListener("click", () => {
    const marker = createCompetitionRosterMarker(competitionName);
    hideNewCompetitionPrompt();
    if (marker) {
      flashStatus(`已建立「${competitionName}」的賽事檢錄，可繼續建立隊伍與選手`);
    } else {
      flashStatus(`「${competitionName}」已在賽事檢錄中`);
    }
    renderRosters();
  });

  const rosterButton = document.createElement("button");
  rosterButton.type = "button";
  rosterButton.textContent = "去賽事檢錄補隊伍";
  rosterButton.addEventListener("click", () => {
    els.rosterCompetition.value = competitionName;
    hideNewCompetitionPrompt();
    switchView("rosterView");
    els.rosterTeam.focus();
    flashStatus("請建立此盃賽的隊伍與選手名單");
  });

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.className = "muted-action";
  dismissButton.textContent = "先不要";
  dismissButton.addEventListener("click", hideNewCompetitionPrompt);

  prompt.append(message, createButton, rosterButton, dismissButton);
}

function checkUnknownCompetitionForRoster() {
  const competitionName = els.competitionName.value.trim();
  if (!competitionName || hasRosterForCompetition(competitionName)) {
    hideNewCompetitionPrompt();
    return;
  }
  showNewCompetitionPrompt(competitionName);
}

function hideNewTeamPrompt(side) {
  const prompt = els[`${side}NewTeamPrompt`];
  if (!prompt) return;
  prompt.classList.add("is-hidden");
  prompt.innerHTML = "";
}

function createEmptyRosterForSide(side) {
  const team = els[`${side}Team`].value.trim();
  if (!team) return null;
  const competitionName = els.competitionName.value.trim() || "未命名盃賽";
  const existing = findRosterByTeam(competitionName, team);
  if (existing) return existing;
  const roster = { id: `${competitionName}｜${team}`, competitionName, team, players: [], updatedAt: new Date().toISOString() };
  writeRosters([roster, ...readRosters()]);
  return roster;
}

function showNewTeamPrompt(side, teamName) {
  const prompt = els[`${side}NewTeamPrompt`];
  if (!prompt || !teamName) return;
  prompt.classList.remove("is-hidden");
  prompt.innerHTML = "";

  const competitionName = els.competitionName.value.trim() || "未命名盃賽";
  const message = document.createElement("span");
  message.textContent = `偵測到「${teamName}」尚未在「${competitionName}」建立檢錄，要建立嗎？`;

  const createButton = document.createElement("button");
  createButton.type = "button";
  createButton.textContent = "建立檢錄";
  createButton.addEventListener("click", () => {
    const roster = createEmptyRosterForSide(side);
    hideNewTeamPrompt(side);
    if (roster) {
      const select = els[`${side}RosterSelect`];
      if (select) select.value = roster.id;
      renderRosterPlayerPicks(side);
      flashStatus(`已建立 ${roster.team} 的檢錄名單，可再補選手`);
    }
  });

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "去賽事檢錄填選手";
  editButton.addEventListener("click", () => {
    const roster = createEmptyRosterForSide(side);
    if (roster) editRoster(roster.id);
    els.rosterCompetition.value = competitionName;
    els.rosterTeam.value = teamName;
    hideNewTeamPrompt(side);
    switchView("rosterView");
    els.rosterPlayers.focus();
  });

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.className = "muted-action";
  dismissButton.textContent = "先不要";
  dismissButton.addEventListener("click", () => hideNewTeamPrompt(side));

  prompt.append(message, createButton, editButton, dismissButton);
}

function checkUnknownTeamForRoster(side) {
  const teamName = els[`${side}Team`].value.trim();
  if (!teamName) {
    hideNewTeamPrompt(side);
    return;
  }
  const competitionName = els.competitionName.value.trim();
  const roster = findRosterByTeam(competitionName, teamName);
  if (roster) {
    hideNewTeamPrompt(side);
    const select = els[`${side}RosterSelect`];
    if (select) {
      select.value = roster.id;
      renderRosterPlayerPicks(side);
      renderSidePlayerSuggestions(side);
    }
    return;
  }
  showNewTeamPrompt(side, teamName);
}

function hideNewPlayerPrompt(side) {
  const prompt = els[`${side}NewPlayerPrompt`];
  if (!prompt) return;
  prompt.classList.add("is-hidden");
  prompt.innerHTML = "";
}

function addPlayerToRoster(rosterId, playerName) {
  const cleanName = String(playerName || "").trim();
  if (!cleanName) return false;

  let changed = false;
  const rosters = readRosters().map((roster) => {
    if (roster.id !== rosterId) return roster;
    const players = Array.isArray(roster.players) ? [...roster.players] : [];
    const exists = players.some((name) => normalizePersonName(name) === normalizePersonName(cleanName));
    if (exists) return roster;
    changed = true;
    return { ...roster, players: [...players, cleanName], updatedAt: new Date().toISOString() };
  });

  if (changed) writeRosters(rosters);
  return changed;
}

function showNewPlayerPrompt(side, roster, playerName) {
  const prompt = els[`${side}NewPlayerPrompt`];
  if (!prompt || !roster) return;
  prompt.classList.remove("is-hidden");
  prompt.innerHTML = "";

  const message = document.createElement("span");
  message.textContent = `偵測到「${playerName}」不在 ${roster.team} 的檢錄名單，要加入嗎？`;

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = `加入 ${roster.team}`;
  addButton.addEventListener("click", () => {
    const added = addPlayerToRoster(roster.id, playerName);
    hideNewPlayerPrompt(side);
    if (added) {
      flashStatus(`已將 ${playerName} 加入 ${roster.team}`);
    } else {
      flashStatus(`${playerName} 已在 ${roster.team} 名單內`);
    }
  });

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "去賽事檢錄編輯";
  editButton.addEventListener("click", () => {
    editRoster(roster.id);
    switchView("rosterView");
  });

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.className = "muted-action";
  dismissButton.textContent = "先不要";
  dismissButton.addEventListener("click", () => hideNewPlayerPrompt(side));

  prompt.append(message, addButton, editButton, dismissButton);
}

function checkUnknownPlayerForRoster(side, input) {
  const playerName = input.value.trim();
  if (!playerName) {
    hideNewPlayerPrompt(side);
    return;
  }

  const roster = getRosterForSide(side);
  if (!roster || !Array.isArray(roster.players)) {
    hideNewPlayerPrompt(side);
    return;
  }

  const exists = roster.players.some((name) => normalizePersonName(name) === normalizePersonName(playerName));
  if (exists) {
    hideNewPlayerPrompt(side);
    return;
  }

  showNewPlayerPrompt(side, roster, playerName);
}

function checkUnknownPlayersForSide(side) {
  const rows = [...els[`${side}Rows`].querySelectorAll("tr")];
  const firstUnknownInput = rows
    .map((row) => row.querySelector('[data-field="name"]'))
    .find((input) => {
      const roster = getRosterForSide(side);
      const playerName = input.value.trim();
      if (!roster || !playerName) return false;
      return !(roster.players || []).some((name) => normalizePersonName(name) === normalizePersonName(playerName));
    });
  if (firstUnknownInput) checkUnknownPlayerForRoster(side, firstUnknownInput);
}

function renderRosterPlayerPicks(side) {
  const container = els[`${side}RosterPlayers`];
  if (!container) return;
  const roster = getSelectedRoster(side);
  container.innerHTML = "";

  if (!roster || !roster.players?.length) {
    container.textContent = "選擇隊伍後，這裡會出現該隊選手快捷按鈕。";
    return;
  }

  const label = document.createElement("strong");
  label.textContent = "隊內選手：";
  container.append(label);

  roster.players.forEach((playerName) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = playerName;
    button.title = "點一下填入第一個空白選手欄；若已滿，會提醒你手動選擇要替換的位置。";
    button.addEventListener("click", () => insertRosterPlayer(side, playerName));
    container.append(button);
  });
}

function renderRosterPlayerPickers() {
  SIDES.forEach(renderRosterPlayerPicks);
}

function insertRosterPlayer(side, playerName) {
  const rows = [...els[`${side}Rows`].querySelectorAll("tr")];
  const nameInputs = rows.map((row) => row.querySelector('[data-field="name"]'));
  const existing = nameInputs.find((input) => input.value.trim() === playerName);
  if (existing) {
    existing.focus();
    existing.select();
    flashStatus(`${playerName} 已在${SIDE_LABELS[side]}名單中`);
    return;
  }
  const emptyInput = nameInputs.find((input) => !input.value.trim());
  if (!emptyInput) {
    flashStatus(`${SIDE_LABELS[side]}三格已滿，可手動點選要替換的選手欄位`);
    return;
  }
  emptyInput.value = playerName;
  calculate();
  markDirty();
  hideNewPlayerPrompt(side);
  flashStatus(`已加入 ${playerName}`);
}

function editRoster(rosterId) {
  const roster = readRosters().find((item) => item.id === rosterId);
  if (!roster) return;
  els.rosterCompetition.value = roster.competitionName;
  els.rosterTeam.value = roster.team;
  els.rosterPlayers.value = (roster.players || []).join("\n");
  els.rosterTeam.focus();
  flashStatus("已載入名單，可修改後按儲存／更新名單");
}

function renderRosters() {
  const rosters = readRosters().filter((roster) => !isCompetitionMarker(roster));
  const activeCompetition = els.competitionName.value.trim();
  const options = rosters.filter((roster) => !activeCompetition || roster.competitionName === activeCompetition);
  [els.affirmativeRosterSelect, els.negativeRosterSelect].forEach((select) => {
    if (!select) return;
    const previousValue = select.value;
    select.innerHTML = "";
    select.append(new Option(options.length ? "選擇隊伍" : "尚無名單", ""));
    options.forEach((roster) => select.append(new Option(`${roster.competitionName}｜${roster.team}`, roster.id)));
    if (options.some((roster) => roster.id === previousValue)) select.value = previousValue;
  });
  renderRosterPlayerPickers();
  SIDES.forEach(renderSidePlayerSuggestions);

  els.rosterList.innerHTML = "";
  if (!rosters.length) {
    const empty = document.createElement("p");
    empty.className = "empty-records";
    empty.textContent = "尚未建立選手名單。";
    els.rosterList.append(empty);
    return;
  }

  rosters.forEach((roster) => {
    const item = document.createElement("article");
    item.className = "roster-card";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(roster.team)}</strong>
        <p>${escapeHtml(roster.competitionName)}｜${escapeHtml((roster.players || []).length ? roster.players.join("、") : "尚未填選手")}</p>
      </div>
      <div class="roster-card-actions">
        <button class="small-action" type="button" data-edit-roster="${escapeHtml(roster.id)}">編輯</button>
        <button class="small-action" type="button" data-delete-roster="${escapeHtml(roster.id)}">刪除</button>
      </div>
    `;
    item.querySelector("[data-edit-roster]").addEventListener("click", () => editRoster(roster.id));
    item.querySelector("[data-delete-roster]").addEventListener("click", () => {
      writeRosters(readRosters().filter((candidate) => candidate.id !== roster.id));
      flashStatus("已刪除選手名單");
    });
    els.rosterList.append(item);
  });
}

function loadRosterToSide(side) {
  const roster = getSelectedRoster(side);
  if (!roster) {
    flashStatus("請先選擇隊伍名單");
    return;
  }
  if (!confirmDiscardUnsaved(`帶入${SIDE_LABELS[side]}名單`)) return;
  els.competitionName.value = roster.competitionName;
  els[`${side}Team`].value = roster.team;
  const rows = [...els[`${side}Rows`].querySelectorAll("tr")];
  rows.forEach((row, index) => {
    row.querySelector('[data-field="name"]').value = roster.players[index] || "";
  });
  calculate();
  renderSeasonRankings();
  renderRosters();
  hideNewTeamPrompt(side);
  hideNewPlayerPrompt(side);
  markDirty();
  flashStatus(`已帶入${SIDE_LABELS[side]}名單`);
}
function flashSaveButton() {
  els.saveMatch.classList.add("is-saved");
  window.clearTimeout(flashSaveButton.timer);
  flashSaveButton.timer = window.setTimeout(() => els.saveMatch.classList.remove("is-saved"), 900);
}

function init() {
  createRows();
  setScoreTabOrder();
  els.matchDate.value = new Date().toISOString().slice(0, 10);
  document.querySelectorAll(".match-meta input, .panel-heading input").forEach((input) => {
    prepareNumericInput(input);
    input.addEventListener("input", () => {
      normalizeIntegerInput(input);
      normalizeScoreInput(input);
      calculate();
      markDirty();
      if (input === els.competitionName) {
        renderSeasonRankings();
        els.rosterCompetition.value = els.competitionName.value;
        renderRosters();
        if (!els.competitionName.value.trim()) hideNewCompetitionPrompt();
      }
    });
  });
  els.competitionName.addEventListener("blur", checkUnknownCompetitionForRoster);
  els.competitionName.addEventListener("change", () => { checkUnknownCompetitionForRoster(); renderNameSuggestions(); });
  els.rosterCompetition.addEventListener("input", renderNameSuggestions);
  els.saveMatch.addEventListener("click", saveMatch);
  els.saveRosterTeam.addEventListener("click", saveRosterTeam);
  if (els.loadAffirmativeRoster) els.loadAffirmativeRoster.addEventListener("click", () => loadRosterToSide("affirmative"));
  if (els.loadNegativeRoster) els.loadNegativeRoster.addEventListener("click", () => loadRosterToSide("negative"));
  if (els.affirmativeRosterSelect) els.affirmativeRosterSelect.addEventListener("change", () => {
    renderRosterPlayerPicks("affirmative");
    checkUnknownPlayersForSide("affirmative");
  });
  if (els.negativeRosterSelect) els.negativeRosterSelect.addEventListener("change", () => {
    renderRosterPlayerPicks("negative");
    checkUnknownPlayersForSide("negative");
  });
  SIDES.forEach((side) => {
    els[`${side}Team`].addEventListener("input", () => { renderSidePlayerSuggestions(side); checkUnknownPlayersForSide(side); });
    els[`${side}Team`].addEventListener("blur", () => checkUnknownTeamForRoster(side));
    els[`${side}Team`].addEventListener("change", () => { checkUnknownTeamForRoster(side); renderSidePlayerSuggestions(side); checkUnknownPlayersForSide(side); });
  });
  els.recordCompetitionFilter.addEventListener("change", () => { recordFilters.competition = els.recordCompetitionFilter.value; refreshFilteredRecordViews(); });
  els.recordPeriodFilter.addEventListener("change", () => { recordFilters.period = els.recordPeriodFilter.value; refreshFilteredRecordViews(); });
  els.recordVenueFilter.addEventListener("change", () => { recordFilters.venue = els.recordVenueFilter.value; refreshFilteredRecordViews(); });
  els.clearRecordFilters.addEventListener("click", () => { recordFilters.competition = ""; recordFilters.period = ""; recordFilters.venue = ""; refreshFilteredRecordViews(); });
  els.swapSides.addEventListener("click", swapSides);
  els.ballotPhotoInput.addEventListener("change", handleBallotPhotoChange);
  els.removeBallotPhoto.addEventListener("click", () => {
    setBallotPhoto(null);
    markDirty();
    flashStatus("已移除評分單照片");
  });
  els.saveCloudEndpoint.addEventListener("click", saveCloudEndpoint);
  els.resetForm.addEventListener("click", () => { if (confirmDiscardUnsaved("清空輸入")) resetForm(); });
  els.exportRecords.addEventListener("click", exportRecords);
  els.exportSpreadsheet.addEventListener("click", exportSpreadsheet);
  if (els.exportFilteredSpreadsheet) els.exportFilteredSpreadsheet.addEventListener("click", exportSpreadsheet);
  els.showSpreadsheetText.addEventListener("click", showSpreadsheetText);
  els.copySpreadsheetText.addEventListener("click", copySpreadsheetText);
  els.importSpreadsheet.addEventListener("change", importSpreadsheet);
  if (els.importGlobalSpreadsheet) els.importGlobalSpreadsheet.addEventListener("change", importSpreadsheet);
  if (els.exportRosterData) els.exportRosterData.addEventListener("click", exportSpreadsheet);
  if (els.importRosterSpreadsheet) els.importRosterSpreadsheet.addEventListener("change", importSpreadsheet);
  els.clearRecords.addEventListener("click", clearRecords);
  if (els.savePlayerSelfRecord) els.savePlayerSelfRecord.addEventListener("click", savePlayerSelfRecord);
  if (els.renderPlayerGrowth) els.renderPlayerGrowth.addEventListener("click", renderPlayerGrowth);
  [els.playerGrowthName, els.playerGrowthTeam, els.playerGrowthMetric, els.playerGrowthCompetition].forEach((element) => {
    if (element) element.addEventListener("change", renderPlayerGrowth);
  });
  if (els.playerGrowthTeam) {
    els.playerGrowthTeam.addEventListener("input", () => {
      renderPlayerGrowthSuggestions();
      renderPlayerGrowth();
    });
  }
  if (els.playerGrowthCompetition) {
    els.playerGrowthCompetition.addEventListener("change", () => {
      renderPlayerGrowthSuggestions();
      renderPlayerGrowth();
    });
  }
  [els.rankingCompetition, els.rankingMinAppearances, els.rankingBestCount].forEach((element) => {
    if (element) element.addEventListener("change", () => renderTournamentRankings());
  });
  if (els.playerGrowthName) els.playerGrowthName.addEventListener("input", renderPlayerGrowth);
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
  els.cycleRankSelects.forEach((select) => {
    select.addEventListener("change", calculateCycle);
  });
  calculate();
  els.rosterCompetition.value = els.competitionName.value;
  renderRosters();
  markClean();
  renderMatchSummaries();
  renderRecords();
  renderNameSuggestions();
  renderSeasonRankings();
  renderCycleControls();
  if (els.playerSelfDate) els.playerSelfDate.value = new Date().toISOString().slice(0, 10);
  renderPlayerGrowthOptions();
  renderPlayerGrowth();
  renderTournamentRankingOptions();
  updateCloudStatus();
}

init();
