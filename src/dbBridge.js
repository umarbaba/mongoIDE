
var mongoClient = require('mongodb');
var client = null

let connectionDetails = null;


function getAllDataBases() {
    return new Promise((resolve, reject) => {
        executeDbAdminCommand({ listDatabases: 1 }).then(dbs => {
            return resolve(dbs)
        })
    })
}

function getCollections(database) {
    return new Promise((resolve, reject) => {
        connect().then(client => {
            client.db(database).collections({ listCollections: 1.0 }).then(collections => {
                return resolve(collections)
            })
        })
    })
}

function getDbStats(dbName) {
    return new Promise((resolve, reject) => {
        connect().then(client => {
            client.db(dbName).stats().then(stats => {
                return resolve(stats)
            })
        })
    })
}


function executeQuery(dbName, query) {
    return new Promise((resolve, reject) => {
        connect().then(client => {
            db = client.db(dbName);
            let evalResult = eval(query)
            getArray(evalResult).then(result => {
                return resolve(result)
            }).catch(err => {
                return resolve(evalResult)
            })
        }).catch(error=>{
            return reject(error.message)
        })

    })
}

function executeDbAdminCommand(query, dbName = 'admin') {
    return new Promise((resolve, reject) => {
        connect().then(client => {
            client.db(dbName).executeDbAdminCommand(query).then(result => {
                return resolve(result)
            })
        })

    })
}

function getCollectionData(dbName, collectionName, query = {}, projection = undefined) {
    return new Promise((resolve, reject) => {
        connect().then(client => {
            let result = client.db(dbName).collection(collectionName).find(query, { _id: {$toString: "$_id"}});
            if (projection != undefined) {
                result = result.project(projection)
            }
            getArray(result).then(result => {
                return resolve(result)
            }).catch(err => {
                return reject(err)
            })

        })
    })
}

function getArray(iterator) {
    return new Promise((resolve, reject) => {
        iterator.toArray((err, res) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(res);
            }
        })
    })
}

function connect() {
    return new Promise(async (resolve, reject) => {

        if (client == null && connectionDetails != null) {
            host = connectionDetails.host;
            port = connectionDetails.port;

            for (let i = 0; i < 1; i++) {
                try {
                    console.log('Initiating DB connection....')
                    client = await mongoClient.connect(`mongodb://${host}:${port}`, {
                        useUnifiedTopology: true,
                        socketTimeoutMS: 5 * 1000,
                        connectTimeoutMS: 5 * 1000
                    });
                    console.log('DB Connected!')
                    return resolve(client)
                }
                catch (e) {
                    client = null;
                    if ((i + 1) < 5) {
                        console.log(`Retrying Again`);
                        continue;
                    } else {
                        return reject(null)
                    }
                }
            }
        }
        else {
            return resolve(client)
        }
    })
}

function setConnectDetails(conDetails) {
    connectionDetails = conDetails;
}

module.exports = {
    connect,
    getAllDataBases,
    getCollections,
    executeDbAdminCommand,
    getDbStats,
    setConnectDetails,
    getCollectionData,
    executeQuery
}