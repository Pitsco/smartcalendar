const tabButtons = document.querySelectorAll(".tab-button");
const sections = document.querySelectorAll(".tab-section");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

const buildings = [];
const nameToId = new Map();
const adj = []; 
const paths = []; 

const overlay = document.getElementById("mapOverlay");
const campImage = document.getElementById("campImage");

function addBuilding(name, x = null, y = null) {
  if (!name) {
    return null;
  }
  if (nameToId.has(name)) {
    const idExisting = nameToId.get(name);
    const b = buildings[idExisting];
    if (b.x === null && x !== null) {
      b.x = x;
      b.y = y;
      drawNode(idExisting);
    }
    return idExisting;
  }
  const id = buildings.length;
  buildings.push({ id, name, x, y });
  nameToId.set(name, id);
  adj.push([]);
  if (x !== null && y !== null) {
    drawNode(id);
  }
  return id;
}

function drawNode(id) {
  if (!overlay) {
    return;
  }
  const b = buildings[id];
  if (b.x === null || b.y === null) {
    return;
  }

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", b.x);
  circle.setAttribute("cy", b.y);
  circle.setAttribute("r", 6);
  circle.setAttribute("class", "map-node");
  overlay.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", b.x + 8);
  text.setAttribute("y", b.y - 8);
  text.setAttribute("class", "map-label");
  text.textContent = b.name;
  overlay.appendChild(text);
}

function drawEdge(u, v) {
  if (!overlay) {
    return;
  }
  const b1 = buildings[u];
  const b2 = buildings[v];
  if (b1.x === null || b2.x === null) {
    return;
  }

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", b1.x);
  line.setAttribute("y1", b1.y);
  line.setAttribute("x2", b2.x);
  line.setAttribute("y2", b2.y);
  line.setAttribute("class", "map-edge");
  overlay.appendChild(line);
}

function addPath(from, to, distance) {
  if (!from || !to) {
    return;
  }
  const u = addBuilding(from);
  const v = addBuilding(to);
  const w = Number(distance);
  const weight = Number.isNaN(w) ? 0 : w;

  adj[u].push({ to: v, weight });
  adj[v].push({ to: u, weight });

  paths.push({ from, to, distance: weight });
  drawEdge(u, v);
}

function removePath(from, to) {
  const u = nameToId.get(from);
  const v = nameToId.get(to);
  if (u === undefined || v === undefined) {
    return 0;
  }
  adj[u] = adj[u].filter((e) => e.to !== v);
  adj[v] = adj[v].filter((e) => e.to !== u);

  const before = paths.length;
  for (let i = paths.length - 1; i >= 0; i--) {
    const p = paths[i];
    if ((p.from === from && p.to === to) || (p.from === to && p.to === from)) {
      paths.splice(i, 1);
    }
  }

  while (overlay.firstChild) {
    overlay.removeChild(overlay.firstChild);
  }
  buildings.forEach((b) => {
    if (b.x != null && b.y != null) {
      drawNode(b.id);
    }
  });

  paths.forEach((p) => {
    const idU = nameToId.get(p.from);
    const idV = nameToId.get(p.to);
    if (idU != null && idV != null) drawEdge(idU, idV);
  });

  return before - paths.length;
}

function removeBuilding(name) {
  const id = nameToId.get(name);
  if (id === undefined) {
    return 0;
  }
  const b = buildings[id];
  if (!b || b.removed) {
    return 0;
  }

  b.removed = true;
  nameToId.delete(name);

  for (let i = paths.length - 1; i >= 0; i--) {
    const p = paths[i];
    if (p.from === name || p.to === name) {
      paths.splice(i, 1);
    }
  }

  adj[id] = [];

  for (let u = 0; u < adj.length; u++) {
    if (u === id) {
      continue;
    }
    adj[u] = adj[u].filter((e) => e.to !== id);
  }

  while (overlay.firstChild){ 
    overlay.removeChild(overlay.firstChild);
  }

  buildings.forEach((b) => {
    if (b && !b.removed && b.x != null && b.y != null) {
      drawNode(b.id);
    }
  });

  paths.forEach((p) => {
    const idU = nameToId.get(p.from);
    const idV = nameToId.get(p.to);
    if (idU != null && idV != null) {
      drawEdge(idU, idV);
    }
  });

  return 1;
}

if (campImage) {
  campImage.addEventListener("click", (e) => {
    const rect = campImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const name = prompt("Building name for this point?");
    if (!name) return;

    addBuilding(name.trim(), x, y);
  });
}

function bfs(startName) {
  const start = nameToId.get(startName);
  if (start === undefined) return "Unknown building: " + startName;

  const visited = new Array(buildings.length).fill(false);
  const q = [];
  let head = 0;
  q.push(start);
  visited[start] = true;
  const order = [];

  while (head < q.length) {
    const u = q[head++];
    order.push(buildings[u].name);
    for (const edge of adj[u]) {
      const v = edge.to;
      if (!visited[v]) {
        visited[v] = true;
        q.push(v);
      }
    }
  }
  return "BFS order: " + order.join(" -> ");
}

function dfs(startName) {
  const start = nameToId.get(startName);
  if (start === undefined) return "Unknown building: " + startName;

  const visited = new Array(buildings.length).fill(false);
  const st = [start];
  const order = [];

  while (st.length > 0) {
    const u = st.pop();
    if (visited[u]) continue;
    visited[u] = true;
    order.push(buildings[u].name);
    for (const edge of adj[u]) {
      const v = edge.to;
      if (!visited[v]) st.push(v);
    }
  }
  return "DFS order: " + order.join(" -> ");
}

function shortestPath(fromName, toName) {
  const src = nameToId.get(fromName);
  const dst = nameToId.get(toName);
  if (src === undefined || dst === undefined) {
    return "Unknown building name(s).";
  }

  const n = buildings.length;
  const INF = Number.MAX_SAFE_INTEGER;
  const dist = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  dist[src] = 0;
  const visited = new Array(n).fill(false);

  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    let best = INF;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < best) {
        best = dist[i];
        u = i;
      }
    }
    if (u === -1) break;
    visited[u] = true;
    if (u === dst) break;

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.weight;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        parent[v] = u;
      }
    }
  }

  if (dist[dst] === INF) return "No path between those buildings.";

  const stack = [];
  let v = dst;
  while (v !== -1) {
    stack.push(v);
    v = parent[v];
  }

  const lines = [];
  lines.push(
    `Shortest path from ${fromName} to ${toName} (distance ${dist[dst]}):`
  );
  while (stack.length > 0) {
    const id = stack.pop();
    lines.push("  -> " + buildings[id].name);
  }
  return lines.join("\n");
}

document.getElementById("addBuildingBtn").addEventListener("click", () => {
  const name = document.getElementById("buildingName").value.trim();
  addBuilding(name);
  document.getElementById("buildingName").value = "";
});

document.getElementById("addPathBtn").addEventListener("click", () => {
  const from = document.getElementById("pathFrom").value.trim();
  const to = document.getElementById("pathTo").value.trim();
  const dist = document.getElementById("pathDistance").value;
  addPath(from, to, dist);
});

document.getElementById("listBuildingsBtn").addEventListener("click", () => {
  const out = buildings
    .map((b) =>
      b.x === null
        ? `[${b.id}] ${b.name}`
        : `[${b.id}] ${b.name} (x=${Math.round(b.x)}, y=${Math.round(b.y)})`
    )
    .join("\n");
  document.getElementById("buildingsOutput").textContent =
    out || "No buildings yet.";
});

document.getElementById("listPathsBtn").addEventListener("click", () => {
  if (paths.length === 0) {
    document.getElementById("pathsOutput").textContent = "No paths yet.";
    return;
  }
  const lines = paths.map(
    (p) =>
      `${p.from} <--> ${p.to} (distance ${
        Math.round(p.distance * 10) / 10
      })`
  );
  document.getElementById("pathsOutput").textContent = lines.join("\n");
});

document.getElementById("bfsBtn").addEventListener("click", () => {
  const start = document.getElementById("traversalStart").value.trim();
  document.getElementById("traversalOutput").textContent = bfs(start);
});

document.getElementById("dfsBtn").addEventListener("click", () => {
  const start = document.getElementById("traversalStart").value.trim();
  document.getElementById("traversalOutput").textContent = dfs(start);
});

document.getElementById("shortestBtn").addEventListener("click", () => {
  const from = document.getElementById("shortestFrom").value.trim();
  const to = document.getElementById("shortestTo").value.trim();
  document.getElementById("shortestOutput").textContent = shortestPath(
    from,
    to
  );
});

document.getElementById("removePathBtn").addEventListener("click", () => {
  const from = document.getElementById("removePathFrom").value.trim();
  const to = document.getElementById("removePathTo").value.trim();
  const removed = removePath(from, to);
  const outEl = document.getElementById("removePathOutput");
  if (!from || !to) {
    outEl.textContent = "Please enter both building names.";
  } else if (removed === 0) {
    outEl.textContent = `No path found between ${from} and ${to}.`;
  } else {
    outEl.textContent = `Removed ${removed} path(s) between ${from} and ${to} and redrew the map.`;
  }
});

const courses = [];
const scheduleByDay = {};

function mergeSortCourses(arr) {
  if (arr.length <= 1) return arr.slice();
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortCourses(arr.slice(0, mid));
  const right = mergeSortCourses(arr.slice(mid));
  const merged = [];
  let i = 0,
    j = 0;
  while (i < left.length && j < right.length) {
    if (left[i].code <= right[j].code) {
      merged.push(left[i++]);
    } else {
      merged.push(right[j++]);
    }
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);
  return merged;
}

function binarySearchCourse(sorted, targetCode) {
  let l = 0,
    r = sorted.length - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (sorted[mid].code === targetCode) return mid;
    if (sorted[mid].code < targetCode) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}

function addCourse(course) {
  courses.push(course);
  for (const day of course.days) {
    if (!scheduleByDay[day]) scheduleByDay[day] = [];
    scheduleByDay[day].push({
      code: course.code,
      name: course.name,
      time: course.time,
    });
  }
}

function removeCourseByCode(code) {
  let removed = 0;
  for (let i = courses.length - 1; i >= 0; i--) {
    if (courses[i].code === code) {
      courses.splice(i, 1);
      removed++;
    }
  }
  for (const day in scheduleByDay) {
    const list = scheduleByDay[day];
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].code === code) {
        list.splice(i, 1);
      }
    }
  }
  return removed;
}

document.getElementById("addCourseBtn").addEventListener("click", () => {
  const code = document.getElementById("courseCode").value.trim();
  const name = document.getElementById("courseName").value.trim();
  const daysStr = document.getElementById("courseDays").value.trim();
  const timeRaw = document.getElementById("courseTime").value.trim();
  const ampm = document.getElementById("courseAmPm").value;

  if (!code || !name || !daysStr || !timeRaw) {
    return;
  }
  const days = daysStr
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
  if (days.length === 0) {
    return;
  }

  const time = `${timeRaw} ${ampm}`;
  addCourse({ code, name, days, time });

  document.getElementById("courseCode").value = "";
  document.getElementById("courseName").value = "";
  document.getElementById("courseDays").value = "";
  document.getElementById("courseTime").value = "";
  document.getElementById("courseAmPm").value = "AM";
});

document.getElementById("showDayBtn").addEventListener("click", () => {
  const day = document.getElementById("showDayInput").value.trim();
  const list = scheduleByDay[day] || [];
  if (list.length === 0) {
    document.getElementById("dayScheduleOutput").textContent =
      "No courses scheduled for " + day;
    return;
  }
  const lines = ["Schedule for " + day + ":"];
  for (const c of list) {
    lines.push(`  ${c.time} - ${c.code}: ${c.name}`);
  }
  document.getElementById("dayScheduleOutput").textContent = lines.join("\n");
});

let sortedCache = [];

document
  .getElementById("listCoursesSortedBtn")
  .addEventListener("click", () => {
    if (courses.length === 0) {
      document.getElementById("sortedCoursesOutput").textContent =
        "No courses yet.";
      return;
    }
    sortedCache = mergeSortCourses(courses);
    const lines = ["Courses sorted by code (merge sort):"];
    for (const c of sortedCache) {
      const daysStr = c.days.join(",");
      lines.push(`${c.code} - ${c.name} (${daysStr} ${c.time})`);
    }
    document.getElementById("sortedCoursesOutput").textContent =
      lines.join("\n");
  });

document.getElementById("searchCourseBtn").addEventListener("click", () => {
  const target = document
    .getElementById("searchCourseCode")
    .value.trim();
  if (!target) return;

  if (sortedCache.length === 0) {
    sortedCache = mergeSortCourses(courses);
  }
  const idx = binarySearchCourse(sortedCache, target);
  const outEl = document.getElementById("searchCourseOutput");

  if (idx === -1) {
    outEl.textContent = "Course not found.";
  } else {
    const c = sortedCache[idx];
    const daysStr = c.days.join(",");
    outEl.textContent = `Found: ${c.code} - ${c.name} (${daysStr} ${c.time})`;
  }
});

document.getElementById("removeCourseBtn").addEventListener("click", () => {
  const code = document.getElementById("removeCourseCode").value.trim();
  if (!code) {
    return;
  }
  const removed = removeCourseByCode(code);
  const outEl = document.getElementById("removeCourseOutput");
  if (removed === 0) {
    outEl.textContent = "No course with code " + code + " found.";
  } else {
    outEl.textContent = `Removed ${removed} course definition(s) with code ${code} and cleaned from all day schedules.`;
  }
  document.getElementById("removeCourseCode").value = "";
});
