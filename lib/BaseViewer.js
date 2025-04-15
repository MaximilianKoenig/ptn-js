import Diagram from "diagram-js";
import { query as domQuery } from "min-dom";
import { innerSVG } from "tiny-svg";
import { MODELER_PREFIX } from "./util/constants";
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

	saveSVG() {
		const self = this;

		return new Promise(function (resolve, reject) {
			self._emit("saveSVG.start");
			let svg, err;

			try {
				const canvas = self.get("canvas");

				// Retrieve the layer of the canvas holding all modeled elements
				const contentNode = canvas.getActiveLayer();

				// Get bounds of the layer to determine the overall size of the exported SVG
				const bbox = contentNode.getBBox();
				const { width, height, x, y } = bbox;
	
				// Derive the layer's content as SVG
				const defsNode = domQuery("defs", canvas._svg);
				const contents = innerSVG(contentNode);
				const defs = defsNode ? "<defs>" + innerSVG(defsNode) + "</defs>" : "";

				svg = `<?xml version="1.0" encoding="utf-8"?>
					<!-- created with diagram-js -->
					<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
							width="${width}" height="${height}"
							viewBox="${x} ${y} ${width} ${height}" version="1.1">
						${defs}
						${contents}
					</svg>`;
			} catch (e) {
				err = e;
			}

			self._emit("saveSVG.done", {
				error: err,
				svg: svg,
			});
	
			if (!err) {
				return resolve({ svg: svg });
			}
	
			return reject(err);
		});
	}
}
