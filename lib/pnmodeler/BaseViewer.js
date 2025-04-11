import Diagram from "diagram-js";
import { MODELER_PREFIX } from "./constants";
import CustomModdle from "./moddle";
import { importDiagram } from "./import/Importer";

export default class BaseViewer extends Diagram {
	constructor(options) {
		const { container, modules = [], additionalModules = [], moddleExtensions = {} } = options;

		const moddle = new CustomModdle(moddleExtensions);

		const staticModules = [
			{
				moddle: [ "value", moddle ]
			}
		];
		const baseViewerModules = [...modules, ...additionalModules, ...staticModules];

		const diagramOptions = {
			canvas: {
				container: container
			},
			modules: baseViewerModules,
		}

		super(diagramOptions);

		this._moddle = moddle;
		// Inject customModeler after calling super
		this.get("injector").invoke(function (injector) {
      injector.customModeler = this;
    });

		this.get("eventBus").fire("attach"); // Needed for key listeners to work
	}

	importXML(xml) {
		const self = this;
		
		return new Promise(function (resolve, reject) {
			// hook in pre-parse listeners +
			// allow xml manipulation
			xml = self._emit("import.parse.start", { xml: xml }) || xml;

			const moddle = self.get("moddle");
			moddle.ids.clear();

			moddle
				.fromXML(xml, `${MODELER_PREFIX}:Definitions`)
				.then(function (result) {
					let definitions = result.rootElement;
					const { references, warnings, elementsById } = result;

					const context = {
						references,
						elementsById,
						warnings,
					};

					definitions =
						self._emit("import.parse.complete", {
							definitions,
							context,
						}) || definitions;

					self.importDefinitions(definitions);
					self.collectIds(moddle, elementsById);

					self._emit("import.render.start", { definitions: definitions });
					self.showModel(definitions);
					self._emit("import.render.complete", {});

					self._emit("import.done", { error: null, warnings: null });
					resolve();
				})
				.catch(function (err) {
					self._emit("import.parse.failed", {
						error: err,
					});

					self._emit("import.done", { error: err, warnings: err.warnings });

					return reject(err);
				});
		});
	}

	importDefinitions(definitions) {
    this._definitions = definitions;
  }

  collectIds(moddle, elementsById) {
    for (let id in elementsById) {
      moddle.ids.claim(id, elementsById[id]);
    }
  }

	showModel(definitions) {
		this.clear();

		// We currently assume that we only import single diagrams
		const rootDiagram = definitions.diagram;
		importDiagram(this, definitions, rootDiagram);
	}

	saveXML(options) {
    options = options || {};

    const self = this;
    let definitions = this._definitions;

    return new Promise(function (resolve, reject) {
      if (!definitions) {
        const err = new Error("no xml loaded");
        return reject(err);
      }

      // allow to fiddle around with definitions
      definitions =
        self._emit("saveXML.start", {
          definitions: definitions,
        }) || definitions;

      self
        .get("moddle")
        .toXML(definitions, options)
        .then(function (result) {
          let xml = result.xml;
          try {
            xml =
              self._emit("saveXML.serialized", {
                error: null,
                xml: xml,
              }) || xml;

            self._emit("saveXML.done", {
              error: null,
              xml: xml,
            });
          } catch (e) {
            console.error("error in saveXML life-cycle listener", e);
          }
          return resolve({ xml: xml });
        })
        .catch(function (err) {
          return reject(err);
        });
    });
	}

	_emit(type, event) {
    return this.get("eventBus").fire(type, event);
  }
}
