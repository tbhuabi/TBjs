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
        Query.prototype.init = function(selector, context, isBrowser) {
            this.isBrowser = isBrowser === undefined ? true : !! isBrowser;
            this.length = 0;
            this.selector = '';
            var _this = this;
            if (toolkit.isArray(selector)) {
                selector.forEach(function(item) {
                    _this[_this.length++] = item;
                })
            } else if (toolkit.isString(selector)) {
                this.selector = selector;
                this.find(selector, context || [document]);
            } else {
                if (selector instanceof this.init) return selector;
                this[this.length++] = selector;
                if (selector.$ENGINE) {
                    this.isBrowser = false;
                }
            }
        }
        Query.prototype.init.prototype = Query.prototype;
        //事件缓存
        toolkit.extend(Query, {
            isTrigger: false,
            eventCache: [],
            findEventCache: function(element) {
                var eventCache = Query.eventCache;
                for (var i = 0, len = eventCache.length; i < len; i++) {
                    if (eventCache[i].element === element) {
                        return eventCache[i];
                    }
                }
                return false;
            },
            dispatchEvent: function(event) {
                var _this = this;

                var result;
                var eventCacheItem = Query.findEventCache(this);

                if (Query.isTrigger) {
                    var eventType = Query.isTrigger[0];
                    var args = Query.isTrigger.slice(1, Query.isTrigger.length);
                    args.unshift(event);
                    var oldEventType = eventType;
                    var dotPosition = eventType.indexOf('.');
                    var eventName = '';
                    if (dotPosition !== -1) {
                        eventName = eventType.substring(dotPosition + 1, eventType.length);
                        eventType = eventType.substring(0, dotPosition);
                    }
                    var eventListener = eventCacheItem.events[eventType];
                    if (!eventListener) return;
                    if (eventName) {
                        for (var type in eventListener) {
                            if (type === oldEventType) {
                                eventListener[type].forEach(function(fn) {
                                    if (fn.apply(_this, args) === false) {
                                        result = false
                                    }
                                })
                            }
                        }
                    } else {
                        for (var type in eventListener) {
                            eventListener[type].forEach(function(fn) {
                                if (fn.apply(_this, args) === false) {
                                    result = false
                                }
                            })
                        }
                    }
                } else {
                    var eventType = event.type;
                    var eventListener = eventCacheItem.events[eventType];
                    for (var key in eventListener) {
                        eventListener[key].forEach(function(fn) {
                            if (fn.call(_this, event) === false) {
                                result = false;
                            };
                        })
                    }
                }
                return result;
            }
        });

        toolkit.extend(Query.prototype, {
            find: function(selector, context) {

                if (toolkit.isUndefined(context)) {
                    return Query(selector, this, this.isBrowser);
                }

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
                return this;
            },
            on: function(eventTypes, selector, callback, useCapture, one) {
                var _this = this;
                if (!toolkit.isString(eventTypes)) return this;
                eventTypes = toolkit.trim(eventTypes);
                if (!eventTypes) return this;

                var eventCache = Query.eventCache;
                var useDelegate = true; //默认有事件委托
                if (toolkit.isFunction(selector)) {
                    useCapture = callback;
                    callback = selector;
                    selector = '';
                    useDelegate = false;
                }
                useCapture = !! useCapture;

                //eventType 可能的情况 click.eventName mouseover...
                var events = eventTypes.match(/[^\s]+/g);

                this.each(function(item) {
                    if (!one) {
                        var eventCacheItem = Query.findEventCache(item);
                        if (!eventCacheItem) {
                            eventCacheItem = {
                                element: item,
                                events: {}
                            }
                            eventCache.push(eventCacheItem);
                        }
                    }
                    events.forEach(function(eventType) {
                        var oldEventType = eventType;
                        var dotPosition = eventType.indexOf('.');
                        if (dotPosition !== -1) {
                            eventType = eventType.substring(0, dotPosition);
                        }
                        if (one) {
                            var handleFn = function(event) {
                                item.removeEventListener(eventType, handleFn);
                                return callback.call(this, event);
                            };
                            item.addEventListener(eventType, handleFn, useCapture);
                            return;
                        }
                        if (!eventCacheItem.events[eventType]) {
                            eventCacheItem.events[eventType] = {};
                            item.addEventListener(eventType, Query.dispatchEvent, useCapture);
                        }
                        var eventListener = eventCacheItem.events[eventType];
                        if (!eventListener[oldEventType]) {
                            eventListener[oldEventType] = [];
                        };
                        eventListener[oldEventType].push(callback);
                    })
                })
                console.log(eventCache);
                return this;
            },
            off: function(eventType, selector, fn) {
                var eventCache = Query.eventCache;
                var isDelegate = true;
                var _this = this;
                if (arguments.length === 0) {
                    this.each(function(item) {
                        var eventCacheItem = Query.findEventCache(item);
                        if (eventCacheItem) {
                            var events = eventCacheItem.events;
                            for (var type in events) {
                                item.removeEventListener(type, Query.dispatchEvent);
                            }
                        }
                        eventCacheItem.events = {};
                    })
                } else {

                    if (toolkit.isFunction(selector)) {
                        fn = selector;
                        selector = '';
                        isDelegate = false;
                    }

                    var events = eventType.match(/[^\s]+/g);
                    events.forEach(function(eventType) {
                        var oldEventType = eventType;
                        var dotPosition = eventType.indexOf('.');
                        var eventName = '';
                        if (dotPosition !== -1) {
                            eventName = eventType.substring(dotPosition + 1, eventType.length);
                            eventType = eventType.substring(0, dotPosition);
                        }
                        _this.each(function(item) {
                            var eventCacheItem = Query.findEventCache(item);
                            if (eventCacheItem) {
                                var events = eventCacheItem.events;
                                if (events[eventType]) {
                                    var eventListener = events[eventType];
                                    if (eventName) {
                                        for (var name in eventListener) {
                                            if (name === oldEventType) {
                                                delete eventListener[name];
                                            }
                                        }
                                        return;
                                    }
                                    events[eventType].eventListener = {};
                                }
                            }
                        })
                    })
                }
                console.log(eventCache);
                return this;
            },
            one: function(eventType, selector, callback, useCapture) {
                return this.on(eventType, selector, callback, useCapture, 1);
            },
            trigger: function(eventTypes) {
                var _this = this;
                var args = [].slice.call(arguments);

                var events = eventTypes.match(/[^\s]+/g);
                events.forEach(function(eventType) {
                    args.shift();
                    var oldEventType = eventType;
                    args.unshift(oldEventType);
                    Query.isTrigger = args;

                    var dotPosition = eventType.indexOf('.');
                    if (dotPosition !== -1) {
                        eventType = eventType.substring(0, dotPosition);
                    }
                    _this.each(function(item) {
                        try {
                            item[eventType]();
                        } catch (e) {

                        }
                    })
                })
                Query.isTrigger = false;
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
            },
            html: function(htmlText) {
                if (toolkit.isUndefined(htmlText)) return this[0] && this[0].innerHTML;
                if (this.isBrowser) {
                    this.each(function(item) {
                        item.innerHTML = htmlText;
                    })
                } else {
                    htmlText = htmlText.toString();
                    this.each(function(item) {
                        item.setInterHtml(htmlText)
                    })
                }
            }
        })

        module.exports = Query;
    })
})
