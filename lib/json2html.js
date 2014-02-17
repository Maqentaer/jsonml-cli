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

// The actual implementation. As the HTML-string is built by appending to the
// `acc`umulator.
var toHtmlAcc = function(jsonml, options, acc) {
	if (!jsonml) return;

	if ('string' === typeof jsonml) {
		acc.push(jsonml);
		return;
	}

	if (!isArray(jsonml) || ('string' !== typeof jsonml[0])) {
		throw new SyntaxError('Invalid JSONML');
	}

	var pos = 1;
	var tagName = jsonml[0];
	if (tagName) {
		if ('!' === tagName || '?' === tagName) {
			if(!options.noProcessingInstructions){
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
					toHtmlAcc(jsonml[pos], options, acc);
					++pos;
				} while(pos < jsonml.length);
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
			toHtmlAcc(jsonml[pos], options, acc);
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

	var acc = [];
	var err = null;
	try {
		toHtmlAcc(jsonml, options, acc);
	} catch(e) {
		err = e;
	}

	var html = acc.join('');
	if (typeof callback === 'function') {
		if (null !== err) {
			callback(err);
		} else {
			callback(null, html)
		}
	}
	return html;
};
