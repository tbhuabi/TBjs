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
