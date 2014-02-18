/*
 json2html.js
 Convert JSONML to HTML

 Created: 2014-02-14

 Copyright (c)2014 Roman Glebsky <maqentaer@gmail.com>
 Distributed under The MIT License: http://github.com/Maqentaer/jsonml-cli/raw/master/LICENSE
 */

var isDoubleQuote = /"/g
var isSingleQuote = /'/g

var escapeHTMLAttributes = function(attr) {
	return String(attr)
		.replace(isDoubleQuote, '&quot;')
		.replace(isSingleQuote, '&#39;');
}

var isArray = Array.isArray || function(val) {
	return (val instanceof Array);
};

var addSpaces= function(options, tabsCount, acc) {
	if (options.space) {
		if (acc.length > 0) {
			acc.push('\n');
		}
		for (var i = 0; i < tabsCount; i++) {
			acc.push(options.space);
		}
	}
}

// The actual implementation. As the HTML-string is built by appending to the
// `acc`umulator.
var toHtmlAcc = function(tabsCount, jsonml, options, acc) {
	if (!jsonml) return;

	if ('string' === typeof jsonml) {
		addSpaces(options, tabsCount, acc);
		acc.push(jsonml);
		return;
	}

	if (!isArray(jsonml) || ('string' !== typeof jsonml[0])) {
		throw new SyntaxError('Invalid JSONML');
	}

	var pos = 1;
	var tagName = jsonml[0];
	if (tagName) {
		var newTabsCount = tabsCount + 1;
		if ('!' === tagName || '?' === tagName) {
			if(!options.noProcessingInstructions){
				addSpaces(options, tabsCount, acc);
				if (jsonml[1] && typeof(jsonml[1]) !== 'string' && !isArray(jsonml[1])) ++pos;
				if (options.childrenInArray && isArray(jsonml[pos])) {
					jsonml = jsonml[pos];
					pos = 0;
				}
				acc.push('<');
				acc.push(tagName);
				while (pos < jsonml.length) {
					acc.push(jsonml[pos], acc);
					++pos;
				}
				acc.push('>');
			}
		} else {
			addSpaces(options, tabsCount, acc);
			if(options.lowerCaseTags){
				tagName = tagName.toLowerCase();
			}
			acc.push('<');
			acc.push(tagName);
			var attributes = jsonml[1];
			if (attributes && typeof(attributes) !== 'string' && !isArray(attributes)) {
				for (var key in attributes) { if(attributes.hasOwnProperty(key)) {
					if(options.lowerCaseAttributeNames){
						key = key.toLowerCase();
					}
					acc.push(' ');
					acc.push(key);
					acc.push('="');
					acc.push(escapeHTMLAttributes(attributes[key]));
					acc.push('"');
				} }
				++pos;
			}
			if (options.childrenInArray && isArray(jsonml[pos])) {
				jsonml = jsonml[pos];
				pos = 0;
			}
			if(pos < jsonml.length) {
				acc.push('>');
				do {
					toHtmlAcc(newTabsCount, jsonml[pos], options, acc);
					++pos;
				} while(pos < jsonml.length);
				addSpaces(options, tabsCount, acc);
				acc.push('</');
				acc.push(tagName);
				acc.push('>');
			} else {
				acc.push(' />');
			}
		}
	} else {
		if (jsonml[1] && typeof(jsonml[1]) !== 'string' && !isArray(jsonml[1])) ++pos;
		if (options.childrenInArray && isArray(jsonml[pos])) {
			jsonml = jsonml[pos];
			pos = 0;
		}
		while (pos < jsonml.length) {
			toHtmlAcc(tabsCount, jsonml[pos], options, acc);
			++pos;
		}
	}
}

// Convert jsonml to html.
module.exports = function(jsonml, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}
	options = options || {};

	var html;
	var acc = [];
	var err = null;
	try {
		toHtmlAcc(0, jsonml, options, acc);
		html = acc.join('');
	} catch(e) {
		html = null;
		err = e;
	}

	if (typeof callback === 'function') {
		if (null !== err) {
			callback(err);
		} else {
			callback(null, html)
		}
	}
	return html;
};
