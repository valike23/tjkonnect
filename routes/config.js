let config = {
    localDB: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'tjconnect'
    },
    dbfree: {
        host: 'db4free.net',
        user: 'ego_bank',
        password: 'ludboyar',
        database: 'ego_bank'
    },
    remote: {

    },
    cloudinary: {
        cloud_name: 'tjconnect',
        api_key: '556459332373436',
        api_secret: '-vfzmuQdlkLrB1rdqR5hTAf5wJg'
    },
    mongo: {
        uri : "mongodb+srv://tjconnect:vanita2018_@cluster0-rrnxg.mongodb.net/test?retryWrites=true&w=majority"
    },
    duration: 1440
};


module.exports = config;