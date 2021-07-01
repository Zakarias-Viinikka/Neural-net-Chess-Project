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
import { BroadcastTo } from '../kernel_names';
import { sum } from '../ops/reduction_ops';
export const broadcastToGradConfig = {
    kernelName: BroadcastTo,
    gradFunc: (dy, saved, attrs) => {
        const broadCastToAttrs = attrs;
        const inputShape = broadCastToAttrs.inputShape;
        const outputShape = broadCastToAttrs.shape;
        const reps = Array.from(outputShape);
        for (let i = inputShape.length - 1; i >= 0; i--) {
            if (inputShape[i] === outputShape[i]) {
                reps[i] = 1;
            }
            else if (inputShape[i] !== 1) {
                throw new Error(`broadcastTo(): [${inputShape}] cannot be broadcast to [${outputShape}].`);
            }
        }
        const axes = [];
        for (let i = 0; i < reps.length; i++) {
            if (reps[i] > 1) {
                axes.push(i);
            }
        }
        return { x: () => sum(dy, axes, true /* keepDims */) };
    }
};
//# sourceMappingURL=BroadcastTo_grad.js.map