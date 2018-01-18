'use strict';

import {encode as b64encode} from 'base-64';

const AuthMethods = {
    BASIC: 'Basic',
    JWT: 'Bearer',
}

class Parse
{
    constructor(url, authMethod, ...args)
    {
        let auth;
        switch (authMethod) {
            case AuthMethods.BASIC:
                if (args.length === 2) {
                    auth = b64encode(`${args[0]}:${args[1]}`);
                } else {
                    throw new Error('Username and password must not be empty!');
                }
            break;
            case AuthMethods.JWT:
                if (args.length === 1) {
                    auth = args[0];
                } else {
                    throw new Error('JWT must not be empty');
                }
            break;
            default:
                throw new Error(`Invalid auth type "${authMethod}"`);
            //
        }

        this.url = url;
        this.headers = new Headers();
        this.headers.append('Authorization', `${authMethod} ${auth}`);
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    _create_payload(docs)
    {
        let result = [];

        for (let doc of docs) {
            let obj = {};

            if (doc.id === undefined) {
                throw Error('Document ID must not be empty!');
            }
            obj['id'] = doc.id;

            if (doc.buffer !== undefined) {
                obj['content'] = b64encode(
                    String.fromCharCode(...new Uint8Array(doc.buffer)));
            } else if (doc.bytes !== undefined) {
                obj['content'] = b64encode(obj.bytes);
            } else if (doc.content !== undefined) {
                obj['content'] = obj.content;
            } else {
                throw Error('Document content must not be empty!');
            }

            if (doc.labelId !== undefined) {
                obj['labelId'] = doc.labelId;
            }

            if (doc.detailedLabelId !== undefined) {
                obj['detailedLabelId'] = doc.detailedLabelId;
            }

            if (doc.extractedData !== undefined) {
                obj['extractedData'] = doc.extractedData;
            }

            result.push(obj);
        }

        return JSON.stringify(result);
    }

    _doc_post(docs, url){
        return this._request(this._create_payload(docs), url, 'POST');
    }

    _request(payload, url, method)
    {
        return fetch(
            `${this.url}${url}`, {
                    method: method,
                    headers: this.headers,
                body: payload,
                credentials: 'include'
                })
        .then(function(response) {
            if (!response.ok) {
                throw {'error': response};
            }
            return response.json();
        })
        .catch(function(error) {
            throw {'error': error}
        });
    }

    classify(docs, take)
    {
        let url = '/docs/classify';
        if (take !== undefined) {
            url += `?take=${take}`;
        }
        return this._doc_post(docs, url);
    }

    parse(docs, mode)
    {
        let url = '/docs/parse';
        if (mode !== undefined) {
            url += `?mode=${mode}`;
        }
        return this._doc_post(docs, url);
    }

    guess(docs)
    {
        let url = '/docs/guess';
        return this._doc_post(docs, url);
    }

    feed(docs)
    {
        let url = '/docs/feed';
        return this._doc_post(docs, url);
    }

    train(docs)
    {
        let url = '/docs/train';
        return this._doc_post(docs, url);
    }

    pending(docIds)
    {
        let url = '/docs/pending';
        return this._request(docsIds, url, 'POST');
    }

    getExtractedDataKeys()
    {
        let url = '/xdata';
        return this._request(null, url, 'GET');
    }

    getLabels()
    {
        let url = '/labels';
        return this._request(null, url, 'GET');
    }
}

export {Parse, AuthMethods};
