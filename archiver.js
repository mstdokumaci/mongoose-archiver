
var ObjectId = require('mongoose').Schema.Types.ObjectId;

module.exports = function (schema, options) {
	var archive_model;

	options = options || {};

	schema.pre('remove', true, function (next, done) {
		get_archive_model(this);

		var doc = clone(this.toObject());
		console.log(JSON.stringify(doc, null, 2));
		archive = new archive_model(doc);
		archive.save(function (err) {
			if (err) throw new Error('Could not archive removed document: ' + JSON.stringify(doc));

			done();
		});

		next();
	});

	schema.statics.archive = function () {
		return archive_model;
	};

	function clone (o) {
		var c, key;

		if (o === null || o === undefined)
			return o;

		switch (o.constructor) {
			case Boolean:
			case String:
			case Number:
				return o;
			break;
			case Array:
				c = [];
			break;
			case Object:
				c = {};
			break;
			case Function:
				return null;
			break;
			default:
				return (o['toHexString'])
					? ObjectId(o.toHexString())
					: JSON.parse(JSON.stringify(o));
			break;
		}

		for (key in o) {
			c[key] = clone(o[key]);
		}

		return c;
	}

	function get_archive_model (document) {
		if (archive_model) return;

		var connection = options.connection || document.constructor.collection.conn;
		var name = options.name || document.constructor.modelName + '_archive';

		archive_model = connection.model(name, schema);
	};
};
