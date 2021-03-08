var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var settings = require('../settings');
var multer = require('multer');
var bodyParser = require('body-parser');
var axios = require("axios");
var config = require("../config")
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
let Client = require('ssh2-sftp-client');
var schedule = require('node-schedule');

var tempDir = 'public/temp/'
var tempTimestamp = ''
var fileDir = 'public/temp/temp' + tempTimestamp + '/' //改变临时目录

var upload = multer({
    dest: tempDir
});

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir)
    }
    res.render('index', {
        title: '鱼丸游戏'
    });
    console.log(fileDir)
    // delDir(fileDir)
});

router.get('/*.html', function (req, res, next) {
    res.render('index', {
        title: '鱼丸游戏'
    });
    // res.render('show', {'imageURL' : fileDir+Filename+Mime});
});

router.post('/fileUpload', upload.array('file'), async function (req, res, next) {
    // 文件保存目录
    tempTimestamp = req.body.tempTimestamp
    fileDir = 'public/temp/temp' + tempTimestamp + '/'
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir)
    }
    if (req.files == undefined) {
        res.status(406).send("err")
        return
    }
    var file = req.files[0];
    if (file == undefined) {
        res.status(406).send("err")
        return
    }
    // console.log("名称：%s",file.originalname);
    // console.log("mime：%s",file.mimetype);
    //以下代码得到文件后缀
    console.log(file);
    name = file.originalname;
    //Mime是文件的后缀
    Filename = path.parse(name).name;
    if (req.body.isBg) {
        Filename = 'bg-hs'
    } else {
        Filename = new Date().getTime()
    }
    Mime = path.parse(name).ext;
    let AllImgExt=".jpg|.jpeg|.gif|.bmp|.png|";
    if(AllImgExt.indexOf(Mime.toLowerCase()+"|")==-1){
        res.status(406).send("err")
        return
    }
    //重命名文件 加上文件后缀
    fs.renameSync(tempDir + file.filename, tempDir + file.filename + Mime);
    await copy(tempDir + file.filename + Mime, fileDir + Filename + Mime);
    response = {
        'imgUrl': fileDir + Filename + Mime
    }
    res.end(JSON.stringify(response));

    // res.render('index', {'imageURL' : fileDir+Filename+Mime});
});

router.post('/delUnusedRes', urlencodedParser, function (req, res, next) {
    let data = req.body
    let file = 'public/' + data.UnusedRes
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        res.end(JSON.stringify({
            'res': 'ok'
        }))
    } else {
        res.end(JSON.stringify({
            'err': 'file not exists'
        }))
    }
});

router.post('/modifyPage', function (req, res, next) {
    let pageName = req.body.pageName
    if (!fs.existsSync(path.join('public', pageName))) {
        res.status(404).send("err")
        return
    }
    let data = fs.readFileSync(path.join('public', pageName))
    data = data.toString()
    if(!/class="bodyContainer/.test(data)){
        res.status(406).send("err:当前页面无法修改")
        return
    }
    tempTimestamp = req.body.tempTimestamp
    fileDir = 'public/temp/temp' + tempTimestamp + '/'
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir)
    }
    let imgReg = /<img.*?(?:>|\/>)/gi;
    let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    let arr = data.match(imgReg);
    arr.forEach((v) => {
        let src = v.match(srcReg);
        if (src == null) return
        if (src[1] == '') return
        let url = 'https://' + path.posix.join('www.dafuhao-ol.com/thirdShare', src[1])
        if(url.indexOf('resource')<0) return
        let Filename = path.parse(url).name;
        let Mime = path.parse(url).ext;
        console.log(url)
        axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        }).then(function (response) {
            let r = response.data
            let w = fs.createWriteStream(fileDir + Filename + Mime)
            r.pipe(w)
            w.on('close', () => {

            })
        });
        data = data.replace(src[1], url)
    })
    let linkReg = /<link.*?(?:>|\/>)/gi;
    let hrefReg = /href=[\'\"]?([^\'\"]*)[\'\"]?/i;
    arr = data.match(linkReg);
    arr.forEach((v) => {
        let src = v.match(hrefReg);
        if (src == null) return
        if (src[1] == '') return
        let url = 'https://' + path.posix.join('www.dafuhao-ol.com/thirdShare', src[1])
        if(url.indexOf('resource')<0) return
        let Filename = path.parse(url).name;
        let Mime = path.parse(url).ext;
        console.log(url)
        axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        }).then(function (response) {
            let r = response.data
            let w = fs.createWriteStream(fileDir + Filename + Mime)
            r.pipe(w)
            w.on('close', () => {

            })
        });
        data = data.replace(src[1], url)
    })
    let scriptReg = /<script.*?(?:>|\/>)/gi;
    srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    arr = data.match(scriptReg);
    arr.forEach((v) => {
        let src = v.match(srcReg);
        if (src == null) return
        if (src[1] == '') return
        let url = 'https://' + path.posix.join('www.dafuhao-ol.com/thirdShare', src[1])
        if(url.indexOf('resource')<0) return
        let Filename = path.parse(url).name;
        let Mime = path.parse(url).ext;
        console.log(url)
        axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        }).then(function (response) {
            let r = response.data
            let w = fs.createWriteStream(fileDir + Filename + Mime)
            r.pipe(w)
            w.on('close', () => {

            })
        });
        data = data.replace(src[1], url)
    })
    data = data.replace(/allowTouchMove:true/g,'allowTouchMove:false')
    res.writeHead(200, {
        "Content-Type": "text/html;charset=UTF-8"
    });
    res.end(data)
});

router.post('/newPage', urlencodedParser, function (req, res) {
    let data = req.body
    let pageName = data.pageName
    let packageName = data.packageName == "" ? "" : data.packageName
    if (packageName != ""){
        packageName = trim(packageName)
        if (packageName.substring(0,7)=="http://" || packageName.substring(0,8)=="https://"){
            console.log(packageName)
        }else{
            packageName = "http://"+ packageName
            console.log(packageName)
        }
    }
    // let timestamp = data.timestamp;
    function checkTime(i){
        if (i<10) {
            i="0" + i
        }
        return i
    }
    let date = new Date();
    let dateY = checkTime(date.getFullYear());
    let dateM = checkTime(date.getMonth()+1);
    let dateD = checkTime(date.getDate());
    let dateh = checkTime(date.getHours());
    let datem = checkTime(date.getMinutes());
    let dates = checkTime(date.getSeconds());
    //- let datems = date.getMilliseconds();
    let timestamp = ''+dateY+dateM+dateD+'-'+dateh+datem+dates;
    let re = new RegExp("temp\/temp" + tempTimestamp, "g");
    data.htmlSource = data.htmlSource.replace(re, './resource/jjdwc-' + timestamp)
    let dafuhaoReg = /[\'\"]?(https:\/\/www\.dafuhao-ol\.com\/thirdShare([^\'\"]*))[\'\"]?/gi;
    let srcReg = /[\'\"]?(https:\/\/www\.dafuhao-ol\.com\/thirdShare([^\'\"]*))[\'\"]?/i;
    let arr = data.htmlSource.match(dafuhaoReg);
    if(arr!=null){
        arr.forEach((v) => {
            let src = v.match(srcReg);
            if (src[1] == '') return
            let url = src[1]
            let Filename = path.parse(url).name;
            let Mime = path.parse(url).ext;
            let re = new RegExp(url.replace(Filename + Mime, ''), "g");
            data.htmlSource = data.htmlSource.replace(re, './resource/jjdwc-' + timestamp + '/')
        })
    }
    const htmlDoc =
        `<!DOCTYPE html>
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=640, user-scalable=no">
    <meta name="renderer" content="webkit|ie-comp|ie-stand">
    <meta http-equiv="MSThemeCompatible" content="no">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>${data.title}</title>
    <meta name="Keywords" content="">
    <meta name="Description" content="">
    <link rel="stylesheet" href="https://cdn.bootcss.com/Swiper/4.4.6/css/swiper.min.css">
    <link rel="stylesheet" href="./resource/jjdwc-${timestamp}/style.css">
    <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdn.bootcss.com/Swiper/4.4.6/js/swiper.min.js"></script>
    <style>
      a{
        color: white;
      }
    </style>
  </head>
  <body>
    ${data.htmlSource}  
  <div class="weixin-tip" id="landing">
    <p>
        <img style="max-width: 100%; height: auto;" src="./resource/public/live_weixin.png" alt="微信打开">
    </p>
  </div>
  
  <script>
  
  //动态为根元素设置字体大小
  function init () {
    // 获取屏幕宽度
    var width = document.documentElement.clientWidth
    // 设置根元素字体大小。此时为宽的10等分
    document.documentElement.style.fontSize = width / 10 + 'px'
  }
  //首次加载应用，设置一次
  init()
  // 监听手机旋转的事件的时机，重新设置
  window.addEventListener('orientationchange', init)
  // 监听手机窗口变化，重新设置
  window.addEventListener('resize', init)
  

  var iosUrl = "${data.iosUrl}";
  var andriodUrl = "${packageName}";
  
  var isMobile = {
      Android: function () {
          return navigator.userAgent.match(/Android/i) ? true : false;
      },
      iOS: function () {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
      }
  };
  
  var u = navigator.userAgent; 
  var ua = navigator.userAgent.toLowerCase(); 
  var wxua = window.navigator.userAgent.toLowerCase();
  var isAndroid = u.match(/Android/i) ? true : false;
  var isIos = u.match(/iPhone|iPad|iPod/i) ? true : false;
  var landing = document.getElementById('landing');

  $(function () {
      $('.bodyFixed').each(function(){
        if($(this).hasClass('download_btn')){
          $(this).prop('outerHTML', '<div style="position:fixed;top:0;width:100%;z-index:100;">'+$(this).prop('outerHTML')+'</div>');
        }else{
          $(this).prop('outerHTML', '<div style="position:fixed;top:0;width:100%;z-index:20;">'+$(this).prop('outerHTML')+'</div>');
        }
      })
      //下载按钮事件绑定
      $('.down_url').click(function (e) {
          e.preventDefault();
          setTimeout(function () {
              DownLoad();
          }, 500) 
      });
  
      function DownLoad() {
          if(wxua.match(/microMessenger/i)=='micromessenger'){
              landing.style.display="block";
              if (isIos) {
                  window.location.href = iosUrl;
                  landing.style.display="none";
                  console.log(iosUrl);
              }
              else {
                  window.location.href = andriodUrl;
              }
          }else{
              if (isIos) {
                  window.location.href = iosUrl;
                  console.log(iosUrl);
              }
              else {
                  window.location.href = andriodUrl;
              }
          }
      }   
  
      landing.onclick = function(){
          landing.style.display = 'none';
      }
  
  })
  </script>
  </body>
  </html>`;
    let content = htmlDoc
    fs.stat('public/' + pageName, function (err, stat) {
        if (req.body.overwrite || !(stat && stat.isFile())) {
            fs.writeFile('public/' + pageName, content, async function (err) {
                if (err) {
                    res.end(JSON.stringify({
                        'err': 'File written failed'
                    }))
                    return console.log(err);
                }
                res.end(JSON.stringify({
                    'res': 'ok'
                }))
                if (!fs.existsSync('export/resource/jjdwc-' + timestamp)) {
                    fs.mkdirSync('export/resource/jjdwc-' + timestamp)
                }
                await copyDir(fileDir, 'export/resource/jjdwc-' + timestamp)
                await copyDir('public/baseRes', 'export/resource/jjdwc-' + timestamp)
                await copy('public/' + pageName, 'export/' + pageName)
                mkdir2Server('resource/jjdwc-'+timestamp,function(){
                    put2Server('export/'+pageName,pageName,function(){
                    freshCDN('http://www.dafuhao-ol.com/thirdShare/' + pageName)
                    })
                    uploadResDir('export/resource/jjdwc-'+timestamp)
                })

                function uploadResDir(path) {
                    let files = [];
                    if (fs.existsSync(path)) {
                        files = fs.readdirSync(path);
                        asyncForEach( files , async (file, index) => {
                            await sleep(1000)
                            let curPath = path + "/" + file;
                            fs.stat(curPath, function (err, stat) {
                                if (err) {
                                    callback(err);
                                } else {
                                    if (stat.isFile()) {
                                        put2Server(curPath, curPath.replace(/export\//, ""),function(){
                                            console.log(index)
                                        })
                                    } else if (stat.isDirectory()) {
                                        uploadResDir(curPath)
                                    }
                                }
                            })
                        })
                    };
                }
            });

        } else {
            res.end(JSON.stringify({
                'err': 'File creation failed'
            }))
            console.log(JSON.stringify({
                'err': 'File creation failed'
            }));
        }
    });
});

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function copy(src, dst) {
    return new Promise((resolve, reject) => {
        let r = fs.createReadStream(src)
        let w = fs.createWriteStream(dst)
        r.pipe(w)
        w.on('close', () => {
            resolve(true)
        })
    })
}

async function copyDir(src, dist) {
    return new Promise((resolve, reject)=>{
        fs.access(dist, async function (err) {
            if (err) {
                // 目录不存在时创建目录
                fs.mkdirSync(dist);
            }
            await _copy(null, src, dist);
            resolve(true);
        })
    })

    async function _copy(err, src, dist) {
        if (err) {
            
        } else {
            let paths = fs.readdirSync(src)
            for(let path of paths){
            // paths.forEach(function (path) {
                var _src = src + '/' + path;
                var _dist = dist + '/' + path;
                let stat = fs.statSync(_src)
                // 判断是文件还是目录
                if (stat.isFile()) {
                    await copy(_src, _dist)
                } else if (stat.isDirectory()) {
                    // 当是目录是，递归复制
                    await copyDir(_src, _dist)
                }
            }
        }
    }

}

function delInDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.existsSync(curPath)) {
                console.log(curPath)
                try {
                    if (fs.statSync(curPath).isDirectory()) {
                        delInDir(curPath); //递归删除文件夹
                    } else {
                        fs.unlinkSync(curPath); //删除文件
                    }
                } catch (error) {
                    console.log(error.errno)
                }
            }
        });
        if(path != 'public/temp'){
            fs.rmdirSync(path);
        }
    }
}

var j = schedule.scheduleJob('30 1 1 * * *', function () {
    delInDir('public/temp')
});


function put2Server(localPath, romotePath, callbackFn) {
    let sftp = new Client();
    sftp.on('end', callbackFn)
    sftp.connect({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password
    }).then(() => {
        return sftp.put(localPath, romotePath);
    }).then(() => {
        console.log(romotePath + ' upload success');
    }).then(() => {
        sftp.end()
    }).catch((err) => {
        console.log(err, romotePath + ' upload error!!!');
    });
}

function mkdir2Server(romotePath, callbackFn) {
    let sftp = new Client();
    sftp.on('end', callbackFn)
    sftp.connect({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password
    }).then(() => {
        return sftp.mkdir(romotePath);
    }).then(() => {
        console.log(romotePath + ' mkdir success');
    }).then(() => {
        sftp.end()
    }).catch((err) => {
        console.log(err, 'mkdir error');
    });
}

function freshCDN(file) {
    axios({
        method: 'post',
        url: 'http://116.62.22.75:3010/cdn/refreshObjectCaches',
        data: {
            objectPath: file,
            objectType: 'File',
            authcode: config.authcode
        }
    }).then(function (res) {
        console.log(res.data)
    });
}

function trim(str){   
    return str.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'');   
}

module.exports = router;