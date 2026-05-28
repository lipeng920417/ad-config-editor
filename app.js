/* eslint-disable no-alert */
const TEMPLATE = {
  ad_global_enabled: true,
  ad_user_segment_filter: null,
  ad_daily_show_limit: 10,
  ad_same_feature_interval_seconds: 300,
  ad_timed_interstitial_interval_seconds: 120,
  startup_duration_seconds: 8,
  ad_positions_config: [
    { name: "开屏广告", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/1708305700", ad_position_type: "start_splash" },
    { name: "首次插屏", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/4351770594", ad_position_type: "first_interstitial" },
    { name: "完成后视频插屏", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/4351770594", ad_position_type: "convert_complete_interstitial" },
    { name: "进入功能插屏", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/4351770594", ad_position_type: "enter_function_interstitial" },
    { name: "插屏", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/4351770594", ad_position_type: "function_interstitial" },
    { name: "120秒插屏", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/4351770594", ad_position_type: "timed_120s_interstitial" },
    { name: "激励视频", ad_enable: true, ad_position_id: "ca-app-pub-9936612306041989/1180408236", ad_position_type: "reward" },
  ],
};

function $(id) {
  return document.getElementById(id);
}

function message(kind, text) {
  const el = document.createElement("div");
  el.className = `msg ${kind === "ok" ? "msg--ok" : "msg--err"}`;
  el.textContent = text;
  $("messages").appendChild(el);
  setTimeout(() => el.remove(), 10_000);
}

function clearMessages() {
  $("messages").innerHTML = "";
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function normalizeConfig(raw) {
  const cfg = deepClone(raw);
  if (!Array.isArray(cfg.ad_positions_config)) cfg.ad_positions_config = [];
  return cfg;
}

function parseNullableJson(text) {
  const t = String(text ?? "").trim();
  if (t === "") return null;
  try {
    return JSON.parse(t);
  } catch (e) {
    throw new Error("ad_user_segment_filter 不是合法 JSON；留空表示 null");
  }
}

function setGlobalFields(cfg) {
  $("ad_global_enabled").value = String(Boolean(cfg.ad_global_enabled));
  $("ad_daily_show_limit").value = String(Number(cfg.ad_daily_show_limit ?? 0));
  $("ad_same_feature_interval_seconds").value = String(Number(cfg.ad_same_feature_interval_seconds ?? 0));
  $("startup_duration_seconds").value = String(Number(cfg.startup_duration_seconds ?? 8));
  $("ad_timed_interstitial_interval_seconds").value = String(Number(cfg.ad_timed_interstitial_interval_seconds ?? 0));
  $("ad_user_segment_filter").value =
    cfg.ad_user_segment_filter == null ? "" : JSON.stringify(cfg.ad_user_segment_filter);
}

function getGlobalFields() {
  const ad_user_segment_filter = parseNullableJson($("ad_user_segment_filter").value);
  return {
    ad_global_enabled: $("ad_global_enabled").value === "true",
    ad_user_segment_filter,
    ad_daily_show_limit: Number($("ad_daily_show_limit").value),
    ad_same_feature_interval_seconds: Number($("ad_same_feature_interval_seconds").value),
    startup_duration_seconds: Number($("startup_duration_seconds").value),
    ad_timed_interstitial_interval_seconds: Number($("ad_timed_interstitial_interval_seconds").value),
  };
}

function renderPositions(positions) {
  const body = $("positionsBody");
  body.innerHTML = "";

  positions.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.dataset.index = String(idx);

    tr.appendChild(tdInput("name", p.name ?? "", "text"));
    tr.appendChild(tdSelectBool("ad_enable", Boolean(p.ad_enable)));
    tr.appendChild(tdInput("ad_position_type", p.ad_position_type ?? "", "text"));
    tr.appendChild(tdInput("ad_position_id", p.ad_position_id ?? "", "text", "ca-app-pub-xxxx/yyyy"));

    const actions = document.createElement("td");
    actions.className = "table__actions";
    const row = document.createElement("div");
    row.className = "row";

    const btnUp = btn("上移", "btn btn--secondary", () => move(idx, -1));
    const btnDown = btn("下移", "btn btn--secondary", () => move(idx, 1));
    const btnDel = btn("删除", "btn btn--danger", () => remove(idx));
    row.append(btnUp, btnDown, btnDel);
    actions.appendChild(row);
    tr.appendChild(actions);

    body.appendChild(tr);
  });
}

function tdInput(key, value, type, placeholder) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.className = "input";
  input.type = type;
  input.value = value;
  if (placeholder) input.placeholder = placeholder;
  input.dataset.key = key;
  td.appendChild(input);
  return td;
}

function tdSelectBool(key, value) {
  const td = document.createElement("td");
  const select = document.createElement("select");
  select.className = "input";
  select.dataset.key = key;
  const o1 = document.createElement("option");
  o1.value = "true";
  o1.textContent = "true";
  const o2 = document.createElement("option");
  o2.value = "false";
  o2.textContent = "false";
  select.append(o1, o2);
  select.value = value ? "true" : "false";
  td.appendChild(select);
  return td;
}

function btn(text, cls, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.className = cls;
  b.addEventListener("click", onClick);
  return b;
}

let state = normalizeConfig(TEMPLATE);

function syncStateFromDom() {
  state = normalizeConfig({
    ...state,
    ...getGlobalFields(),
  });

  const rows = Array.from($("positionsBody").querySelectorAll("tr"));
  const next = rows.map((tr) => {
    const inputs = tr.querySelectorAll("input,select");
    const obj = {};
    inputs.forEach((el) => {
      const k = el.dataset.key;
      if (!k) return;
      if (k === "ad_enable") {
        obj[k] = el.value === "true";
      } else {
        obj[k] = el.value;
      }
    });
    return obj;
  });
  state.ad_positions_config = next;
}

function updateOutput() {
  syncStateFromDom();
  $("output").value = JSON.stringify(state, null, 2);
}

function addPosition() {
  syncStateFromDom();
  state.ad_positions_config.push({
    name: "",
    ad_enable: true,
    ad_position_type: "",
    ad_position_id: "",
  });
  renderPositions(state.ad_positions_config);
  updateOutput();
}

function move(index, delta) {
  syncStateFromDom();
  const arr = state.ad_positions_config;
  const next = index + delta;
  if (next < 0 || next >= arr.length) return;
  const tmp = arr[index];
  arr[index] = arr[next];
  arr[next] = tmp;
  renderPositions(arr);
  updateOutput();
}

function remove(index) {
  syncStateFromDom();
  state.ad_positions_config.splice(index, 1);
  renderPositions(state.ad_positions_config);
  updateOutput();
}

function sortByType() {
  syncStateFromDom();
  state.ad_positions_config.sort((a, b) => String(a.ad_position_type ?? "").localeCompare(String(b.ad_position_type ?? "")));
  renderPositions(state.ad_positions_config);
  updateOutput();
}

function validate(cfg) {
  const errors = [];
  if (typeof cfg.ad_global_enabled !== "boolean") errors.push("ad_global_enabled 必须是 boolean");
  if (!Number.isFinite(cfg.ad_daily_show_limit)) errors.push("ad_daily_show_limit 必须是 number");
  if (!Number.isFinite(cfg.ad_same_feature_interval_seconds)) errors.push("ad_same_feature_interval_seconds 必须是 number");
  if (!Number.isFinite(cfg.startup_duration_seconds)) errors.push("startup_duration_seconds 必须是 number");
  if (!Number.isFinite(cfg.ad_timed_interstitial_interval_seconds)) errors.push("ad_timed_interstitial_interval_seconds 必须是 number");
  if (!Array.isArray(cfg.ad_positions_config)) errors.push("ad_positions_config 必须是数组");

  const seenType = new Set();
  (cfg.ad_positions_config ?? []).forEach((p, idx) => {
    const prefix = `ad_positions_config[${idx}]`;
    if (!p || typeof p !== "object") {
      errors.push(`${prefix} 必须是 object`);
      return;
    }
    if (typeof p.name !== "string" || p.name.trim() === "") errors.push(`${prefix}.name 不能为空`);
    if (typeof p.ad_enable !== "boolean") errors.push(`${prefix}.ad_enable 必须是 boolean`);
    if (typeof p.ad_position_type !== "string" || p.ad_position_type.trim() === "") errors.push(`${prefix}.ad_position_type 不能为空`);
    if (typeof p.ad_position_id !== "string" || p.ad_position_id.trim() === "") errors.push(`${prefix}.ad_position_id 不能为空`);

    const t = String(p.ad_position_type ?? "").trim();
    if (t) {
      if (seenType.has(t)) errors.push(`${prefix}.ad_position_type 重复：${t}`);
      seenType.add(t);
    }
  });
  return errors;
}

function downloadJson() {
  updateOutput();
  const cfg = JSON.parse($("output").value);
  const errors = validate(cfg);
  clearMessages();
  if (errors.length) {
    errors.forEach((e) => message("err", e));
    return;
  }

  const blob = new Blob([$("output").value + "\n"], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "default_ad_config.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  message("ok", "已下载 default_ad_config.json");
}

function loadTemplate() {
  state = normalizeConfig(deepClone(TEMPLATE));
  setGlobalFields(state);
  renderPositions(state.ad_positions_config);
  updateOutput();
  clearMessages();
  message("ok", "已加载模板");
}

function applyImport() {
  const raw = $("importText").value.trim();
  if (!raw) {
    message("err", "导入区为空");
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    message("err", "导入 JSON 解析失败，请检查格式");
    return;
  }
  state = normalizeConfig(parsed);
  setGlobalFields(state);
  renderPositions(state.ad_positions_config);
  updateOutput();
  clearMessages();
  message("ok", "已应用导入 JSON");
}

function importFromPrompt() {
  const raw = window.prompt("粘贴 JSON 到这里：");
  if (!raw) return;
  $("importText").value = raw;
  applyImport();
}

function copyOutput() {
  updateOutput();
  navigator.clipboard
    .writeText($("output").value)
    .then(() => message("ok", "已复制到剪贴板"))
    .catch(() => message("err", "复制失败（浏览器权限限制），请手动复制"));
}

function bindAutoUpdate() {
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t && (t.matches("input") || t.matches("select") || t.matches("textarea"))) {
      if (t.id === "importText") return;
      updateOutput();
    }
  });
}

function main() {
  $("btnLoadTemplate").addEventListener("click", loadTemplate);
  $("btnImport").addEventListener("click", importFromPrompt);
  $("btnApplyImport").addEventListener("click", applyImport);
  $("btnAddPosition").addEventListener("click", addPosition);
  $("btnSortByType").addEventListener("click", sortByType);
  $("btnDownload").addEventListener("click", downloadJson);
  $("btnCopy").addEventListener("click", copyOutput);
  $("btnValidate").addEventListener("click", () => {
    updateOutput();
    clearMessages();
    const cfg = JSON.parse($("output").value);
    const errors = validate(cfg);
    if (!errors.length) {
      message("ok", "校验通过");
      return;
    }
    errors.forEach((e) => message("err", e));
  });

  loadTemplate();
  bindAutoUpdate();
}

main();

