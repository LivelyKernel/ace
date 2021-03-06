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

if (typeof process !== "undefined") {
    require("amd-loader");
}

define(function(require, exports, module) {
"use strict";

var EditSession = require("./../edit_session").EditSession,
    Editor = require("./../editor").Editor,
    MockRenderer = require("./../test/mockrenderer").MockRenderer,
    emacs = require('./emacs'),
    keys = require("./../lib/keys"),
    assert = require("./../test/assertions"),
    editor, sendKeys,
    assertRangeAndContent;

function initEditor(docString) {
    var doc = new EditSession(docString.split("\n"));
    editor = new Editor(new MockRenderer(), doc);
    editor.setKeyboardHandler(emacs.handler);
    sendKeys = keys.simulateKeys.bind(keys, editor);
    assertRangeAndContent = assert.rangeAndContent.bind(assert, editor);
}

module.exports = {

    "test: detach removes emacs commands from command manager": function() {
        initEditor('');
        assert.ok(!!editor.commands.byName["keyboardQuit"], 'setup error: emacs commands not installed');
        editor.keyBinding.removeKeyboardHandler(editor.getKeyboardHandler());
        assert.ok(!editor.commands.byName["keyboardQuit"], 'emacs commands not removed');
    },

    "test: keyboardQuit clears selection": function() {
        initEditor('foo');
        editor.selectAll();
        editor.execCommand('keyboardQuit');
        assert.ok(editor.selection.isEmpty(), 'selection non-empty');
    },

    "test: send keys": function() {
        initEditor('foo');
        editor.selection.moveCursorLineEnd();
        assertRangeAndContent(0, 3, 0, 3, 'foo');
        sendKeys('b a r');
        assertRangeAndContent(0,6,0,6, 'foobar');
    },

    "test: command via shortcut": function() {
        initEditor('foo');
        editor.selection.moveCursorRight();
        editor.execCommand('splitline');
        assertRangeAndContent(0,1,0,1,'f\noo');
    },

    "test: command via shortcut sequence": function() {
        initEditor('foo');
        assertRangeAndContent(0,0,0,0,'foo');
        sendKeys("ctrl- ctrl-x ctrl-p"); // selectall
        assertRangeAndContent(0,0,0,3,'foo');
    }

};

});

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec()
}
