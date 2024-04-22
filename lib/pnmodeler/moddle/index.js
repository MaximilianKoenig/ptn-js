import {assign} from 'min-dash';

import Moddle from './Moddle';

import PnDescriptors from './resources/ptn.json';
import DiDescriptors from './resources/ptnDi.json';
import DcDescriptors from './resources/dc.json';

const packages = {
  ptn: PnDescriptors,
  ptnDi: DiDescriptors,
  dc: DcDescriptors
};

export default function (additionalPackages, options) {
    var pks = assign({}, packages, additionalPackages);

    return new Moddle(pks, options);
}
