/*
 * @author bh-lay
 * view url : /blog    /blog/
 */


var utils = require('../core/utils/index.js');
var mongo = require('../core/DB.js');
var showdown = require('../lib/showdown/showdown.js');

function getDetail(id,callback){
  var method = mongo.start();
  method.open({
    collection_name: 'article'
  },function(err,collection){
    if(err){
      callback && callback(err);
      return;
    }

    collection.find({
        'id' : id
    }).toArray(function(err, docs) {
      method.close();
      if(arguments[1].length==0){
        callback && callback('哇塞，貌似这篇博文不存在哦!');
      }else{
        docs[0].time_show = utils.parse.time(docs[0].time_show ,'{y}-{m}-{d}');

        var converter = new showdown.converter();
        docs[0].content = converter.makeHtml(docs[0].content);
        callback&&callback(null,docs[0]);
      }
    });
  });
}

function getList(app,param,callback){
  var method = mongo.start();
  var param = param || {},
      skip = param.skip || 0,
      limit = param.limit || 10,
      findKeys = {};

  //过滤标签
  if(param.tag){
      findKeys.tags = param.tag;
  }
  method.open({
    collection_name: 'article'
  },function(err,collection){
    if(err){
      callback && callback(err);
      return;
    }
    collection.count(findKeys , function(err,count){
      collection.find(findKeys , {
          limit:limit
      }).sort({
        id:-1
      }).skip(skip).toArray(function(err, docs) {
        method.close();
        for(var i in docs){
          docs[i].time_show = utils.parse.time(docs[i].time_show ,'{y}年-{m}月-{d}日');
          docs[i].cover = (docs[i].cover && docs[i].cover[0] == '/') ? app.config.frontEnd.img_domain + docs[i].cover : docs[i].cover;
        }
        callback && callback(null,docs,{
          count : count,
          skip : skip,
          limit : limit
        });
      });
    });
  });
};
exports.list = function (connect,app){
	
  var data = connect.url.search;
  var page = data.page || 1,
      tag = data.tag ? data.tag : null;
  
  var cache_name = 'blog_list_' + page + '_' + (tag ? tag : '');
  app.cache.use(cache_name,['html'],function(this_cache){
    //do something with this_cache
    connect.write('html',200,this_cache);
  },function(save_cache){
    //if none of cache,do this Fn
    getList(app,{
      skip : (page-1) * 10,
      limit: 10,
      tag: tag
    },function(err,list,data){
      if(err){
        app.views('system/mongoFail',{},function(err,html){
          connect.write('html',500,html);
        });
        return;
      }
      var page_html = app.utils.pagination({
          list_count : data.count,
          page_list_num: data.limit,
          page_cur: page,
          max_page_btn: 10,
          base_url : '/blog?page={num}' + (tag ? ('&tag=' + tag) : '')
      });
      //获取视图
      app.views('blogList',{
        title : '我的博客_月泉的个人博客',
        keywords : '后台开发工程师，c/c++, Java, Golang',
        description : '分享生活，分享技术',
        list : list,
        pagination : page_html
      },function(err,html){
          save_cache(html);
      });
    });
  });
};

exports.detail = function (connect,app,id){
  app.cache.use('blog_id_' + id,['html'],function(this_cache){
    connect.write('html',200,this_cache);
  },function(save_cache){
    getDetail(id,function(err,data){
      if(err){
        connect.write('notFound','404');
        return;
      }
      //获取视图
      app.views('blogDetail',{
        id : id,
        title : data.title,
        keywords : data.tags,
        description : data.intro,
        time_show : data.time_show,
        author : data.author || '剧中人',
        cover : data.cover,
        tags : data.tags,
        content : data.content
      },function(err,html){
        save_cache(html);
      });
    });
  });
};
