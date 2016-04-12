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

        function Query(selector, context, isBrowser) {
            return new Query.prototype.init(selector, context, isBrowser);
        }
        //事件缓存
        Query.eventCache = [];
        Query.prototype.init = function(selector, context, isBrowser) {
            context = context || document;
            this.isBrowser = isBrowser === undefined ? true : !! isBrowser;
            this.length = 0;
            this.selector = selector;
            var _this = this;
            if (toolkit.isArray(selector)) {
                selector.forEach(function(item) {
                    _this[_this.length++] = item;
                })
            } else if (toolkit.isString(selector)) {
                this.find(selector, context === document ? [document] : this);
            } else {
                if (selector instanceof this.init) return selector;
                this[this.length++] = selector;
                if (selector.$ENGINE == 'TBJS_VIRTUAL') {
                    this.isBrowser = false;
                }
            }
        }
        Query.prototype.init.prototype = Query.prototype;
        toolkit.extend(Query.prototype, {
            find: function(selector, context) {
                var _this = this;
                var elements = [];

                if (this.isBrowser) {
                    for (var i = 0, len = context.length; i < len; i++) {
                        if (context[i] === document) {
                            [].slice.call(context[i].querySelectorAll(selector)).forEach(function(item) {
                                elements.push(item);
                            })
                        } else {
                            var oldId = context[i].id;
                            var newId = '__TBJS__QUERY__' + Date.now();

                            context[i].id = newId;

                            [].slice.call(context[i].querySelectorAll('#' + newId + ' ' + selector)).forEach(function(item) {
                                elements.push(item);
                            })
                            if (oldId) {
                                context[i].id = oldId;
                            } else {
                                context[i].removeAttribute('id');
                            }
                        }
                    }
                } else {
                    for (var i = 0, len = context.length; i < len; i++) {
                        context[i].querySelectorAll(selector).forEach(function(item) {
                            elements.push(item);
                        })
                    }
                }
                toolkit.unique(elements).forEach(function(item) {
                    _this[_this.length++] = item;
                });
            },
            on: function(eventType, selector, callback, useCapture, one) {
                var eventTypeOld = eventType;
                var eventCache = Query.eventCache;
                var _this = this;
                var useDelegate = true;
                if (toolkit.isFunction(selector)) {
                    useCapture = callback;
                    callback = selector;
                    selector = '';
                    useDelegate = false;
                }
                useCapture = !! useCapture;

                //eventType 可能的情况 click.eventName mouseover...
                eventType = toolkit.trim(eventType);
                var events = eventType.match(/[^\s]+/g);

                events.forEach(function(eventType) {
                    var position = eventType.indexOf('.');
                    var eventName = '';
                    if (position !== -1) {
                        eventName = eventType.substring(position + 1, eventType.length);
                        eventType = eventType.substring(0, position);
                    }
                    var handleFn = function(event) {
                        if (useDelegate) {
                            _this.find(selector).each(function(item) {
                                if (item === event.srcEelement) {
                                    callback.call(item, event);
                                    if (one) {
                                        _this.off(eventTypeOld, selector, callback);
                                    }
                                }
                            });
                        } else {
                            callback.call(this, event);
                            if (one) {
                                _this.off(eventTypeOld, selector, callback);
                            }
                        }
                    };
                    _this.each(function(item) {
                        item.addEventListener(eventType, handleFn, useCapture);
                        eventCache.push({
                            element: item,
                            handleFn: handleFn,
                            callback: callback,
                            eventType: eventType,
                            eventName: eventName,
                            selector: selector
                        })
                    });
                })
                return this;
            },
            off: function(eventType, selector, fn) {
                var eventCache = Query.eventCache;
                var isDelegate = true;
                var _this = this;
                if (arguments.length === 0) {
                    this.each(function(item) {
                        var arr = [];
                        eventCache.forEach(function(eventCacheItem) {
                            if (eventCacheItem.element === item) {
                                item.removeEventListener(eventCacheItem.eventType, eventCacheItem.handleFn);
                            } else {
                                arr.push(eventCacheItem);
                            }
                        })
                        eventCache = arr;
                    })
                } else {

                    if (toolkit.isFunction(selector)) {
                        fn = selector;
                        selector = '';
                        isDelegate = false;
                    }

                    var events = eventType.match(/[^\s]+/g);
                    var compare = function(obj1, obj2) {
                        for (var name in obj1) {
                            if (obj1[name] !== obj2[name]) return false;
                        }
                        return true;
                    }
                    events.forEach(function(eventType) {
                        var position = eventType.indexOf('.');
                        var eventName = '';
                        if (position !== -1) {
                            eventName = eventType.substring(position + 1, eventType.length);
                            eventType = eventType.substring(0, position);
                        }
                        var eventMap = {};
                        if (selector) eventMap.selector = selector;
                        if (eventType) eventMap.eventType = eventType;
                        if (eventName) eventMap.eventName = eventName;
                        if (fn) eventMap.callback = fn;


                        _this.each(function(item) {
                            var arr = [];
                            eventCache.forEach(function(eventCacheItem) {
                                if (compare(eventMap, eventCacheItem)) {
                                    item.removeEventListener(eventCacheItem.eventType, eventCacheItem.handleFn);
                                } else {
                                    arr.push(eventCacheItem);
                                }
                            })
                            eventCache = arr;
                        })
                    })
                }
                return this;
            },
            one: function(eventType, selector, callback, useCapture) {
                this.on(eventType, selector, callback, useCapture, 1);
            },
            trigger: function(eventName) {

            },
            attr: function(name, value) {
                if (toolkit.isString(name)) {
                    switch (arguments.length) {
                        case 2:
                            this.each(function(item) {
                                item.setAttribute(name, value)
                            })
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
                        this.each(function(item) {
                            item.className = toolkit.trim(item.className + ' ' + className);

                        })
                    } else {
                        this.each(function(item) {
                            item.setAttribute('className', toolkit.trim(item.className + ' ' + className));
                        })
                    }
                }
                return this;
            },
            removeClass: function(className) {
                if (toolkit.isString(className)) {
                    className = toolkit.trim(className);
                    var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                    if (this.isBrowser) {
                        this.each(function(item) {
                            item.className = toolkit.trim(item.className.replace(reg, '')).replace(/\s+/g, ' ');
                        })
                    } else {
                        this.each(function(item) {
                            item.setAttribute('className', toolkit.trim(item.className.replace(reg, '')).replace(/\s+/g, ' '));
                        })
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
                for (var i = 0, len = this.length; i < len; i++) {
                    callback(this[i]);
                }
                return this;
            }
        })

        module.exports = Query;
    })
})
