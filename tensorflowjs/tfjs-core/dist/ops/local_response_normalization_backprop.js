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
import { LRNBackprop } from '../kernel_names';
import { op } from './operation';
function localResponseNormalizationBackprop_(x, y, dy, depthRadius = 5, bias = 1, alpha = 1, beta = 0.5) {
    const forward = backend => backend.LRNGrad(dy, x, y, depthRadius, bias, alpha, beta);
    const inputs = { x, y, dy };
    const attrs = { depthRadius, bias, alpha, beta };
    return ENGINE.runKernelFunc(forward, inputs, null /* grad */, LRNBackprop, attrs);
}
export const localResponseNormalizationBackprop = op({ localResponseNormalizationBackprop_ });
//# sourceMappingURL=local_response_normalization_backprop.js.map