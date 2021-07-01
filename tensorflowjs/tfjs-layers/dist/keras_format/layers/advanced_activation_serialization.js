/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
// We can't easily extract a string[] from the string union type, but we can
// recapitulate the list, enforcing at compile time that the values are valid.
/**
 * A string array of valid AdvancedActivationLayer class names.
 *
 * This is guaranteed to match the `AdvancedActivationLayerClassName` union
 * type.
 */
export const advancedActivationLayerClassNames = [
    'ReLU',
    'LeakyReLU',
    'PReLU',
    'ELU',
    'ThresholdedReLU',
    'Softmax',
];
//# sourceMappingURL=advanced_activation_serialization.js.map