var crypto = require('crypto'),//crypto 是 Node.js 的一个核心模块，我们后面用它生成散列值来加密密码。
    Utils = require("./utils"),
    User = require("../models/user");
var reg = function(app){
    app.get('/reg', Utils.checkNotLogin);
    app.post('/reg', Utils.checkNotLogin);
    /**
     * 注册界面
     */
    app.get("/reg",function(req,res){
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    /**
     * 注册
     */
    app.post("/reg",function(req,res){
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body["password-repeat"];
        console.log(password_re);
        if(password_re!=password){
            req.flash("error","两次密码不一致");
            return res.redirect("/reg");
        }
        //MD5加密
        var md5 = crypto.createHash("md5"),
            md52 = crypto.createHash("md5"),
            password = md5.update(req.body.password).digest("hex"),
            email_MD5 = md52.update(req.body.email.toLowerCase()).digest('hex'),
            head = "https://secure.gravatar.com/avatar/" + email_MD5 + "?s=48";
        var newUser = new User({
            name:req.body.name,
            password:password,
            email:req.body.email,
            head:head
        });
        //检查用户名是否存在
        User.getOne({name:newUser.name},function(err,user){
            if(user){
                req.flash("error",user);
                return res.redirect("/reg");
            }
            newUser.save(function(err,user){
                if(err){
                    req.flash("error",err);
                    return res.redirect("/reg");
                }
                req.session.user = user;//用户信息存入session
                req.flash("success","注册成功！");
                res.redirect("/");
            });
        });
    });
};
exports.reg = reg;