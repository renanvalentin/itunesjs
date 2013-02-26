; (function ($, window, document, undefined) {
    var pluginName = "iTunes",
        defaults = {
            wrapper: ".itunes",
            template: "#descriptiontmpl",
            cls: ".description",
            onOpen: null,
            onClose: null,
            ajax: {
                config: {},
                data: function () { },
                done: function () { }
            }
        };
 
    function Plugin(element, options) {
        this.element = element;
 
        this.options = $.extend({}, defaults, options);
 
        this.init();
    }
 
    Plugin.prototype = {
 
        init: function () {
            var _self = this;
 
            $(this.element, "document").on("click", "li", function (e) {
                e.stopPropagation();
                _self.showDescriptionBox(this, _self.options, e);
            });
 
            $(this.element, "document").on("mouseup", function (e) {
                e.stopPropagation();
                var container = $(_self.options.cls);
                if (container.has(e.target).length === 0 && container.length > 0 && e.target.nodeName.toLowerCase() == "ul") {
                  _self.reset();
                }
            });
 
              $(this.element, "document").on("mouseup", function (e) {
                e.stopPropagation();
                var container = $(_self.options.cls);
                if (container.has(e.target).length === 0 && container.length > 0 && e.target.nodeName.toLowerCase() == "ul") {
                  _self.reset();
                }
            });
 
            $(this.element).on('click', '.close', function(e) {
                _self.reset();
            });
 
            $(window).on("resize", function (e) {
                _self.reset();
            });
        },
 
        reset: function() {
            this.hideAnimation();
            $(this.element).find('li').removeClass('active');
        },
 
        getTemplateElement: function () {
            return this.options.wrapper + " " + this.options.template;
        },
 
        getTransEndEventNames: function () {
            var transEndEventNames = {
                "WebkitTransition": "webkitTransitionEnd",
                "MozTransition": "transitionend",
                "OTransition": "oTransitionEnd",
                "msTransition": "MSTransitionEnd",
                "transition": "transitionend"
            };
            return transEndEventNames[Modernizr.prefixed("transition")];
        },
 
        getNextIndex: function (index, itemsPerRow, numberOfItems, nextRow) {
            var nextIndex = 0;
 
            if (index <= itemsPerRow) {
                nextIndex = itemsPerRow - 1;
            } else {
                nextIndex = ((nextRow * itemsPerRow) - index) + index - 1;
            }
 
            return nextIndex >= numberOfItems ? numberOfItems - 1 : nextIndex;
        },
 
        templateTransform: function (value) {
            return $.parseHTML(Mustache.render($(this.options.template).html(), value).trim());
        },
 
        showDescriptionBox: function (el, options, e) {
            var _self = this,
                wrapperWidth = $(this.element).width(),
                outerWidth = $(el).outerWidth(true),
                numberOfItems = $(this.element).find('li').size(),
                itemsPerRow = parseInt(wrapperWidth / outerWidth),
                index = $(el).index() + 1,
                nextRow = Math.ceil(index / itemsPerRow),
                nextIndex = this.getNextIndex(index, itemsPerRow, numberOfItems, nextRow);
 
            _self.options.ajax.config.data = this.options.ajax.data.call(el);
 
            if (!$(el).hasClass("active")) {
 
                $.ajax(_self.options.ajax.config).done(function(result) {
                    if (_self.options.ajax.done != null)
                        _self.options.ajax.done.call(this);
 
                    var content = _self.templateTransform(result),
                        row = parseInt($(_self.options.cls, _self.element).attr('data-row')),
                        arrowPosition = ($(el).position().left + $(el).outerWidth() / 2) - 15;
 
                    if (row != nextRow) {
                        $(content).insertAfter($(_self.element).find('li').eq(nextIndex));
                        $(content).find(".wrapperArrow").css("left", arrowPosition);
                        _self.hideAnimation(content);
                        _self.showAnimation(content);
                    } else {
                        _self.animateArrow(content, arrowPosition);
                        $(_self.options.cls).find('.content').html($(content).find('.content').html());
                    }
 
                    $(content).attr('data-row', nextRow);
                    $(el).addClass("active").siblings("li").removeClass("active");
 
               });
            } else {
                $(el).removeClass("active");
                _self.hideAnimation();
            }
        },
 
        showAnimation: function (el) {
            setTimeout(function () {
                if (Modernizr.csstransitions) {
                    $(el).addClass('active');
                } else {
                    $(el).animate({ height: 200 }, 300).find('.content').animate({ height: 185 }, 300);
                }
            }, 300);
        },
 
        hideAnimation: function (el) {
            var _self = this;
 
            setTimeout(function () {
                var remove = $(_self.options.cls).not(el);
                if (Modernizr.csstransitions) {
                    remove.removeClass('active').on(_self.getTransEndEventNames(), function () {
                        remove.remove();
                    });
                } else {
                    remove.animate({ height: 0 }, 300).find('.content').animate({height: 0}, function () {
                        remove.remove();
                    });
                }
            }, 300);
        },
 
        animateArrow: function (el, left) {
            var _self = this;
            setTimeout(function () {
                var arrow = $(el).find(".wrapperArrow");
                if (Modernizr.csstransitions) {
                    $(_self.options.cls).find(".wrapperArrow").removeClass("up").addClass('down').on(_self.getTransEndEventNames(), function () {
                        $(this).css("left", left).addClass("up");
                    });
                } else {
                    $(_self.options.cls).find(".wrapperArrow .arrow").animate({ top: 17 }, 300, function () {
                        $(this).parent('.wrapperArrow').css('left', left).end().animate({ top: 0}, 300);
                    });
                }
            }, 300);
        }
    };
 
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
 
})(jQuery, window, document);