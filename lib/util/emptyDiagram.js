import { MODELER_PREFIX, MODELER_DI_PREFIX, MODELER_NAMESPACE, MODELER_DI_NAMESPACE } from "./constants";

const emptyDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<${MODELER_PREFIX}:definitions xmlns:${MODELER_PREFIX}="${MODELER_NAMESPACE}" xmlns:${MODELER_DI_PREFIX}="${MODELER_DI_NAMESPACE}" xmlns:dc="https://www.omg.org/spec/BPMN/20100501/DC.xsd">
    <${MODELER_PREFIX}:model id="model_1" name="Model 1">
    </${MODELER_PREFIX}:model>
    <${MODELER_DI_PREFIX}:diagram id="model_1_di">
        <${MODELER_DI_PREFIX}:plane id="model_1_plane" modelElement="model_1">
        </${MODELER_DI_PREFIX}:plane>
    </${MODELER_DI_PREFIX}:diagram>
</${MODELER_PREFIX}:definitions>`;

export default emptyDiagram;
