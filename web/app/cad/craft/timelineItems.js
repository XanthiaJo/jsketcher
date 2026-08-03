/**
 * Pure helpers for composing the HistoryTimeline contents.
 *
 * The timeline merges two independent sources:
 *  - operation history entries (craft modifications)
 *  - standalone sketch models (MSketch)
 *
 * Sketches are rendered as a group before the operation history so the
 * user can see and re-enter sketches alongside the parametric timeline.
 */

/**
 * Build the ordered list of timeline items from the operation history and
 * the collection of standalone sketches.
 *
 * @param {Array}  history   - craft operation history entries
 * @param {Array}  sketches  - MSketch models (may be null/undefined)
 * @returns {Array<{type: string, sketch?: *, index?: number}>}
 */
export function composeTimelineItems(history, sketches) {
  const items = [];
  const hasSketches = sketches && sketches.length > 0;
  const hasHistory = history && history.length > 0;

  if (hasSketches) {
    sketches.forEach(sketch => items.push({ type: 'sketch', sketch }));
    if (hasHistory) {
      items.push({ type: 'separator' });
    }
  }

  if (hasHistory) {
    history.forEach((modification, index) =>
      items.push({ type: 'operation', index, modification }));
  }

  return items;
}

/**
 * Whether the sketch group should be rendered at all.
 */
export function shouldShowSketchGroup(sketches) {
  return !!(sketches && sketches.length > 0);
}

/**
 * Whether a separator should be drawn between the sketch group and the
 * operation history.
 */
export function shouldShowSeparator(sketches, history) {
  return shouldShowSketchGroup(sketches) && !!(history && history.length > 0);
}
