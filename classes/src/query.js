var $QueryProvider = function $QueryProvider() {

    if (!(this instanceof $QueryProvider)) return new $QueryProvider();

    this.$get = function() {
        return Query;
    };
    var triggerParams = null;
    var eventCache = [];
    var findEventCache = function(element) {
        var eventCache = eventCache;
        for (var i = 0, len = eventCache.length; i < len; i++) {
            if (eventCache[i].element === element) {
                return eventCache[i];
            }
        }
        return false;
    };
    var dispatchEvent = function(event) {
        var _this = this;

        var result;
        var eventCacheItem = findEventCache(this);

        if (triggerParams) {
            var eventType = triggerParams[0];
            var args = triggerParams.slice(1, triggerParams.length);
            args.unshift(event);
            var oldEventType = eventType;
            var dotPosition = eventType.indexOf('.');
            var eventName = '';
            if (dotPosition !== -1) {
                eventName = eventType.substring(dotPosition + 1, eventType.length);
                eventType = eventType.substring(0, dotPosition);
            }
            var events = eventCacheItem.events[eventType];
            if (!events) return;

            if (eventName) {
                for (var key in events) {
                    if (key === oldEventType) {
                        var eventListenerCollection = events[key];
                        eventListenerCollection.forEach(function(eventListenerObj) {
                            var eventListener = eventListenerObj.eventListener;
                            eventListener.forEach(function(fn) {
                                if (fn.apply(_this, args) === false) {
                                    result = false
                                }
                            })
                        })
                    }
                }
            } else {
                for (var type in events) {
                    var eventListenerCollection = events[key];
                    eventListenerCollection.forEach(function(eventListenerObj) {
                        var eventListener = eventListenerObj.eventListener;
                        eventListener.forEach(function(fn) {
                            if (fn.apply(_this, args) === false) {
                                result = false
                            }
                        })
                    })
                }
            }
        } else {
            var eventType = event.type;
            var events = eventCacheItem.events[eventType];
            var findEventSrcElement = function(QueryObj, srcElement) {
                for (var i = 0, len = QueryObj.length; i < len; i++) {
                    if (QueryObj[i] === srcElement) return true;
                }
                return false;
            };
            for (var key in events) {
                var eventListenerObj = events[key];
                eventListenerObj.forEach(function(item) {
                    if (item.selector) {
                        if (!findEventSrcElement(Query(_this).find(item.selector), event.srcElement)) {
                            return;
                        }
                    }
                    item.eventListener.forEach(function(fn) {
                        if (fn.call(_this, event) === false) {
                            result = false;
                        };
                    })
                })
            }
        }
        return result;
    };

    function Query(selector, context, isBrowser) {
        return new Query.prototype.init(selector, context, isBrowser);
    }
    Query.prototype.init = function(selector, context, isBrowser) {
        this.isBrowser = isBrowser === undefined ? true : !! isBrowser;
        this.length = 0;
        this.selector = '';
        var _this = this;
        if (isArray(selector)) {
            selector.forEach(function(item) {
                _this[_this.length++] = item;
            })
        } else if (isString(selector)) {
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

    extend(Query.prototype, {
        find: function(selector, context) {

            if (isUndefined(context)) {
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
                        var newId = ('__TBJS__QUERY__' + Math.random() + Math.random()).replace(/\./g, '');

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
            unique(elements).forEach(function(item) {
                _this[_this.length++] = item;
            });
            return this;
        },
        on: function(eventTypes, selector, callback, useCapture, one) {
            var _this = this;
            if (!isString(eventTypes)) return this;
            eventTypes = trim(eventTypes);
            if (!eventTypes) return this;

            var eventCache = eventCache;
            if (isFunction(selector)) {
                useCapture = callback;
                callback = selector;
                selector = '';
            }
            useCapture = !! useCapture;

            //eventType 可能的情况 click.eventName mouseover...
            var events = eventTypes.match(/[^\s]+/g);

            this.each(function(item) {
                if (!one) {
                    var eventCacheItem = findEventCache(item);
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
                        item.addEventListener(eventType, dispatchEvent, useCapture);
                    }

                    var events = eventCacheItem.events[eventType];
                    if (!events[oldEventType]) {
                        events[oldEventType] = [];
                    };
                    var findEventListener = function(selector, arr) {
                        for (var i = 0, len = arr.length; i < len; i++) {
                            if (arr[i].selector === selector) {
                                return arr[i];
                            }
                        }
                        return false;
                    };
                    var eventListenerObj = findEventListener(selector, events[oldEventType]);
                    if (eventListenerObj) {
                        eventListenerObj.eventListener.push(callback);
                    } else {
                        events[oldEventType].push({
                            eventListener: [callback],
                            selector: selector
                        });
                    }
                })
            })
            console.log(eventCache);
            return this;
        },
        off: function(eventType, selector, fn) {
            var eventCache = eventCache;
            var _this = this;
            if (arguments.length === 0) {
                this.each(function(item) {
                    var eventCacheItem = findEventCache(item);
                    if (eventCacheItem) {
                        var events = eventCacheItem.events;
                        for (var type in events) {
                            item.removeEventListener(type, dispatchEvent);
                        }
                    }
                    eventCacheItem.events = {};
                })
            } else {

                if (isFunction(selector)) {
                    fn = selector;
                    selector = '';
                }
                selector = selector || '';
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
                        var eventCacheItem = findEventCache(item);
                        if (eventCacheItem) {
                            var events = eventCacheItem.events;
                            if (events[eventType]) {

                                if (eventName) {
                                    events[eventType][oldEventType].forEach(function(eventListenerObj) {
                                        if (selector) {
                                            if (eventListenerObj.selector !== selector) return;
                                        }
                                        var eventListener = eventListenerObj.eventListener;
                                        if (fn) {
                                            var arr = [];
                                            eventListener.forEach(function(callback) {
                                                if (callback !== fn) {
                                                    arr.push(callback);
                                                }
                                            })
                                            eventListenerObj.eventListener = arr;
                                        } else {
                                            eventListenerObj.eventListener = [];
                                        }
                                    });
                                } else {
                                    if (fn) {
                                        for (var key in events[eventType]) {
                                            events[eventType][key].forEach(function(eventListenerObj) {
                                                var arr = [];
                                                eventListenerObj.eventListener.forEach(function(callback) {
                                                    if (fn !== callback) {
                                                        arr.push(callback);
                                                    }
                                                })
                                                eventListenerObj.eventListener = arr;
                                            })
                                        }
                                    } else {
                                        delete events[eventType];
                                        item.removeEventListener(eventType, dispatchEvent);
                                    }
                                }
                            }
                        }
                    })
                })
            }
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
                triggerParams = args;

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
            triggerParams = null;
            return this;
        },
        attr: function(name, value) {
            if (isString(name)) {
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
            if (isString(className)) {
                className = trim(className);
                var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                if (this.isBrowser) {
                    this.each(function(item) {
                        item.className = trim(item.className + ' ' + className);

                    })
                } else {
                    this.each(function(item) {
                        item.setAttribute('class', trim(item.className + ' ' + className));
                    })
                }
            }
            return this;
        },
        removeClass: function(className) {
            if (isString(className)) {
                className = trim(className);
                var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                if (this.isBrowser) {
                    this.each(function(item) {
                        item.className = trim(item.className.replace(reg, '')).replace(/\s+/g, ' ');
                    })
                } else {
                    this.each(function(item) {
                        item.setAttribute('className', trim(item.className.replace(reg, '')).replace(/\s+/g, ' '));
                    })
                }
            }
            return this;
        },
        hasClass: function(className) {
            className = trim(className);
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
            if (isUndefined(htmlText)) return this[0] && this[0].innerHTML;
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
};
