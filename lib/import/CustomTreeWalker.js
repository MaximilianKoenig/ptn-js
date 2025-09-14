import { forEach } from "min-dash";
import { Refs } from "object-refs";
import { elementToString } from "../util/Util";
import { MODELER_PREFIX } from "../util/constants";

const diRefs = new Refs(
  { name: "diagramElement", enumerable: true },
  { name: "di", configurable: true },
);

/**
 * Returns true if an element has the given meta-model type
 *
 * @param  {ModdleElement}  element
 * @param  {String}         type
 *
 * @return {Boolean}
 */
function is(element, type) {
  return element.$instanceOf(type);
}

/**
 * Find a suitable display candidate for definitions where the DI does not
 * correctly specify one.
 */
function findDisplayCandidate(definitions) {
  return definitions.model;
}

export default function CustomTreeWalker(handler, translate) {
  // list of containers already walked
  const handledElements = {};

  // list of elements to handle deferred to ensure
  // prerequisites are drawn
  const deferred = [];

  // Helpers //////////////////////

  function visitRoot(element, diagram) {
    return handler.root(element, diagram);
  }

  function visit(element, ctx) {
    const gfx = element.gfx;

    // avoid multiple rendering of elements
    if (gfx) {
      throw new Error(
        translate("already rendered {element}", {
          element: elementToString(element),
        }),
      );
    }

    // call handler
    return handler.element(element, ctx);
  }

  function visitIfDi(element, ctx) {
    try {
      const gfx = element.di && visit(element, ctx);

      handled(element);

      return gfx;
    } catch (e) {
      logError(e.message, { element: element, error: e });

      console.error(
        translate("failed to import {element}", {
          element: elementToString(element),
        }),
      );
      console.error(e);
    }
  }

  function logError(message, context) {
    handler.error(message, context);
  }

  function handled(element) {
    handledElements[element.id] = element;
  }

  // DI handling //////////////////////

  function registerDi(di) {
    const modelElement = di.modelElement;

    if (modelElement) {
      if (modelElement.di) {
        logError(
          translate("multiple DI elements defined for {element}", {
            element: elementToString(modelElement),
          }),
          { element: modelElement },
        );
      } else {
        diRefs.bind(modelElement, "di");
        modelElement.di = di;
      }
    } else {
      logError(
        translate("no modelElement referenced in {element}", {
          element: elementToString(di),
        }),
        { element: di },
      );
    }
  }

  function handleDiagram(diagram) {
    handlePlane(diagram.plane);
  }

  function handlePlane(plane) {
    registerDi(plane);

    forEach(plane.planeElements, handlePlaneElement);
  }

  function handlePlaneElement(planeElement) {
    registerDi(planeElement);
  }

  function handleSequenceFlow(sequenceFlow, context) {
    visitIfDi(sequenceFlow, context);
  }

  // Semantic handling //////////////////////

  /**
   * Handle definitions and return the rendered diagram (if any)
   *
   * @param {ModdleElement} definitions to walk and import
   * @param {ModdleElement} [rootDiagram] specific diagram to import and display
   *
   * @throws {Error} if no diagram to display could be found
   */
  function handleDefinitions(definitions, rootDiagram) {
    // no root board -> nothing to import
    if (!rootDiagram) {
      throw new Error(translate("no diagram to display"));
    }

    // load DI from selected root board only
    handleDiagram(rootDiagram);

    const plane = rootDiagram.plane;

    if (!plane) {
      throw new Error(
        translate("no plane for {element}", {
          element: elementToString(rootDiagram),
        }),
      );
    }

    // rootElement corresponds to the model to display
    let rootElement = plane.modelElement;

    // ensure we default to a suitable display candidate (model),
    // even if none is specified in DI
    if (!rootElement) {
      rootElement = findDisplayCandidate(definitions);

      if (!rootElement) {
        throw new Error(translate("no model to display"));
      } else {
        logError(
          translate(
            "correcting missing modelElement on {plane} to {rootElement}",
            {
              plane: elementToString(plane),
              rootElement: elementToString(rootElement),
            },
          ),
        );

        // correct DI on the fly
        plane.modelElement = rootElement;
        registerDi(plane);
      }
    }

    const ctx = visitRoot(rootElement, plane);

    if (is(rootElement, `${MODELER_PREFIX}:Model`)) {
      handleModel(rootElement, ctx);
    }

    // handle all deferred elements
    handleDeferred(deferred);
  }

  function handleModelElements(modelElements, context) {
    forEach(modelElements, function (element) {
      if (is(element, `${MODELER_PREFIX}:Arc`)) {
        deferred.push(function () {
          handleSequenceFlow(element, context);
        });
      } else {
        visitIfDi(element, context);
      }
    });
  }

  function handleModel(model, context) {
    handleModelElements(model.modelElements, context);

    // log board handled
    handled(model);
  }

  function handleDeferred() {
    let fn;

    // drain deferred until empty
    while (deferred.length) {
      fn = deferred.shift();

      fn();
    }
  }

  // API //////////////////////

  return {
    handleDeferred: handleDeferred,
    handleDefinitions: handleDefinitions,
    registerDi: registerDi,
  };
}
