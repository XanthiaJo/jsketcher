import React from 'react';
import {
  Check,
  Circle,
  CircleDashed,
  CircleDot,
  Compass,
  Copy,
  Crosshair,
  Dot,
  Egg,
  ExternalLink,
  FlipHorizontal2,
  Hand,
  MoveHorizontal,
  MoveVertical,
  PenLine,
  PenTool,
  RulerDimensionLine,
  Slash,
  Spline,
  Square,
  X,
} from 'lucide-react';
import {getSizeInPx} from 'cad/icons/DeclarativeIcon';

// Sketcher ribbon icons are keyed by the unprefixed sketcher action id
// (e.g. 'PointTool', 'PanTool', 'MeasureDistance') plus the sketcher
// control action ids ('sketchSaveAndExit', 'sketchExit', 'sketchOpenInTab').
// This mirrors the modeler ribbon icon pattern in modelerRibbonIcon.tsx.
export const sketcherRibbonIcons: Record<string, React.ComponentType<any>> = {
  // control actions
  sketchSaveAndExit: Check,
  sketchExit: X,
  sketchOpenInTab: ExternalLink,

  // general tools
  PanTool: Hand,
  ReferencePointTool: Crosshair,

  // object tools
  PointTool: Dot,
  SegmentTool: Slash,
  MultiLineTool: PenLine,
  CircleTool: Circle,
  ArcTool: Spline,
  EllipseTool: Egg,
  EllipseArcTool: CircleDashed,
  BezierTool: PenTool,
  RectangleTool: Square,

  // operations
  Offset: Copy,
  MirrorStart: FlipHorizontal2,

  // measure tools
  MeasureDistance: RulerDimensionLine,
  MeasureHDistance: MoveHorizontal,
  MeasureVDistance: MoveVertical,
  MeasureCircle: CircleDot,
  MeasureAngleBetween: Compass,
};

export function getSketcherRibbonIcon(actionId: string) {
  const Icon = sketcherRibbonIcons[actionId];
  return Icon ? <Icon size={16} strokeWidth={1.8} /> : null;
}

export function sketcherRibbonIcon(actionId: string) {
  const Icon = sketcherRibbonIcons[actionId];
  if (!Icon) {
    return null;
  }
  return {
    icon: ({size}) => React.createElement(Icon, {size: getSizeInPx(size), strokeWidth: 1.8})
  };
}
