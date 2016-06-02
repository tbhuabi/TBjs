function minErr(module) {
    return function(code, template) {
        var args = arguments;
        var msg = '[' + (module ? module + ':' : '') + code + ']  ';
        var index = 0;
        msg += template.replace(/\{(\d+)\}/g, function(str, $1) {
            index = +$1;
            return args[index + 2] ? args[index + 2] : str;
        })

        msg += '\nhttp://www.TBjs.org?' + module + '=' + code;
        //        var params = [];
        //        index += 2;
        //        for (; index < args.length; index++) {
        //            params.push(msg + '#/?' + encodeURIComponent(args[index]));
        //        }
        //        if (params.length) {
        //            msg += params.join('');
        //        }
        return new Error(msg);
    }
}


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



var trim = function(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

var extend = function(obj, properties) {
    for (var i in properties) {
        obj[i] = properties[i];
    }
	return obj;
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
