
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	string: String,
	number: Number,
	array: [String],
	bool: Boolean,
	object: {
		string: String
	}
});
schema.plugin(require('../archiver.js'));

var connection = mongoose.createConnection('mongodb://localhost/archiver_test');
var model = connection.model('test', schema);

describe('Document 1', function () {
	it('insert' function (done) {
		var document = new model({
			string: 'String1',
			number: 42,
			array: ['String2', 'String3'],
			bool: true,
			object: {string: 'String4'}
		});

		document.save(done);
	});

	it('remove' function (done) {
		document.remove(done);
	});
});
