import React from 'react';
import {Composition} from 'remotion';
import {Reels} from './Reels';
import data from './data.json';
export const Root: React.FC = () => (
  <Composition id="Reels" component={Reels} durationInFrames={data.total} fps={30} width={1080} height={1920} />
);
