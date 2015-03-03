//去html标签
function delHtmlTag(str,length){
    var title = str.replace(/<[^>]+>/g,"");//去掉所有的html标记
    if(title.length > length) {
        title = title.substring(0,length)+" ...";
    }
    return title;
}
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录!');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        res.redirect('back');
    }
    next();
}
exports.delHtmlTag = delHtmlTag;
exports.checkLogin = checkLogin;
exports.checkNotLogin = checkNotLogin;