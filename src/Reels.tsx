import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, Audio, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Freeze, Easing} from 'remotion';
import {BRAND_CSS} from './fonts';
import data from './data.json';
export const RED = '#ED1C24', WHITE = '#FFFFFF';
const T = data.timeline; const seg = (i: number) => T[i];
export const D = 'DrukCond', DT = 'DrukText', SF = 'SF';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Headline: per-letter drop-in with blur, CAPS
export const Line: React.FC<{children: React.ReactNode; delay?: number; size: number; color?: string; font?: string; out?: number}> = ({children, delay = 0, size, color = WHITE, font = D, out}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const o = out !== undefined ? interpolate(f, [out, out + 7], [0, 1], clamp) : 0;
  const text = String(children); const isSmall = font === SF;
  const chars = Array.from(text);
  return <div style={{lineHeight: 0.92, padding: '0.06em 10px 0', whiteSpace: 'nowrap', textAlign: 'center', opacity: 1 - o, filter: `blur(${o * 12}px)`, transform: `scale(${1 + o * 0.06})`}}>
    {chars.map((ch, i) => { const d = delay + i * (isSmall ? 0.6 : 1.6);
      const s = spring({frame: f - d, fps, config: {damping: 22, stiffness: 120}});
      return <span key={i} style={{display: 'inline-block', fontFamily: font, fontWeight: isSmall ? 500 : 400, fontSize: size, color, textTransform: isSmall ? 'none' : 'uppercase',
        transform: `translateY(${(1 - s) * 0.12}em) scale(${0.92 + 0.08 * s})`, filter: `blur(${(1 - s) * 8}px)`, opacity: f < d ? 0 : Math.min(1, s * 1.4),
        textShadow: '0 6px 30px rgba(0,0,0,.5)', whiteSpace: 'pre'}}>{ch}</span>; })}
  </div>;
};

// lines: [text, size, 'r' red | 'k' small SF kicker]
export const Stack: React.FC<{lines: [string, number, string?][]; top?: number; step?: number; out?: number}> = ({lines, top = 640, step = 8, out}) =>
  <AbsoluteFill style={{alignItems: 'center', paddingTop: top}}>
    {lines.map(([t, s, c], i) => <Line key={i} size={c === 'k' ? 52 : s} font={c === 'k' ? SF : D} color={c === 'r' ? RED : WHITE} delay={i * step} out={out}>{t}</Line>)}
  </AbsoluteFill>;

const BW: React.FC<{dur: number}> = ({dur}) => null;

export const Speaker: React.FC<{src: string; i: number; dur: number; bw?: [number, number][]; punch?: number[]}> = ({src, i, dur, bw = [], punch = []}) => {
  const f = useCurrentFrame();
  const inBw = bw.some(([a, b]) => f >= a && f < b);
  const lastPunch = punch.filter(p => p <= f).length; // alternate framing on each punch
  const base = lastPunch % 2 ? 1.12 : 1.02;
  const pk = punch.filter(p => p <= f).pop();
  const kick = pk !== undefined ? interpolate(f - pk, [0, 8], [0.06, 0], clamp) : 0;
  return <AbsoluteFill style={{transform: `scale(${base + kick + interpolate(f, [0, dur], [0, 0.05])})`, transformOrigin: '50% 35%'}}>
    <OffthreadVideo src={staticFile(src)} muted startFrom={i} style={{width: '100%', height: '100%', objectFit: 'cover', filter: inBw ? 'grayscale(1) contrast(1.15) brightness(.85)' : 'none'}} />
  </AbsoluteFill>;
};

export const BRoll: React.FC<{src: string; start?: number; dur: number; img?: boolean}> = ({src, start = 0, dur, img}) => {
  const f = useCurrentFrame();
  const st: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};
  return <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, dur], [1.06, 1.18])})`, filter: `blur(${interpolate(f, [0, 5], [12, 0], clamp)}px)`}}>
    {img ? <Img src={staticFile(src)} style={st} /> : <OffthreadVideo src={staticFile(src)} muted startFrom={start} style={st} />}
  </AbsoluteFill>;
};

const Phone: React.FC<{src: string; start?: number; bg: string; bgStart?: number}> = ({src, start = 0, bg, bgStart = 0}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 16}});
  return <AbsoluteFill>
    <AbsoluteFill><OffthreadVideo src={staticFile(bg)} muted startFrom={bgStart} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px) brightness(.45) grayscale(.6)', transform: 'scale(1.2)'}} /></AbsoluteFill>
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 260}}>
      <div style={{width: 600, height: 1160, borderRadius: 66, border: '12px solid #0d0d0d', overflow: 'hidden', background: 'white', boxShadow: '0 50px 100px rgba(0,0,0,.6)',
        transform: `translateY(${(1 - s) * 1300}px) rotate(${(1 - s) * -10}deg)`}}>
        <OffthreadVideo src={staticFile(src)} muted startFrom={start} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div></AbsoluteFill></AbsoluteFill>;
};

const SiteCards: React.FC<{bg: string; bgStart?: number}> = ({bg, bgStart = 0}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const pos = [[-250, -330, -8], [250, -300, 7], [-240, 330, 6], [250, 360, -7]];
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile(bg)} muted startFrom={bgStart} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) brightness(.4) grayscale(.7)', transform: 'scale(1.2)'}} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      {pos.map(([x, y, r], k) => { const s = spring({frame: f - k * 5, fps, config: {damping: 13, stiffness: 150}});
        return <Img key={k} src={staticFile(`card${k}.png`)} style={{position: 'absolute', width: 450, borderRadius: 34, boxShadow: '0 30px 70px rgba(0,0,0,.6)',
          transform: `translate(${x * s}px, ${y * s + (1 - s) * 1400}px) rotate(${r * s + Math.sin((f + k * 10) / 18) * 1.5}deg) scale(${0.8 + 0.2 * s})`}} />; })}
    </AbsoluteFill></AbsoluteFill>;
};

export const Flash: React.FC = () => { const f = useCurrentFrame();
  return <AbsoluteFill style={{background: 'white', opacity: interpolate(f, [0, 1, 4], [0, 0.85, 0], clamp), pointerEvents: 'none'}} />; };

export const SiteMotion: React.FC<{dur: number; bg: string; bgStart?: number; scrollFrom?: number}> = ({dur, bg, bgStart = 0, scrollFrom = 0}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const ease = Easing.bezier(0.45, 0, 0.2, 1);
  const enter = interpolate(f, [0, 22], [0, 1], {...clamp, easing: ease});
  const ry = interpolate(f, [0, dur], [-24, 14], {...clamp, easing: ease});
  const rx = interpolate(f, [0, dur], [10, 4], clamp);
  const scroll = interpolate(f, [8, dur], [scrollFrom, scrollFrom + 1500], {...clamp, easing: ease});
  const cards = [[-330, -120, 0], [330, 80, 1], [-300, 420, 3]];
  const tapT = Math.max(0, dur - 34);
  const tap = interpolate(f, [tapT, tapT + 8, tapT + 18], [0, 1, 0], clamp);
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile(bg)} muted startFrom={bgStart} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px) brightness(.4) grayscale(.6)', transform: 'scale(1.2)'}} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 300, perspective: 1600}}>
      <div style={{position: 'relative', width: 560, height: 1100, transformStyle: 'preserve-3d',
        transform: `translateY(${(1 - enter) * 900}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${0.85 + 0.15 * enter})`, opacity: enter}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 64, border: '12px solid #0d0d0d', overflow: 'hidden', background: 'white', boxShadow: '0 60px 120px rgba(0,0,0,.6)'}}>
          <Img src={staticFile('site_top.png')} style={{width: '100%', transform: `translateY(${-scroll * (536 / 1080)}px)`}} />
          <div style={{position: 'absolute', left: '50%', top: '62%', width: 120, height: 120, marginLeft: -60, borderRadius: 60, border: `6px solid ${RED}`,
            transform: `scale(${0.4 + tap * 0.9})`, opacity: tap, background: 'rgba(237,28,36,.18)'}} />
        </div>
        {cards.map(([x, y, k], i) => { const s = spring({frame: f - 18 - i * 7, fps, config: {damping: 20, stiffness: 90}});
          const fl = Math.sin((f + i * 20) / 22) * 10;
          return <Img key={i} src={staticFile(`card${k}.png`)} style={{position: 'absolute', left: 140, top: 300, width: 300, borderRadius: 26, boxShadow: '0 30px 60px rgba(0,0,0,.55)',
            transform: `translate3d(${x * s}px, ${y * s + fl}px, ${160 * s}px) rotate(${(i % 2 ? 6 : -6) * s}deg) scale(${0.5 + 0.5 * s})`, opacity: Math.min(1, s * 1.5)}} />; })}
      </div></AbsoluteFill></AbsoluteFill>;
};

export const NameTag: React.FC<{name: string; role: string}> = ({name, role}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 12], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)});
  const o = interpolate(f, [80, 92], [0, 1], clamp);
  return <AbsoluteFill style={{alignItems: 'flex-start', paddingTop: 170, paddingLeft: 80, opacity: e * (1 - o), filter: `blur(${(1 - e) * 10 + o * 10}px)`}}>
    <div style={{fontFamily: D, fontSize: 170, lineHeight: 0.9, color: WHITE, textTransform: 'uppercase', textShadow: '0 6px 30px rgba(0,0,0,.45)', transform: `translateX(${(1 - e) * -40}px)`}}>{name}</div>
    <div style={{marginTop: 18, transform: `translateX(${(1 - e) * -20}px)`}}>
      <span style={{display: 'inline-block', background: RED, color: WHITE, fontFamily: SF, fontWeight: 700, fontSize: 60, padding: '10px 34px', borderRadius: 50}}>{role}</span></div>
  </AbsoluteFill>;
};

// one word at a time, SF, blur-in pop — like refs
export const Captions: React.FC<{hide: [number, number][]; accent: string[]}> = ({hide, accent}) => {
  const f = useCurrentFrame(); const caps = data.captions as [number, number, string][];
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  let idx = -1;
  for (let k = 0; k < caps.length; k++) { const nx = caps[k + 1]?.[0] ?? caps[k][1] + 8; if (f >= caps[k][0] && f < Math.min(nx, caps[k][1] + 10)) { idx = k; break; } }
  if (idx < 0) return null;
  const c = caps[idx]; const l = f - c[0];
  const w = c[2].replace(/[.,!?—«»]/g, '');
  if (!w) return null;
  const isA = false;
  return <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 640}}>
    <div style={{fontFamily: isA ? D : SF, fontWeight: 600, fontSize: isA ? 150 : 60, color: isA ? RED : WHITE, textTransform: isA ? 'uppercase' : 'none',
      transform: `scale(${interpolate(l, [0, 4], [1.25, 1], clamp)}) translateY(${interpolate(l, [0, 4], [12, 0], clamp)}px)`, filter: `blur(${interpolate(l, [0, 3], [8, 0], clamp)}px)`,
      textShadow: '0 4px 18px rgba(0,0,0,.7)'}}>{w}</div></AbsoluteFill>;
};

const Counter: React.FC<{to: number; delay: number; label: string; red?: boolean}> = ({to, delay, label, red}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [delay, delay + 16], [0, to], {...clamp, easing: Easing.out(Easing.cubic)}));
  return <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 24, opacity: f < delay ? 0 : 1, filter: `blur(${interpolate(f, [delay, delay + 5], [14, 0], clamp)}px)`}}>
    <div style={{fontFamily: D, fontSize: 330, color: red ? RED : WHITE, lineHeight: .85}}>{n}</div>
    <div style={{fontFamily: D, fontSize: 120, color: red ? WHITE : RED, lineHeight: 1, textTransform: 'uppercase', paddingBottom: 18}}>{label}</div></div>;
};

const Stats: React.FC = () => <AbsoluteFill>
  <OffthreadVideo src={staticFile('px_7334485.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) blur(10px) brightness(.45)'}} />
  <AbsoluteFill style={{justifyContent: 'center', gap: 10}}>
    <Counter to={7} delay={0} label="ай" /><Counter to={3} delay={22} label="қала" red /><Counter to={10} delay={44} label="пакет" />
  </AbsoluteFill></AbsoluteFill>;

export const Final: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile('amanat.mp4')} muted startFrom={950} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) blur(18px) brightness(.4)'}} />
    <Stack top={640} lines={[['енді', 0, 'k'], ['TEZTAP', 300], ['ОНЛАЙН', 220, 'r']]} step={10} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 1160, gap: 34, opacity: interpolate(f, [24, 34], [0, 1], clamp), filter: `blur(${interpolate(f, [24, 32], [10, 0], clamp)}px)`}}>
      <div style={{fontFamily: SF, fontWeight: 500, fontSize: 50, color: WHITE, textAlign: 'center', maxWidth: 820}}>Үздік сұрақтар — сіздің экраныңызда</div>
      <div style={{fontFamily: SF, fontWeight: 600, fontSize: 46, color: WHITE, background: RED, padding: '14px 40px', borderRadius: 50}}>play.teztap.company</div>
    </AbsoluteFill></AbsoluteFill>;
};

const Hook: React.FC = () => <AbsoluteFill>
  <Sequence durationInFrames={75}><BRoll src="px_8058006.mp4" dur={75} /><AbsoluteFill style={{background: 'rgba(0,0,0,.45)'}} /></Sequence>
  <Sequence from={75}><SiteMotion dur={105} bg="px_8058006.mp4" bgStart={60} /></Sequence>
  <Sequence durationInFrames={75}><Stack top={640} lines={[['бізден жиі сұрайтын:', 0, 'k'], ['СҰРАҚТАРЫҢЫЗДЫ', 150], ['САТАСЫЗДАР МА?', 165, 'r']]} step={9} out={66} /></Sequence>
  <Sequence from={75}><AbsoluteFill style={{alignItems: 'center', paddingTop: 190}}><Line size={52} font={SF}>енді — иә!</Line><Line size={170} color={RED} delay={8}>ОНЛАЙН</Line></AbsoluteFill></Sequence>
</AbsoluteFill>;

const DanaQ: React.FC = () => <AbsoluteFill>
  <BRoll src="px_12893579.mp4" dur={84} /><AbsoluteFill style={{background: 'rgba(0,0,0,.5)'}} />
  <Stack top={640} lines={[['сөйтсем, ол', 0, 'k'], ['IT-МАМАН', 270, 'r'], ['болып шықты', 0, 'k']]} step={10} />
</AbsoluteFill>;

export const Reels: React.FC = () => {
  const at = (sec: number, s: typeof T[0]) => s.from + Math.round(sec * 30) - s.in;
  const a1 = seg(1), a2 = seg(3), m1 = seg(4), m2 = seg(5), m3 = seg(6);
  const f39 = at(30.15, a2);
  const L = (s: typeof T[0], sec: number) => Math.round(sec * 30) - s.in; // local frame within speaker seq
  // big title moments over speakers (absolute frames) — captions hidden there
  const titles: {from: number; dur: number; lines: [string, number, string?][]}[] = [
    {from: at(18.6, a2), dur: 50, lines: [['біздің қала', 0, 'k'], ['АТЫРАУ', 280, 'r']]},
    {from: at(24.2, a2), dur: 60, lines: [['бастадық', 0, 'k'], ['МАМЫР', 230], ['2026', 260, 'r']]},
    {from: at(7.5, m1), dur: 40, lines: [['әрине', 0, 'k'], ['ҚУАНДЫМ', 240, 'r']]},
    {from: at(30.45, m3), dur: 34, lines: [['тек қана', 0, 'k'], ['ҚУАНЫШ', 250, 'r']]},
  ];
  const hide: [number, number][] = [[0, a1.from], [seg(2).from, seg(2).from + seg(2).dur], [seg(7).from, 99999], ...titles.map(t => [t.from, t.from + t.dur] as [number, number]),
    [at(0.6, a1) + 54, at(0.6, a1) + 54], [f39, a2.from + a2.dur], [m2.from, m2.from + m2.dur]];
  return <AbsoluteFill style={{background: 'black'}}><style>{BRAND_CSS}</style>
    <Sequence durationInFrames={seg(0).dur}><Hook /></Sequence>
    <Sequence from={a1.from} durationInFrames={a1.dur}><Speaker src="alt.mp4" i={a1.in} dur={a1.dur} punch={[L(a1, 3.4)]} /><Audio src={staticFile('alt_clean.wav')} startFrom={a1.in} /></Sequence>
    <Sequence from={a2.from} durationInFrames={a2.dur}><Speaker src="alt.mp4" i={a2.in} dur={a2.dur} punch={[L(a2, 23.0)]} bw={[[at(24.2, a2) - a2.from, at(24.2, a2) - a2.from + 60]]} /><Audio src={staticFile('alt_clean.wav')} startFrom={a2.in} /></Sequence>
    <Sequence from={m1.from} durationInFrames={m1.dur}><Speaker src="amanat.mp4" i={m1.in} dur={m1.dur} punch={[L(m1, 5.2), L(m1, 8.4)]} bw={[[at(7.5, m1) - m1.from, at(7.5, m1) - m1.from + 40]]} /><Audio src={staticFile('amanat_clean.wav')} startFrom={m1.in} /></Sequence>
    <Sequence from={m2.from} durationInFrames={m2.dur}><Speaker src="amanat.mp4" i={m2.in} dur={m2.dur} /><Audio src={staticFile('amanat_clean.wav')} startFrom={m2.in} /></Sequence>
    <Sequence from={m3.from} durationInFrames={m3.dur}><Speaker src="amanat.mp4" i={m3.in} dur={m3.dur} punch={[L(m3, 32.1)]} bw={[[0, 48]]} /><Audio src={staticFile('amanat_clean.wav')} startFrom={m3.in} /></Sequence>
    <Sequence from={seg(2).from} durationInFrames={seg(2).dur}><DanaQ /></Sequence>
    {/* B-roll */}
    <Sequence from={at(2.4, a1)} durationInFrames={130}><Sequence durationInFrames={65}><BRoll src="px_3256852.mp4" dur={65} /></Sequence><Sequence from={65}><BRoll src="px_5847919.mp4" dur={65} /></Sequence><AbsoluteFill style={{background: 'rgba(0,0,0,.25)'}} />
      <Stack top={640} lines={[['біз ойнайтынбыз', 0, 'k'], ['АСТАНА', 190], ['АЛМАТЫ', 190, 'r']]} /></Sequence>
    <Sequence from={at(17.6, a2)} durationInFrames={95}><BRoll src="office.mp4" start={60} dur={95} /></Sequence>
    <Sequence from={at(26.6, a2)} durationInFrames={at(29.3, a2) - at(26.6, a2)}><BRoll src="px_7989667.mp4" dur={80} /></Sequence>
    <Sequence from={f39} durationInFrames={a2.from + a2.dur - f39}>
      <Freeze frame={Math.round(30.15 * 30)}><OffthreadVideo src={staticFile('alt.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) blur(10px) brightness(.6)', transform: 'scale(1.15)'}} /></Freeze>
      <Stack top={640} lines={[['кеше өткіздік', 0, 'k'], ['39', 520, 'r'], ['ОЙЫН', 170]]} step={8} /></Sequence>
    <Sequence from={at(10.0, m1)} durationInFrames={50}><BRoll src="px_6646796.mp4" dur={50} /></Sequence>
    <Sequence from={at(10.0, m1) + 50} durationInFrames={m1.from + m1.dur - at(10.0, m1) - 50}><BRoll src="pack.mp4" start={190} dur={70} /></Sequence>
    <Sequence from={m2.from} durationInFrames={m2.dur}><SiteMotion dur={m2.dur} bg="amanat.mp4" bgStart={520} scrollFrom={900} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 190}}><Line size={52} font={SF}>енді</Line><div style={{display: 'flex', gap: 24}}><Line size={130} delay={8}>ҚАЗАҚ</Line><Line size={130} color={RED} delay={16}>ТІЛІНДЕ</Line></div></AbsoluteFill></Sequence>
    <Sequence from={at(33.0, m3)} durationInFrames={45}><BRoll src="px_8451937.mp4" dur={45} /></Sequence>
    <Sequence from={at(31.6, m3)} durationInFrames={at(33.0, m3) - at(31.6, m3)}><BRoll src="px_8058014.mp4" dur={42} /></Sequence>
    {titles.map((t, k) => <Sequence key={k} from={t.from} durationInFrames={t.dur}><Stack top={640} lines={t.lines} out={t.dur - 7} /></Sequence>)}
    <Sequence from={a1.from} durationInFrames={92}><NameTag name="Алтынбек" role="әзірлеуші · Атырау" /></Sequence>
    <Sequence from={m1.from} durationInFrames={92}><NameTag name="Аманат" role="редактор" /></Sequence>
    <Captions hide={hide} accent={['платформ', 'онлайн', 'teztap']} />
    <Sequence from={seg(7).from} durationInFrames={seg(7).dur}><Stats /></Sequence>
    {[seg(0).from + 75, a1.from, at(2.4, a1), at(2.4, a1) + 65, at(2.4, a1) + 130, seg(2).from, a2.from, at(17.6, a2), at(26.6, a2), f39, m1.from, at(10.0, m1), at(10.0, m1) + 50, m2.from, m3.from, at(31.6, m3), at(33.0, m3), seg(7).from, seg(8).from]
      .map((fr, k) => <Sequence key={'fl' + k} from={fr - 1} durationInFrames={5}><Flash /></Sequence>)}
    <Sequence from={seg(8).from} durationInFrames={seg(8).dur}><Final /></Sequence>
  </AbsoluteFill>;
};
