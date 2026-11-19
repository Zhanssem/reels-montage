import React from 'react';
import {Composition} from 'remotion';
import {Reels} from './Reels';
import {Reels2} from './Reels2';
import data from './data.json';
import data2 from './data2.json';
import {Reels3} from './Reels3';
import data3 from './data3.json';
export const Root: React.FC = () => (<>
  <Composition id="Reels" component={Reels} durationInFrames={data.total} fps={30} width={1080} height={1920} />
  <Composition id="QA" component={Reels2} durationInFrames={data2.total} fps={30} width={1080} height={1920} />
  <Composition id="Story" component={Reels3} durationInFrames={data3.total} fps={30} width={1080} height={1920} />
</>);
