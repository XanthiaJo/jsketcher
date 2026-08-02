export function resetCraftHistoryWithOriginGeometry(craftService, history, createOriginGeometry) {
  craftService.reset(history, createOriginGeometry);
}

export function appendImplicitOriginGeometry(models, createOriginGeometry) {
  return [...(models || []), ...createOriginGeometry()];
}

export function hasImplicitOriginGeometry(models) {
  return (models || []).some(model => model.id === 'D:0' && model.originatingOperation === -1);
}

export function ensureImplicitOriginGeometry(models, createOriginGeometry) {
  if (hasImplicitOriginGeometry(models)) {
    return models;
  }
  return [...createOriginGeometry(), ...(models || [])];
}
