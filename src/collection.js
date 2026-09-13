const $ = (s) => document.querySelector(s);
let state,
  page =
    new URLSearchParams(location.search).get("page") === "settings"
      ? "settings"
      : "basket",
  filter = "all",
  selected = null,
  noticeTimer;
// Animate only visible special catches; offscreen cards do not consume draw time.
const animatedCards = new Map();
const cardVisibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const item = animatedCards.get(entry.target);
    if (item) item.visible = entry.isIntersecting;
  }
});
function animateCard(card, item) {
  // if (item.undiscovered || !["glow", "prism"].includes(item.trait)) return;
  if (item.undiscovered) return;
  animatedCards.set(card, {
    item,
    canvas: card.querySelector("canvas"),
    visible: false,
  });
  cardVisibility.observe(card);
}
function notify(text) {
  $("#notice").textContent = text;
  $("#notice").hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => ($("#notice").hidden = true), 4500);
}
function render() {
  if (!state) return;
  document.body.dataset.page = page;
  cardVisibility.disconnect();
  animatedCards.clear();
  $("#total").innerHTML = `${state.catches.length} <small>条</small>`;
  $("#total-nav").textContent = state.catches.length;
  $("#species").innerHTML =
    `${new Set(state.catches.map((c) => c.species)).size} <small>/ 100</small>`;
  $("#special").innerHTML =
    `${state.catches.filter((c) => c.trait !== "normal").length} <small>条</small>`;
  $("#value").innerHTML =
    `${state.catches.reduce((a, c) => a + c.value, 0).toLocaleString()} <small>贝壳</small>`;
  $("#interval").textContent =
    `每 ${state.settings.min}–${state.settings.max} 分钟 · 随机咬钩`;
  $("#fishing-status").textContent = state.settings.paused
    ? "小船正在休息"
    : "小船正在垂钓";
  $("#inventory").hidden = page === "settings";
  $("#settings-panel").hidden = page !== "settings";
  $("#page-title").textContent =
    page === "atlas"
      ? "一百种相遇，慢慢收集。"
      : page === "settings"
        ? "给自己，留一点闲暇。"
        : "今天，也有新的收获。";
  $("#grid-title").innerHTML =
    page === "atlas"
      ? "海洋图鉴 <span>FIELD GUIDE · 100</span>"
      : "我的鱼篓 <span>COLLECTION</span>";
  $("#sort").hidden = page === "atlas";
  let items =
    page === "atlas"
      ? Sea.fish.map(
          (f) =>
            state.catches.find(
              (c) =>
                c.species === f.id && (filter === "all" || c.trait === filter),
            ) || { species: f.id, trait: "normal", undiscovered: true },
        )
      : [...state.catches];
  items = items.filter(
    (c) =>
      (filter === "all" || (!c.undiscovered && c.trait === filter)) &&
      (c.undiscovered ? "???" : Sea.fish[c.species].name).includes(
        $("#search").value.trim(),
      ),
  );
  if (page === "basket")
    items.sort((a, b) =>
      $("#sort").value === "name"
        ? Sea.fish[a.species].name.localeCompare(Sea.fish[b.species].name, "zh-CN") ||
          Sea.traits.findIndex((t) => t.id === a.trait) - Sea.traits.findIndex((t) => t.id === b.trait) ||
          b.time - a.time
        : $("#sort").value === "value"
        ? b.value - a.value
        : $("#sort").value === "size"
          ? Sea.catchWeight(b) - Sea.catchWeight(a)
          : b.time - a.time,
    );
  const grid = $("#grid");
  grid.replaceChildren();
  if (!items.length) {
    grid.innerHTML = `<div class="empty"><strong>${state.catches.length || page === "atlas" ? "这里暂时没有鱼" : "你的第一条鱼，正在路上。"}</strong><br>${state.catches.length || page === "atlas" ? "试试其他筛选条件。" : "小船已经出发。去忙一会儿，回来就可能有惊喜。<br>也可以点「试钓一下」预览收获，不计入收藏。"}</div>`;
    return;
  }
  for (const item of items) {
    const f = Sea.fish[item.species],
      t = Sea.traits.find((t) => t.id === item.trait);
    const card = document.createElement("button");
    card.className = "fish-card" + (item.undiscovered ? " undiscovered" : "");
    card.dataset.trait = item.undiscovered ? "locked" : item.trait;
    card.innerHTML = `<div class="fish-stage"><span class="trait">${item.undiscovered ? "尚未发现" : t.name + " · " + "✦".repeat(f.rarity)}</span><canvas width="256" height="160"></canvas></div><div class="fish-caption"><h3>${item.undiscovered ? "???" : f.name}</h3><div class="meta"><span>${item.undiscovered ? "???" : Sea.catchWeight(item) + " g"}</span><span class="price">${item.undiscovered ? "—" : item.value.toLocaleString() + " ◇"}</span></div></div>`;
    Art.fish(
      card.querySelector("canvas"),
      f,
      item.undiscovered ? "silhouette" : item.trait,
      0,
      item,
    );
    card.onclick = () => detail(item);
    grid.append(card);
    animateCard(card, item);
  }
}
function detail(c) {
  selected = c;
  const f = Sea.fish[c.species],
    t = Sea.traits.find((t) => t.id === c.trait);
  $("#detail-tag").textContent = c.undiscovered
    ? "尚未发现 / ???"
    : `${f.habitat} / ${"✦".repeat(f.rarity)} / ${t.name}`;
  $("#detail-name").textContent = c.undiscovered ? "???" : f.name;
  $("#description").textContent = c.undiscovered
    ? "海里还有一个秘密，等你亲手钓起。"
    : f.description;
  $("#detail-stats").innerHTML = c.undiscovered
    ? "<span>等待一次不期而遇。</span>"
    : `<div><small>克重 / 体长</small>${Sea.catchWeight(c)} g / ${c.length} cm</div><div><small>收藏价值</small>${c.value.toLocaleString()} 贝壳</div><div><small>性状加成</small>×${t.mult}</div>`;
  $("#caught-time").textContent = c.undiscovered
    ? "钓获后揭晓名字、外形和描述"
    : c.preview
      ? "试钓预览 · 不计入真实收藏"
      : "钓获于 " + new Date(c.time).toLocaleString("zh-CN");
  if (!$("#detail").open) $("#detail").showModal();
}
$(".close").onclick = () => $("#detail").close();
$("#detail").onclick = (e) => {
  if (e.target === $("#detail")) $("#detail").close();
};
function navigate(target) {
  page = ["basket", "atlas", "settings"].includes(target) ? target : "basket";
  if (!state) return;
  if ($("#detail").open) $("#detail").close();
  document
    .querySelectorAll("[data-page]")
    .forEach((x) => x.classList.toggle("active", x.dataset.page === page));
  if (page === "basket") desktop.read();
  if (page === "settings") {
    for (const k of ["min", "max"]) $("#" + k).value = state.settings[k];
    for (const k of ["top", "paused"]) $("#" + k).checked = state.settings[k];
  }
  render();
  window.scrollTo(0, 0);
}
document
  .querySelectorAll("[data-page]")
  .forEach((b) => (b.onclick = () => navigate(b.dataset.page)));
desktop.onNavigate(navigate);
$("#quit-app").onclick = () => desktop.quit();
$("#reset-size").onclick = async () => {
  await desktop.scale(1);
  notify("小船已恢复默认大小。");
};
document.querySelectorAll("[data-filter]").forEach(
  (b) =>
    (b.onclick = () => {
      filter = b.dataset.filter;
      document
        .querySelectorAll("[data-filter]")
        .forEach((x) => x.classList.toggle("active", x === b));
      render();
    }),
);
$("#sort").onchange = render;
$("#search").oninput = render;
$("#demo").onclick = async () => {
  const c = await desktop.demo();
  detail({ ...c, preview: true });
  notify("试钓成功！这条鱼是预览，不计入收藏。");
};
$("#settings-form").onsubmit = async (e) => {
  e.preventDefault();
  try {
    state = await desktop.settings({
      min: Number($("#min").value),
      max: Number($("#max").value),
      top: $("#top").checked,
      paused: $("#paused").checked,
    });
    $("#saved").textContent = "已保存，小船收到啦。";
    render();
  } catch (e) {
    $("#saved").textContent = "请输入有效范围：1–120 分钟，最短不超过最长。";
  }
};
Promise.all([desktop.state(), Art.ready]).then(([s]) => {
  state = s;
  navigate(page);
});
desktop.onState((s) => {
  state = s;
  render();
});
let lastAnimationFrame = 0,
  lastCardFrame = 0;
let sceneCatch = null,
  sceneStrikeAt = 0;
desktop.onCatch((c) => {
  sceneCatch = c;
  sceneStrikeAt = performance.now();
});
function animateCollection(now) {
  if (now - lastAnimationFrame >= 1000 / 30 && !document.hidden) {
    lastAnimationFrame = now;
    const t = now / 1000;
    if (
      now - lastCardFrame >= 1000 / 15 &&
      page !== "settings" &&
      !$("#detail").open
    ) {
      lastCardFrame = now;
      for (const { item, canvas, visible } of animatedCards.values())
        if (visible)
          Art.fish(canvas, Sea.fish[item.species], item.trait, t, item);
    }
    Art.scene(
      $("#hero-scene"),
      t,
      !!sceneCatch && now - sceneStrikeAt < 6500,
      sceneCatch,
      (now - sceneStrikeAt) / 1000,
    );
    if ($("#detail").open && selected)
      Art.fish(
        $("#detail canvas"),
        Sea.fish[selected.species],
        selected.undiscovered ? "silhouette" : selected.trait,
        t,
        selected,
      );
  }
  requestAnimationFrame(animateCollection);
}
requestAnimationFrame(animateCollection);

$("#format-save").onclick = async () => {
  const button = $("#format-save");
  button.disabled = true;
  try {
    const result = await desktop.format();
    if (result.cancelled) {
      notify("已取消格式化，收藏保留。");
      return;
    }
    state = result.state;
    render();
    notify("格式化完成，收藏已清空。");
  } catch (error) {
    notify("格式化失败，收藏未清空，请重试。");
  } finally {
    button.disabled = false;
  }
};
desktop.onFormatted(() => {
  selected = null;
  sceneCatch = null;
  if ($("#detail").open) $("#detail").close();
  filter = "all";
  $("#search").value = "";
  $("#sort").value = "new";
  document
    .querySelectorAll("[data-filter]")
    .forEach((b) => b.classList.toggle("active", b.dataset.filter === "all"));
  render();
});
// Bilingual language control: the selected locale is persisted in the shared save.
function installLanguageControl() {
  if (!state) return;
  const lang = state.language === "en";
  document.documentElement.lang = lang ? "en" : "zh-CN";
  const form = document.querySelector("#settings-form");
  if (form && !document.querySelector("#language")) {
    const label = document.createElement("label");
    label.textContent = lang ? "Language" : "语言";
    const select = document.createElement("select");
    select.id = "language";
    select.innerHTML =
      '<option value="en">English</option><option value="zh-CN">中文</option>';
    select.value = state.language;
    label.append(select);
    form.prepend(label);
    select.onchange = async () => {
      state = await desktop.settings({
        ...state.settings,
        language: select.value,
      });
      location.reload();
    };
  }
  if (lang) {
    document.querySelector('[data-page="basket"] span').textContent =
      "My Catch";
    document.querySelector('[data-page="atlas"] span').textContent =
      "Field Guide";
    document.querySelector('[data-page="settings"] span').textContent =
      "Settings";
    document.querySelector("#demo").textContent = "✧ Try fishing";
  }
}
const originalNavigate = navigate;
navigate = function (target) {
  originalNavigate(target);
  installLanguageControl();
};
