"use client";

import { useMemo, useState } from "react";

const temples = [
  { value: "Veytharion", label: "维萨里昂" },
  { value: "Caltheris", label: "卡瑟莉斯" },
  { value: "Dravakar", label: "德拉瓦卡" },
  { value: "Nyxara", label: "奈厄拉" },
] as const;
const positions = ["女儿之家", "奈厄拉", "维萨里昂", "空位", "德拉瓦卡", "卡瑟莉斯"];
const templePosition: Record<string, number> = { Nyxara: 1, Veytharion: 2, Dravakar: 4, Caltheris: 5 };
const pillarRiddles = [
  { quote: "我飘向记得诸月的群星，它们是借取了浩瀚星河之力的漫游者。", turns: [1, 2, 2] },
  { quote: "我记得飘向诸月的浩瀚星河，它们是借取了群星之力的漫游行者。", turns: [2, 0, 2] },
  { quote: "当诸月和星辰恪守本真之时，我记得那个奔向浩瀚星河的行者。", turns: [0, 2, 3] },
  { quote: "当群星恪守本真之时，我飘向漫游诸月的行者，那向浩瀚星河借取梦想之人。", turns: [3, 2, 1] },
] as const;

function norm(value: number) { return ((value % 6) + 6) % 6; }

function solveCranks(start: number[], target: number, direction: number) {
  if (start.every((position) => position === target)) return [0, 0, 0];
  const startKey = start.join(",");
  const visited = new Map<string, null | [string, number]>([[startKey, null]]);
  const queue: number[][] = [start];
  while (queue.length) {
    const current = queue.shift()!;
    for (let turned = 0; turned < 3; turned += 1) {
      const next = current.map((position, index) => norm(position + direction * (index === turned ? 1 : 2)));
      const nextKey = next.join(",");
      if (visited.has(nextKey)) continue;
      visited.set(nextKey, [current.join(","), turned]);
      if (next.every((position) => position === target)) {
        const counts = [0, 0, 0];
        let nodeKey = nextKey;
        while (visited.get(nodeKey) !== null) {
          const [previousKey, wheel] = visited.get(nodeKey)!;
          counts[wheel] += 1;
          nodeKey = previousKey;
        }
        return counts;
      }
      queue.push(next);
    }
  }
  return null;
}

export default function Home() {
  const [activeSheet, setActiveSheet] = useState<"crank" | "pillar">("pillar");
  const [direction, setDirection] = useState("ccw");
  const [starts, setStarts] = useState([0, 0, 0]);
  const [target, setTarget] = useState<string>(temples[0].value);
  const [result, setResult] = useState<number[] | null | undefined>();
  const [selectedRiddle, setSelectedRiddle] = useState(0);
  const targetIndex = useMemo(() => templePosition[target], [target]);

  function updateStart(index: number, value: number) {
    setStarts((current) => current.map((item, i) => (i === index ? value : item)));
    setResult(undefined);
  }

  return (
    <main className="page-shell">
      <div className="rex-crank-solver">
        <nav className="rex-sheet-tabs" aria-label="解谜工具">
          <button type="button" className={activeSheet === "pillar" ? "active" : ""} onClick={() => setActiveSheet("pillar")}><span>01</span> 石柱谜题</button>
          <button type="button" className={activeSheet === "crank" ? "active" : ""} onClick={() => setActiveSheet("crank")}><span>02</span> 转盘对齐</button>
        </nav>
        <header className="rex-hud-header">
          <div className="rex-hud-kicker"><span></span> 炼狱王庭 <span></span></div>
          <h1>{activeSheet === "crank" ? "转盘求解器" : "石柱逃课"}</h1>
          <p>{activeSheet === "crank" ? "输入三个转盘的当前位置，快速计算对准目标神殿所需的最少转动次数。" : "选择游戏中出现的谜语，按结果转动左、中、右石柱对应的把手，最后转动「锁定」把手。"}</p>
        </header>
        {activeSheet === "crank" ? <>
        <div className="rex-crank-viz-wrap" aria-hidden="true">
          <svg className="rex-crank-circle" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="112" className="rex-crank-track" />
            <line x1="150" y1="38" x2="150" y2="262" className="rex-crank-spoke" />
            <line x1="38" y1="150" x2="262" y2="150" className="rex-crank-spoke" />
            <line x1="63" y1="63" x2="237" y2="237" className="rex-crank-spoke" />
            <line x1="237" y1="63" x2="63" y2="237" className="rex-crank-spoke" />
            <g><circle cx="150" cy="38" r="26" className="rex-crank-node rex-crank-node-house" /><text x="150" y="43" className="rex-crank-node-label">女儿之家</text></g>
            <g><circle cx="247" cy="94" r="26" className="rex-crank-node" /><text x="247" y="99" className="rex-crank-node-label">奈厄拉</text></g>
            <g><circle cx="247" cy="206" r="26" className="rex-crank-node" /><text x="247" y="211" className="rex-crank-node-label">维萨里昂</text></g>
            <g><circle cx="150" cy="262" r="26" className="rex-crank-node rex-crank-node-empty" /><text x="150" y="267" className="rex-crank-node-label">空位</text></g>
            <g><circle cx="53" cy="206" r="26" className="rex-crank-node" /><text x="53" y="211" className="rex-crank-node-label">德拉瓦卡</text></g>
            <g><circle cx="53" cy="94" r="26" className="rex-crank-node" /><text x="53" y="99" className="rex-crank-node-label">卡瑟莉斯</text></g>
          </svg>
        </div>
        <div className="rex-crank-controls">
          <div className="rex-quick-grid">
            <div className="rex-crank-group">
              <label className="rex-crank-group-title" htmlFor="direction">旋转方向</label>
              <select id="direction" className="rex-crank-select full" value={direction} onChange={(event) => { setDirection(event.target.value); setResult(undefined); }}>
                <option value="ccw">逆时针</option><option value="cw">顺时针</option>
              </select>
            </div>
            <div className="rex-crank-group">
              <label className="rex-crank-group-title" htmlFor="target">目标神殿</label>
              <select id="target" className="rex-crank-select full" value={target} onChange={(event) => { setTarget(event.target.value); setResult(undefined); }}>
                {temples.map((temple) => <option value={temple.value} key={temple.value}>{temple.label}</option>)}
              </select>
            </div>
          </div>
          <div className="rex-crank-group">
            <div className="rex-crank-group-title">转盘初始位置</div>
            <div className="rex-position-grid">
              {["内圈", "中圈", "外圈"].map((label, index) => (
              <div className="rex-position-field" key={label}>
                <label htmlFor={`start-${index}`}>{label}</label>
                <select id={`start-${index}`} className="rex-crank-select full" value={starts[index]} onChange={(event) => updateStart(index, Number(event.target.value))}>
                  {positions.map((name, position) => <option value={position} key={name}>{name}</option>)}
                </select>
              </div>
              ))}
            </div>
          </div>
          <div className="rex-solver-actions">
            <button className="rex-action-btn primary" type="button" onClick={() => setResult(solveCranks(starts, targetIndex, direction === "ccw" ? -1 : 1))}><span>计算转动次数</span><b>›</b></button>
          </div>
          {result && <><div className="rex-solve-result" aria-live="polite">{["内圈", "中圈", "外圈"].map((label, index) => <div className="rex-solve-row" key={label}><span className="rex-solve-label">{label}</span><span className="rex-solve-count">{result[index]}</span></div>)}</div><div className="rex-crank-note">转动顺序不影响结果，只需按照总次数转动各个转盘。</div></>}
          {result === null && <div className="rex-crank-error" role="alert">未找到解法。</div>}
        </div>
        </> : <section className="rex-pillar-sheet">
          <figure className="rex-pillar-map">
            <div className="rex-pillar-map-frame">
              <img
                src="./pillar-layout.webp"
                width="959"
                height="959"
                alt="石柱房间把手位置示意图：左侧为护甲把手，中间为符文把手，右侧为泡泡糖把手，上方为锁定把手。"
              />
            </div>
            <figcaption><span>POSITION MAP</span> 石柱把手位置示意</figcaption>
          </figure>
          <div className="rex-riddle-title">选择谜语</div>
          <div className="rex-riddle-grid">
            {pillarRiddles.map((riddle, index) => (
              <button
                type="button"
                className={`rex-riddle-card ${selectedRiddle === index ? "active" : ""}`}
                aria-pressed={selectedRiddle === index}
                onClick={() => setSelectedRiddle(index)}
                key={riddle.quote}
              >
                <span className="rex-riddle-index">0{index + 1}</span>
                <span className="rex-riddle-quote">“{riddle.quote}”</span>
                <span className="rex-riddle-code">{riddle.turns.join("")}</span>
              </button>
            ))}
          </div>
          <div className="rex-pillar-result" aria-live="polite">
            {[
              ["左", "护甲"],
              ["中", "符文"],
              ["右", "泡泡糖"],
            ].map(([side, name], index) => (
              <div className="rex-pillar-output" key={side}>
                <span className="rex-pillar-side">{side}</span>
                <span className="rex-pillar-name">{name}</span>
                <strong>{pillarRiddles[selectedRiddle].turns[index]}</strong>
                <small>次</small>
              </div>
            ))}
          </div>
          <div className="rex-lock-step"><span>FINAL</span><strong>完成后，转动「锁定」把手</strong></div>
        </section>}
        <a className="rex-character-banner" href="./rex-family.webp" target="_blank" rel="noreferrer" aria-label="查看完整角色合影">
          <img
            src="./rex-family.webp"
            width="1400"
            height="788"
            alt="炼狱王庭的两位角色合影"
            decoding="async"
          />
          <span>Thank You Dark Aether Saga</span>
        </a>
      </div>
    </main>
  );
}
