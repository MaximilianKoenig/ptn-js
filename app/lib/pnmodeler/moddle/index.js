import {assign} from 'min-dash';

import Moddle from './Moddle';

import PnDescriptors from './pn.json';

const packages = {
  pn: PnDescriptors,
};

export default function (additionalPackages, options) {
    var pks = assign({}, packages, additionalPackages);

    return new Moddle(pks, options);
}
