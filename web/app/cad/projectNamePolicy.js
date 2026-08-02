export function findDuplicateProjectName(projects, currentUuid, name) {
  const normalized = String(name || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return (projects || []).find(project =>
    project.uuid !== currentUuid && String(project.name || '').trim().toLowerCase() === normalized
  ) || null;
}

export function resolveProjectNameConflict(projects, currentUuid, name, ask) {
  const duplicate = findDuplicateProjectName(projects, currentUuid, name);
  if (!duplicate) {
    return name;
  }
  return ask(duplicate);
}
