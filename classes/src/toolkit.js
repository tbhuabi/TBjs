function isType(type) {
    return function(obj) {
        return {}.toString.call(obj) == '[object ' + type + ']';
    }
};

var isObject = isType('Object');
var isString = isType('String');
var isArray = Array.isArray || isType('Array');
var isFunction = isType('Function');
var isUndefined = isType('Undefined');

var throwError = function(errorMsg) {
    throw new Error(errorMsg);
};

var trim = function(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

var extend = function(obj, properties) {
    for (var i in properties) {
        obj[i] = properties[i];
    }
};
var forEach = function(arr, fn) {
    for (var i = 0, len = arr.length; i < len; i++) {
        fn(arr[i]);
    }
};
var unique = function(arr) {
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
};

var clone = function(obj) {
    var newObj;
    if (isArray(obj)) {
        newObj = [];
        for (var i = 0; i < obj.length; i++) {
            if (isArray(obj[i]) || isObject(obj[i])) {
                newObj.push(clone(obj[i]))
            } else {
                newObj.push(obj[i]);
            }
        }
    } else if (isObject(obj)) {
        newObj = {};
        for (var i in obj) {
            if (isArray(obj[i]) || isObject(obj[i])) {
                newObj[i] = clone(obj[i]);
            } else {
                newObj[i] = obj[i];
            }
        }
    }
    return newObj;
};
