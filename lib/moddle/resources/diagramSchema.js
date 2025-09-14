import {
  MODELER_PREFIX,
  MODELER_DI_PREFIX,
  MODELER_DI_NAMESPACE,
} from "../../util/constants";

const diagramSchema = {
  name: "Petri net Diagrams",
  uri: MODELER_DI_NAMESPACE,
  prefix: MODELER_DI_PREFIX,
  xml: {
    tagAlias: "lowerCase",
  },
  types: [
    {
      name: "Diagram",
      isAbstract: true,
      properties: [
        {
          name: "id",
          isAttr: true,
          isId: true,
          type: "String",
        },
        {
          name: "name",
          isAttr: true,
          type: "String",
        },
        {
          name: "plane",
          type: "Plane",
        },
      ],
    },
    {
      name: "DiagramElement",
      isAbstract: true,
      properties: [
        {
          name: "id",
          isAttr: true,
          isId: true,
          type: "String",
        },
        {
          name: "owningDiagram",
          type: "Diagram",
          isReadOnly: true,
          isVirtual: true,
          isReference: true,
        },
        {
          name: "owningElement",
          type: "DiagramElement",
          isReadOnly: true,
          isVirtual: true,
          isReference: true,
        },
      ],
    },
    {
      name: "Plane",
      properties: [
        {
          name: "modelElement",
          isAttr: true,
          isReference: true,
          type: `${MODELER_PREFIX}:Model`,
        },
        {
          name: "planeElements",
          type: "DiagramElement",
          subsettedProperty: "DiagramElement-ownedElement",
          isMany: true,
        },
      ],
      superClass: ["DiagramElement"],
    },
    {
      name: "Shape",
      isAbstract: true,
      properties: [
        {
          name: "bounds",
          type: "dc:Bounds",
        },
      ],
      superClass: ["DiagramElement"],
    },
    {
      name: "LabeledShape",
      isAbstract: true,
      properties: [
        {
          name: "ownedLabel",
          type: "Label",
          isReadOnly: true,
          subsettedProperty: "DiagramElement-ownedElement",
          isMany: true,
          isVirtual: true,
        },
      ],
      superClass: ["Shape"],
    },
    {
      name: "DiagramShape",
      properties: [
        {
          name: "modelElement",
          isAttr: true,
          isReference: true,
          type: `${MODELER_PREFIX}:Node`,
        },
        {
          name: "label",
          type: "DiagramLabel",
        },
      ],
      superClass: ["LabeledShape"],
    },
    {
      name: "Edge",
      isAbstract: true,
      properties: [
        {
          name: "source",
          type: `${MODELER_PREFIX}:Node`,
          isReadOnly: true,
          isVirtual: true,
          isReference: true,
        },
        {
          name: "target",
          type: `${MODELER_PREFIX}:Node`,
          isReadOnly: true,
          isVirtual: true,
          isReference: true,
        },
        {
          name: "waypoint",
          type: "dc:Point",
          isUnique: false,
          isMany: true,
          xml: {
            serialize: "xsi:type",
          },
        },
      ],
      superClass: ["DiagramElement"],
    },
    {
      name: "LabeledEdge",
      isAbstract: true,
      properties: [
        {
          name: "ownedLabel",
          type: "Label",
          isReadOnly: true,
          subsettedProperty: "DiagramElement-ownedElement",
          isMany: true,
          isVirtual: true,
        },
      ],
      superClass: ["Edge"],
    },
    {
      name: "DiagramEdge",
      properties: [
        {
          name: "modelElement",
          isAttr: true,
          isReference: true,
          type: `${MODELER_PREFIX}:Connection`,
        },
        {
          name: "label",
          type: "DiagramLabel",
        },
        {
          name: "sourceElement",
          isAttr: true,
          isReference: true,
          type: `${MODELER_PREFIX}:Node`,
          redefines: "Edge#source",
        },
        {
          name: "targetElement",
          isAttr: true,
          isReference: true,
          type: `${MODELER_PREFIX}:Node`,
          redefines: "Edge#target",
        },
      ],
      superClass: ["LabeledEdge"],
    },
    {
      name: "Label",
      isAbstract: true,
      properties: [
        {
          name: "bounds",
          type: "dc:Bounds",
        },
      ],
      superClass: ["DiagramElement"],
    },
    {
      name: "DiagramLabel",
      superClass: ["Label"],
    },
  ],
};

export default diagramSchema;
