/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tfc from '@tensorflow/tfjs-core';
import { getParamValue, getTensor } from './utils';
export const executeOp = (node, tensorMap, context) => {
    switch (node.op) {
        case 'Const': {
            return tensorMap[node.name];
        }
        case 'PlaceholderWithDefault':
            const def = getParamValue('default', node, tensorMap, context);
            return [getTensor(node.name, tensorMap, context) || def];
        case 'Placeholder':
            return [getTensor(node.name, tensorMap, context)];
        case 'Identity':
        case 'StopGradient':
        case 'FakeQuantWithMinMaxVars': // This op is currently ignored.
            return [
                getParamValue('x', node, tensorMap, context).clone()
            ];
        case 'IdentityN':
            return getParamValue('x', node, tensorMap, context)
                .map((t) => t.clone());
        case 'Snapshot':
            const snapshot = getParamValue('x', node, tensorMap, context);
            return [snapshot.clone()];
        case 'Shape':
            return [tfc.tensor1d(getParamValue('x', node, tensorMap, context).shape, 'int32')];
        case 'ShapeN':
            return getParamValue('x', node, tensorMap, context)
                .map((t) => tfc.tensor1d(t.shape));
        case 'Size':
            return [tfc.scalar(getParamValue('x', node, tensorMap, context).size, 'int32')];
        case 'Rank':
            return [tfc.scalar(getParamValue('x', node, tensorMap, context).rank, 'int32')];
        case 'NoOp':
            return [tfc.scalar(1)];
        case 'Print':
            const input = getParamValue('x', node, tensorMap, context);
            const data = getParamValue('data', node, tensorMap, context);
            const message = getParamValue('message', node, tensorMap, context);
            const summarize = getParamValue('summarize', node, tensorMap, context);
            console.warn('The graph has a tf.print() operation,' +
                'usually used for debugging, which slows down performance.');
            console.log(message);
            for (let i = 0; i < data.length; i++) {
                console.log(Array.prototype.slice.call(data[i].dataSync()).slice(0, summarize));
            }
            return [input];
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'graph';
//# sourceMappingURL=graph_executor.js.map