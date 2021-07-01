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
import { Tensor } from '../tensor';
import { TensorLike } from '../types';
/**
 * @deprecated
 * Adds two `tf.Tensor`s element-wise, A + B.
 *
 * Inputs must be the same shape. For broadcasting support, use add() instead.
 *
 * @param a The first Tensor to add element-wise.
 * @param b The second Tensor to add element-wise.
 */
declare function addStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Subtracts two `tf.Tensor`s element-wise, A - B. Inputs must
 * be the same shape.
 *
 * For broadcasting support, use `tf.sub` instead.
 *
 * @param a The first Tensor to subtract element-wise.
 * @param b The second Tensor to subtract element-wise.
 */
declare function subStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Computes the power of one `tf.Tensor` to another. Inputs must
 * be the same shape.
 *
 * For broadcasting support, use `tf.pow` instead.
 *
 * @param base The base tensor to pow element-wise.
 * @param exp The exponent tensor to pow element-wise.
 */
declare function powStrict_<T extends Tensor>(base: T, exp: Tensor): T;
/**
 * @deprecated
 * Multiplies two `tf.Tensor`s element-wise, A * B.
 *
 * Inputs must be the same shape. For broadcasting support, use `tf.mul`.
 *
 * @param a The first tensor to multiply.
 * @param b The first tensor to multiply. Must have the same
 *    dtype as `a`.
 */
declare function mulStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Divides two `tf.Tensor`s element-wise, A / B. Inputs must
 * be the same shape.
 *
 * @param a The first tensor as the numerator for element-wise division.
 * @param b The second tensor as the denominator for element-wise division.
 */
declare function divStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Returns the mod of a and b (`a < b ? a : b`) element-wise. Inputs must
 * be the same shape. For broadcasting support, use mod().
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same dtype as `a`.
 */
declare function modStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Returns the min of a and b (`a < b ? a : b`) element-wise. Inputs must
 * be the same shape. For broadcasting support, use minimum().
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same dtype as `a`.
 */
declare function minimumStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Returns the max of a and b (`a > b ? a : b`) element-wise. Inputs must
 * be the same shape. For broadcasting support, use maximum().
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same dtype as `a`.
 */
declare function maximumStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
/**
 * @deprecated
 * Returns (a - b) * (a - b) element-wise.
 *
 * Inputs must be the same shape. For broadcasting support, use
 * `tf.squaredDifference` instead.
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same type as `a`.
 */
declare function squaredDifferenceStrict_<T extends Tensor>(a: T | TensorLike, b: T | TensorLike): T;
export declare const addStrict: typeof addStrict_;
export declare const divStrict: typeof divStrict_;
export declare const maximumStrict: typeof maximumStrict_;
export declare const minimumStrict: typeof minimumStrict_;
export declare const modStrict: typeof modStrict_;
export declare const mulStrict: typeof mulStrict_;
export declare const powStrict: typeof powStrict_;
export declare const squaredDifferenceStrict: typeof squaredDifferenceStrict_;
export declare const subStrict: typeof subStrict_;
export {};
