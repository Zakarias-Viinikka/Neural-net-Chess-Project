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
import { FusedBatchNorm } from '../kernel_names';
import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { reshape } from './array_ops';
import { xAs4D } from './batchnorm_util';
import { op } from './operation';
/**
 * Batch normalization.
 *
 * As described in
 * [http://arxiv.org/abs/1502.03167](http://arxiv.org/abs/1502.03167).
 *
 * Mean, variance, scale, and offset can be of two shapes:
 *   - The same shape as the input.
 *   - In the common case, the depth dimension is the last dimension of x, so
 *     the values would be an `tf.Tensor1D` of shape [depth].
 *
 * Also available are stricter rank-specific methods with the same signature
 * as this method that assert that parameters passed are of given rank
 *   - `tf.batchNorm2d`
 *   - `tf.batchNorm3d`
 *   - `tf.batchNorm4d`
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
/** @doc {heading: 'Operations', subheading: 'Normalization'} */
function batchNorm_(x, mean, variance, offset, scale, varianceEpsilon) {
    if (varianceEpsilon == null) {
        varianceEpsilon = 0.001;
    }
    const $x = convertToTensor(x, 'x', 'batchNorm');
    const $mean = convertToTensor(mean, 'mean', 'batchNorm');
    const $variance = convertToTensor(variance, 'variance', 'batchNorm');
    let $scale;
    if (scale != null) {
        $scale = convertToTensor(scale, 'scale', 'batchNorm');
    }
    let $offset;
    if (offset != null) {
        $offset = convertToTensor(offset, 'offset', 'batchNorm');
    }
    util.assert($mean.rank === $variance.rank, () => 'Batch normalization gradient requires mean and variance to have ' +
        'equal ranks.');
    util.assert($offset == null || $mean.rank === $offset.rank, () => 'Batch normalization gradient requires mean and offset to have ' +
        'equal ranks.');
    util.assert($scale == null || $mean.rank === $scale.rank, () => 'Batch normalization gradient requires mean and scale to have ' +
        'equal ranks.');
    const x4D = xAs4D($x);
    const forward = (backend, save) => {
        save([x4D, $mean, $variance, $scale]);
        return backend.batchNorm(x4D, as1DOr4D($mean), as1DOr4D($variance), as1DOr4D($offset), as1DOr4D($scale), varianceEpsilon);
    };
    const inputs = {
        x: x4D,
        scale: $scale,
        offset: $offset,
        mean: $mean,
        variance: $variance
    };
    const attrs = { varianceEpsilon };
    const res = ENGINE.runKernelFunc(forward, inputs, null /* gradient */, FusedBatchNorm, attrs);
    return reshape(res, $x.shape);
}
function as1DOr4D(x) {
    if (x == null) {
        return null;
    }
    if (x.rank === 0) {
        return x.as1D();
    }
    else if (x.rank === 1) {
        return x;
    }
    else if (x.rank === 2) {
        return x.as4D(1, 1, x.shape[0], x.shape[1]);
    }
    else if (x.rank === 3) {
        return x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
    }
    return x;
}
export const batchNorm = op({ batchNorm_ });
//# sourceMappingURL=batchnorm.js.map