var mongodb = require('./db'),
    BSON = require('mongodb').BSONPure;
function Comment(postId,comment){
    this.postId = postId;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var comment = this.comment;
    var query = {
        _id:BSON.ObjectID.createFromHexString(this.postId)
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('Post', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
            collection.update(query,{
                $push: {"comments": comment}
            } , function (err, result) {
                mongodb.close();
                callback(null);
            });
        });
    });
};
