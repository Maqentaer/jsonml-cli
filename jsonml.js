#!/usr/bin/env node

/*
 jsonml.js
 Convert Convert HTML to JSONML or vice versa

 Created: 2014-02-14

 Copyright (c)2014 Roman Glebsky <maqentaer@gmail.com>
 Distributed under The MIT License: http://github.com/Maqentaer/jsonml-cli/raw/master/LICENSE
 */

var fs = require('fs');
var request = require('request');
var html2jsonml = require('html2jsonml');
var json2html = require('./lib/json2html');
var cli = require('commander');

cli.helpInformationOld = cli.helpInformation;
cli.helpInformation = function() {
	return '\n  ' + cli.description() + '\n' + cli.helpInformationOld();
};

cli.optionHelpOld = cli.optionHelp;
cli.optionHelp = function() {
	var help = cli.optionHelpOld().split('\n');
	help.push(help.shift());
	return help.join('\n');
};

cli
	.description('Convert HTML to JSONML or vice versa')
	.option('-o, --out <file>', 'output file')
	.option('-i, --in <file>', 'input file')
	.option('-u, --url <url>', 'input URL\n')
	.option('-s, --space [string]', 'adds indentation, white space and line break\n')
	.option('-n, --noProcInst', 'don\'t generate processing instructions')
	.option('-l, --lowerTagNames', 'tag names in lower case')
	.option('-L, --lowerAttrNames', 'attribute names in lower case')
	.option('-a, --childrenInArray', 'children in separate array')
	.option('-r, --requireAttr', 'HTML -> JSONML: add attributes object in any case')
	.option('-e, --decodeEntities', 'HTML -> JSONML: decode Entities\n')
	.version(require('./package.json').version, '-v, --version')
	.on('--help', function(){
		console.log('    Without -i, --in and -u, --url');
		console.log('      input from stdin');
		console.log('');
		console.log('    Without -o, --out');
		console.log('      output to stdout');
	})
	.parse(process.argv);

var showError = function(err) {
	process.stderr.write('\n' + err.toString() + '\n');
	process.exit(1);
};

var isJson = function(data) {
	var re = /^\s*[\[\{]/;
	return re.test(data);
};

var saveData = function(data) {
	if (cli['out']) {
		fs.writeFile(cli['out'], data, function(err) {
			if (err) {
				showError(err);
			}
		});
	} else {
		process.stdout.write(data);
	}
};

var parseData = function(data) {
	var options = {
		noProcessingInstructions: cli.noProcInst,
		lowerCaseTags:            cli.lowerTagNames,
		lowerCaseAttrNames:       cli.lowerAttrNames,
		childrenInArray:          cli.childrenInArray,
		requireAttributes:        cli.requireAttr,
		decodeEntities:           cli.decodeEntities,
		space:                    cli.space === true ? '\t' : cli.space
	};
	if (isJson(data)) {
		var jsonML;
		try {
			jsonML = JSON.parse(data);
		} catch(err) {
			return showError(err);
		}
		json2html(jsonML, options, function(err, html) {
			if (err) {
				return showError(err);
			}
			saveData(html);
		});
	} else {
		html2jsonml(data, options, function(err, jsonMl) {
			if (err) {
				return showError(err);
			}
			saveData(JSON.stringify(jsonMl, null, options.space));
		});
	}
};

if (cli['url']) {
	request(cli['url'], function(err, res, body) {
		if (err) {
			return showError(err);
		}
		parseData(body);
	});
} else if (cli['in']) {
	fs.readFile(cli['in'], 'utf8', function(err, content) {
		if (err) {
			return showError(err);
		}
		parseData(content);
	});
} else {
	var stream = process.openStdin(), stdin = '';
	stream.setEncoding('utf8');
	stream.on('data', function (chunk) {
		stdin += chunk;
	});
	stream.on('end', function() {
		parseData(stdin);
	});
}
