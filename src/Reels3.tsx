import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, Audio, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Freeze, Easing} from 'remotion';
import {BRAND_CSS} from './fonts';
import data from './data3.json';
import {Line, Stack, Speaker, BRoll, SiteMotion, NameTag, Flash, RED, WHITE, D, SF, clamp} from './Reels';
type Seg = {type: string; src?: string; from: number; dur: number; in?: number; a?: number; text?: string; red?: string; at?: number};
const TL = data.timeline as Seg[];
const CAPS = data.captions as [number, number, string][];
const SRC: Record<string, {v: string; a: string}> = {amanat: {v: 'amanat.mp4', a: 'amanat_clean.wav'}, alt: {v: 'alt.mp4', a: 'alt_clean.wav'}};
const ease = Easing.bezier(0.45, 0, 0.2, 1);

// word time lookup (absolute frame of first caption starting with prefix after frame `after`)
const wordAt = (prefix: string, after = 0) => (CAPS.find(c => c[0] >= after && c[2].toLowerCase().startsWith(prefix.toLowerCase())) || [after])[0];

const Question: React.FC<{s: Seg; n: number}> = ({s, n}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const words = s.text!.split(' ');
  const out = interpolate(f, [s.dur - 14, s.dur], [0, 1], {...clamp, easing: ease});
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile(SRC[s.src!].v)} muted startFrom={Math.max(0, Math.round(s.at! * 30) - s.dur)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(${1 - out}) blur(${26 * (1 - out)}px) brightness(${0.45 + 0.55 * out})`, transform: `scale(${1.15 - 0.13 * out})`}} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px', opacity: 1 - out, filter: `blur(${out * 12}px)`, transform: `scale(${1 - out * 0.05})`}}>
      <div style={{fontFamily: SF, fontWeight: 600, fontSize: 40, color: WHITE, opacity: .8, marginBottom: 26, letterSpacing: 4, transform: `translateY(${interpolate(f, [0, 10], [10, 0], {...clamp, easing: ease})}px)`}}>СҰРАҚ · 0{n}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 26px', maxWidth: 940}}>
        {words.map((w, i) => { const sp = spring({frame: f + 8 - i * 2, fps, config: {damping: 22, stiffness: 120}});
          const isRed = s.red && w.replace(/[?—]/g, '').toLowerCase() === s.red.toLowerCase();
          return <span key={i} style={{fontFamily: D, fontSize: words.length > 5 ? 118 : 150, lineHeight: 1.02, color: isRed ? RED : WHITE, textTransform: 'uppercase',
            opacity: Math.min(1, sp * 1.5), filter: `blur(${(1 - sp) * 8}px)`, transform: `translateY(${(1 - sp) * 14}px)`, textShadow: '0 6px 30px rgba(0,0,0,.4)'}}>{w}</span>; })}
      </div></AbsoluteFill></AbsoluteFill>;
};

// one-word captions
const Captions: React.FC<{hide: [number, number][]}> = ({hide}) => {
  const f = useCurrentFrame();
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  let c: [number, number, string] | undefined;
  for (let k = 0; k < CAPS.length; k++) { const nx = CAPS[k + 1]?.[0] ?? CAPS[k][1] + 8; if (f >= CAPS[k][0] && f < Math.min(nx, CAPS[k][1] + 10)) { c = CAPS[k]; break; } }
  if (!c) return null; const w = c[2].replace(/[.,!?«»]/g, ''); if (!w || w === '—') return null; const l = f - c[0];
  return <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 820}}>
    <div style={{fontFamily: SF, fontWeight: 600, fontSize: 60, color: WHITE, transform: `scale(${interpolate(l, [0, 4], [1.15, 1], clamp)})`, filter: `blur(${interpolate(l, [0, 3], [6, 0], clamp)}px)`, textShadow: '0 4px 18px rgba(0,0,0,.7)'}}>{w}</div></AbsoluteFill>;
};

// ref-style white UI card
const Card: React.FC<{children: React.ReactNode; dur: number; top?: number; h?: number}> = ({children, dur, top = 470, h = 760}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease}); const o = interpolate(f, [dur - 10, dur], [0, 1], {...clamp, easing: ease});
  return <AbsoluteFill style={{alignItems: 'center', paddingTop: top}}>
    <div style={{width: 900, height: h, background: 'linear-gradient(180deg,#fff,#f3f3f3)', borderRadius: 54, boxShadow: '0 40px 100px rgba(0,0,0,.45)', padding: 56, boxSizing: 'border-box',
      opacity: e * (1 - o), transform: `translateY(${(1 - e) * 120 - o * 60}px) scale(${0.94 + 0.06 * e})`, filter: `blur(${(1 - e) * 10 + o * 10}px)`, overflow: 'hidden', position: 'relative'}}>{children}</div>
  </AbsoluteFill>;
};
const Typing: React.FC<{text: string; start?: number; size?: number; color?: string; weight?: number}> = ({text, start = 0, size = 52, color = '#111', weight = 700}) => {
  const f = useCurrentFrame(); const n = Math.floor(interpolate(f, [start, start + text.length * 1.1], [0, text.length], clamp));
  return <div style={{fontFamily: SF, fontWeight: weight, fontSize: size, color, lineHeight: 1.2}}>{text.slice(0, n)}<span style={{opacity: n < text.length && f % 16 < 8 ? 1 : 0, color: RED}}>|</span></div>;
};
const Chip: React.FC<{children: React.ReactNode; at: number; red?: boolean}> = ({children, at, red}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - at, fps, config: {damping: 15, stiffness: 140}});
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: red ? RED : WHITE, color: red ? WHITE : '#111', fontFamily: SF, fontWeight: 600, fontSize: 44,
    padding: '16px 30px', borderRadius: 60, boxShadow: '0 10px 30px rgba(0,0,0,.18)', opacity: f < at ? 0 : Math.min(1, s * 1.4), transform: `scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 20}px)`}}>
    <span style={{width: 16, height: 16, borderRadius: 8, background: red ? WHITE : RED}} />{children}</div>;
};

const ChipsOverlay: React.FC<{items: [string, number][]}> = ({items}) =>
  <AbsoluteFill style={{alignItems: 'center', paddingTop: 1480, gap: 14}}>{items.map(([t, at], i) => <Chip key={i} at={at} red={i === items.length - 1}>{t}</Chip>)}</AbsoluteFill>;

const PacksUI: React.FC<{dur: number}> = ({dur}) => <Card dur={dur}>
  <div style={{fontFamily: SF, fontWeight: 600, fontSize: 34, color: '#999', marginBottom: 18}}>TEZTAP · жаңа пакет</div>
  <Typing text="Ойын күні: сенбі" start={8} />
  <div style={{display: 'flex', gap: 16, marginTop: 34}}><Chip at={26}>автор 1</Chip><Chip at={31}>автор 2</Chip><Chip at={36}>автор 3</Chip></div>
  <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22}}>
    {['өзекті тақырыптар', 'елдегі жаңалықтар', 'бір жылдан кейін де өзекті?'].map((t, i) => <Check key={i} at={48 + i * 14} text={t} />)}
  </div>
</Card>;
const Check: React.FC<{at: number; text: string}> = ({at, text}) => {
  const f = useCurrentFrame(); const p = interpolate(f, [at, at + 8], [0, 1], {...clamp, easing: ease});
  return <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
    <div style={{width: 54, height: 54, borderRadius: 16, background: p > .5 ? RED : '#ddd', color: WHITE, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontWeight: 900}}>✓</div>
    <div style={{fontFamily: SF, fontWeight: 600, fontSize: 46, color: '#111'}}>{text}</div></div>;
};

const CallUI: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const tiles = ['px_6646796.mp4', 'px_8451937.mp4', 'px_3256852.mp4', 'px_7334485.mp4'];
  return <Card dur={dur} h={820}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26}}>
      <div style={{fontFamily: SF, fontWeight: 700, fontSize: 44}}>Видеозвонок</div><Chip at={6} red>TEZTAP ONLINE</Chip></div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
      {tiles.map((t, i) => { const s = spring({frame: f - 8 - i * 5, fps, config: {damping: 16}});
        return <div key={i} style={{height: 290, borderRadius: 30, overflow: 'hidden', opacity: s, transform: `scale(${0.8 + 0.2 * s})`}}>
          <OffthreadVideo src={staticFile(t)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>; })}
    </div>
    <div style={{marginTop: 24, display: 'flex', justifyContent: 'center', gap: 18}}><Chip at={34}>Астана</Chip><Chip at={38}>Алматы</Chip><Chip at={42}>Атырау</Chip></div>
  </Card>;
};

export const Reels3: React.FC = () => {
  const S = TL.filter(s => s.type === 'speak'); const [s1, s2] = S;
  const at = (s: Seg, sec: number) => s.from + Math.round((sec - s.a!) * 30);
  const hide: [number, number][] = TL.filter(s => s.type !== 'speak').map(s => [s.from, s.from + s.dur] as [number, number]);
  const titles: {from: number; dur: number; lines: [string, number, string?][]}[] = [
    {from: s1.from + 100, dur: 50, lines: [['ойнайтынбыз', 0, 'k'], ['АСТАНА · АЛМАТЫ', 170]]},
    {from: at(s1, 18.6), dur: 50, lines: [['біздің қала', 0, 'k'], ['АТЫРАУ', 240, 'r']]},
    {from: at(s1, 24.4), dur: 55, lines: [['бастадық', 0, 'k'], ['МАМЫР 2026', 200, 'r']]},
    {from: at(s1, 30.2), dur: 75, lines: [['кеше өткіздік', 0, 'k'], ['39 ОЙЫН', 240, 'r']]},
    {from: s2.from + 100, dur: 50, lines: [['әрине', 0, 'k'], ['ҚУАНДЫМ', 220, 'r']]},
    {from: at(s2, 17.1), dur: 60, lines: [['енді', 0, 'k'], ['ҚАЗАҚ ТІЛІНДЕ', 170, 'r']]},
    {from: at(s2, 30.5), dur: 50, lines: [['тек қана', 0, 'k'], ['ҚУАНЫШ', 230, 'r']]},
  ];
  return <AbsoluteFill style={{background: 'black'}}><style>{BRAND_CSS}</style>
    {TL.map((s, i) => s.type === 'speak' ? <Sequence key={i} from={s.from} durationInFrames={s.dur}>
        <Speaker src={SRC[s.src!].v} i={s.in!} dur={s.dur} punch={[]} />
        <Audio src={staticFile(SRC[s.src!].a)} startFrom={s.in!} /></Sequence>
      : s.type === 'q' ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Question s={s} n={(i >> 1) + 1} /></Sequence>
      : <Sequence key={i} from={s.from} durationInFrames={s.dur}><FinalCard /></Sequence>)}
    <Sequence from={s1.from} durationInFrames={92}><NameTag name="Алтынбек" role="әзірлеуші · Атырау" /></Sequence>
    <Sequence from={s2.from} durationInFrames={92}><NameTag name="Аманат" role="редактор" /></Sequence>
    <Captions hide={hide} />
  </AbsoluteFill>;
};

const FinalCard: React.FC = () => { const f = useCurrentFrame();
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile('pack.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) blur(18px) brightness(.4)'}} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 620, opacity: interpolate(f, [0, 12], [0, 1], clamp)}}>
      <div style={{fontFamily: SF, fontWeight: 500, fontSize: 52, color: WHITE}}>енді</div>
      <div style={{fontFamily: D, fontSize: 300, lineHeight: .9, color: WHITE}}>TEZTAP</div>
      <div style={{fontFamily: D, fontSize: 220, lineHeight: .9, color: RED}}>ОНЛАЙН</div></AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 1180, gap: 30, opacity: interpolate(f, [24, 34], [0, 1], clamp)}}>
      <div style={{fontFamily: SF, fontWeight: 500, fontSize: 50, color: WHITE, textAlign: 'center', maxWidth: 820}}>Үздік сұрақтар — сіздің экраныңызда</div>
      <div style={{fontFamily: SF, fontWeight: 600, fontSize: 46, color: WHITE, background: RED, padding: '14px 40px', borderRadius: 50}}>play.teztap.company</div>
    </AbsoluteFill></AbsoluteFill>; };
