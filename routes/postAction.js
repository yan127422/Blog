var Post = require("../models/post"),
     Comment = require("../models/Comment"),
     Utils = require("./utils"),
     crypto = require('crypto');

var post = function(app){

    app.get('/post', Utils.checkLogin);
    app.get('/', function (req, res) {
        var page = (req.query&&req.query.p) ? parseInt(req.query.p) : 1;
        var limit = 5;
        Post.findAll(function (err, posts,total) {
            if (err) {
                posts = [];
            }
            for(var i= 0,len=posts.length;i<len;i++){
                var post = posts[i].post+"";
                posts[i].post = Utils.delHtmlTag(post,100);
            }
            console.log(req.session.user);
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1)*limit + posts.length) == total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        },{
            page:page,
            limit:limit
        });
    });
    app.get("/u",function(req,res){
        Post.getById(req.query.id
            ,function(error,data){
                if(error){
                    req.flash("error",error);
                    res.redirect("/");
                }
                new Post().updateById(req.query.id,{$inc:{"pv":1}},function(error){});
                res.render("article",{
                    title:data?data.title:"文章未找到",
                    post:data,
                    user:req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
    });
    app.get("/u/:name",function(req,res){

            var page = (req.query&&req.query.p) ? parseInt(req.query.p) : 1;
            var limit = 5;
            Post.findAll(function (err, posts,total) {
                if (err) {
                    posts = [];
                }
                for(var i= 0,len=posts.length;i<len;i++){
                    var post = posts[i].post;
                    posts[i].post = Utils.delHtmlTag(post,100);
                }
                res.render('index', {
                    title: '主页',
                    user: req.session.user,
                    posts: posts,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1)*limit + posts.length) == total,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            },{
                page:page,
                limit:limit,
                query:{
                    name:req.params.name
                }
            });
    });

    app.get("/post",function(req,res){
        res.render('post', {
            title: '文章发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    /**
     * 新增文章
     */
    app.post("/post",function(req,res){
        var currentUser = req.session.user,
            tags = [{"tag":req.body.tag1},{"tag":req.body.tag2},{"tag":req.body.tag3}],
            post = new Post(currentUser.name, req.body.title, req.body.post,tags,req.session.user.head);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');
        });
    });
    /**
     * 编辑文章界面
     */
    app.get('/edit/:id', function (req, res) {
        var currentUser = req.session.user;
        Post.getById(req.params.id,function(error,data){
            if(error){
                req.flash('error', err);
                return res.redirect('/');
            }
            if(data&&
                (data.name==currentUser.name)){
                res.render('edit', {
                    title: '编辑文章',
                    user: req.session.user,
                    post:data,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            }else{
                req.flash('error', "没有权限");
                return res.redirect('/');
            }
        });
    });

    /**
     * 修改文章
     */
    app.post("/edit/:id",function(req,res){
        var tags = [{"tag":req.body.tag1},{"tag":req.body.tag2},{"tag":req.body.tag3}];
        var data = {
            title: req.body.title,
            post:req.body.post,
            tags:tags,
            head:req.session.user.head
        };
        var id = req.params.id;
        new Post().updateById(id,{$set:data},function(error){
            if(error){
                req.flash('error', err);
                return res.redirect('/');
            }
            res.redirect("/u?id="+id);
        });
    });
    /**
     * 删除文章
     */
    app.get("/remove/:id",function(req,res){
        var id = req.params.id;
        Post.deleteById(id,function(error){
            if(error){
                req.flash("error",error);
                return res.redirect('/');
            }
            req.flash("success","删除成功");
            res.redirect("/");
        });
    });

    /**
     * 留言
     */
    app.post("/u",function(req,res){
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        var md5 = crypto.createHash('md5'),
            email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
            head = "https://secure.gravatar.com/avatar/" + email_MD5 + "?s=48";
        var user = req.session.user||{};
        var comment = {
            name: user.name||req.body.name||req.connection.remoteAddress,
            email: user.email||req.body.email,
            head: head,
            time: time,
            ipAddress:getClientIp(req),
            content: req.body.content
        };
        new Comment(req.query.id,comment).save(function(error){
            if(error){
                req.flash("error",error);
                return res.redirect("/");
            }
            req.flash("success","留言成功");
            res.redirect("back");
        });
    });
    /**
     * 标签
     */
    app.get("/tags",function(req,res){
        Post.getTags(function(err,data){
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('tags', {
                title: '标签',
                tags: data,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.get("/tags/:tag",function(req,res){
        Post.findAll(function(err,data){
            if (err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                posts: data,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        },{query:{"tags.tag":req.params.tag}});
    });
    /**
     * 关键子查询
     */
    app.get('/search', function (req, res) {
        var keyword = req.query.keyword;
        Post.findAll(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('search', {
                title: "SEARCH:" + req.query.keyword,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        },{query:{
            "title":new RegExp("^.*" + keyword + ".*$", "i")
        }});
    });
};
function getClientIp(req) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for'); 
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return req.get['x-real-ip'];
};
exports.post = post;

