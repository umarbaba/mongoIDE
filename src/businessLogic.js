const dbBridge = require('./dbBridge')

function getInitData() {
    return new Promise((resolve, reject) => {

        dbBridge.getAllDataBases().then(dbs => {
            console.log("Got the dbs")
            getCollectionsOfAllDBS(dbs).then(dbsWithCollections => {
                
                getServerStatus().then(serverStatus=>{
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

module.exports = {
    getInitData,getDbDetails
}