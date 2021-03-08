var path = require('path');

var debug = true;

module.exports = {
    tempDir: path.resolve(__dirname,  './public/temp/'),
    fileDir: path.resolve(__dirname,  './public/test/'),
    defaultHtmlPath: path.resolve(__dirname,  './public/upload/html/default.htm'),
    default2018HtmlPath: path.resolve(__dirname,  './public/upload/html/default2018.htm'),
    htmlDir: debug ? path.resolve(__dirname,  './public/upload/html')+'/' : '/mnt/soft/apache-tomcat/webapps/thirdShare/',
    picDir: debug ? path.resolve(__dirname,  './public/upload/pic')+'/' : '/mnt/soft/apache-tomcat/webapps/thirdShare/resource/',
    apkDir: debug ? path.resolve(__dirname,  './public/upload/apk')+'/'  : '/mnt/soft/apache-tomcat/webapps/GameBusiness/dfhapk/',
};

