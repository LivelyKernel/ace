/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var UndoManager = require("ace/undomanager").UndoManager;
var Renderer = require("ace/virtual_renderer").VirtualRenderer;
var Editor = require("ace/editor").Editor;
var MultiSelect = require("ace/multi_select").MultiSelect;

/**
 * A `VirtualRenderer` specifically configured for one line rendering. Used
 * e.g. for command lines
 * @class OneLineRenderer
 **/

function OneLineRenderer(el) {
    Renderer.call(this, el);
    el.style.overflow = "hidden";
    this.scrollBar.element.style.top = "0";
    this.scrollBar.element.style.display = "none";
    this.scrollBar.orginalWidth = this.scrollBar.width;
    this.scrollBar.width = 0;
    this.content.style.height = "auto";
    this.$maxLines = 4;
    this.$computeLayerConfigWithScroll = this.$computeLayerConfig;
    this.setStyle("ace_one-line");
}

oop.inherits(OneLineRenderer, Renderer);

(function() {

    this.screenToTextCoordinates = function(x, y) {
        var pos = this.pixelToScreenCoordinates(x, y);
        return this.session.screenToDocumentPosition(
            Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
            Math.max(pos.column, 0)
        );
    }

    this.$computeLayerConfig = function() {
        var config = this.layerConfig;
        var height = this.session.getScreenLength() * this.lineHeight;
        if (config.height != height) {
            var vScroll = height > this.maxLines * this.lineHeight;

            if (vScroll != this.$vScroll) {
                if (vScroll) {
                    this.scrollBar.element.style.display = "";
                    this.scrollBar.width = this.scrollBar.orginalWidth;
                    this.container.style.height = config.height + "px";
                    height = config.height;
                    this.scrollTop = height - this.maxLines * this.lineHeight;
                } else {
                    this.scrollBar.element.style.display = "none";
                    this.scrollBar.width = 0;
                }

                this.onResize();
                this.$vScroll = vScroll;
            }

            if (this.$vScroll)
                return this.$computeLayerConfigWithScroll();

            this.container.style.height = height + "px";
            this.scroller.style.height = height + "px";
            this.content.style.height = height + "px";
            this._emit("resize");
        }

        var longestLine = this.$getLongestLine();
        var firstRow = 0;
        var lastRow = this.session.getLength();

        this.scrollTop = 0;
        config.width = longestLine;
        config.padding = this.$padding;
        config.firstRow = 0;
        config.firstRowScreen = 0;
        config.lastRow = lastRow;
        config.lineHeight = this.lineHeight;
        config.characterWidth = this.characterWidth;
        config.minHeight = height;
        config.maxHeight = height;
        config.offset = 0;
        config.height = height;

        this.$gutterLayer.element.style.marginTop = 0 + "px";
        this.content.style.marginTop = 0 + "px";
        this.content.style.width = longestLine + 2 * this.$padding + "px";
    }

    this.isScrollableBy = function(){ return false };

}).call(OneLineRenderer.prototype);


function singleLineEdit(el) {
    // original change: 95ac143...a5889ba
    // merged in change in layout.js exports.singleLineEditor
    var editor = new Editor(new OneLineRenderer(el));
    new MultiSelect(editor);
    editor.session.setUndoManager(new UndoManager());
    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setHighlightGutterLine(false);
    editor.$mouseHandler.$focusWaitTimout = 0;
    return editor;
}

exports.singleLineEdit = singleLineEdit;

});
