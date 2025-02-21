import {assign} from 'min-dash';

import CustomModdle from './CustomModdle';

// CustomModelerTodo: Replace "ptn" with your moddle prefix.
import SemanticDescriptors from './resources/ptn.json';
import DiDescriptors from './resources/ptnDi.json';
import DcDescriptors from './resources/dc.json';

const packages = {
  ptn: SemanticDescriptors,
  ptnDi: DiDescriptors,
  dc: DcDescriptors
};

export default function (additionalPackages, options) {
    const pks = assign({}, packages, additionalPackages);

    return new CustomModdle(pks, options);
}
