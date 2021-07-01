/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
import { Relu6 } from '../kernel_names';
import { convertToTensor } from '../tensor_util_env';
import { cast } from './array_ops';
import { op } from './operation';
/**
 * Computes rectified linear 6 element-wise: `min(max(x, 0), 6)`.
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 8]);
 *
 * x.relu6().print();  // or tf.relu6(x)
 * ```
 * @param x The input tensor. If the dtype is `bool`, the output dtype will be
 *     `int32'.
 */
/** @doc {heading: 'Operations', subheading: 'Basic math'} */
function relu6_(x) {
    const $x = convertToTensor(x, 'x', 'relu6');
    const forward = (backend, save) => {
        save([$x]);
        if ($x.dtype === 'bool') {
            return cast($x, 'int32');
        }
        return backend.relu6($x);
    };
    const inputs = { x: $x };
    return ENGINE.runKernelFunc(forward, inputs, null /* grad */, Relu6);
}
export const relu6 = op({ relu6_ });
//# sourceMappingURL=relu6.js.map