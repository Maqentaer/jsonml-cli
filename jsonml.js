#!/usr/bin/env node

var fs = require('fs');
var jsdom = require('jsdom');
var dom2jsonml = require('dom2jsonml');
var cli = require('cli');
cli.enable('help', 'version');

cli.parse({
  out: ['o', 'Output file', 'path'],
  "in": ['i', 'Input file', 'path'],
  url: ['u', 'Input URL', 'url']
});

var options = {
  features: {
    FetchExternalResources: false,
    ProcessExternalResources: false,
    SkipExternalResources: false
  },
  done: function(parseErrors, window) {
    if (parseErrors) {
      throw parseErrors;
    }
    return dom2jsonml(window.document, function(err, jsonMl) {
      if (err) {
        throw err;
      }
      if (cli.options.out) {
        return fs.writeFileSync(cli.options.out, JSON.stringify(jsonMl));
      } else {
        return console.log(JSON.stringify(jsonMl));
      }
    });
  }
};

if (cli.options.url) {
  options.url = cli.options.url;
  jsdom.env(options);
} else if (cli.options["in"]) {
  options.file = cli.options["in"];
  jsdom.env(options);
} else {
  cli.withStdin(function(stdin) {
    options.html = stdin;
    return jsdom.env(options);
  });
}
