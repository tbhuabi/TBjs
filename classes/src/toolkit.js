(function(factory) {
    if (typeof exports === 'undefined') {
        factory(define)
    } else {
        factory(function(self) {
            self(require, exports, module);
        });
    }
})(function(define) {
    define(function(require, exports, module) {
        function isType(type) {
            return function(obj) {
                return {}.toString.call(obj) == '[object ' + type + ']';
            }
        };
        var toolKit = {
            isObject: isType('Object'),
            isString: isType('String'),
            isArray: Array.isArray || isType('Array'),
            isFunction: isType('Function'),
            isUndefined: isType('Undefined'),
            trim: function(str) {
                return str.replace(/^\s+|\s+$/g, '');
            },
            extend: function(obj, properties) {
                for (var i in properties) {
                    obj[i] = properties[i];
                }
            },
            clone: function(obj) {
                var newObj;
                if (isType.isArray(obj)) {
                    newObj = [];
                    for (var i = 0; i < obj.length; i++) {
                        if (isType.isArray(obj[i]) || isType.isObject(obj[i])) {
                            newObj.push(copy(obj[i]))
                        } else {
                            newObj.push(obj[i]);
                        }
                    }
                } else if (isType.isObject(obj)) {
                    newObj = {};
                    for (var i in obj) {
                        if (isType.isArray(obj[i]) || isType.isObject(obj[i])) {
                            newObj[i] = copy(obj[i]);
                        } else {
                            newObj[i] = obj[i];
                        }
                    }
                }
                return newObj;
            },
            unique: function(arr) {
                if (arr.length < 2) {
                    return arr;
                }
                var result = [arr[0]];
                var noRepeat = true;
                for (var i = 1, len = arr.length; i < len; i++) {
                    for (var j = 0, len2 = result.length; j < len2; j++) {
                        if (result[j] === arr[i]) {
                            noRepeat = false;
                        }
                    }
                    if (noRepeat) {
                        result.push(arr[i]);
                        noRepeat = true;
                    }
                }
				return result;
            },
            extendPrototype: function(parentObj, fnChildAttr, childMethodes) {
                function Child() {
                    parentObj.apply(this, arguments);
                    fnChildAttr.apply(this, arguments);
                }
                Child.prototype = new parentObj();
                Child.prototype.constructor = Child;
                for (var name in childMethodes) {
                    Child.prototype[name] = childMethodes[name];
                }
                return Child;
            }
        };
        module.exports = toolKit;
    })
})
