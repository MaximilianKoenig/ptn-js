import { MODELER_PREFIX } from "./constants";

const emptyDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<${MODELER_PREFIX}:definitions xmlns:${MODELER_PREFIX}="http://bpt-lab.org/schemas/ptn" xmlns:${MODELER_PREFIX}Di="http://bpt-lab.org/schemas/ptnDi" xmlns:dc="https://www.omg.org/spec/BPMN/20100501/DC.xsd">
    <${MODELER_PREFIX}:model id="model_1" name="Model 1">
    </${MODELER_PREFIX}:model>
    <${MODELER_PREFIX}Di:diagram id="model_1_di">
        <${MODELER_PREFIX}Di:plane id="model_1_plane" modelElement="model_1">
        </${MODELER_PREFIX}Di:plane>
    </${MODELER_PREFIX}Di:diagram>
</${MODELER_PREFIX}:definitions>`;

export default emptyDiagram;
