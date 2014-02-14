#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var html2jsonml = require('html2jsonml');
var json2html = require('./lib/json2html');
var cli = require('cli');
cli.enable('help', 'version');

// Windows path support
// https://github.com/chriso/cli/pull/42
cli.getPath = function (default_val, identifier) {
	identifier = identifier || 'path';
	return cli.getValue(default_val, function (value) {
		if (value.match(/[?*;{}]/)) {
			throw 'Invalid path';
		}
		return value;
	}, cli.getOptError('a ' + identifier, identifier.toUpperCase()));
}

cli.parse({
	'out': ['o', 'Output file', 'path'],
	'in': ['i', 'Input file', 'path'],
	'url': ['u', 'Input URL', 'url']
});

var isJson = function(data) {
	var re = /^\s*\[/;
	return re.test(data);
};

var saveData = function(data) {
	if (cli.options['out']) {
		fs.writeFileSync(cli.options['out'], data);
	} else {
		console.log(data);
	}
};

var parseData = function(data) {
	if (isJson(data))
	{
		var jsonML = JSON.parse(data);
		var html = json2html(jsonML);
		saveData(html);
	}
	else
	{
		html2jsonml(data, function(err, jsonMl) {
			if (err) throw err;
			saveData(JSON.stringify(jsonMl));
		});
	}
};

if (cli.options['url']) {
	request(cli.options['url'], function(err, res, body) {
		if (err) throw err;
		parseData(body);
	});
} else if (cli.options['in']) {
	fs.readFile(cli.options['in'], 'utf8', function(err, content) {
		if (err) throw err;
		parseData(content);
	});
} else {
	cli.withStdin(function(stdin) {
		parseData(stdin);
	});
}
