
var mongoose = require('mongoose');
var async = require('async');
var should = require('should');
const expect = require('chai').expect;

var schema = new mongoose.Schema({
	string: String,
	number: Number,
	array: [String],
	bool: Boolean,
	object: {
		string: String
	},
	oid: mongoose.Schema.Types.ObjectId
});
schema.plugin(require('../archiver.js'));

var model;
var docs = [];
before(async function () {
	var connection = await mongoose.connect('mongodb://localhost:27017/archiver_test', { native_parser: true }, function () {
		mongoose.connection.db.dropDatabase();
	});
	model = connection.model('test', schema);
});

describe('Document 1', function () {

	it('Archived document shouldnt have the same id as the original document, have archived_id set to original document, and have removed_at set', async function () {
		const doc = new model({
			string: 'First document',
			number: 42,
			array: ['Array 1'],
			bool: true,
			object: { string: 'object string' },
			oid: new mongoose.Types.ObjectId()
		});

		archivedId = doc._id;
		return doc.save()
			.then(() => model.findById(doc._id))
			.then(doc => doc.remove())
			.then(() => model.findById(doc._id))
			.then((doc) => expect(doc).to.be.null)
			.then(doc => {
				return model.archive().findOne({ number: 42 });
			})
			.then(archivedDoc => {
				expect(archivedDoc.archived_id).to.equal(doc._id.toString());
				expect(archivedDoc._id.toString()).not.equal(doc._id.toString());
				expect(archivedDoc.removed_at).not.equal(null);
			});
	});


	it('create docs', function () {
		for (var i = 1; i < 101; i++) {
			docs.push(new model({
				string: 'String ' + i,
				number: 42 * i,
				array: ['String ' + i, 'String ' + i],
				bool: true,
				object: { string: 'String ' + i },
				oid: new mongoose.Types.ObjectId()
			}));
		}
	});

	it('save docs', function (done) {
		this.timeout(3000);
		async.each(docs, function (doc, cb) {
			doc.save(cb);
		}, done);
	});

	it('remove', function (done) {
		this.timeout(3000);
		async.each(docs, function (doc, cb) {
			doc.remove(cb);
		}, done);
	});

	it('check if archived', function (done) {
		model.archive().count({ "object.string": /String \d+/ }, function (err, count) {
			count.should.eql(100);
			done();
		})
	});

	it('insert 101st', function (done) {
		var doc = new model({
			string: 'String 101',
			number: 42 * 101,
			array: ['String ' + 101, 'String ' + 101],
			bool: true,
			object: { string: 'String ' + 101 },
			oid: new mongoose.Types.ObjectId()
		});
		doc.save(done);
	});
});
