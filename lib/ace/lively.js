define(function(require, exports, module) {
"use strict";

require("./lib/fixoldbrowsers");

var dom = require("./lib/dom");
var event = require("./lib/event");

var Editor = require("./editor").Editor;
var EditSession = require("./edit_session").EditSession;
var UndoManager = require("./undomanager").UndoManager;
var Renderer = require("./virtual_renderer").VirtualRenderer;
var MultiSelect = require("./multi_select").MultiSelect;
var singleLineEdit = require("./single_line_edit").singleLineEdit;

// The following require()s are for inclusion in the built ace file
require("./keyboard/hash_handler");
require("./placeholder");
require("./mode/folding/fold_mode");
require("./theme/textmate");

require("ace/snippets");
require("ace/ext/language_tools"); // for autocompletion

exports.config = require("./config");

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// rksm, Sunday, 07. July 2013
// workers throw error, disable for now
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var workerModule = require("ace/worker/worker_client");
workerModule.WorkerClient = workerModule.UIWorkerClient;

/**
 * Provides access to require in packed noconflict mode
 * @param {String} moduleName
 * @returns {Object}
 *
 **/
exports.require = require;

/**
 * Embeds the Ace editor into the DOM, at the element provided by `el`.
 * @param {String | DOMElement} el Either the id of an element, or the element itself
 *
 **/
exports.edit = function(el) {
    if (typeof(el) == "string") {
        var _id = el;
        var el = document.getElementById(_id);
        if (!el)
            throw "ace.edit can't find div #" + _id;
    }

    if (el.env && el.env.editor instanceof Editor)
        return el.env.editor;

    var doc = exports.createEditSession(dom.getInnerText(el));
    el.innerHTML = '';

    var editor = new Editor(new Renderer(el));
    new MultiSelect(editor);
    editor.setSession(doc);

    var env = {
        document: doc,
        editor: editor,
        onResize: editor.resize.bind(editor, null)
    };
    event.addListener(window, "resize", env.onResize);
    editor.on("destroy", function() {
        event.removeListener(window, "resize", env.onResize);
    });
    el.env = editor.env = env;
    return editor;
};

exports.commandLineEdit = function(el) {
    var editor = singleLineEdit(el);
    return editor;
}

/**
 * Creates a new [[EditSession]], and returns the associated [[Document]].
 * @param {Document | String} text {:textParam}
 * @param {TextMode} mode {:modeParam}
 *
 **/
exports.createEditSession = function(text, mode) {
    var doc = new EditSession(text, doc);
    doc.setUndoManager(new UndoManager());
    return doc;
}
exports.EditSession = EditSession;
exports.UndoManager = UndoManager;
});
