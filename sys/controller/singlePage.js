exports.render = function (connect,app){
	
	//缓存机制
	app.cache.use('singlePage',['html','comment','links'],function(this_cache){
		connect.write('html',200,this_cache);
	},function(save_cache){
    //获取单页面视图
    app.views('singlePage',{
      title : '我的博客_月泉的个人博客',
      keywords : '后台开发工程师，分布式，c/c++，Java，Golang',
      description : '月泉'
    },function(err,html){
      save_cache(html);
    });
	});
};
