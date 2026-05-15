import React from 'react';
import Svg, { Circle, Path, Ellipse, Line, Rect } from 'react-native-svg';

export default function RobotFace({ size = 40, dark = false }) {
  const h = Math.round(size * 1.08);
  const body      = dark ? '#ffffff' : '#1e3a8a';
  const earInner  = dark ? '#dbeafe' : '#2563eb';
  const face      = dark ? '#f1f5f9' : '#1d4ed8';
  const cheek     = dark ? '#93c5fd' : '#60a5fa';
  const line      = dark ? '#1e3a8a' : 'white';
  const antenna   = dark ? '#1e3a8a' : '#93c5fd';
  return (
    <Svg width={size} height={h} viewBox="0 0 100 108" fill="none">
      <Circle cx="50" cy="47" r="43" fill={body}/>
      <Path d="M18 82 Q8 102 34 94 L36 80 Z" fill={body}/>
      <Circle cx="5"  cy="47" r="12" fill={body}/>
      <Circle cx="5"  cy="47" r="7"  fill={earInner}/>
      <Circle cx="95" cy="47" r="12" fill={body}/>
      <Circle cx="95" cy="47" r="7"  fill={earInner}/>
      <Line x1="50" y1="4" x2="50" y2="0" stroke={antenna} strokeWidth="3" strokeLinecap="round"/>
      <Circle cx="50" cy="0" r="4.5" fill="#fbbf24"/>
      <Circle cx="50" cy="50" r="30" fill={face}/>
      <Path d="M32 46 Q38 38 44 46" stroke={line} strokeWidth="3.8" strokeLinecap="round" fill="none"/>
      <Path d="M56 46 Q62 38 68 46" stroke={line} strokeWidth="3.8" strokeLinecap="round" fill="none"/>
      <Ellipse cx="36" cy="58" rx="7" ry="4.5" fill={cheek} opacity="0.5"/>
      <Ellipse cx="64" cy="58" rx="7" ry="4.5" fill={cheek} opacity="0.5"/>
      <Path d="M38 64 Q50 75 62 64" stroke={line} strokeWidth="3.2" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}
