var PouchDB = require('pouchdb-node');
PouchDB.plugin(require('pouchdb-find'));
var db = new PouchDB('_storage');

function addNewConnection(conObj) {
    return new Promise((resolve, reject) => {
        var connObj = {
            _id: new Date().toISOString(),
            name: conObj.name,
            host: conObj.host,
            port: conObj.port,
            type: 'CONN_OBJ'
        };
        db.put(connObj, function callback(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve()
            }

        });
    })

}

function getAllConnections() {
    /*   db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
          console.log(doc)
          //  redrawTodosUI(doc.rows);
      }); */
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'CONN_OBJ' }
        }).then(function (result) {
            resolve(result.docs)
        }).catch(function (err) {
            reject(err);
        });
    })
}




module.exports = {
    addNewConnection, getAllConnections
}