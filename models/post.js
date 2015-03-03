var mongodb = require('./db'),
    base = require("./BaseDao");

function Post(name, title, post,tags,head) {
    this.name = name;
    this.head = head||"";
    this.title= title;
    this.post = post;
    this.tags = tags;
}
base.extend(Post,base.BaseDao);
Post.prototype.save = function(callback){
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //要存入数据库的文档
    var post = {
        name: this.name,//作者
        head:this.head,//头像
        time: time,
        title: this.title,//标题
        post: this.post,//文章
        tags:this.tags,//标签
        comments:[],//留言
        pv:0
    };
   Post.superclass.save.call(this,callback,post);
};
//返回所有标签
Post.getTags = function(callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('Post', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //distinct 用来找出给定键的所有不同值
            collection.distinct("tags.tag", function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

module.exports = Post;
