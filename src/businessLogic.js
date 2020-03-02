const dbBridge = require('./dbBridge')

function getInitData() {
    return new Promise((resolve, reject) => {

        dbBridge.getAllDataBases().then(dbs => {
            console.log("Got the dbs")
            getCollectionsOfAllDBS(dbs).then(dbsWithCollections => {

                getServerStatus().then(serverStatus => {
                    resolve({
                        dbsWithCollections,
                        serverStatus
                    });
                })
            })
        })


    })
}

function getServerStatus() {
    return new Promise((resolve, reject) => {
        dbBridge.executeDbAdminCommand({
            serverStatus: 1
        }).then(serverStatus => {
            resolve(serverStatus)
        }).catch(err => {
            throw new Error(err)
        })
    });
}

function getDbDetails(dbName) {
    return new Promise((resolve, reject) => {
        dbBridge.getDbStats(dbName).then(dbStats => {
            resolve(dbStats)
        }).catch(err => {
            throw new Error(err)
        })
    });
}


function getCollectionsOfAllDBS(dbs) {
    return new Promise((resolve, reject) => {
        let dbsWithCollections = []
        dbs.databases.forEach(db => {
            dbsWithCollections.push(getCollections(db["name"]));
        })
        Promise.all(dbsWithCollections).then(result => {
            resolve(result)
        })

    })
}
function getCollections(dbName) {
    return new Promise((resolve, reject) => {
        dbBridge.getCollections(dbName).then(collections => {
            resolve({ dbName, collections })
        })
    })
}

function getCollectionData(node) {
    return new Promise((resolve, reject) => {
        let dbName = node.dbName
        let collectionName = node.name;
        dbBridge.getCollectionData(dbName, collectionName).then(collectionData => {
            resolve(collectionData)
        })
    })
}

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        let currentdb = query.currentdb
        dbBridge.executeQuery(currentdb,query.query).then(result => {
            resolve({currentdb,result})
        }).catch(err=>{
            reject(err)
        })
    })
}

module.exports = {
    getInitData, getDbDetails, getCollectionData, executeQuery
}