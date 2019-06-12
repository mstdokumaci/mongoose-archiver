module.exports = function (schema, options) {
	var archive_model;

	options = options || {};

	// add date field to schema
	if (!options.date_field) options.date_field = 'removed_at';
	// add archived_id field to schema
	if (!options.archived_id) options.archived_id = 'archived_id';
	var add_to_schema = {};
	add_to_schema[options.date_field] = Date;
	add_to_schema[options.archived_id] = String;
	if (options.schema) {
		options.schema.add(add_to_schema);
	} else {
		schema.add(add_to_schema);
	}

	schema.pre('remove', true, function (next, done) {
		get_archive_model(this);

		// copy the doc so original _id isn't deleted
		var copyDoc = JSON.parse(JSON.stringify(this));

		// delete copyDoc so the old _id isn't used for the Arvhive id
		delete copyDoc._id;

		// copy document to archive model
		var doc = new archive_model(copyDoc);

		// flat doc as new
		doc.isNew = true;

		// set date field
		doc.set(options.date_field, new Date());

		// set date field
		doc.set(options.archived_id, this._id);

		// save to archive collection
		doc.save(function (err) {
			if (err)
				throw new Error(
					'Could not archive removed document: ' + JSON.stringify(doc)
					+ ' Because: ' + (err.stack || err)
				);

			done();
		});

		next();
	});

	schema.statics.archive = function () {
		get_archive_model(this);
		return archive_model;
	};

	function get_archive_model(document) {
		if (archive_model) return;

		var connection = options.connection || document.collection.conn || document.constructor.collection.conn;
		var name = options.model_name || document.modelName || document.constructor.modelName;
		name = name + '_archive';
		const newSchema = options.schema || schema;
		archive_model = connection.model(name, newSchema);
	};
};
