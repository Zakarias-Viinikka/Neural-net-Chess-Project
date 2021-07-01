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
import { ENGINE } from '../engine';
import { MaxPool } from '../kernel_names';
import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { reshape } from './array_ops';
import * as conv_util from './conv_util';
import { op } from './operation';
/**
 * Computes the 2D max pooling of an image.
 *
 * @param x The input tensor, of rank 4 or rank 3 of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is assumed.
 * @param filterSize The filter size: `[filterHeight, filterWidth]`. If
 *     `filterSize` is a single number, then `filterHeight == filterWidth`.
 * @param strides The strides of the pooling: `[strideHeight, strideWidth]`. If
 *     `strides` is a single number, then `strideHeight == strideWidth`.
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in dilated pooling. Defaults to `[1, 1]`. If `dilations` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_guides/python/nn#Convolution](
 *          https://www.tensorflow.org/api_guides/python/nn#Convolution)
 * @param dimRoundingMode The rounding mode used when computing output
 *     dimensions if pad is a number. If none is provided, it will not round
 *     and error if the output is of fractional size.
 */
function maxPool_(x, filterSize, strides, pad, dimRoundingMode) {
    const $x = convertToTensor(x, 'x', 'maxPool');
    const dilations = 1;
    let x4D = $x;
    let reshapedTo4D = false;
    if ($x.rank === 3) {
        reshapedTo4D = true;
        x4D = reshape($x, [1, $x.shape[0], $x.shape[1], $x.shape[2]]);
    }
    util.assert(x4D.rank === 4, () => `Error in maxPool: input must be rank 4 but got rank ${x4D.rank}.`);
    util.assert(conv_util.eitherStridesOrDilationsAreOne(strides, dilations), () => 'Error in maxPool: Either strides or dilations must be 1. ' +
        `Got strides ${strides} and dilations '${dilations}'`);
    if (dimRoundingMode != null) {
        util.assert(util.isInt(pad), () => `Error in maxPool: pad must be an integer when using, ` +
            `dimRoundingMode ${dimRoundingMode} but got pad ${pad}.`);
    }
    const forward = (backend, save) => {
        const convInfo = conv_util.computePool2DInfo(x4D.shape, filterSize, strides, 1 /* dilations */, pad, dimRoundingMode);
        let y;
        if (convInfo.filterWidth === 1 && convInfo.filterHeight === 1 &&
            util.arraysEqual(convInfo.inShape, convInfo.outShape)) {
            y = x4D.clone();
        }
        else {
            y = backend.maxPool(x4D, convInfo);
        }
        save([x4D, y]);
        return y;
    };
    const inputs = { x: x4D };
    const attrs = { filterSize, strides, pad, dimRoundingMode };
    const res = ENGINE.runKernelFunc(forward, inputs, null /* grad */, MaxPool, attrs);
    if (reshapedTo4D) {
        return reshape(res, [res.shape[1], res.shape[2], res.shape[3]]);
    }
    return res;
}
export const maxPool = op({ maxPool_ });
//# sourceMappingURL=max_pool.js.map