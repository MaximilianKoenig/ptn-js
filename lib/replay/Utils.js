export function canTrigger(element, flowDirectionInverted) {
  const incoming = flowDirectionInverted ? element.outgoing : element.incoming;
  console.log(element);
  if (incoming) {
    for (const i of incoming) {
      const incomingId = flowDirectionInverted
        ? i.businessObject.target.id
        : i.businessObject.source.id;
      const weight = i.businessObject.weight ?? 1;
      const source = getChildById(element.parent, incomingId);
      const marking = source.businessObject.marking ?? 0;
      console.log(marking);
      console.log(weight);
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
