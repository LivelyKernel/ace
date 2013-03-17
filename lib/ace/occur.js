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
var Range = require("./range").Range;
var Search = require("./search").Search;
var Document = require("./document").Document;

/**
 * @class Occur
 *
 * Finds all lines matching a search term in the current docuement and
 * displays them instead of the original document.
 *
 **/


/**
 *
 *
 * Creates a new `Occur` object.
 *
 * @constructor
 **/
function Occur() {
    // this.$options = {wrap: false, skipCurrent: false};
    // this.$keyboardHandler = new ISearchKbd(this);
}

oop.inherits(Occur, Search);

(function() {

    this.display = function(session, options) {
        this.$originalDoc = session.doc;
        var found = this.matchingLines(session, options),
            lines = found.map(function(foundLine) { return foundLine.content; }),
            occurDoc = new Document(lines);
        occurDoc.$occur = this;
        session.setDocument(occurDoc);
    }

    this.displayOriginal = function(session) {
        session.setDocument(this.$originalDoc);
    }

    this.matchingLines = function(session, options) {
        options = options || {};
        if (!session || !options.needle) return [];
        var search = new Search();
        search.set(options);
        var ranges = search.findAll(session);
        return ranges.map(function(range) {
            var row = range.start.row;
            return {row: row, content: session.getLine(row)};
        });
    }

}).call(Occur.prototype);


exports.Occur = Occur;

});