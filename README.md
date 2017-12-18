# Securibox Parse - JavaScript API

A Javascript API for Securibox Parse

## Community

Securibox Parse JavaScript API is an open source software released under an
[LGPL-3.0 license](https://github.com/Securibox/parse-api-js/blob/master/LICENSE).

You are welcome to [report bugs](https://github.com/Securibox/parse-api-js/issues) or create pull requests on [github](https://github.com/Securibox/parse-api-js).

## Installation

The easiest way to install sbx-parse-api is with [`npm`][npm].

[npm]: https://www.npmjs.com/

```sh
npm install sbx-parse-api
```

Alternately, download the source.

```sh
git clone https://github.com/Securibox/parse-api-js.git
```

## Usage

Creating a parser:
```JavaScript
import {Parse, AuthMethods} from "sbx-parse-api";

var parser = new Parse(url, authMethod, ...authKeys);
```

Supported authentication methods:
* `AuthMethods.BASIC`: [basic authentication](https://tools.ietf.org/html/rfc2617) is using username and password
* `AuthMethods.JWT`: [JSON Web Tokens](https://jwt.io/) are using tokens

After you have the `parser` object, you can call the API. Every call will return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Only requests returning with **200** will be handled as a `.then()`, everything else will fall to `.catch()` in a `JSON` object as `{"error": [Error Object]}`.

The API has three methods:
* `parse(docs, split=undefined)`: takes a set of document, classifies and parses them. It has an optional parameter `mode`, what can be the following:
  * `undefined` (default) - handles every document as it is
  * `"split"` - splits the document into pages and handles every page as a separate document.
* `classify(docs)`: takes a set of document and classifies them.
* `feed(docs)`: takes a set of document and tries to learn the models according to the given informations.

The `docs` object is used on the _Requests_ and the _Responses_ as well. The structure is always an array of the following dictionary:
* `id`: the document identifier, must be unique in the set
* `buffer` or `bytes` or `content`: the content of the PDF document. The buffer is waiting for an `ArrayBuffer`, the `bytes` is waiting for an array of bytes while the `content` is the content of the PDF in `base64` encoding. **Only exists on _Requests_.**
* `labelId` (_optional_): the document class identifier
  * `parse()` and `classify()`: if filled, the document will be only layout-classified
  * `feed()`: used to teach the models
  * _Response_: will be filled with the best matching class
* `detailedLabelId` (_optional_): the document layout identifier
  * `parse()` and `classify()`: if filled, the document will not be classified
  * `feed()`: used to teach the models
  * _Response_: will be filled with the best matching layout
* `extractedData`: the extracted data fields. Array object, every item contains a `name` and a `value` field. Returned on `parse()`, should be filled on `feed()`.
