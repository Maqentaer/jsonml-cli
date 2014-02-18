#jsonml-cli

Convert HTML to JSONML or vice versa

##Usage

  jsonml.js [options]

##Options

```
    -o, --out <file>       output file
    -i, --in <file>        input file
    -u, --url <url>        input URL

    -s, --space [string]   adds indentation, white space and line break

    -n, --noProcInst       don't generate processing instructions
    -l, --lowerTagNames    tag names in lower case
    -L, --lowerAttrNames   attribute names in lower case
    -a, --childrenInArray  children in separate array
    -r, --requireAttr      HTML -> JSONML: add attributes object in any case
    -e, --decodeEntities   HTML -> JSONML: decode Entities

    -v, --version          output the version number
    -h, --help             output usage information
```

####Without -i, --in and -u, --url

  input from stdin

####Without -o, --out

  output to stdout
