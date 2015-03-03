var uploadAction = require("./upload"),
    postAction = require("./postAction"),
    regAction = require("./regAction"),
    loginAction = require("./loginAction"),
    linksAction = require("./linksAction");
exports.index =  function(app){
    app.use(function (req, res) {
        res.render("404");
    });
    regAction.reg(app);
    loginAction.login(app);
    uploadAction.upload(app);
    postAction.post(app);
    linksAction.links(app);
};
