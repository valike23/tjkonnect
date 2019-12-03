(function () {
    var app = angular.module('app', []);
    



    var apis = [
        {
        "name": "Login",
        "status": "public",
        "description": "",
        "input": ['username *','password *'],
        "outputs": [{
            "name" : "success",
            "status": 200,
            "data": ['firstname', 'lastname','phone','email','country', 'state', 'username']
        }, {
                "name": "error",
                "status": 503,
                "data": ['the server ran into some problem... We are aware and are working on it please try again later.']
            }]

        },
        {
            "name": "Register",
            "status": "public",
            "description": "",
            "input": ['firstname *', 'lastname *','username *', 'phone', 'email *', 'country *', 'state *'],
            "outputs": [{
                "name": "success",
                "status": 200,
                "data": ['firstname', 'lastname', 'phone', 'email', 'country', 'state']
            }, {
                "name": "error",
                "status": 503,
                "data": ['the server ran into some problem... We are aware and are working on it please try again later.']
            }]

        }
    ]
})()