var crypto = require('crypto'),
    Utils = require("./utils"),
    User = require("../models/user");
var login = function(app){
    app.get('/login', Utils.checkNotLogin);
    app.post('/login', Utils.checkNotLogin);
    app.get('/logout', Utils.checkLogin);
    /**
     * 登录界面
     */
    app.get("/login",function(req,res){
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    /**
     * 登录post
     */
    app.post('/login', function (req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.getOne({name:req.body.name}, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login');//用户不存在则跳转到登录页
            }
            //检查密码是否一致
            if (user.password != password) {
                req.flash('error', '密码错误!');
                return res.redirect('/login');//密码错误则跳转到登录页
            }
            //用户名密码都匹配后，将用户信息存入 session
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');
        });
    });
    /**
     * 登出
     */
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');
    });
};
exports.login = login;