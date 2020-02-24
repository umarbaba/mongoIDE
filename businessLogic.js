const dbBridge = require('./dbBridge')

function getAllDBSWithCollection() {
    return new Promise((resolve, reject) => {

        dbBridge.getAllDataBases().then(dbs => {
            console.log("Got the dbs")
            getCollectionsOfAllDBS(dbs).then(dbsWithCollections => {
                resolve(dbsWithCollections)
            })
        })
    })

}

function getCollectionsOfAllDBS(dbs) {
    return new Promise((resolve, reject) => {
        let dbsWithCollections = []
        dbs.databases.forEach(db => {
            dbsWithCollections.push(getCollections(db["name"]));
        })
        Promise.all(dbsWithCollections).then(result=>{
            resolve(result)
        })
       
    })
}
function getCollections(dbName) {
    return new Promise((resolve, reject) => {
        dbBridge.getCollections(dbName).then(collections => {
            resolve({dbName,collections})
        })
    })
}

module.exports = {
    getAllDBSWithCollection
}