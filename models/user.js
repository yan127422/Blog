var mongodb = require("./db"),
    base = require("./BaseDao");
function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.head = user.head;
}
base.extend(User,base.BaseDao);
module.exports = User;

