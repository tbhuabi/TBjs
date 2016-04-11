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
        var toolkit = require('./toolkit');

        function Query(selector) {
            this.isBrowser = false;
            this.length = 0;
            this.find(selector);
            this.selector = '';
            this.parent = null;
        }
        var elementsCache = {};
        toolkit.extend(Query.prototype, {
            find: function(selector, context) {
                var _this = this;
                if (toolkit.isArray(selector)) {
                    selector.filter(function(item) {
                        _this[_this.length++] = item;
                    })
                    return this;
                }
                if (selector.$ENGINE == 'TBJS_VIRTUAL') {
                    this[this.length++] = selector;
                    return this;
                }


                var elements = [];

                if (this.isBrowser) {
                    for (var i = 0, len = this.length; i < len; i++) {
                        var oldId = this[i].id;
                        var newId = '__TBJS__QUERY__' + Date.now();

                        this[i].id = newId;

                        this[i].querySelectorAll('#' + newId + ' ' + selector).filter(function(item) {
                            elements.push(item);
                        })
                        if (oldId) {
                            this[i].id = oldId;
                        } else {
                            this[i].removeAttribute('id');
                        }
                    }
                    return new Query(toolkit.unique(elements));
                }

                for (var i = 0, len = this.length; i < len; i++) {
                    this[i].querySelectorAll(selector).filter(function(item) {
                        elements.push(item);
                    })
                }
                var result = new Query(elements);
                result.parent = this;
                result.selector = selector;
                return result;
            },
            on: function(eventType, eventSource, callback) {

                if (toolkit.isFunction(callback)) {

                }
            },
            off: function() {

            },
            one: function() {

            },
            trigger: function(eventName) {

            },
            attr: function(name, value) {
                if (toolkit.isString(name)) {
                    switch (arguments.length) {
                        case 2:
                            for (var i = 0, len = this.length; i < len; i++) {
                                this[i].setAttribute(name, value)
                            }
                            return this;
                        case 1:
                            return this[0].getAttribute(name);
                    }
                }
                return this;
            },
            addClass: function(className) {
                if (toolkit.isString(className)) {
                    className = toolkit.trim(className);
                    var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                    if (this.isBrowser) {
                        for (var i = 0, len = this.length; i < len; i++) {
                            this[i].className = toolkit.trim(this[i].className + ' ' + className);
                        }
                    } else {
                        for (var i = 0, len = this.length; i < len; i++) {
                            this[i].setAttribute('className', toolkit.trim(this[i].className + ' ' + className));
                        }
                    }
                }
                return this;
            },
            removeClass: function(className) {
                if (toolkit.isString(className)) {
                    className = toolkit.trim(className);
                    var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                    if (this.isBrowser) {
                        for (var i = 0, len = this.length; i < len; i++) {
                            this[i].className = toolkit.trim(this[i].className.replace(reg, '')).replace(/\s+/g, ' ');
                        }
                    } else {
                        for (var i = 0, len = this.length; i < len; i++) {
                            this[i].setAttribute('className', toolkit.trim(this[i].className.replace(reg, '')).replace(/\s+/g, ' '));
                        }
                    }
                }
                return this;
            },
            hasClass: function(className) {
                className = toolkit.trim(className);
                var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                return reg.test(this[0].className);
            },
            each: function(callback) {
                if (toolkit.isFunction(callback)) {
                    for (var i = 0, len = this.length; i < len; i++) {
                        callback(this[i]);
                    }
                }
                return this;
            }
        })

        module.exports = function(selector) {
            return new Query(selector);
        };
    })
})
