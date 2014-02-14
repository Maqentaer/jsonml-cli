var isDoubleQuote = /"/g
var isSingleQuote = /'/g

var escapeHTMLAttributes = function(attr) {
	return String(attr)
		.replace(isDoubleQuote, "&quot;")
		.replace(isSingleQuote, "&#39;")
}

var isArray = Array.isArray || function(val) {
	return (val instanceof Array);
};

// The actual implementation. As the HTML-string is built by appending to the
// `acc`umulator.
var toHtmlAcc = function(jsonml, acc) {
	if (!jsonml) return;

	if ('string' === typeof jsonml) {
		acc.push(jsonml);
		return;
	}

	if (!isArray(jsonml) || ('string' !== typeof jsonml[0])) {
		throw new SyntaxError('invalid JsonML');
	}

	var pos = 1;
	var tagName = jsonml[0];
	if (tagName) {
		if ('!' === tagName || '?' === tagName) {
			acc.push("<");
			acc.push(tagName);
			while (pos < jsonml.length) {
				acc.push(jsonml[pos], acc);
				++pos;
			}
			acc.push(">");
		} else {
			acc.push("<");
			acc.push(tagName);
			var attributes = jsonml[1];
			if (attributes && typeof(attributes) !== "string" && !(attributes instanceof Array)) {
				for (var key in attributes) { if(attributes.hasOwnProperty(key)) {
					acc.push(' ');
					acc.push(key);
					acc.push('="');
					acc.push(escapeHTMLAttributes(attributes[key]));
					acc.push('"');
				} }
				++pos;
			}
			if(pos < jsonml.length) {
				acc.push(">");
				do {
					toHtmlAcc(jsonml[pos], acc);
					++pos;
				} while(pos < jsonml.length);
				acc.push("</");
				acc.push(tagName);
				acc.push(">");
			} else {
				acc.push(" />");
			}
		}
	} else {
		while (pos < jsonml.length) {
			toHtmlAcc(jsonml[pos], acc);
			++pos;
		}
	}
}

// Convert jsonml to html.
module.exports = function(jsonml) {
	var acc = [];
	toHtmlAcc(jsonml, acc);
	return acc.join('');
};
