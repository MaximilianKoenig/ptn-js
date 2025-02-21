// Candidate for common module
import AutoPlaceModule from 'diagram-js/lib/features/auto-place';
import PnAutoPlace from './PnAutoPlace';

export default {
    __depends__: [ AutoPlaceModule ],
    __init__: [ 'pnAutoPlace' ],
    pnAutoPlace: [ 'type', PnAutoPlace ]
};
