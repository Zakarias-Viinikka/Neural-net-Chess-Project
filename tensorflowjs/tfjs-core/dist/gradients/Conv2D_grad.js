/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
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
import { Conv2D } from '../kernel_names';
import { conv2DBackpropFilter } from '../ops/conv2d_backprop_filter';
import { conv2DBackpropInput } from '../ops/conv2d_backprop_input';
import * as conv_util from '../ops/conv_util';
import * as util from '../util';
export const conv2DGradConfig = {
    kernelName: Conv2D,
    inputsToSave: ['x', 'filter'],
    gradFunc: (dy, saved, attrs) => {
        const [x4D, $filter] = saved;
        const { dilations, strides, pad, dataFormat } = attrs;
        util.assert(conv_util.tupleValuesAreOne(dilations), () => 'Error in gradient of conv2D: dilation rates greater than 1 ' +
            `are not yet supported in gradients. Got dilations '${dilations}'`);
        return {
            x: () => conv2DBackpropInput(x4D.shape, dy, $filter, strides, pad, dataFormat),
            filter: () => conv2DBackpropFilter(x4D, dy, $filter.shape, strides, pad, dataFormat)
        };
    }
};
//# sourceMappingURL=Conv2D_grad.js.map