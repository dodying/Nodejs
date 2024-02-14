//! stanz - v8.1.15 https://github.com/kirakiray/stanz  (c) 2018-2023 YAO
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.stanz = factory());
})(this, (function () { 'use strict';

  const getRandomId = () => Math.random().toString(32).slice(2);

  const objectToString = Object.prototype.toString;
  const getType = (value) =>
    objectToString
      .call(value)
      .toLowerCase()
      .replace(/(\[object )|(])/g, "");

  const isObject = (obj) => {
    const type = getType(obj);
    return type === "array" || type === "object";
  };

  const tickSets = new Set();
  function nextTick(callback) {
    const tickId = `t-${getRandomId()}`;
    tickSets.add(tickId);
    Promise.resolve().then(() => {
      if (tickSets.has(tickId)) {
        callback();
        tickSets.delete(tickId);
      }
    });
    return tickId;
  }

  function debounce(func, wait = 0) {
    let timeout = null;
    let hisArgs = [];

    return function (...args) {
      hisArgs.push(...args);

      if (wait > 0) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.call(this, hisArgs);
          hisArgs = [];
          timeout = null;
        }, wait);
      } else {
        if (timeout === null) {
          timeout = 1;
          nextTick(() => {
            func.call(this, hisArgs);
            hisArgs = [];
            timeout = null;
          });
        }
      }
    };
  }

  // Enhanced methods for extending objects
  const extend = (_this, proto, descriptor = {}) => {
    [
      ...Object.getOwnPropertyNames(proto),
      ...Object.getOwnPropertySymbols(proto),
    ].forEach((k) => {
      const result = Object.getOwnPropertyDescriptor(proto, k);
      const { configurable, enumerable, writable, get, set, value } = result;

      if ("value" in result) {
        if (_this.hasOwnProperty(k)) {
          _this[k] = value;
        } else {
          Object.defineProperty(_this, k, {
            enumerable,
            configurable,
            writable,
            ...descriptor,
            value,
          });
        }
      } else {
        Object.defineProperty(_this, k, {
          enumerable,
          configurable,
          ...descriptor,
          get,
          set,
        });
      }
    });

    return _this;
  };

  const { assign, freeze } = Object;

  class Watcher {
    constructor(opts) {
      assign(this, opts);
      freeze(this);
    }

    _getCurrent(key) {
      let { currentTarget } = this;

      if (/\./.test(key)) {
        const matchs = key.split(".");
        key = matchs.pop();
        currentTarget = currentTarget.get(matchs.join("."));
      }

      return {
        current: currentTarget,
        key,
      };
    }

    hasModified(k) {
      if (this.type === "array") {
        return this.path.includes(this.currentTarget.get(k));
      }

      if (/\./.test(k)) {
        const { current, key } = this._getCurrent(k);
        const last = this.path.slice(-1)[0];
        if (current === last) {
          if (this.name === key) {
            return true;
          }

          return false;
        }

        return this.path.includes(current);
      }

      if (!this.path.length) {
        return this.name === k;
      }

      return this.path.includes(this.currentTarget[k]);
    }

    hasReplaced(k) {
      if (this.type !== "set") {
        return false;
      }

      if (/\./.test(k)) {
        const { current, key } = this._getCurrent(k);
        const last = this.path.slice(-1)[0];
        if (current === last && this.name === key) {
          return true;
        }

        return false;
      }

      if (!this.path.length && this.name === k) {
        return true;
      }

      return false;
    }
  }

  class Watchers extends Array {
    constructor(arr) {
      super(...arr);
    }

    hasModified(key) {
      return this.some((e) => e.hasModified(key));
    }

    hasReplaced(key) {
      return this.some((e) => e.hasReplaced(key));
    }
  }

  const emitUpdate = ({
    type,
    currentTarget,
    target,
    name,
    value,
    oldValue,
    args,
    path = [],
  }) => {
    if (path && path.includes(currentTarget)) {
      console.warn("Circular references appear");
      return;
    }

    let options = {
      type,
      target,
      name,
      oldValue,
      value,
    };

    if (type === "array") {
      delete options.value;
      options.args = args;
    }

    if (currentTarget._hasWatchs) {
      const watcher = new Watcher({
        currentTarget,
        ...options,
        path: [...path],
      });

      currentTarget[WATCHS].forEach((func) => {
        func(watcher);
      });
    }

    currentTarget._update &&
      currentTarget.owner.forEach((parent) => {
        emitUpdate({
          currentTarget: parent,
          ...options,
          path: [currentTarget, ...path],
        });
      });
  };

  var watchFn = {
    watch(callback) {
      const wid = "w-" + getRandomId();

      this[WATCHS].set(wid, callback);

      return wid;
    },

    unwatch(wid) {
      return this[WATCHS].delete(wid);
    },

    watchTick(callback, wait) {
      return this.watch(
        debounce((arr) => {
          try {
            this.xid;
          } catch (err) {
            // console.warn(`The revoked object cannot use watchTick : `, this);
            return;
          }
          arr = arr.filter((e) => {
            try {
              e.path.forEach((item) => item.xid);
            } catch (err) {
              return false;
            }

            return true;
          });

          callback(new Watchers(arr));
        }, wait || 0)
      );
    },
  };

  const { defineProperties: defineProperties$1 } = Object;

  const setData = ({ target, key, value, receiver, type, succeed }) => {
    let data = value;
    if (isxdata(data)) {
      data._owner.push(receiver);
    } else if (isObject(value)) {
      const desc = Object.getOwnPropertyDescriptor(target, key);
      if (!desc || desc.hasOwnProperty("value")) {
        data = new Stanz(value);
        data._owner.push(receiver);
      }
    }

    const oldValue = receiver[key];
    const isSame = oldValue === value;

    if (!isSame && isxdata(oldValue)) {
      clearData(oldValue, receiver);
    }

    const reval = succeed(data);

    !isSame &&
      !target.__unupdate &&
      emitUpdate({
        type: type || "set",
        target: receiver,
        currentTarget: receiver,
        name: key,
        value,
        oldValue,
      });

    return reval;
  };

  const clearData = (val, target) => {
    if (isxdata(val)) {
      const index = val._owner.indexOf(target);
      if (index > -1) {
        val._owner.splice(index, 1);
      } else {
        console.error({
          desc: "This data is wrong, the owner has no boarding object at the time of deletion",
          target,
          mismatch: val,
        });
      }
    }
  };

  const handler = {
    set(target, key, value, receiver) {
      if (typeof key === "symbol") {
        return Reflect.set(target, key, value, receiver);
      }

      // Set properties with _ prefix directly
      if (/^_/.test(key)) {
        if (!target.hasOwnProperty(key)) {
          defineProperties$1(target, {
            [key]: {
              writable: true,
              configurable: true,
              value,
            },
          });
        } else {
          Reflect.set(target, key, value, receiver);
        }
        return true;
      }

      try {
        return setData({
          target,
          key,
          value,
          receiver,
          succeed(data) {
            return Reflect.set(target, key, data, receiver);
          },
        });
      } catch (error) {
        const err = new Error(`failed to set ${key} \n ${error.stack}`);

        Object.assign(err, {
          key,
          value,
          target: receiver,
          error,
        });

        throw err;
      }
    },
    deleteProperty(target, key) {
      if (/^_/.test(key) || typeof key === "symbol") {
        return Reflect.deleteProperty(target, key);
      }

      return setData({
        target,
        key,
        value: undefined,
        receiver: target[PROXY],
        type: "delete",
        succeed() {
          return Reflect.deleteProperty(target, key);
        },
      });
    },
  };

  const mutatingMethods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "reverse",
    "sort",
    "fill",
    "copyWithin",
  ];

  const holder = Symbol("placeholder");

  function compareArrays(oldArray, newArray) {
    const backupNewArray = Array.from(newArray);
    const backupOldArray = Array.from(oldArray);
    const deletedItems = [];
    const addedItems = new Map();

    const oldLen = oldArray.length;
    for (let i = 0; i < oldLen; i++) {
      const oldItem = oldArray[i];
      const newIndex = backupNewArray.indexOf(oldItem);
      if (newIndex > -1) {
        backupNewArray[newIndex] = holder;
      } else {
        deletedItems.push(oldItem);
      }
    }

    const newLen = newArray.length;
    for (let i = 0; i < newLen; i++) {
      const newItem = newArray[i];
      const oldIndex = backupOldArray.indexOf(newItem);
      if (oldIndex > -1) {
        backupOldArray[oldIndex] = holder;
      } else {
        addedItems.set(i, newItem);
      }
    }

    return { deletedItems, addedItems };
  }

  const fn = {};

  const arrayFn = Array.prototype;

  mutatingMethods.forEach((methodName) => {
    if (arrayFn[methodName]) {
      fn[methodName] = function (...args) {
        const backupArr = Array.from(this);

        const reval = arrayFn[methodName].apply(this[SELF], args);

        const { deletedItems, addedItems } = compareArrays(backupArr, this);

        // Refactoring objects as proxy instances
        for (let [key, value] of addedItems) {
          if (isxdata(value)) {
            value._owner.push(this);
          } else if (isObject(value)) {
            this.__unupdate = 1;
            this[key] = value;
            delete this.__unupdate;
          }
        }

        for (let item of deletedItems) {
          clearData(item, this);
        }

        emitUpdate({
          type: "array",
          currentTarget: this,
          target: this,
          args,
          name: methodName,
          oldValue: backupArr,
        });

        if (reval === this[SELF]) {
          return this[PROXY];
        }

        return reval;
      };
    }
  });

  const { defineProperties, getOwnPropertyDescriptor, entries } = Object;

  const SELF = Symbol("self");
  const PROXY = Symbol("proxy");
  const WATCHS = Symbol("watchs");
  const ISXDATA = Symbol("isxdata");

  const isxdata = (val) => val && !!val[ISXDATA];

  function constructor(data, handler$1 = handler) {
    // const proxySelf = new Proxy(this, handler);
    let { proxy: proxySelf, revoke } = Proxy.revocable(this, handler$1);

    // Determines the properties of the listener bubble
    proxySelf._update = 1;

    let watchs;

    defineProperties(this, {
      xid: { value: data.xid || getRandomId() },
      // Save all parent objects
      _owner: {
        value: [],
      },
      owner: {
        configurable: true,
        get() {
          return new Set(this._owner);
        },
      },
      [ISXDATA]: {
        value: true,
      },
      [SELF]: {
        configurable: true,
        get: () => this,
      },
      [PROXY]: {
        configurable: true,
        get: () => proxySelf,
      },
      // Save the object of the listener function
      [WATCHS]: {
        get: () => watchs || (watchs = new Map()),
      },
      _hasWatchs: {
        get: () => !!watchs,
      },
      _revoke: {
        value: revoke,
      },
    });

    Object.keys(data).forEach((key) => {
      const descObj = getOwnPropertyDescriptor(data, key);
      let { value, get, set } = descObj;

      if (get || set) {
        defineProperties(this, {
          [key]: descObj,
        });
      } else {
        // Set the function directly
        proxySelf[key] = value;
      }
    });

    return proxySelf;
  }

  class Stanz extends Array {
    constructor(data) {
      super();

      return constructor.call(this, data);
    }

    // This method is still in the experimental period
    revoke() {
      const self = this[SELF];

      if (self._onrevokes) {
        self._onrevokes.forEach((f) => f());
        self._onrevokes.length = 0;
      }

      self.__unupdate = 1;

      self[WATCHS].clear();

      entries(this).forEach(([name, value]) => {
        if (isxdata(value)) {
          this[name] = null;
        }
      });

      self._owner.forEach((parent) => {
        entries(parent).forEach(([name, value]) => {
          if (value === this) {
            parent[name] = null;
          }
        });
      });

      delete self[SELF];
      delete self[PROXY];
      self._revoke();
    }

    toJSON() {
      let obj = {};

      let isPureArray = true;
      let maxId = 0;

      Object.keys(this).forEach((k) => {
        let val = this[k];

        if (!/\D/.test(k)) {
          k = parseInt(k);
          if (k > maxId) {
            maxId = k;
          }
        } else {
          isPureArray = false;
        }

        if (isxdata(val)) {
          val = val.toJSON();
        }

        obj[k] = val;
      });

      if (isPureArray) {
        obj.length = maxId + 1;
        obj = Array.from(obj);
      }

      const xid = this.xid;
      defineProperties(obj, {
        xid: {
          get: () => xid,
        },
      });

      return obj;
    }

    toString() {
      return JSON.stringify(this.toJSON());
    }

    extend(obj, desc) {
      return extend(this, obj, desc);
    }

    get(key) {
      if (/\./.test(key)) {
        const keys = key.split(".");
        let target = this;
        for (let i = 0, len = keys.length; i < len; i++) {
          try {
            target = target[keys[i]];
          } catch (error) {
            const err = new Error(
              `Failed to get data : ${keys.slice(0, i).join(".")} \n${
              error.stack
            }`
            );
            Object.assign(err, {
              error,
              target,
            });
            throw err;
          }
        }

        return target;
      }

      return this[key];
    }
    set(key, value) {
      if (/\./.test(key)) {
        const keys = key.split(".");
        const lastKey = keys.pop();
        let target = this;
        for (let i = 0, len = keys.length; i < len; i++) {
          try {
            target = target[keys[i]];
          } catch (error) {
            const err = new Error(
              `Failed to get data : ${keys.slice(0, i).join(".")} \n${
              error.stack
            }`
            );
            Object.assign(err, {
              error,
              target,
            });
            throw err;
          }
        }

        return (target[lastKey] = value);
      }

      return (this[key] = value);
    }
  }

  Stanz.prototype.extend(
    { ...watchFn, ...fn },
    {
      enumerable: false,
    }
  );

  const stanz = (data) => {
    return new Stanz(data);
  };

  Object.assign(stanz, { is: isxdata });

  return stanz;

}));
