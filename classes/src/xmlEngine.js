define(function(require, exports, module) {
    var toolkit = require('./toolkit');
    var oddTagList = ['a', 'img', 'input', 'br', 'hr', 'param', 'meta', 'link'];

    //根对象
    function RootElementEngine() {};
    toolkit.extend(RootElementEngine.prototype, {
        getInnerHtml: function() {
            var innerHTML = '';
            if (this.childNodes) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    innerHTML += this.childNodes[i].getOuterHtml();
                }
            }
            return innerHTML;
        },
        getOuterHtml: function() {
            if (this.nodeType === 3) {
                return this.innerText;
            }
            var innerHTML = '';
            if (this.parentNode) {
                innerHTML = '<' + this.tagName;
                var attrbutesList = [];
                for (var i = 0; i < this.attributes.length; i++) {
                    var item = this.attributes[i];
                    var attr = item.name;
                    if (item.value !== null) {
                        if (item.value.indexOf('"') === -1) {
                            attr = attr + '="' + item.value + '"';
                        } else {
                            attr = attr + "='" + item.value + "'";
                        }
                    }
                    attrbutesList.push(attr);
                }
                if (attrbutesList.length) {
                    innerHTML = innerHTML + ' ' + attrbutesList.join(' ');
                }
                innerHTML += '>';
            }

            if (oddTagList.indexOf(this.tagName) === -1) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    innerHTML += this.childNodes[i].getOuterHtml();
                }
                if (this.parentNode) {
                    innerHTML += '</' + this.tagName + '>';
                }
            }
            return innerHTML;
        },
        getInnerText: function() {
            var text = '';
            if (this.childNodes) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    text += this.childNodes[i].getInnerText();
                }
            } else {
                text = this.innerText;
            }
            return text.replace(/[\n\t\r]/g, '');
        }
    });

    //dom元素构造函数

    function ElementEngine() {};
    ElementEngine.prototype = new RootElementEngine();
    toolkit.extend(ElementEngine.prototype, {
        constructor: ElementEngine,
        $refresh: function() {
            this.innerHTML = this.getInnerHtml();
            this.outerHtml = this.getOuterHtml();
            this.innerText = this.getInnerText();
            if (this.parentNode && this.parentNode.nodeType !== 9) {
                this.parentNode.innerHTML = this.parentNode.getInnerHtml();
                this.parentNode.outerHtml = this.parentNode.getOuterHtml();
                this.parentNode.innerText = this.parentNode.getInnerText();
            }
        },
        setInnerHtml: function(arg) {
            var newNodeElements = new DocumentEngine(arg);
            this.childNodes = [];
            for (var i = 0; i < newNodeElements.childNodes.length; i++) {
                this.appendChild(newNodeElements.childNodes[i]);
            }
            newNodeElements = null;
            this.$refresh();
        },
        setAttribute: function(attributes, value) {
            if (toolkit.isString(attributes)) {
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].name === attributes) {
                        this.attributes[i].value = value;
                        this.className = this.getAttribute('className');
                        this.classList = this.className.match(/[^\s]+/g) || [];
                        this.id = this.getAttribute('id');
                        this.$refresh();
                        return;
                    }
                }
                var obj = {};
                obj.name = attributes;
                obj.value = value;
                this.attributes.push(obj);
            } else if (toolkit.isObject(attributes)) {
                for (var i in attributes) {
                    this.attributes.push({
                        name: i,
                        value: attributes[i]
                    })
                }
            }
            this.className = this.getAttribute('className');
            this.classList = this.className.match(/[^\s]+/g) || [];
            this.id = this.getAttribute('id');
            this.$refresh();
        },
        getAttribute: function(key) {
            var value;
            for (var i = 0; i < this.attributes.length; i++) {
                if (this.attributes[i].name === key) {
                    return this.attributes[i].value;
                }
            }
            return '';
        },
        addClass: function(className) {
            if (this.attributes.className === undefined) {
                this.attributes.className = '';
            }
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (!reg.test(' ' + this.attributes.className + ' ')) {
                this.attributes.className += ' ' + className;
            }
            this.$refresh();
        },
        removeClass: function(className) {
            if (this.attributes.className === undefined) {
                this.attributes.className = '';
            }
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (reg.test(' ' + this.attributes.className + ' ')) {
                this.attributes.className = this.attributes.className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
            }
            this.$refresh();
        },
        hasClass: function(className) {
            className = toolkit.trim(className);
            return this.classList.indexOf(className) !== -1;
        }
    });

    //dom方法构造函数

    function ElementMethodEngine() {};
    ElementMethodEngine.prototype = new ElementEngine();
    toolkit.extend(ElementMethodEngine.prototype, {
        constructor: ElementMethodEngine,
        getElementsByTagName: function(tagName) {
            var elements = [];
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].tagName === tagName) {
                    elements.push(this.children[i]);
                }
                if (this.children[i].children) {
                    this.children[i].getElementsByTagName(tagName).filter(function(item) {
                        elements.push(item);
                    });
                }
            }
            return elements;
        },
        getElementsByClassName: function(className) {
            var elements = [];
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].hasClass(className)) {
                    elements.push(this.children[i]);
                }
                if (this.children[i].children) {
                    this.children[i].getElementsByClassName(className).filter(function(item) {
                        elements.push(item);
                    });
                }
            }
            return elements;
        },
        appendChild: function(TBDomElement) {
            if (TBDomElement.parentNode !== this) {
                TBDomElement.parentNode = this;
                this.childNodes.push(TBDomElement);
                if (TBDomElement.nodeType === 1) {
                    this.children.push(TBDomElement);
                }
            } else {
                var currentNode;
                for (var i = 0; i < this.childNodes.length; i++) {
                    if (TBDomElement === this.childNodes[i]) {
                        this.childNodes.splice(this.childNodes.length - 1, 0, this.childNodes.splice(i, 1));
                    }
                }
                if (TBDomElement.nodeType === 1) {
                    for (var i = 0; i < this.children.length; i++) {
                        if (TBDomElement === this.children[i]) {
                            this.children.splice(this.children.length - 1, 0, this.children.splice(i, 1));
                        }
                    }
                }
            }
            this.$refresh();
        },
        removeChild: function(TBDomElement) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === TBDomElement) {
                    this.childNodes.splice(i, 1);
                    break;
                }
            }
            if (TBDomElement.nodeType === 1) {
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i] === TBDomElement) {
                        this.children.splice(i, 1);
                        break;
                    }
                }
            }
            this.$refresh();
        },
        insertBefore: function(TBDomElement, nextElement) {
            var parentNode = TBDomElement.parentNode;
            for (var i = 0; i < parentNode.childNodes.length; i++) {
                if (parentNode.childNodes[i] === TBDomElement) {
                    parentNode.childNodes.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < parentNode.children.length; i++) {
                if (parentNode.children[i] === TBDomElement) {
                    parentNode.children.splice(i, 1);
                    break;
                }
            }
            TBDomElement.parentNode = this;
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === nextElement) {
                    this.childNodes.splice(i, 0, TBDomElement);
                    break;
                }
            }
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] === nextElement) {
                    this.children.splice(i, 0, TBDomElement);
                    break;
                }
            }
            this.$refresh();
        }
    })

    //document构造函数
    function DocumentEngine(htmlContent) {
        this.$XMLContent = htmlContent;
        this.nodeType = 9;
        this.parentNode = null;
        this.innerHTML = '';
        this.innerText = '';
        this.outerHtml = '';
        this.classList = [];
        this.className = '';
        this.childNodes = [];
        this.children = [];
        this.$XMLEngine();
    }
    DocumentEngine.prototype = new ElementMethodEngine();
    toolkit.extend(DocumentEngine.prototype, {
        constructor: DocumentEngine,
        createElement: function(tag) {
            tag = tag.toLowerCase();
            if (oddTagList.indexOf(tag) === -1) {
                return new EvenElement(tag);
            }
            return new OddElement(tag);
        },
        createTextNode: function(text) {
            text = text.replace(/[<>]/g, function(str) {
                if (str === '<') {
                    return '&lt;';
                }
                return '&gt;';
            })
            return new TextElement(text);
        },
        $XMLEngine: function() {
            //this.$XMLContent = this.$XMLContent.replace(/\s*[\n\t\r]+\s*/g, '');
            var arr = [];
            this.$XMLContent.split(/(?!^)(?=<\/?\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*>)/).filter(function(item) {
                arr.push(item);
            });
            var newArr = [];
            arr.filter(function(item) {
                var oldLength = newArr.length;
                item.replace(/(<\/?\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*>)((?:.|\r|\n|\t|\s)*)/, function(str, $1, $2) {
                    newArr.push($1);
                    $2 && newArr.push($2);
                });
                if (oldLength == newArr.length) {
                    newArr.push(item);
                }
            })

            this.$XMLbuilder(this, newArr, 0);
        },
        $XMLbuilder: function(parentNode, arr, i) {
            if (i < arr.length) {
                var item = arr[i];
                var beginTag = /^<([\w\-]+)/.exec(item);
                if (beginTag) {
                    beginTag = beginTag[1];
                    var currentElement = this.createElement(beginTag);
                    var attrbutes = item.match(/\s\w+(-\w+)*(="[^"]*"|='[^']*'|[^\s>]+)*\s*?/g);
                    if (attrbutes) {
                        attrbutes.filter(function(item) {
                            item = toolkit.trim(item);
                            item.replace(/(^\w+(?:-\w+)*)(?:=(.*)$)?/, function(str, $1, $2) {
                                if ($1 === 'class') $1 = 'className';
                                if (!$2) {
                                    $2 = null;
                                } else {
                                    $2 = $2.replace(/^['"]|['"]$/g, '');
                                }
                                currentElement.setAttribute($1, $2);
                            })
                        })
                    }
                    parentNode.appendChild(currentElement);
                    i++;
                    if (currentElement.childNodes === undefined) {
                        this.$XMLbuilder(parentNode, arr, i);
                    } else {
                        this.$XMLbuilder(currentElement, arr, i);
                    }
                    return;
                }
                var closeTag = /^<\/([\w\-]+)/.exec(item);
                if (closeTag) {
                    closeTag = closeTag[1];
                    if (parentNode.parentNode) {
                        this.$XMLbuilder(parentNode.parentNode, arr, ++i);
                    }
                    return;
                }
                var currentElement = this.createTextNode(item);
                parentNode.appendChild(currentElement);
                this.$XMLbuilder(parentNode, arr, ++i);
            }
        }
    })

    //单标签元素构造函数

    function OddElement(tagName) {
        this.tagName = tagName;
        this.nodeType = 1;
        this.parentNode = null;
        this.innerHTML = '';
        this.innerText = '';
        this.outerHtml = '';
        this.classList = [];
        this.className = '';
        this.attributes = [];
    }
    OddElement.prototype = new ElementEngine();
    toolkit.extend(OddElement.prototype, {
        constructor: OddElement
    })


    //双标签元素构造函数
    function EvenElement(tagName) {
        this.tagName = tagName;
        this.nodeType = 1;
        this.parentNode = null;
        this.innerHTML = '';
        this.innerText = '';
        this.outerHtml = '';
        this.classList = [];
        this.className = '';
        this.childNodes = [];
        this.children = [];
        this.attributes = [];
    }
    EvenElement.prototype = new ElementMethodEngine();
    toolkit.extend(EvenElement.prototype, {
        constructor: EvenElement
    })

    //文本节点构造函数
    function TextElement(text) {
        this.parentNode = null;
        this.nodeType = 3;
        this.innerHTML = this.innerText = this.outerHtml = text;
    }
    TextElement.prototype = new RootElementEngine();
    TextElement.prototype.constructor = TextElement;









    module.exports = function(text) {
        var document = new DocumentEngine(text);
        console.log(document);
        console.log(document.innerHTML);
        console.log(document.getElementsByClassName('a'));
        console.log(document.getElementsByTagName('td'));
    };
})
