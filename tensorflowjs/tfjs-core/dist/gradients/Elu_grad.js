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
import { Elu, EluGrad } from '../kernel_names';
export const eluGradConfig = {
    kernelName: Elu,
    outputsToSave: [true],
    gradFunc: (dy, saved) => {
        const [y] = saved;
        const backPropKernelFunc = (backend) => {
            return backend.eluDer(dy, y);
        };
        const inputs = { dy, y };
        return {
            x: () => ENGINE.runKernelFunc(backPropKernelFunc, inputs, null /* grad */, EluGrad)
        };
    }
};
//# sourceMappingURL=Elu_grad.js.map