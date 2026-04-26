/**
 * Bus Spawn Points – Main Application Logic
 */
(function () {
  "use strict";

  // === STATE ===
  let currentDirection = "toBlucina";
  let currentDayType = getDayType();
  let selectedDayType = currentDayType; // user-chosen day type for search
  let useNow = true;
  let ttDirection = "toBlucina";
  let ttDayType = "weekday";
  let selectedHour = 0;
  let selectedMinute = 0;

  // === DOM REFS ===
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const liveTimeEl = $("#liveTime");
  const fromStop = $("#fromStop");
  const toStop = $("#toStop");
  const nowBtn = $("#nowBtn");
  const searchBtn = $("#searchBtn");

  const dayLabel = $("#dayLabel");
  const resultsList = $("#resultsList");
  const resultsTitle = $("#resultsTitle");
  const resultsCount = $("#resultsCount");
  const nextUpCard = $("#nextUpCard");

  // === INIT ===
  function init() {
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
    updateDayIndicator();
    populateStops();
    initDrumPickers();
    setTimeToNow();
    renderNextUp();
    setInterval(renderNextUp, 30000);
    bindEvents();

    // Auto-select timetable day type tab
    ttDayType = currentDayType;
    $$('#ttDayToggle button').forEach(b => {
      b.classList.toggle('active', b.dataset.day === ttDayType);
    });

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  // === LIVE TIME (24h) ===
  function updateLiveTime() {
    const now = new Date();
    const opts = { weekday: "long", month: "short", day: "numeric" };
    const dateStr = now.toLocaleDateString("en-US", opts);
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    liveTimeEl.textContent = `${dateStr} · ${h}:${m}:${s}`;
  }

  // === DAY INDICATOR ===
  function updateDayIndicator() {
    currentDayType = getDayType();
    dayLabel.textContent = currentDayType === "weekend" ? "Weekend schedule" : "Weekday schedule";
  }

  // === POPULATE STOPS ===
  function populateStops() {
    const stops = STOPS[currentDirection];
    fromStop.innerHTML = "";
    toStop.innerHTML = "";
    stops.forEach((s, i) => {
      fromStop.add(new Option(s, s));
      toStop.add(new Option(s, s));
    });
    // Default: first and last
    fromStop.value = stops[0];
    toStop.value = stops[stops.length - 1];
  }

  // === DRUM PICKER ===
  const ITEM_H = 36;
  const PICKER_H = 140;
  // Offset so item 0's center aligns with the picker's vertical center
  const CENTER_OFFSET = (PICKER_H - ITEM_H) / 2; // = 52
  let hourDrum, minuteDrum;

  function initDrumPickers() {
    hourDrum = createDrum("hourTrack", "hourPicker", 24, (v) => { selectedHour = v; onDrumChange(); });
    minuteDrum = createDrum("minuteTrack", "minutePicker", 60, (v) => { selectedMinute = v; onDrumChange(); });
  }

  function onDrumChange() {
    useNow = false;
    nowBtn.classList.remove("active");
  }

  function createDrum(trackId, pickerId, count, onChange) {
    const track = $("#" + trackId);
    const picker = $("#" + pickerId);
    track.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "drum-item";
      el.textContent = i.toString().padStart(2, "0");
      el.dataset.value = i;
      track.appendChild(el);
    }

    const state = { index: 0, startY: 0, baseOffset: 0, dragging: false };

    function getOffset(idx) {
      return CENTER_OFFSET - idx * ITEM_H;
    }

    function snapTo(idx, animate) {
      idx = ((idx % count) + count) % count; // wrap around
      state.index = idx;
      const off = getOffset(idx);
      track.style.transition = animate ? "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      track.style.transform = `translateY(${off}px)`;
      track.querySelectorAll(".drum-item").forEach((el, i) => {
        el.classList.toggle("selected", i === idx);
      });
      onChange(idx);
    }

    function onStart(y) {
      state.dragging = true;
      state.startY = y;
      state.baseOffset = getOffset(state.index);
      track.style.transition = "none";
    }

    function onMove(y) {
      if (!state.dragging) return;
      const off = state.baseOffset + (y - state.startY);
      track.style.transform = `translateY(${off}px)`;
    }

    function onEnd(y) {
      if (!state.dragging) return;
      state.dragging = false;
      const off = state.baseOffset + (y - state.startY);
      const idx = Math.round((CENTER_OFFSET - off) / ITEM_H);
      snapTo(idx, true);
    }

    // Touch
    picker.addEventListener("touchstart", (e) => {
      onStart(e.touches[0].clientY);
    }, { passive: true });
    
    picker.addEventListener("touchmove", (e) => {
      e.preventDefault(); // Stop page scrolling
      onMove(e.touches[0].clientY);
    }, { passive: false });
    
    picker.addEventListener("touchend", (e) => {
      onEnd(e.changedTouches[0].clientY);
    });

    // Mouse
    picker.addEventListener("mousedown", (e) => { onStart(e.clientY); e.preventDefault(); });
    document.addEventListener("mousemove", (e) => { if (state.dragging) onMove(e.clientY); });
    document.addEventListener("mouseup", (e) => { if (state.dragging) onEnd(e.clientY); });

    // Wheel
    picker.addEventListener("wheel", (e) => {
      e.preventDefault();
      snapTo(state.index + (e.deltaY > 0 ? 1 : -1), true);
    }, { passive: false });

    // Tap on item to select it
    track.querySelectorAll(".drum-item").forEach((el) => {
      el.addEventListener("click", () => {
        snapTo(parseInt(el.dataset.value, 10), true);
      });
    });

    return { snapTo };
  }

  // === SET TIME ===
  function setTimeToNow() {
    const now = new Date();
    selectedHour = now.getHours();
    selectedMinute = now.getMinutes();
    if (hourDrum) hourDrum.snapTo(selectedHour, false);
    if (minuteDrum) minuteDrum.snapTo(selectedMinute, false);
    useNow = true;
    nowBtn.classList.add("active");
  }

  // === RENDER CONNECTION CARD ===
  function renderCard(conn, direction, from, to, status = "upcoming") {
    const allStops = STOPS[direction];
    const fromIdx = allStops.indexOf(from);
    const toIdx = allStops.indexOf(to);
    const visibleStops = allStops.slice(fromIdx, toIdx + 1);

    const depTime = conn[from];
    const arrTime = conn[to];
    const depMin = parseTime(depTime);
    const arrMin = parseTime(arrTime);
    const duration = arrMin - depMin;
    const isYellow = conn.isYellow === true;

    let badgeHTML = "";
    if (status === "next") badgeHTML = '<span class="card-badge next">Next up</span>';
    else if (status === "departed") badgeHTML = '<span class="card-badge departed">Departed</span>';
    else badgeHTML = '<span class="card-badge upcoming">Upcoming</span>';

    if (isYellow) badgeHTML += ' <span class="card-badge yellow">Working Sat/Sun</span>';

    const durationBadge = `<span class="card-badge duration">${duration} min</span>`;

    // Route line — only show selected from → to stops
    let routeHTML = '<div class="route-line">';
    visibleStops.forEach((s, i) => {
      routeHTML += `
        <div class="route-stop">
          <div class="dot-outer"><div class="dot-inner"></div></div>
          <div class="stop-name">${s}</div>
          <div class="stop-time">${conn[s]}</div>
        </div>`;
      if (i < visibleStops.length - 1) {
        routeHTML += '<div class="route-connector"></div>';
      }
    });
    routeHTML += "</div>";

    const statusClass = status === "next" ? "next-up" : status === "departed" ? "departed" : "";
    const yellowClass = isYellow ? "yellow-service" : "";

    return `
      <div class="connection-card glass ${statusClass} ${yellowClass}">
        <div class="card-top">
          <div class="card-times">
            <span class="time">${depTime}</span>
            <span class="arrow">→</span>
            <span class="time">${arrTime}</span>
          </div>
          <div>${durationBadge}</div>
        </div>
        ${routeHTML}
        <div style="display:flex;gap:6px;margin-top:8px;">${badgeHTML}</div>
      </div>`;
  }

  // === NEXT UP CARD (home screen) ===
  function renderNextUp() {
    const stops = STOPS[currentDirection];
    const from = stops[0];
    const to = stops[stops.length - 1];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const next = getNextConnections(currentDirection, currentDayType, from, nowMin, 1);

    if (next.length === 0) {
      const first = TIMETABLE[currentDirection][currentDayType]?.[0]?.[from] || "—";
      nextUpCard.innerHTML = `
        <div class="no-results" style="padding:20px 10px;">
          <div class="emoji" style="font-size:32px;">🌙</div>
          <p style="font-size:13px;">No more buses today. First tomorrow at <strong>${first}</strong></p>
        </div>`;
      return;
    }

    nextUpCard.innerHTML = renderCard(next[0], currentDirection, from, to, "next");
  }


  // === SEARCH ===
  function doSearch() {
    const from = fromStop.value;
    const to = toStop.value;
    const stops = STOPS[currentDirection];
    const fromIdx = stops.indexOf(from);
    const toIdx = stops.indexOf(to);

    if (fromIdx >= toIdx) {
      alert("Please select a valid From → To pair (departure before arrival).");
      return;
    }

    let searchMin = 0;
    if (useNow) {
      const now = new Date();
      searchMin = now.getHours() * 60 + now.getMinutes();
    } else {
      searchMin = selectedHour * 60 + selectedMinute;
    }

    const searchDayType = selectedDayType;
    const all = TIMETABLE[currentDirection]?.[searchDayType] || [];
    const nowMin = (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();

    // Filter: departure from `from` stop >= searchMin
    const filtered = all.filter(conn => parseTime(conn[from]) >= searchMin);

    resultsTitle.textContent = `${from} → ${to}`;
    resultsCount.textContent = `${filtered.length} connection${filtered.length !== 1 ? "s" : ""}`;

    if (filtered.length === 0) {
      resultsList.innerHTML = `
        <div class="no-results">
          <div class="emoji">🌙</div>
          <p>No more connections for today.</p>
        </div>`;
    } else {
      let html = "";
      let foundNext = false;
      filtered.forEach(conn => {
        const depMin = parseTime(conn[from]);
        let status = "upcoming";
        if (depMin < nowMin) {
          status = "departed";
        } else if (!foundNext) {
          status = "next";
          foundNext = true;
        }
        html += renderCard(conn, currentDirection, from, to, status);
      });
      resultsList.innerHTML = html;
    }

    showPage("pageResults");
  }

  // === TIMETABLE ===
  // Short names for timetable display
  const SHORT_NAMES = {
    "Brno Úzká": "Úzká",
    "Brno Komárov": "Komárov",
    "Blučina": "Blučina",
    "Brno Mariánské nám.": "Mar. nám."
  };

  function renderTimetable() {
    const stops = STOPS[ttDirection];
    const conns = TIMETABLE[ttDirection]?.[ttDayType] || [];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const isToday = ttDayType === currentDayType;

    // Table head — use short names
    let headHTML = "<tr><th>#</th>";
    stops.forEach(s => { headHTML += `<th>${SHORT_NAMES[s] || s}</th>`; });
    headHTML += "</tr>";
    $("#ttHead").innerHTML = headHTML;

    // Table body
    let bodyHTML = "";
    let highlightedOne = false;

    conns.forEach((conn, i) => {
      const depMin = parseTime(conn[stops[0]]);
      const isNext = isToday && !highlightedOne && depMin >= nowMin;
      if (isNext) highlightedOne = true;
      const rowClass = isNext ? "highlight-row" : "";
      const isYellow = conn.isYellow === true;

      bodyHTML += `<tr class="${rowClass}${isYellow ? " yellow-row" : ""}">`;
      bodyHTML += `<td style="color:var(--text-tertiary)">${i + 1}</td>`;
      stops.forEach(s => {
        const cls = isYellow ? 'class="yellow-cell"' : "";
        bodyHTML += `<td ${cls}>${conn[s]}</td>`;
      });
      bodyHTML += "</tr>";
    });

    $("#ttBody").innerHTML = bodyHTML;
  }

  // === NAVIGATION ===
  function showPage(pageId) {
    $$(".page").forEach(p => p.classList.remove("active"));
    $(`#${pageId}`).classList.add("active");
    $$(".nav-item").forEach(n => {
      n.classList.toggle("active", n.dataset.page === pageId);
    });
  }

  // === EVENTS ===
  function bindEvents() {
    // Direction toggle (search page)
    $$("#dirToggle button").forEach(btn => {
      btn.addEventListener("click", () => {
        $$("#dirToggle button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentDirection = btn.dataset.dir;
        populateStops();
        renderNextUp();
      });
    });


    // Now button
    nowBtn.addEventListener("click", () => {
      setTimeToNow();
      // Also reset day to Today
      selectedDayType = getDayType();
      $$(".day-opt").forEach(b => b.classList.remove("active"));
      $("#dayToday").classList.add("active");
      updateDayIndicator();
    });

    // Day selector
    $$(".day-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".day-opt").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const val = btn.dataset.day;
        if (val === "today") {
          selectedDayType = getDayType();
        } else {
          selectedDayType = val;
        }
        // Update day indicator
        dayLabel.textContent = selectedDayType === "weekend" ? "Weekend schedule" : "Weekday schedule";
      });
    });

    // Search
    searchBtn.addEventListener("click", doSearch);

    // Nav
    $$(".nav-item").forEach(nav => {
      nav.addEventListener("click", () => {
        const page = nav.dataset.page;
        showPage(page);
        if (page === "pageTimetable") renderTimetable();
        if (page === "pageSearch") {
          updateDayIndicator();
          if (useNow) setTimeToNow();

        }
      });
    });

    // Timetable direction toggle
    $$("#ttDirToggle button").forEach(btn => {
      btn.addEventListener("click", () => {
        $$("#ttDirToggle button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        ttDirection = btn.dataset.dir;
        renderTimetable();
      });
    });

    // Timetable day toggle
    $$("#ttDayToggle button").forEach(btn => {
      btn.addEventListener("click", () => {
        $$("#ttDayToggle button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        ttDayType = btn.dataset.day;
        renderTimetable();
      });
    });
  }

  // === START ===
  document.addEventListener("DOMContentLoaded", init);
})();
