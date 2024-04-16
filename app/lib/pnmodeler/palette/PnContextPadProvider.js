import { assign } from "min-dash";

export default function PnContextPadProvider(connect, contextPad, modeling, elementFactory, create, autoPlace) {
  this._connect = connect;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._create = create;
  this._autoPlace = autoPlace;

  contextPad.registerProvider(this);
}

PnContextPadProvider.$inject = [
  'connect',
  'contextPad',
  'modeling',
  'elementFactory',
  'create',
  'autoPlace'
];

PnContextPadProvider.prototype.getContextPadEntries = function (element) {
  const connect = this._connect;
  const modeling = this._modeling;
  const elementFactory = this._elementFactory;
  const create = this._create;
  const autoPlace = this._autoPlace;

  function removeElement() {
    modeling.removeElements([element]);
  }

  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }

  function appendPlace(event, element) {
    const shape = elementFactory.createShape({ type: 'ptn:Place' });

    autoPlace.append(element, shape, { connection: { type: 'ptn:Arc' } });
  }

  function appendPlaceStart(event) {
    const shape = elementFactory.createShape({ type: 'ptn:Place' });

    create.start(event, shape, { source: element });
  }

  function appendTransition(event, element) {
    const shape = elementFactory.createShape({ type: 'ptn:Transition' });

    autoPlace.append(element, shape, { connection: { type: 'ptn:Arc' } });
  }

  function appendTransitionStart(event) {
    const shape = elementFactory.createShape({ type: 'ptn:Transition' });

    create.start(event, shape, { source: element });
  }

  function addToken(event, element) {
    const marking = element.businessObject.marking;
    if (marking) {
      modeling.updateProperty(
        element,
        'marking',
        marking + 1,
        { rerender: true }
      );
    } else {
      modeling.updateProperty(
        element,
        'marking',
        1,
        { rerender: true }
      );
    }
  }

  function removeToken(event, element) {
    const marking = element.businessObject.marking;
    if (marking && marking > 0) {
      modeling.updateProperty(
        element,
        'marking',
        marking - 1,
        { rerender: true }
      );
    }
  }

  // Common actions
  const actions = {
    'delete': {
      group: 'edit',
      className: 'bpmn-icon-trash',
      title: 'Remove',
      action: {
        click: removeElement,
        dragstart: removeElement
      }
    }
  }

  // Transition & Place actions
  if (element.type === 'ptn:Place' || element.type === 'ptn:Transition') {
    assign(actions, {
      'connect': {
        group: 'edit',
        className: 'bpmn-icon-connection',
        title: 'Connect',
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      }
    });
  }

  // Transition actions
  if (element.type === 'ptn:Transition') {
    assign(actions, {
      'append-place': {
        group: 'create',
        className: 'pn-icon-place',
        title: 'Append place',
        action: {
          click: appendPlace,
          dragstart: appendPlaceStart
        }
      }
    });
  }

  // Place actions
  if (element.type === 'ptn:Place') {
    assign(actions, {
      'append-transition': {
        group: 'create',
        className: 'pn-icon-transition',
        title: 'Append transition',
        action: {
          click: appendTransition,
          dragstart: appendTransitionStart
        }
      }
    });
    assign(actions, {
      'add-token': {
        group: 'create',
        className: 'pn-icon-add-token',
        title: 'Add token',
        action: {
          click: addToken
        }
      }
    });
    assign(actions, {
      'remove-token': {
        group: 'create',
        className: 'pn-icon-remove-token',
        title: 'Remove token',
        action: {
          click: removeToken
        }
      }
    });
  }

  return actions;
}