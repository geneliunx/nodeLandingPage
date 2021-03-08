let Client = require('ssh2-sftp-client');
var fs = require('fs');
var os = require('os');
var path = require('path');
var config = require('./config');

var idata = [];

function get(sftp, name) {
    console.log(path.join('./', name))
    sftp.fastGet(path.join('./', name), path.join('public', name), function (err) {
        if (idata.length !== 0) {
            return get(sftp, idata.pop())
        } else {
            sftp.end()
        }
    })
}

function listhtml() {
    var sftp = new Client();
    sftp.connect({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password
    }).then(() => {
        return sftp.list('./');
    }).then((data) => {
        data.forEach((v) => {
            if (v.type == 'd') return
            if (v.name.substr(v.name.lastIndexOf(".")) == '.html' || v.name.substr(v.name.lastIndexOf(".")) == '.htm') {
                idata.push(v.name)
            }
        })
    }).then(() => {
        if (idata.length !== 0) {
            get(sftp, idata.pop())
        } else {
            sftp.end()
        }
    }).catch((err) => {
        console.log(err, 'catch error');
    });


}

listhtml();