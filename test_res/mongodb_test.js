/**
 * Created by missionhealth on 15/10/24.
 */


var MongoClient = require('mongodb').MongoClient,
    test = require('assert');
MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
    var collection = db.collection("simple_document_insert_collection_no_safe");
    // Insert a single document
    collection.insertOne({hello:'world_no_safe'});

    // Wait for a second before finishing up, to ensure we have written the item to disk
    setTimeout(function() {

        // Fetch the document
        collection.findOne({hello:'world_no_safe'}, function(err, item) {
            test.equal(null, err);
            test.equal('world_no_safe', item.hello);
            db.close();
        })
    }, 100);
});