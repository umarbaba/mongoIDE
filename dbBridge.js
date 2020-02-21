
var mongoClient = require('mongodb');


var client = null

function getAllDataBases() {
    return new Promise((resolve, reject) => {
        connect().then(db => {
            db.executeDbAdminCommand({ listDatabases: 1 }).then(dbs => {
                return resolve(dbs)
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
                    return resolve(client.db("admin"))
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
            return resolve(client.db(dbName))
        }
    })
}

module.exports = {
    connect, getAllDataBases
}