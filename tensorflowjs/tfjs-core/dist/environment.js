/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
// Expects flags from URL in the format ?tfjsflags=FLAG1:1,FLAG2:true.
const TENSORFLOWJS_FLAGS_PREFIX = 'tfjsflags';
/**
 * The environment contains evaluated flags as well as the registered platform.
 * This is always used as a global singleton and can be retrieved with
 * `tf.env()`.
 */
/** @doc {heading: 'Environment'} */
export class Environment {
    // tslint:disable-next-line: no-any
    constructor(global) {
        this.global = global;
        this.flags = {};
        this.flagRegistry = {};
        this.urlFlags = {};
        this.populateURLFlags();
    }
    setPlatform(platformName, platform) {
        if (this.platform != null) {
            console.warn(`Platform ${this.platformName} has already been set. ` +
                `Overwriting the platform with ${platform}.`);
        }
        this.platformName = platformName;
        this.platform = platform;
    }
    registerFlag(flagName, evaluationFn, setHook) {
        this.flagRegistry[flagName] = { evaluationFn, setHook };
        // Override the flag value from the URL. This has to happen here because the
        // environment is initialized before flags get registered.
        if (this.urlFlags[flagName] != null) {
            const flagValue = this.urlFlags[flagName];
            console.warn(`Setting feature override from URL ${flagName}: ${flagValue}.`);
            this.set(flagName, flagValue);
        }
    }
    async getAsync(flagName) {
        if (flagName in this.flags) {
            return this.flags[flagName];
        }
        this.flags[flagName] = await this.evaluateFlag(flagName);
        return this.flags[flagName];
    }
    get(flagName) {
        if (flagName in this.flags) {
            return this.flags[flagName];
        }
        const flagValue = this.evaluateFlag(flagName);
        if (flagValue instanceof Promise) {
            throw new Error(`Flag ${flagName} cannot be synchronously evaluated. ` +
                `Please use getAsync() instead.`);
        }
        this.flags[flagName] = flagValue;
        return this.flags[flagName];
    }
    getNumber(flagName) {
        return this.get(flagName);
    }
    getBool(flagName) {
        return this.get(flagName);
    }
    getFlags() {
        return this.flags;
    }
    // For backwards compatibility.
    get features() {
        return this.flags;
    }
    set(flagName, value) {
        if (this.flagRegistry[flagName] == null) {
            throw new Error(`Cannot set flag ${flagName} as it has not been registered.`);
        }
        this.flags[flagName] = value;
        if (this.flagRegistry[flagName].setHook != null) {
            this.flagRegistry[flagName].setHook(value);
        }
    }
    evaluateFlag(flagName) {
        if (this.flagRegistry[flagName] == null) {
            throw new Error(`Cannot evaluate flag '${flagName}': no evaluation function found.`);
        }
        return this.flagRegistry[flagName].evaluationFn();
    }
    setFlags(flags) {
        this.flags = Object.assign({}, flags);
    }
    reset() {
        this.flags = {};
        this.urlFlags = {};
        this.populateURLFlags();
    }
    populateURLFlags() {
        if (typeof this.global === 'undefined' ||
            typeof this.global.location === 'undefined' ||
            typeof this.global.location.search === 'undefined') {
            return;
        }
        const urlParams = getQueryParams(this.global.location.search);
        if (TENSORFLOWJS_FLAGS_PREFIX in urlParams) {
            const keyValues = urlParams[TENSORFLOWJS_FLAGS_PREFIX].split(',');
            keyValues.forEach(keyValue => {
                const [key, value] = keyValue.split(':');
                this.urlFlags[key] = parseValue(key, value);
            });
        }
    }
}
export function getQueryParams(queryString) {
    const params = {};
    queryString.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g, (s, ...t) => {
        decodeParam(params, t[0], t[1]);
        return t.join('=');
    });
    return params;
}
function decodeParam(params, name, value) {
    params[decodeURIComponent(name)] = decodeURIComponent(value || '');
}
function parseValue(flagName, value) {
    value = value.toLowerCase();
    if (value === 'true' || value === 'false') {
        return value === 'true';
    }
    else if (`${+value}` === value) {
        return +value;
    }
    throw new Error(`Could not parse value flag value ${value} for flag ${flagName}.`);
}
/**
 * Returns the current environment (a global singleton).
 *
 * The environment object contains the evaluated feature values as well as the
 * active platform.
 */
/** @doc {heading: 'Environment'} */
export function env() {
    return ENV;
}
export let ENV = null;
export function setEnvironmentGlobal(environment) {
    ENV = environment;
}
//# sourceMappingURL=environment.js.map