var fs = require("fs"),
    util = require('util'),
    Utils = require("./utils");;
function upload(app){
    //文件上传界面
    app.post('/upload', Utils.checkLogin);
    app.get('/upload', Utils.checkLogin);
    app.post('/upload', function (req, res) {
        for (var i in req.files) {
            if (req.files[i].size == 0){
                // 使用同步方式删除一个文件
                fs.unlinkSync(req.files[i].path);
                console.log('Successfully removed an empty file!');
            } else {
                var target_path = './public/images/' + req.files[i].name;
                // 使用同步方式重命名一个文件
                var readStream = fs.createReadStream(req.files[i].path)
                var writeStream = fs.createWriteStream(target_path);
                util.pump(readStream, writeStream, function() {
                    fs.unlinkSync(req.files[i].path);
                });
                console.log('Successfully renamed a file!');
            }
        }
        req.flash('success','文件上传成功!');
        res.redirect('/upload');
    });

    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
}

exports.upload = upload;
