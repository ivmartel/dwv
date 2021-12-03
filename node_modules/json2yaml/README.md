json2yaml
===

A command-line utility to convert JSON to YAML (meaning a `.json` file to a `.yml` file)

The purpose of this utility is to pretty-print JSON in the human-readable YAML object notation
(ignore the misnomer, YAML is not a Markup Language at all).

Installation
===

```bash
npm install -g json2yaml
```

*Note*: To use `npm` and `json2yaml` you must have installed [NodeJS](http://nodejs.org#download).

Usage
---

Specify a file:

```bash
json2yaml ./example.json > ./example.yml

yaml2json ./example.yml | json2yaml > ./example.yml
```

Or pipe from stdin:

```bash
curl -s http://foobar3000.com/echo/echo.json | json2yaml

wget -qO- http://foobar3000.com/echo/echo.json | json2yaml
```

Or require:

```javascript
(function () {
  "use strict";

  var YAML = require('json2yaml')
    , ymlText
    ;

    ymlText = YAML.stringify({
      "foo": "bar"
    , "baz": "corge"
    });

    console.log(ymlText);
}());
```

Example
===

So, for all the times you want to turn JSON int YAML (YML):

```javascript
{ "foo": "bar"
, "baz": [
    "qux"
  , "quxx"
  ]
, "corge": null
, "grault": 1
, "garply": true
, "waldo": "false"
, "fred": "undefined"
}
```

becomes

```yaml
---
  foo: "bar"
  baz:
    - "qux"
    - "quxx"
  corge: null
  grault: 1
  garply: true
  waldo: "false"
  fred: "undefined"
```

*Note*: In fact, both of those Object Notations qualify as YAML
because JSON technically *is* a proper subset of YAML.
That is to say that all proper YAML parsers parse proper JSON.

YAML can use either *whitespace and dashes* or *brackets and commas*.

For human readability, the whitespace-based YAML is preferrable.
For compression and computer readability, the JSON syntax of YAML is preferrable.

Alias
===

`json2yaml` has the following aliases:

  * `jsontoyaml`
  * `json2yml`
  * `jsontoyml`
