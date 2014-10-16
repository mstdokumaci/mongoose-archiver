
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (schema, options) {
	var archive_model;

	options = options || {};

	if (!options.date_field) options.date_field = 'removed_at';
	var add_to_schema = {};
	add_to_schema[options.date_field] = Date;
	schema.add(add_to_schema);

	schema.pre('remove', true, function (next, done) {
		var me = this;
		get_archive_model(this);

		var doc = new archive_model(this);
		doc._id = new ObjectId();
		doc.set(options.date_field, new Date());
		doc.save(function (err) {
			if (err) throw new Error('Could not archive removed document: ' + JSON.stringify(doc) + ' ' + err);

			done();
		});

		next();
	});

	schema.statics.archive = function () {
		return archive_model;
	};

	function get_archive_model (document) {
		if (archive_model) return;

		var connection = options.connection || document.constructor.collection.conn;
		var name = options.model_name || document.constructor.modelName + '_archive';

		archive_model = connection.model(name, schema);
	};
};
