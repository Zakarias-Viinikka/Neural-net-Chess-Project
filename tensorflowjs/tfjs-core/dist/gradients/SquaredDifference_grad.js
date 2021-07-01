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
import { SquaredDifference } from '../kernel_names';
import { mul } from '../ops/mul';
import { sub } from '../ops/sub';
import { scalar } from '../ops/tensor_ops';
export const squaredDifferenceGradConfig = {
    kernelName: SquaredDifference,
    inputsToSave: ['a', 'b'],
    gradFunc: (dy, saved) => {
        const [a, b] = saved;
        const two = scalar(2);
        const derA = () => mul(dy, mul(two, sub(a, b)));
        const derB = () => mul(dy, mul(two, sub(b, a)));
        return { a: derA, b: derB };
    }
};
//# sourceMappingURL=SquaredDifference_grad.js.map