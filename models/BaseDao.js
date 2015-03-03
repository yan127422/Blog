var mongodb = require('./db');
var BSON = require('mongodb').BSONPure;
var BaseDao = function(){};
var username = process.env.BAE_ENV_AK;                 // 用户名
var password = process.env.BAE_ENV_SK;
BaseDao.prototype = {
    save:function(callback,data){
        var me = this;
        if(!data){
                 data = {};
            var hasOwn = Object.prototype.hasOwnProperty;
            for(var i in me){
                if(hasOwn.call(me,i)){
                    data[i] = me[i];
                }
            }
        }
        //打开数据库
       mongodb.open(function (err, db) {
               db.authenticate(username, password, function(err, result) {
                   if (!result) {
                       db.close();
                       return callback(err);
                   }

                //读取 posts 集合
                db.collection(me.getClassName(), function (err, collection) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                    //将文档插入 posts 集合
                    collection.insert(data, {
                        safe: true
                    }, function (err, post) {
                        mongodb.close();
                        callback(null,post[0]);
                    });
                });
               });
        });
    },
    update:function(callback,data,condition) {
        var me = this;
        if(!data){
            data = {};
            var hasOwn = Object.prototype.hasOwnProperty;
            for(var i in me){
                if(hasOwn.call(me,i)){
                    data[i] = me[i];
                }
            }
        }
        //打开数据库
        mongodb.open(function (err, db) {
                db.authenticate(username, password, function(err, result) {
                    if (!result) {
                        db.close();
                        return callback(err);
                    }

            //读取 posts 集合
            db.collection(me.getClassName(), function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //更新文章内容
                collection.update(condition,data, function (err, result) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
                });
        });
   },
    updateById:function(id,data,callback){
        var query = {
            _id:BSON.ObjectID.createFromHexString(id)
        };
        this.update(callback,data,query);
    }
};
BaseDao.findAll = function(callback,query){
    var me = this;
    //打开数据库
    mongodb.open(function(error,db){
        db.authenticate(username, password, function(err, result) {
            if (!result) {
                db.close();
                return callback(err);
            }
        db.collection(me.className,function(error,collection){
            if(error){
                mongodb.close();
                console.log(error);
                return callback(error);
            }
            var toPage = (query&&query.limit)?{
                skip:(query.page-1)*query.limit,
                limit:query.limit
            }:{};
            var condition = (query&&query.query)?query.query:{};
            //根据 query 对象查询文章
            collection.count(condition,function(error,total){
            collection.find(condition,toPage).sort({
                time: -1
            }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);//失败！返回 err
                    }
                    callback(null, docs,total);//成功！以数组形式返回查询的结果
                });
            });
        });
        });
    });
};
BaseDao.getOne = function(query,callback){
    var me = this;
    console.log("getOne.....");
    console.log(me);
    console.log("----------query------------");
    console.log(query);
    //打开数据库
    mongodb.open(function(error,db){
        db.authenticate(username, password, function(err, result) {
            if (!result) {
                db.close();
                return callback(err);
            }
        db.collection(me.className,function(error,collection){
            if(error){
                mongodb.close();
                console.log(error);
               return callback(error);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne(query,function(error,data){
                if(error){
                    return callback(error);
                }
                mongodb.close();
                callback(null,data);
            });
        });
        });
    });
};
BaseDao.getById = function(id,callback){
    var query = {
        _id:BSON.ObjectID.createFromHexString(id)
    };
     BaseDao.getOne.call(this,query,callback);
};
BaseDao.deleteById = function(id,callback){
    var query = {
        _id:BSON.ObjectID.createFromHexString(id)
    };
    var me = this;
    //打开数据库
    mongodb.open(function (err, db) {
        db.authenticate(username, password, function(err, result) {
            if (!result) {
                db.close();
                return callback(err);
            }
        //读取 posts 集合
        db.collection(me.className, function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、日期和标题查找并删除一篇文章
            collection.remove(query, function (err, result) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
        });
    });
};

exports.BaseDao = BaseDao;
exports.extend = function(subClass,superClass){
    subClass.className = __typeof__(subClass)
    var F = function(){};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();//继承父类prototype属性中的方法
    subClass.prototype.constructor = subClass;
    subClass.prototype.getClassName = function(){return subClass.className};
    subClass.superclass = superClass.prototype;
    if(superClass.prototype.constructor!=Object.prototype.constructor){
        superClass.prototype.constructor = superClass;
    }
    for(var i in superClass){
        if(!subClass[i]){
            subClass[i] = superClass[i];
        }
    }
};
function __typeof__(objClass)
{
    if ( objClass && objClass.constructor )
    {
        var strFun = objClass.toString();
        var className = strFun.substr(0, strFun.indexOf('('));
        className = className.replace('function', '');
        return className.replace(/(^\s*)|(\s*$)/ig, '');
    }
    return typeof(objClass);
}

