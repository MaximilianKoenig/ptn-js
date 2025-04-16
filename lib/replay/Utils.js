export function canTrigger(element, flowDirectionInverted) {
  const incoming = flowDirectionInverted ? element.outgoing : element.incoming;
  if (incoming) {
    for (const i of incoming) {
      const incomingId = flowDirectionInverted
        ? i.businessObject.target.id
        : i.businessObject.source.id;
      const weight = i.businessObject.inscription ?? 1;
      const source = getChildById(element.parent, incomingId);
      const marking = source.businessObject.marking ?? 0;
      if (marking < weight) {
        return false;
      }
    }
  }
  return true;
}

export function getChildById(element, id) {
  return element.children.find((child) => child.id === id);
}
