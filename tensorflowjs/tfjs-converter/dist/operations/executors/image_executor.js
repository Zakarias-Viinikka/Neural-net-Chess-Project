/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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
import { getParamValue } from './utils';
export const executeOp = (node, tensorMap, context) => {
    switch (node.op) {
        case 'ResizeBilinear': {
            const images = getParamValue('images', node, tensorMap, context);
            const size = getParamValue('size', node, tensorMap, context);
            const alignCorners = getParamValue('alignCorners', node, tensorMap, context);
            return [tfc.image.resizeBilinear(images, [size[0], size[1]], alignCorners)];
        }
        case 'ResizeNearestNeighbor': {
            const images = getParamValue('images', node, tensorMap, context);
            const size = getParamValue('size', node, tensorMap, context);
            const alignCorners = getParamValue('alignCorners', node, tensorMap, context);
            return [tfc.image.resizeNearestNeighbor(images, [size[0], size[1]], alignCorners)];
        }
        case 'CropAndResize': {
            const image = getParamValue('image', node, tensorMap, context);
            const boxes = getParamValue('boxes', node, tensorMap, context);
            const boxInd = getParamValue('boxInd', node, tensorMap, context);
            const cropSize = getParamValue('cropSize', node, tensorMap, context);
            const method = getParamValue('method', node, tensorMap, context);
            const extrapolationValue = getParamValue('extrapolationValue', node, tensorMap, context);
            return [tfc.image.cropAndResize(image, boxes, boxInd, cropSize, method, extrapolationValue)];
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'image';
//# sourceMappingURL=image_executor.js.map