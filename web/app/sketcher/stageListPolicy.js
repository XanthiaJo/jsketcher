// Pure stage-list arithmetic for the sketcher solve stages.
// Operates on a lightweight { length, pointer } shape so it can be unit tested
// without the ParametricManager / solver machinery.

// Returns the new { length, pointer } after appending a stage (which becomes active).
export function addStage({ length, pointer }) {
  return { length: length + 1, pointer: pointer + 1 };
}

// Returns the new { length, pointer } after removing the stage at stageIndex,
// or null when removal is not allowed (removing the last remaining stage or an
// out-of-range index).
export function removeStage({ length, pointer }, stageIndex) {
  if (length <= 1 || stageIndex < 0 || stageIndex >= length) {
    return null;
  }
  let newPointer = pointer;
  if (pointer === stageIndex) {
    newPointer = Math.max(0, stageIndex - 1);
  } else if (pointer > stageIndex) {
    newPointer = pointer - 1;
  }
  const newLength = length - 1;
  return { length: newLength, pointer: Math.min(newPointer, newLength - 1) };
}
