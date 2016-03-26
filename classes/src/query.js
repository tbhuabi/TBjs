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
            this.isBrowser = selector.$ENGINE === 'TBJS_VIRTUAL';
            this.length = 0;
            this.find(selector);
        }
        toolkit.extend(Query.prototype, {
            find: function(selector, context) {

                var _this = this;
                if (toolkit.isArray(selector)) {
                    selector.filter(function(item) {
                        _this[_this.length++] = item;
                    })
                    return this;
                }


                function findWrapContainer(QueryObj) {

                    var containers = [];

                    var count = 0;
                    for (var i = 0; len = QueryObj.length; i < len; i++) {
                        count = 0;
                        while (QueryObj[i].parentNode) {
                            count++
                        }
                        if (!containers[count]) {
                            containers[count] = [];
                        }
                        containers[count].push(QueryObj[i]);
                    }
                    for (var i = 0, len = containers.length; i < len; i++) {
                        if (containers[i]) {
                            return containers[i];
                        }
                    }
                    return containers;
                }

                var elements = [];
                var containers = findWrapContainer(this);

                if (this.isBrowser) {
                    for (var i = 0, len = containers.length; i < len; i++) {
                        var oldId = containers[i].id;
                        var newId = '__TBJS__QUERY__' + Date.now();

                        containers[i].id = 'newId';

                        containers[i].querySelectorAll('#' + newId + ' ' + selector).filter(function(item) {
                            elements.push(item);
                        })
                        if (oldId) {
                            containers[i].id = oldId;
                        } else {
                            containers[i].removeAttribute('id');
                        }
                    }
                    return new Query(elements);
                }

                for (var i = 0, len = containers.length; i < len; i++) {
                    containers[i].querySelectorAll(selector).filter(function(item) {
                        elements.push(item);
                    })
                }
                return new Query(elements);
            },
            on: function(eventType, eventSource, callback) {

            },
            off: function() {

            },
            one: function() {

            },
            trigger: function(eventName) {

            },
            attr: function(name, value) {
                if (toolkit.isString(name)) {
                    switch (argument.length) {
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
                            this[i].className = toolkit.trim(this[i].className) + ' ' + className;
                        }
                    } else {
                        for (var i = 0, len = this.length; i < len; i++) {
                            this[i].setAttribute('className', toolkit.trim(this[i].className) + ' ' + className);
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

        module.exports = Query;
    })
})
