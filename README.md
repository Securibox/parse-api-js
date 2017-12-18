# Securibox Parse - JavaScript API

A Javascript API for Securibox Parse

## Community

Securibox Parse JavaScript API is an open source software released under [LGPL-3.0 license](https://github.com/Securibox/parse-api-js/blob/master/LICENSE).

You are welcome to [report bugs](https://github.com/Securibox/parse-api-js/issues) or create pull requests on [github](https://github.com/Securibox/parse-api-js).

## Installation

The easiest way to install sbx-parse-api is with [`npm`][npm].

[npm]: https://www.npmjs.com/

```sh
npm install sbx-parse-api
```

Alternatively, download the source.

```sh
git clone https://github.com/Securibox/parse-api-js.git
```

## Usage

### Creating a parser
```JavaScript
import {Parse, AuthMethods} from "sbx-parse-api";

// Using JWT authentication
let jwt = "thisIsMyEncodedToken";
authMethod = AuthMethods.JWT;
var parser = new Parse(url, authMethod, jwt);

// OR, with basic authentication:
// user = "MyUsername";
// password = "MySecretPassword";
// authMethod = AuthMethods.BASIC;
// var parser = new Parse(url, authMethod, user, password);
```

### Authentication

Supported authentication methods:
* `AuthMethods.BASIC`: [basic authentication](https://tools.ietf.org/html/rfc2617) using username and password
* `AuthMethods.JWT`: [JSON Web Tokens](https://jwt.io/) using tokens

### API Methods

After you have instanciated a `Parse` object, you can use it to call the API. Every call will return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Only requests returning a **200** HTTP code will result in a fulfilled promise and trigger the `.then()` method; everything else will fall into the `.catch()` method and return an error structured as `{"error": [Error Object]}`.

The API has four methods:
* `classify(docs, take=5)`: takes a set of documents and labels them. Internally, the classification is done in two steps: first a fast algorithm returns a list of candidate labels; then a slower high-precision algorithm choses among the `take` most probable labels and determines the document's specific layout. The `take` optional parameter is a number between 1 and 9 (5 is the default value).  
* `parse(docs, take=5, mode=undefined)`: takes a set of documents, classifies and parses them. Along with the `take` parameter (same as in `classify`), it accepts an optional `mode` parameter, that can be one of the following:
  * `undefined` (default) - handles every document as it is
  * `"split"` - splits the document into pages and handles every page as a separate document.
* `guess(docs)`: takes a set of partially parsed documents with similar layout and tries to infere the missing data. This method can be used to speed up data entry when the `parse` method fails.
* `feed(docs)`: takes a set of documents and stores them for the next training cycles. This method must be used with wrongly classified or wrongly parsed documents after the errors have been corrected by the user; it allows the application to learn and improve over time.

### Objects

The `docs` object is used on both _Requests_ and _Responses_. The structure is always an array of the following dictionary:
* `id`: the document identifier, must be unique in the set
* `buffer` or `bytes` or `content`: the content of the PDF document. The `buffer` is waiting for an `ArrayBuffer`, the `bytes` is waiting for an array of bytes while the `content` is the content of the PDF in `base64` encoding. **Only exists on _Requests_.**
* `labelId` (_optional_): the document label identifier
  * `parse()` and `classify()`: if filled, the document will be only layout-classified
  * `feed()`: used to train the models
  * _Response_: will be filled with the best matching label
* `detailedLabelId` (_optional_): the document layout identifier
  * `parse()` and `classify()`: if filled, the document will not be classified
  * _Response_: will be filled with the best matching layout
* `extractedData`: the extracted data fields. Array object, every item contains a `name` and a `value` field. Returned on `parse()` and `guess()`, should be filled on `feed()` and (for some documents) on `guess()`.
* `errors`: an array containing processing errors for the specific document. Storing errors by document allows you to successfully process the rest of the batch.

### Sample
```JavaScript
let docs = [];
let doc = {id: "Doc_01", content: "Base64ContentMustGoHere"};
docs.push(doc);
parser.parse(docs).then(function(parsedDocs){
    // parsedDocs is an array of documents
    alert("The doc contains " + parsedDocs[0].extractedData);
});
```
