function $QueryProvider() {
    this.$get = function() {
        return Query;
    };

    var triggerParams = null;
    var eventCache = [];
    var findEventCache = function(element) {
        for (var i = 0, len = eventCache.length; i < len; i++) {
            if (eventCache[i].element === element) {
                return eventCache[i];
            }
        }
        return false;
    };
    var dispatchEvent = function(event) {
        var self = this;

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
                                if (fn.apply(self, args) === false) {
                                    result = false
                                }
                            })
                        })
                    }
                }
            } else {
                for (var type in events) {
                    var eventListenerCollection = events[type];
                    eventListenerCollection.forEach(function(eventListenerObj) {
                        var eventListener = eventListenerObj.eventListener;
                        eventListener.forEach(function(fn) {
                            if (fn.apply(self, args) === false) {
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
                        if (!findEventSrcElement(Query(self).find(item.selector), event.srcElement)) {
                            return;
                        }
                    }
                    item.eventListener.forEach(function(fn) {
                        if (fn.call(self, event) === false) {
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
        var self = this;
        self.isBrowser = isBrowser === undefined ? true : !!isBrowser;
        self.length = 0;
        self.selector = '';
        if (isArray(selector)) {
            selector.forEach(function(item) {
                self[self.length++] = item;
            })
        } else if (isString(selector)) {
            self.selector = selector;
            self.find(selector, context || [document]);
        } else {
            if (selector instanceof self.init) return selector;
            self[self.length++] = selector;
            if (selector.$ENGINE) {
                self.isBrowser = false;
            }
        }
    }
    Query.prototype.init.prototype = Query.prototype;

    extend(Query.prototype, {
        find: function(selector, context) {

            var self = this;
            if (isUndefined(context)) {
                return Query(selector, self, self.isBrowser);
            }

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
                self[self.length++] = item;
            });
            return self;
        },
        on: function(eventTypes, selector, callback, useCapture, one) {
            var self = this;
            if (!isString(eventTypes)) return self;
            eventTypes = trim(eventTypes);
            if (!eventTypes) return self;

            if (isFunction(selector)) {
                useCapture = callback;
                callback = selector;
                selector = '';
            }
            useCapture = !!useCapture;

            //eventType 可能的情况 click.eventName mouseover...
            var events = eventTypes.match(/[^\s]+/g);

            self.each(function(item) {
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
            return this;
        },
        off: function(eventType, selector, fn) {
            var self = this;
            if (arguments.length === 0) {
                self.each(function(item) {
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
                    self.each(function(item) {
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
            return self;
        },
        one: function(eventType, selector, callback, useCapture) {
            return this.on(eventType, selector, callback, useCapture, 1);
        },
        trigger: function(eventTypes) {
            var self = this;
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
                self.each(function(item) {
                    try {
                        item[eventType]();
                    } catch (e) {

                    }
                })
            })
            triggerParams = null;
            return self;
        },
        attr: function(name, value) {
            var self = this;
            if (isString(name)) {
                switch (arguments.length) {
                    case 2:
                        self.each(function(item) {
                            item.setAttribute(name, value)
                        })
                        return self;
                    case 1:
                        return self[0].getAttribute(name);
                }
            }
            return self;
        },
        addClass: function(className) {
            var self = this;
            if (isString(className)) {
                className = trim(className);
                var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                if (self.isBrowser) {
                    self.each(function(item) {
                        item.className = trim(item.className + ' ' + className);

                    })
                } else {
                    self.each(function(item) {
                        item.setAttribute('class', trim(item.className + ' ' + className));
                    })
                }
            }
            return self;
        },
        removeClass: function(className) {
            var self = this;
            if (isString(className)) {
                className = trim(className);
                var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                if (self.isBrowser) {
                    self.each(function(item) {
                        item.className = trim(item.className.replace(reg, '')).replace(/\s+/g, ' ');
                    })
                } else {
                    self.each(function(item) {
                        item.setAttribute('className', trim(item.className.replace(reg, '')).replace(/\s+/g, ' '));
                    })
                }
            }
            return self;
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
            var self = this;
            if (isUndefined(htmlText)) return self[0] && self[0].innerHTML;
            if (self.isBrowser) {
                self.each(function(item) {
                    item.innerHTML = htmlText;
                })
            } else {
                htmlText = htmlText.toString();
                self.each(function(item) {
                    item.setInterHtml(htmlText)
                })
            }
        }
    })

}
