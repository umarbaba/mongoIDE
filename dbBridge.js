
var mongoClient = require('mongodb');


var client = null

function getAllDataBases() {
    return new Promise((resolve, reject) => {
        connect().then(client => {
            client.db("admin").executeDbAdminCommand({ listDatabases: 1 }).then(dbs => {
                return resolve(dbs)
            })
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
function connect() {
    return new Promise(async (resolve, reject) => {

        if (client == null) {
            host = "localhost";
            port = "27017";

            for (let i = 0; i < 5; i++) {
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

module.exports = {
    connect, getAllDataBases, getCollections
}