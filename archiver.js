
var ObjectId = require('mongoose').Schema.Types.ObjectId;
var archive_model;

module.exports = function (schema, options) {
	options = options || {};

	schema.pre('remove', true, function (next, done) {
		get_archive_model(this);

		var doc = clone(this);
		archive = new archive_model(doc);
		archive.save(function (err) {
			if (err) api.logger.error('Couldnt archive removed document: ' + JSON.stringify(doc));

			done();
		});

		next();
	});

	function clone (o) {
		var clone, key;

		if (o === null || o === undefined)
			return o;

		switch (o.constructor) {
			case Boolean:
			case String:
			case Number:
				return o;
			break;
			case Array:
				clone = [];
			break;
			case Object:
				clone = {};
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
			clone[key] = clone(o[key]);
		}

		return clone;
	}

	function get_archive_model = function (document) {
		if (archive_model) return;

		var connection = options.connection || document.constructor.collection.conn;
		var name = options.name || document.constructor.modelName + 's_archive';

		archive_model = connection.model(name, schema);
	};
};
