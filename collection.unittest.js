global.ROOT_DIR = process.cwd() || __dirname;

var expect = require("chai").expect;
var assert = require("chai").assert;
var MemoCache = require(ROOT_DIR + "/rocks/memocache/memocache");
var MemoDB = require(ROOT_DIR + "/rocks/memodb");
var MediaDB = require(ROOT_DIR + "/rocks/mediaext/media");
var CollectionDB = require(ROOT_DIR + "/rocks/mediaext/collection");

describe("unit.collectiondb", function() {
    var mcache;
    var mediadb;
    var collectiondb;

    before(function() {
        mcache = new MemoCache({maxSize:5000});
        mediadb = new MediaDB({mcache:mcache, memopath:ROOT_DIR + "/test/media"});
        collectiondb = new CollectionDB(mediadb, {mcache:mcache, memopath:ROOT_DIR + "/test/album"});
    });

    after(function() { delete(mcache); });

    describe("scrapTargets", function() {
        beforeEach(function(done) {
            Promise.all([
                mediadb.removeAll(),
                collectiondb.removeAll()
            ])
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            Promise.all([
                mediadb.removeAll(),
                collectiondb.removeAll()
            ])
            .then(function() { done(); })
            .catch(done); 
        });

        it("must read targets from a path", function(done) {
            collectiondb.scrapTargets(__dirname + "/test/")
            .then(function(newcollections) {
                expect(newcollections).to.be.ok;
                expect(newcollections.length).to.be.equal(3)
                done();
            })
            .catch(done);
        });
    });

    describe("scrapAlbum", function() {
        beforeEach(function(done) {
            Promise.all([
                mediadb.removeAll(),
                collectiondb.removeAll()
            ])
            .then(function() {
                collectiondb.scrapTargets(__dirname + "/test/")
                .then(function(collections) { done(); })
                .catch(done);
            })
            .catch(done);
        });

        afterEach(function(done) { 
            Promise.all([
                mediadb.removeAll(),
                collectiondb.removeAll()
            ])
            .then(function() { done(); })
            .catch(done);
        });

        it("must get an error because the parameter is not a saved collection", function(done) {
            collectiondb.scrapAlbum("noncollection")
            .then(function(collection) {
                done(new Error("should not pass here, because the scrap have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoDB.ERROR.NOTFOUND);
                done();
            })
            .catch(done);
        });

        it("must return a collections with empty array of medias because there isn't a master folder inside of album", function(done) {
            collectiondb.scrapAlbum("media-nomaster")
            .then(function(collection) {
                expect(collection).to.be.ok;
                expect(collection.contentlist).to.be.ok;
                expect(collection.contentlist.length).to.be.equal(0);
                done();
            })
            .catch(done);
        });

        it("must get an empty array of medias because there is no medias into the master folder of the album", function(done) {
            collectiondb.scrapAlbum("media-empty")
            .then(function(collection) {
                expect(collection).to.be.ok;
                expect(collection.contentlist).to.be.ok;
                expect(collection.contentlist.length).to.be.equal(0);
                done();
            })
            .catch(done);
        });

        it("must get an array of medias readed from the folder images/web", function(done) {
            collectiondb.scrapAlbum("images")
            .then(function(collection) {
                expect(collection).to.be.ok;
                expect(collection.contentlist).to.be.ok;
                expect(collection.contentlist.length).to.be.equal(6);
                done();
            })
            .catch(done);
        });
    });
});