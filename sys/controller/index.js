//author bh-lay

exports.deal = function (connect,app){
	//缓存机制
	app.cache.use('index_page',['html'],function(this_cache){
		connect.write('html',200,this_cache);
	},function(save_cache){
		//获取视图
		app.views('indexPage',{
			title : '后台工程师，分布式系统设计',
			keywords : '工程师,C++,golang,JavaScript',
			description : '描述'
		},function(err,html){
			save_cache(html);
		});
	});
}
