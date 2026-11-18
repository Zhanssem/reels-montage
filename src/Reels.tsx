import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Freeze, Img} from 'remotion';
import {FONT_CSS} from './fonts';
import data from './data.json';
const U = 'Montserrat', C = 'Caveat';
const RED = '#ED1C24', DARK = '#C82127', YEL = '#E1E31A';
const T = data.timeline;
const seg = (i: number) => T[i];

const Pop: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'up' | 'left' | 'scale'}> = ({delay = 0, children, style, from = 'scale'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 11, stiffness: 160}});
  const tr = from === 'scale' ? `scale(${s})` : from === 'up' ? `translateY(${(1 - s) * 200}px)` : `translateX(${(1 - s) * -1100}px)`;
  return <div style={{transform: tr, opacity: f < delay ? 0 : 1, ...style}}>{children}</div>;
};

const Rays: React.FC = () => {
  const f = useCurrentFrame();
  const rays = Array.from({length: 16}, (_, i) => `${DARK} ${i * 22.5}deg ${i * 22.5 + 11}deg, ${RED} ${i * 22.5 + 11}deg ${(i + 1) * 22.5}deg`).join(',');
  const icons = ['?', '★', '⚡', '!', '?', '★'];
  return <AbsoluteFill style={{background: RED, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -900, top: -400, width: 2880, height: 2880, background: `conic-gradient(${rays})`, opacity: 0.55, transform: `rotate(${f * 0.4}deg)`}} />
    {icons.map((c, i) => <div key={i} style={{position: 'absolute', fontFamily: C, fontSize: 130, color: 'white', opacity: 0.35,
      left: (i * 173) % 950, top: 200 + ((i * 331 + f * 2) % 1500), transform: `rotate(${Math.sin(f / 20 + i) * 20}deg)`}}>{c}</div>)}
  </AbsoluteFill>;
};

const Big: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 110, color = 'white'}) =>
  <div style={{fontFamily: U, fontWeight: 900, fontSize: size, color, textAlign: 'center', lineHeight: 1.05, textTransform: 'uppercase',
    WebkitTextStroke: '6px black', paintOrder: 'stroke fill', textShadow: `0 12px 0 ${DARK}`}}>{children}</div>;

const Zoom: React.FC<{children: React.ReactNode; dur: number; a?: number; b?: number}> = ({children, dur, a = 1, b = 1.08}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, dur], [a, b])})`}}>{children}</AbsoluteFill>;
};

const Flash: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{background: 'white', opacity: interpolate(f, [0, 6], [0.9, 0], {extrapolateRight: 'clamp'})}} />; };

const NameTag: React.FC<{name: string; role: string}> = ({name, role}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14}}); const out = interpolate(f, [100, 115], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', left: 60, top: 300, transform: `translateX(${(1 - s + out) * -1000}px)`}}>
    <div style={{background: RED, color: 'white', fontFamily: U, fontWeight: 800, fontSize: 64, padding: '18px 34px', border: '5px solid black', borderRadius: 18, boxShadow: '10px 10px 0 black'}}>{name}</div>
    <div style={{display: 'inline-block', marginTop: 14, background: YEL, color: 'black', fontFamily: U, fontWeight: 600, fontSize: 40, padding: '10px 26px', border: '4px solid black', borderRadius: 14}}>{role}</div>
  </div>;
};

const Phone: React.FC<{src: string; start?: number}> = ({src, start = 0}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 13}});
  return <AbsoluteFill><Rays />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 640, height: 1240, borderRadius: 70, border: '18px solid black', overflow: 'hidden', background: 'white', boxShadow: '24px 24px 0 rgba(0,0,0,.35)',
        transform: `translateY(${(1 - s) * 1400}px) rotate(${(1 - s) * 18 + Math.sin(f / 25) * 2}deg)`}}>
        <OffthreadVideo src={staticFile(src)} muted startFrom={start} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill></AbsoluteFill>;
};

// B-roll cut over speaker (visual only)
const BRoll: React.FC<{src: string; start?: number; label?: string; dur: number}> = ({src, start = 0, label, dur}) =>
  <AbsoluteFill><Zoom dur={dur}><OffthreadVideo src={staticFile(src)} muted startFrom={start} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Zoom>
    {label && <AbsoluteFill style={{justifyContent: 'flex-start', paddingTop: 560}}><Pop delay={4}><Big size={96}>{label}</Big></Pop></AbsoluteFill>}
  </AbsoluteFill>;

const FreezeStamp: React.FC<{src: string; at: number; text: string; sub: string}> = ({src, at, text, sub}) =>
  <AbsoluteFill>
    <Freeze frame={at}><OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.3) contrast(1.15)'}} /></Freeze>
    <AbsoluteFill style={{background: 'rgba(237,28,36,.35)'}} /><Flash />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 20}}>
      <Pop><Big size={300} color={YEL}>{text}</Big></Pop><Pop delay={6}><Big size={90}>{sub}</Big></Pop>
    </AbsoluteFill></AbsoluteFill>;

const Speaker: React.FC<{src: string; i: number; dur: number}> = ({src, i, dur}) =>
  <Zoom dur={dur} a={1.02} b={1.12}><OffthreadVideo src={staticFile(src)} muted startFrom={i} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Zoom>;

const Captions: React.FC = () => {
  const f = useCurrentFrame(); const caps = data.captions as [number, number, string][];
  const idx = caps.findIndex(c => f >= c[0] && f < (caps[caps.indexOf(c) + 1]?.[0] ?? c[1] + 10) && f < c[1] + 12);
  if (idx < 0) return null;
  const g = Math.floor(idx / 3) * 3; const group = caps.slice(g, g + 3).filter(c => c[0] - caps[g][0] < 60);
  const local = f - caps[g][0];
  return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 470}}>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 22px', maxWidth: 920, transform: `scale(${interpolate(local, [0, 5], [0.85, 1], {extrapolateRight: 'clamp'})})`}}>
      {group.map((c, k) => { const on = g + k === idx; return <span key={k} style={{fontFamily: U, fontWeight: 800, fontSize: 66, color: on ? YEL : 'white', textTransform: 'uppercase',
        WebkitTextStroke: '10px black', paintOrder: 'stroke fill', transform: on ? 'scale(1.08)' : 'none', display: 'inline-block'}}>{c[2]}</span>; })}
    </div></AbsoluteFill>;
};

const Stats: React.FC = () => {
  const f = useCurrentFrame();
  const n = (to: number, d: number) => Math.round(interpolate(f, [d, d + 18], [0, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const items: [number, string, number][] = [[7, 'ай', 0], [3, 'қала', 25], [10, 'пакет', 50]];
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile('pack.mp4')} muted startFrom={150} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) brightness(.55)'}} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>
      {items.map(([to, w, d]) => <Pop key={w} delay={d} from="left"><div style={{display: 'flex', alignItems: 'baseline', gap: 30}}>
        <Big size={260} color={YEL}>{n(to, d)}</Big><Big size={110}>{w}</Big></div></Pop>)}
    </AbsoluteFill></AbsoluteFill>;
};

const Final: React.FC = () => <AbsoluteFill><Rays />
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 50, padding: 80}}>
    <Pop><div style={{fontFamily: U, fontWeight: 900, fontSize: 220, color: 'white', lineHeight: .9, textAlign: 'center', WebkitTextStroke: '10px black', paintOrder: 'stroke fill', textShadow: `0 18px 0 ${DARK}`}}>TEZ<br />TAP!</div></Pop>
    <Pop delay={10} from="up"><Big size={92} color={YEL}>енді онлайн</Big></Pop>
    <Pop delay={22} from="up"><div style={{fontFamily: C, fontSize: 84, color: 'white', textAlign: 'center'}}>Үздік сұрақтар — сіздің экраныңызда</div></Pop>
    <Pop delay={34}><div style={{background: 'white', border: '5px solid black', borderRadius: 60, padding: '20px 50px', fontFamily: U, fontWeight: 600, fontSize: 52}}>play.teztap.company</div></Pop>
  </AbsoluteFill></AbsoluteFill>;

const Hook: React.FC = () => <AbsoluteFill>
  <Sequence durationInFrames={75}><Zoom dur={75}><OffthreadVideo src={staticFile('hall.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.6)'}} /></Zoom></Sequence>
  <Sequence from={75}><Phone src="site.mp4" /></Sequence>
  <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 300, gap: 24}}>
    <Pop delay={4} from="up"><Big size={70}>Бізден жиі сұрайтын:</Big></Pop>
    <Pop delay={20}><div style={{background: 'white', border: '6px solid black', borderRadius: 40, padding: '28px 40px', boxShadow: '12px 12px 0 black', maxWidth: 900,
      fontFamily: U, fontWeight: 800, fontSize: 62, textAlign: 'center'}}>«Сұрақтарыңызды <span style={{color: RED}}>сатасыздар ма?</span>»</div></Pop>
  </AbsoluteFill>
  <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 440}}>
    <Sequence from={95} layout="none"><Pop><Big size={84} color={YEL}>Енді — иә! Онлайн.</Big></Pop></Sequence>
  </AbsoluteFill></AbsoluteFill>;

const DanaQ: React.FC = () => <AbsoluteFill>
  <BRoll src="code.mp4" dur={84} start={30} />
  <AbsoluteFill style={{background: 'rgba(0,0,0,.35)', justifyContent: 'center', alignItems: 'center', padding: 70}}>
    <Pop><div style={{background: YEL, border: '6px solid black', borderRadius: 40, padding: '40px 46px', boxShadow: '14px 14px 0 black', transform: 'rotate(-3deg)'}}>
      <div style={{fontFamily: U, fontWeight: 900, fontSize: 76, textAlign: 'center'}}>Сөйтсем, ол IT-маман болып шықты 😄</div></div></Pop>
  </AbsoluteFill></AbsoluteFill>;

export const Reels: React.FC = () => {
  const at = (sec: number, s: typeof T[0]) => s.from + Math.round(sec * 30) - s.in;
  const a1 = seg(1), a2 = seg(3), m1 = seg(4), m2 = seg(5), m3 = seg(6);
  const f39 = at(30.15, a2);
  return <AbsoluteFill style={{background: 'black'}}><style>{FONT_CSS}</style>
    <Sequence durationInFrames={seg(0).dur}><Hook /></Sequence>
    {[a1, a2].map((s, k) => <Sequence key={'a' + k} from={s.from} durationInFrames={s.dur}><Speaker src="alt.mp4" i={s.in} dur={s.dur} /><Audio src={staticFile('alt.mp4')} startFrom={s.in} /></Sequence>)}
    {[m1, m2, m3].map((s, k) => <Sequence key={'m' + k} from={s.from} durationInFrames={s.dur}><Speaker src="amanat.mp4" i={s.in} dur={s.dur} /><Audio src={staticFile('amanat.mp4')} startFrom={s.in} /></Sequence>)}
    <Sequence from={seg(2).from} durationInFrames={seg(2).dur}><DanaQ /></Sequence>
    {/* B-roll over Altynbek: Astana/Almaty games, Atyrau, coding */}
    <Sequence from={at(2.4, a1)} durationInFrames={130}><AbsoluteFill><Zoom dur={130} a={1.0} b={1.25}><Img src={staticFile('players.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Zoom>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 500}}><Pop delay={6}><Big size={96}>Астана · Алматы</Big></Pop></AbsoluteFill></AbsoluteFill></Sequence>
    <Sequence from={at(18.4, a2)} durationInFrames={70}><BRoll src="office.mp4" start={60} dur={70} label="📍 Атырау" /></Sequence>
    <Sequence from={at(23.8, a2)} durationInFrames={95}><BRoll src="code.mp4" start={120} dur={95} label="мамыр 2026" /></Sequence>
    <Sequence from={f39} durationInFrames={a2.from + a2.dur - f39}><FreezeStamp src="alt.mp4" at={Math.round(30.15 * 30)} text="39" sub="ойын" /></Sequence>
    {/* B-roll over Amanat */}
    <Sequence from={at(10.0, m1)} durationInFrames={m1.from + m1.dur - at(10.0, m1)}><BRoll src="pack.mp4" start={140} dur={120} label="платформа" /></Sequence>
    <Sequence from={m2.from + 6} durationInFrames={m2.dur - 6}><Phone src="site.mp4" start={120} /></Sequence>
    <Sequence from={m2.from + 6} durationInFrames={m2.dur - 6}><AbsoluteFill style={{paddingTop: 260, alignItems: 'center'}}><Pop><Big size={88} color={YEL}>қазақ тілінде!</Big></Pop></AbsoluteFill></Sequence>
    <Sequence from={at(32.0, m3)} durationInFrames={50}><BRoll src="pack.mp4" start={330} dur={50} /></Sequence>
    {/* name tags with freeze flash */}
    <Sequence from={a1.from} durationInFrames={120}><Flash /><NameTag name="Алтынбек" role="әзірлеуші · Атырау" /></Sequence>
    <Sequence from={m1.from} durationInFrames={120}><Flash /><NameTag name="Аманат" role="редактор" /></Sequence>
    <Audio src={staticFile('music.mp3')} volume={(f) => { const sp = [[seg(1).from, seg(6).from + seg(6).dur]]; const speaking = f > seg(1).from + 8 && f < seg(6).from + seg(6).dur - 4 && !(f > seg(2).from + 4 && f < seg(2).from + seg(2).dur - 4); return speaking ? 0.12 : 0.55; }} />
    <Captions />
    <Sequence from={seg(7).from} durationInFrames={seg(7).dur}><Flash /><Stats /></Sequence>
    <Sequence from={seg(8).from} durationInFrames={seg(8).dur}><Final /></Sequence>
  </AbsoluteFill>;
};
