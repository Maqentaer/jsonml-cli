#jsonml-cli

Convert HTML to JSONML or vice versa

##Usage

  jsonml.js [OPTIONS]

##Options

```
  -o, --out PATH         Output file
  -i, --in PATH          Input file
  -u, --url URL          Input URL

  -s, --space STRING     Adds indentation, white space, and line break characters

  -n, --noProcInst       Don't generate processing instructions
  -l, --lowerTagNames    Tag names in lower case
  -L, --lowerAttrNames   Attribute names in lower case
  -a, --childrenInArray  Children in separate array
  -r, --requireAttr      HTML -> JSONML: Add attributes object in any case
  -e, --decodeEntities   HTML -> JSONML: Decode Entities

  -v, --version          Display the current version
  -h, --help             Display help and usage details
```

####Without -i, --in and -u, --url

  input from stdin

####Without -o, --out

  output to stdout
