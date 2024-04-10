import PnTreeWalker from './PnTreeWalker';

export function importPnDiagram(modeler, definitions, rootDiagram) {

    var importer,
        eventBus,
        translate;

    var error,
        warnings = [];

    /**
     * Walk the diagram semantically, importing (=drawing)
     * all elements you encounter.
     */
    function render(definitions, rootDiagram) {

        var visitor = {

            root: function (element) {
                return importer.add(element);
            },

            element: function (element, parentShape) {
                return importer.add(element, parentShape);
            },

            error: function (message, context) {
                warnings.push({message: message, context: context});
            }
        };

        var walker = new PnTreeWalker(visitor, translate);

        // traverse xml document model,
        // starting at definitions
        walker.handleDefinitions(definitions, rootDiagram);
    }

    return new Promise(function (resolve, reject) {
        try {
            importer = modeler.get('pnImporter');
            eventBus = modeler.get('eventBus');
            translate = modeler.get('translate');

            eventBus.fire('import.render.start', {definitions: definitions});

            render(definitions, rootDiagram);

            eventBus.fire('import.render.complete', {
                error: error,
                warnings: warnings
            });

            return resolve({warnings: warnings});
        } catch (e) {
            return reject(e);
        }
    });
}
