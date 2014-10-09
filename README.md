mongoose-archiver
=================

Archives removed documents to an archive collection
[![Build Status](https://travis-ci.org/mstdokumaci/mongoose-archiver.svg?branch=master)](https://travis-ci.org/mstdokumaci/mongoose-archiver)

## How to install
```sh
npm install mongoose-archiver
```

## How to use
Add the plugin to your schema.
```js
var your_schema = new Schema({
	field: String
});

your_schema.plugin(require('mongoose-archiver'));
```

When you remove any document from collection, plugin automatically creates an archive collection and inserts the removed document in it. Later when you need to query any removed documents, you can have the archive model like this:

```js
var archive_model = your_model.archive();
archive_model.find({field: value}, callback);
```
