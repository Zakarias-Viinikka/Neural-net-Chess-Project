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
import { Tensor4D, Tensor5D } from '../tensor';
import { TensorLike } from '../types';
/**
 * Computes the 3D max pooling.
 *
 * ```js
 * const x = tf.tensor5d([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 2, 2, 1]);
 * const result = tf.maxPool3d(x, 2, 1, 'valid');
 * result.print();
 * ```
 *
 * @param x The input tensor, of rank 5 or rank 4 of shape
 *     `[batch, depth, height, width, inChannels]`.
 * @param filterSize The filter size:
 *     `[filterDepth, filterHeight, filterWidth]`.
 *     If `filterSize` is a single number,
 *     then `filterDepth == filterHeight == filterWidth`.
 * @param strides The strides of the pooling:
 *     `[strideDepth, strideHeight, strideWidth]`.
 *     If `strides` is a single number,
 *     then `strideDepth == strideHeight == strideWidth`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1*1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_guides/python/nn#Convolution](
 *          https://www.tensorflow.org/api_guides/python/nn#Convolution)
 * @param dimRoundingMode The rounding mode used when computing output
 *     dimensions if pad is a number. If none is provided, it will not round
 *     and error if the output is of fractional size.
 * @param dataFormat An optional string from: "NDHWC", "NCDHW". Defaults to
 *     "NDHWC". Specify the data format of the input and output data. With the
 *     default format "NDHWC", the data is stored in the order of: [batch,
 *     depth, height, width, channels]. Only "NDHWC" is currently supported.
 * @param dilations Deprecated, this field will be gone in v3.0.0.
 *     The dilation rates: `[dilationDepth, dilationHeight, dilationWidth]`
 *     in which we sample input values across the depth, height and width
 *     dimensions in dilated pooling.
 *     Defaults to `[1, 1, 1]`. If `dilations` is a single number,
 *     then `dilationDepth == dilationHeight == dilationWidth`.
 *     If it is greater than 1, then all values of `strides` must be 1.
 */
/** @doc {heading: 'Operations', subheading: 'Convolution'} */
declare function maxPool3d_<T extends Tensor4D | Tensor5D>(x: T | TensorLike, filterSize: [number, number, number] | number, strides: [number, number, number] | number, pad: 'valid' | 'same' | number, dimRoundingMode?: 'floor' | 'round' | 'ceil', dataFormat?: 'NDHWC' | 'NCDHW', dilations?: [number, number, number] | number): T;
export declare const maxPool3d: typeof maxPool3d_;
export {};
