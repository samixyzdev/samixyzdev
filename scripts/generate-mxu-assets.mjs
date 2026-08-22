import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schedule = JSON.parse(
  fs.readFileSync(path.join(root, "assets/mxu-event-schedule.json"), "utf8"),
);

const configs = [
  {
    file: "systolic-array.svg",
    width: 960,
    height: 480,
    board: [82, 50, 796, 338],
    route: { x0: 180, x1: 780, y0: 60, y1: 420 },
    columns: [330, 480, 630],
    rows: [150, 240, 330],
    nodeRadius: 30,
    aLabelX: 140,
    bLabelY: 61,
    envelope: { activeX: 214, readyX: 588, labelY: 414, baseY: 462, scale: 5 },
  },
  {
    file: "systolic-array-mobile.svg",
    width: 600,
    height: 620,
    board: [28, 58, 544, 442],
    route: { x0: 100, x1: 540, y0: 80, y1: 520 },
    columns: [210, 320, 430],
    rows: [190, 300, 410],
    nodeRadius: 37,
    aLabelX: 68,
    bLabelY: 65,
    envelope: { activeX: 142, readyX: 396, labelY: 536, baseY: 600, scale: 6 },
  },
];

const n = schedule.matrixSize;
const duration = schedule.durationSeconds;
const macEvents = [];
const readyEvents = [];
const aStreams = [];
const bStreams = [];

for (let i = 0; i < n; i += 1) {
  for (let j = 0; j < n; j += 1) {
    const sum = i + j;
    readyEvents.push({ i, j, sum, time: schedule.firstMacSecond + sum + n - 1 + schedule.readyDelaySeconds });
    for (let k = 0; k < n; k += 1) {
      macEvents.push({ i, j, k, time: schedule.firstMacSecond + i + j + k });
    }
  }
  for (let k = 0; k < n; k += 1) {
    aStreams.push({ i, k, start: i + k });
    bStreams.push({ j: i, k, start: i + k });
  }
}

function histogram(events, key, offset) {
  const result = [];
  for (const event of events) {
    const index = Math.round(event[key] - offset);
    result[index] = (result[index] ?? 0) + 1;
  }
  return result;
}

function assertContract() {
  const active = histogram(macEvents, "time", schedule.firstMacSecond);
  const ready = histogram(readyEvents, "sum", 0);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (macEvents.length !== 27 || readyEvents.length !== 9) throw new Error("Unexpected MXU event count");
  if (!same(active, schedule.activeMacEnvelope)) throw new Error(`Active envelope mismatch: ${active}`);
  if (!same(ready, schedule.readyEnvelope)) throw new Error(`Ready envelope mismatch: ${ready}`);
  if (readyEvents.at(-1).time !== 7.7) throw new Error("Final C output must become ready at 7.7s");
}

function fixed(value) {
  return Number(value.toFixed(4));
}

function chamferedRect(x, y, width, height, corner) {
  return `M${x + corner} ${y} H${x + width - corner} L${x + width} ${y + corner} V${y + height - corner} L${x + width - corner} ${y + height} H${x + corner} L${x} ${y + height - corner} V${y + corner} Z`;
}

function polar(radius, degrees) {
  const radians = (degrees * Math.PI) / 180;
  return [fixed(radius * Math.cos(radians)), fixed(radius * Math.sin(radians))];
}

function arcPath(radius, startDegrees, endDegrees) {
  const [x0, y0] = polar(radius, startDegrees);
  const [x1, y1] = polar(radius, endDegrees);
  return `M${x0} ${y0} A${radius} ${radius} 0 0 1 ${x1} ${y1}`;
}

function latchOpacity(time) {
  const before = fixed((time - 0.01) / duration);
  const at = fixed(time / duration);
  return `<animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${before};${at};${schedule.holdUntilSecond / duration};${schedule.resetCompleteSecond / duration};1"/>`;
}

function pulseOpacity(times) {
  const points = [{ time: 0, value: 0 }];
  for (const time of times) {
    points.push(
      { time: time - 0.08, value: 0 },
      { time, value: 1 },
      { time: time + 0.08, value: 0 },
    );
  }
  points.push({ time: duration, value: 0 });
  return `<animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" values="${points.map((p) => p.value).join(";")}" keyTimes="${points.map((p) => fixed(p.time / duration)).join(";")}"/>`;
}

function packetOpacity(start) {
  const end = start + schedule.traversalSeconds;
  if (start === 0) {
    return `<animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;${fixed((end - 0.05) / duration)};${fixed(end / duration)};1"/>`;
  }
  return `<animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${fixed((start - 0.05) / duration)};${fixed(start / duration)};${fixed((end - 0.05) / duration)};${fixed(end / duration)};1"/>`;
}

function packetMotion(start, pathData) {
  const end = start + schedule.traversalSeconds;
  const keyPoints = start === 0 ? "0;1;1" : "0;0;1;1";
  const keyTimes = start === 0
    ? `0;${fixed(end / duration)};1`
    : `0;${fixed(start / duration)};${fixed(end / duration)};1`;
  return `<animateMotion dur="${duration}s" repeatCount="indefinite" calcMode="linear" keyPoints="${keyPoints}" keyTimes="${keyTimes}" path="${pathData}"/>`;
}

function packetLayer(config) {
  const a = aStreams.map(({ i, k, start }) => {
    const pathData = `M${config.route.x0} ${config.rows[i]} H${config.route.x1}`;
    return `<g class="motion-only" opacity="0"><path class="packet-a" d="M-19 -9 H10 L19 0 L10 9 H-19 Z"/><text class="packet-label packet-label-a" y="3">a${i}${k}</text>${packetMotion(start, pathData)}${packetOpacity(start)}</g>`;
  }).join("");
  const b = bStreams.map(({ j, k, start }) => {
    const pathData = `M${config.columns[j]} ${config.route.y0} V${config.route.y1}`;
    return `<g class="motion-only" opacity="0"><path class="packet-b" d="M-9 -19 H9 V10 L0 19 L-9 10 Z"/><text class="packet-label packet-label-b" y="3">b${k}${j}</text>${packetMotion(start, pathData)}${packetOpacity(start)}</g>`;
  }).join("");
  return `<g class="packets">${a}${b}</g>`;
}

function nodeShell(config) {
  const r = config.nodeRadius;
  const arcRadius = r + 6;
  const arcs = [[-160, -60], [-40, 60], [80, 180]];
  return `<g id="node-shell">
    <circle r="${r + 4}" class="node-seat"/>
    <circle r="${r}" class="node-boundary"/>
    <circle r="${r - 10}" class="node-core"/>
    <path d="M-${r - 12} 0 H-${r - 4} M${r - 12} 0 H${r - 4} M0 -${r - 12} V-${r - 4} M0 ${r - 12} V${r - 4}" class="node-contact"/>
    <path d="M0 -7 L7 0 L0 7 L-7 0 Z" class="compute-core"/>
    ${arcs.map(([start, end]) => `<path d="${arcPath(arcRadius, start, end)}" class="accumulator-base"/>`).join("")}
    <circle cx="-7" cy="${r - 9}" r="3" class="ready-pad-base"/>
    <circle cx="7" cy="${r - 9}" r="3" class="ready-pad-base"/>
  </g>`;
}

function nodeLayer(config) {
  const r = config.nodeRadius;
  const arcRadius = r + 6;
  const arcs = [[-160, -60], [-40, 60], [80, 180]];
  return macEvents
    .filter(({ k }) => k === 0)
    .map(({ i, j }) => {
      const events = macEvents.filter((event) => event.i === i && event.j === j);
      const ready = readyEvents.find((event) => event.i === i && event.j === j);
      const activeArcs = arcs.map(([start, end], k) => `<path d="${arcPath(arcRadius, start, end)}" class="accumulator-active motion-only" opacity="0">${latchOpacity(events[k].time)}</path>`).join("");
      const finalArcs = arcs.map(([start, end]) => `<path d="${arcPath(arcRadius, start, end)}" class="accumulator-active"/>`).join("");
      return `<g transform="translate(${config.columns[j]} ${config.rows[i]})">
        <use href="#node-shell"/>
        <circle r="${r + 11}" class="phase-ring motion-only" opacity="0">${pulseOpacity(events.map((event) => event.time))}</circle>
        ${activeArcs}
        <g class="ready-contact motion-only" opacity="0">
          <circle cx="-7" cy="${r - 9}" r="3"/><circle cx="7" cy="${r - 9}" r="3"/><path d="M-4 ${r - 9} H4"/>
          ${latchOpacity(ready.time)}
        </g>
        <g class="final-only">${finalArcs}<g class="ready-contact"><circle cx="-7" cy="${r - 9}" r="3"/><circle cx="7" cy="${r - 9}" r="3"/><path d="M-4 ${r - 9} H4"/></g></g>
      </g>`;
    }).join("");
}

function sweepLayer(config) {
  const extension = config.nodeRadius + 28;
  return Array.from({ length: n * 2 - 1 }, (_, sum) => {
    const nodes = readyEvents
      .filter((event) => event.sum === sum)
      .sort((a, b) => a.i - b.i);
    const first = nodes[0];
    const last = nodes.at(-1);
    const x0 = config.columns[first.j] - extension;
    const y0 = config.rows[first.i] + extension;
    const x1 = config.columns[last.j] + extension;
    const y1 = config.rows[last.i] - extension;
    const time = nodes[0].time;
    return `<g class="ready-sweep motion-only" opacity="0"><path d="M${x0} ${y0} L${x1} ${y1}" class="sweep-band"/><path d="M${x0} ${y0} L${x1} ${y1}" class="sweep-line"/>${pulseOpacity([time])}</g>`;
  }).join("");
}

function routingLayer(config) {
  const a = config.rows.map((y, index) => `<g><path d="M${config.aLabelX + 22} ${y} H${config.route.x1}" class="trace trace-a"/><path d="M${config.aLabelX - 12} ${y} H${config.aLabelX + 8}" class="port-mark port-a"/><text x="${config.aLabelX}" y="${y - 12}" class="port-text" text-anchor="middle">A${index}</text></g>`).join("");
  const b = config.columns.map((x, index) => `<g><path d="M${x} ${config.route.y0} V${config.route.y1}" class="trace trace-b"/><path d="M${x} ${config.bLabelY - 18} V${config.bLabelY - 2}" class="port-mark port-b"/><text x="${x + 14}" y="${config.bLabelY - 8}" class="port-text">B${index}</text></g>`).join("");
  return `<g class="routing">${a}${b}</g>`;
}

function cursor(points, times, className) {
  const pathData = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const keyPoints = points.map((_, index) => fixed(index / (points.length - 1))).join(";");
  const keyTimes = [0, ...times.map((time) => fixed(time / duration)), 1].join(";");
  const paddedPoints = `0;${keyPoints};1`;
  const visibleStart = times[0];
  const visibleEnd = times.at(-1) + 0.25;
  const opacityTimes = [0, visibleStart - 0.05, visibleStart, visibleEnd, visibleEnd + 0.05, duration]
    .map((time) => fixed(time / duration))
    .join(";");
  return `<circle r="4" class="${className} motion-only" opacity="0"><animateMotion dur="${duration}s" repeatCount="indefinite" calcMode="discrete" keyPoints="${paddedPoints}" keyTimes="${keyTimes}" path="${pathData}"/><animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="${opacityTimes}"/></circle>`;
}

function envelopeLayer(config) {
  const { activeX, readyX, labelY, baseY, scale } = config.envelope;
  const barWidth = config.width < 700 ? 8 : 10;
  const gap = config.width < 700 ? 7 : 8;
  const activePoints = [];
  const activeBars = schedule.activeMacEnvelope.map((value, index) => {
    const x = activeX + index * (barWidth + gap);
    const height = value * scale;
    activePoints.push([x + barWidth / 2, baseY - height - 7]);
    return `<rect x="${x}" y="${baseY - height}" width="${barWidth}" height="${height}" rx="2" class="envelope-bar envelope-active"/>`;
  }).join("");
  const readyPoints = [];
  const readyBars = schedule.readyEnvelope.map((value, index) => {
    const x = readyX + index * (barWidth + gap);
    const height = value * scale;
    readyPoints.push([x + barWidth / 2, baseY - height - 7]);
    return `<rect x="${x}" y="${baseY - height}" width="${barWidth}" height="${height}" rx="2" class="envelope-bar envelope-ready"/>`;
  }).join("");
  const activeTimes = schedule.activeMacEnvelope.map((_, index) => schedule.firstMacSecond + index);
  const readyTimes = schedule.readyEnvelope.map((_, index) => schedule.firstMacSecond + n - 1 + schedule.readyDelaySeconds + index);
  return `<g class="envelope">
    <text x="${activeX}" y="${labelY}" class="envelope-label">ACTIVE MACS · 1 3 6 7 6 3 1</text>
    ${activeBars}${cursor(activePoints, activeTimes, "cursor-active")}
    <text x="${readyX}" y="${labelY}" class="envelope-label">READY C · 1 2 3 2 1</text>
    ${readyBars}${cursor(readyPoints, readyTimes, "cursor-ready")}
  </g>`;
}

function svg(config) {
  const [boardX, boardY, boardWidth, boardHeight] = config.board;
  const node = nodeShell(config);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" role="img" aria-labelledby="title desc">
  <!-- Generated by scripts/generate-mxu-assets.mjs from assets/mxu-event-schedule.json. -->
  <title id="title">Clocked wavefront observatory for a three by three output-stationary MXU</title>
  <desc id="desc">Conceptual cycle trace, not a physical accelerator floorplan. Blue A packets move right and amber B packets move down through nine crosspoint processing elements. Each node locks three accumulator arcs, white phase rings mark synchronized MAC events, and teal contacts close in a one two three two one anti-diagonal ready wave. The active MAC envelope is one three six seven six three one.</desc>
  <style>
    :root { --canvas:#f4f6f8; --substrate:#e7ecf1; --substrate-edge:#7a899a; --well:#d9e0e8; --core:#f8fafb; --ink:#172033; --muted:#5d6b7f; --trace:#8998aa; --a:#1f66d1; --b:#d39400; --mac:#172033; --ready:#087f66; --inactive:#aeb9c5; --sweep:#087f66; }
    @media (prefers-color-scheme: dark) { :root { --canvas:#070c13; --substrate:#0e1622; --substrate-edge:#53657a; --well:#162334; --core:#0a111b; --ink:#edf3fa; --muted:#9cacbf; --trace:#2c3b4d; --a:#67a2ff; --b:#f1c75b; --mac:#f6f8fa; --ready:#54d2b3; --inactive:#3e5065; --sweep:#54d2b3; } }
    @media (prefers-contrast: more) { :root { --trace:#65758a; --substrate-edge:#314157; --inactive:#65758a; } .trace,.node-boundary,.accumulator-base { stroke-width:2.5; } }
    * { shape-rendering:geometricPrecision; }
    text { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace; letter-spacing:0; fill:var(--ink); }
    .instrument-mark { font-size:12px; font-weight:800; }
    .instrument-note,.port-text,.envelope-label { font-size:9px; font-weight:700; fill:var(--muted); }
    .substrate { fill:var(--substrate); stroke:var(--substrate-edge); stroke-width:1.5; }
    .substrate-inset { fill:none; stroke:var(--substrate-edge); stroke-width:1; opacity:.42; }
    .trace { fill:none; stroke:var(--trace); stroke-width:2; opacity:.68; }
    .trace-a { stroke:var(--a); opacity:.34; }
    .trace-b { stroke:var(--b); opacity:.34; }
    .port-mark { fill:none; stroke-width:4; stroke-linecap:square; }
    .port-a { stroke:var(--a); } .port-b { stroke:var(--b); }
    .node-seat { fill:var(--well); stroke:var(--substrate-edge); stroke-width:1; }
    .node-boundary { fill:var(--substrate); stroke:var(--substrate-edge); stroke-width:1.5; }
    .node-core { fill:var(--core); stroke:var(--substrate-edge); stroke-width:1; }
    .node-contact { fill:none; stroke:var(--trace); stroke-width:2; }
    .compute-core { fill:var(--mac); opacity:.88; }
    .accumulator-base { fill:none; stroke:var(--inactive); stroke-width:4; stroke-linecap:butt; }
    .accumulator-active { fill:none; stroke:var(--a); stroke-width:4; stroke-linecap:butt; }
    .phase-ring { fill:none; stroke:var(--mac); stroke-width:3; }
    .ready-pad-base { fill:var(--inactive); }
    .ready-contact circle { fill:var(--ready); }
    .ready-contact path { fill:none; stroke:var(--ready); stroke-width:4; stroke-linecap:square; }
    .packet-a { fill:var(--a); } .packet-b { fill:var(--b); }
    .packet-label { font-size:7px; font-weight:800; text-anchor:middle; }
    .packet-label-a { fill:#fff; } .packet-label-b { fill:#172033; }
    .sweep-band { fill:none; stroke:var(--sweep); stroke-width:18; opacity:.12; }
    .sweep-line { fill:none; stroke:var(--sweep); stroke-width:2; opacity:.9; }
    .envelope-bar { opacity:.72; }
    .envelope-active { fill:var(--a); } .envelope-ready { fill:var(--ready); }
    .cursor-active { fill:var(--mac); stroke:var(--a); stroke-width:2; }
    .cursor-ready { fill:var(--mac); stroke:var(--ready); stroke-width:2; }
    .final-only { display:none; }
    @media (prefers-reduced-motion: reduce) { .motion-only { display:none; } .final-only { display:inline; } }
  </style>
  <defs>${node}</defs>
  <rect width="${config.width}" height="${config.height}" fill="var(--canvas)"/>
  <text x="22" y="27" class="instrument-mark">MXU TRACE · 3×3 · CLK 0–7</text>
  <text x="${config.width - 22}" y="27" class="instrument-note" text-anchor="end">27 MAC · 9 C</text>
  <path d="${chamferedRect(boardX, boardY, boardWidth, boardHeight, 18)}" class="substrate"/>
  <path d="${chamferedRect(boardX + 8, boardY + 8, boardWidth - 16, boardHeight - 16, 12)}" class="substrate-inset"/>
  ${routingLayer(config)}
  ${sweepLayer(config)}
  ${packetLayer(config)}
  <g class="nodes">${nodeLayer(config)}</g>
  ${envelopeLayer(config)}
</svg>
`;
}

assertContract();
for (const config of configs) {
  const target = path.join(root, "assets", config.file);
  fs.writeFileSync(target, svg(config));
  process.stdout.write(`${config.file}: ${fs.statSync(target).size} bytes\n`);
}
