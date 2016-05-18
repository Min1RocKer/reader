          	//js闭包封装
        	//数据本地存储
        	//事件绑定
        	//通用方法封装
           (function(){


           		var Util = (function(){


	           			var prefix = "html5_reader_";
	           			var StorageGetter = function(key){
	           				return localStorage.getItem(prefix+key);
	           			}
	           			var StorageSetter = function(key,value){
	           				return localStorage.setItem(prefix+key,value);
	           			}
	           			var getJSONP = function(address,callback){
	           				$.jsonp({
	           					url:address,
	           					cache:true,
	           					callback:"duokan_fiction_chapter",
	           					success:function(result){
	           						var data = $.base64.decode(result);
	           						var json = decodeURIComponent(escape(data));
	           						callback(json);
	           					}
	           				});
	           			}
	           			return {
	           				//将方法暴露出来 JSON格式数据
	           				getJSONP:getJSONP,
	           				StorageGetter:StorageGetter,
	           				StorageSetter:StorageSetter
	           			}


           		})();

           		//将常用的对象 提前声明 后面直接获取 不需要再用$选择器
                var Dom = {
           			top_nav:$("#top_nav"),
           			bottom_nav:$("#bottom_nav"),
           			bottom_font:$("#bottom_font"),
           			icon_2:$("#icon_2"),
           			icon_3:$("#icon_3"),
           			day:$("#day")
           		}
           		var reader;
           		var UIReader;
           		var Win = $(window);
           		var content = $("body");
           		var ReaderRoot = $("#fiction-chapter-content");
           		var initialFont = Util.StorageGetter("font_size");//调试器中resource可以查看本地存储数据   可以删除历史数据
           		initialFont = parseInt(initialFont);//将font-size的值强制转换为整数  避免出面将其判断为字符串而出错
           		if(!initialFont){
           	        initialFont = 14;
                }
                ReaderRoot.css("font-size",initialFont);
                var initialBgcolor = Util.StorageGetter("background-color");
                if(!initialBgcolor){
                	initialBgcolor = "#e9dfc7";
                }
                content.css("background-color",initialBgcolor);
                var initialDay = Util.StorageGetter("day");
                if(!initialDay){
                	initialDay = "白天";
                }
           		Dom.day.text(initialDay);
           		var icon_3_class = Util.StorageGetter("icon_3_class");
           		if(!icon_3_class){
           			icon_3_class = "icon_3_active";
           		}
           		Dom.icon_3.addClass(icon_3_class);
                


	           	//整个项目的入口函数
	            function main(){
	            	reader = ReaderModel();
	            	UIReader = ReaderBaseFrame(ReaderRoot);
	           		reader.init(function(data){
	           			UIReader(data);
	           		});
	           		EventHanlder();
	           		
	            }

	            //实现和阅读器相关的数据交互
	            function ReaderModel(){
	            	//获取小说章节信息
	            	var Chapter_id = Util.StorageGetter("Chapter_id");
	            	
					function init(callback){
						getFictionInfo(function(){
							getCurChapterInfo(Chapter_id,function(data){
								//数据渲染
								callback&&callback(data);
							});
						});
					}
	            	var getFictionInfo = function(callback){
	            		$.get("data/chapter.json",function(fictionInfo){
	            			if(Chapter_id==null){
	            				Chapter_id = fictionInfo.chapters[1].chapter_id;
	            			}
	            		 	callback&&callback();
	            		},"json");
	            	}
	            	var getCurChapterInfo = function(chapter_id,callback){
	            		$.get("data/data"+chapter_id+".json",function(chapterInfo){
	            			//处理章节信息
	            			if(chapterInfo.result == 0){
	            				//数据返回成功
	            				var chapterAdrr = chapterInfo.jsonp;//获取章节正文访问地址
	            				//解码
	            				Util.getJSONP(chapterAdrr,function(data){
	            					callback&&callback(data);
	            				});
	            			}
	            		},'json');
	            	}
	            	var prevChapter = function(UIcallback){
	            		Chapter_id = parseInt(Chapter_id,10);
	            		if(Chapter_id==0){
	            			return;
	            		}
	            		Chapter_id = Chapter_id-1;
	            		Util.StorageSetter("Chapter_id",Chapter_id);
	            		getCurChapterInfo(Chapter_id,UIcallback);

	            	}
	            	var nextChapter = function(UIcallback){
	            		Chapter_id = parseInt(Chapter_id,10);
	            		if(Chapter_id==4){
	            			return;
	            		}
	            		Chapter_id = Chapter_id+1;
	            		Util.StorageSetter("Chapter_id",Chapter_id);
	            		getCurChapterInfo(Chapter_id,UIcallback);
	            	}
	            	return {
	            		init:init,
	            		prevChapter:prevChapter,
	            		nextChapter:nextChapter
	            	}

				}

	           //渲染基本的UI结构
	           function ReaderBaseFrame(container){
	           		function parseChapterData(jsonData){
	           			var jsonObj = JSON.parse(jsonData);
	           			var html = "<h4>"+jsonObj.t+"</h4>";
	           			for(var i=0; i<jsonObj.p.length; i++){
	           				html +="<p>"+jsonObj.p[i]+"</p>";
	           			}
	           			return html;
	           		}
	           		
	           		return function(data){
	           			container.html(parseChapterData(data));
	           		}
	           }

	           //交互的事件绑定
	           function EventHanlder(){
	           		//头部 底部 导航栏的显示与隐藏
	           		$("#artical-action-mid").click(function(){
	           			if(Dom.top_nav.css('display') == 'none'){
	           				Dom.top_nav.show();
	           				Dom.bottom_nav.show();
	           			}else{
	           				Dom.top_nav.hide();
	           				Dom.bottom_nav.hide();
	           				Dom.bottom_font.hide();
	           				Dom.bottom_font.hide();
	           				Dom.icon_2.removeClass("icon_2_active");
	           				Dom.icon_2.addClass("icon_2");
	           			}
	           		});
	           		$("#bottom_nav_font").click(function(){
	           			if(Dom.bottom_font.css('display') == 'none'){
	           				Dom.bottom_font.show();
	           				Dom.icon_2.removeClass("icon_2");
	           				Dom.icon_2.addClass("icon_2_active");
	           			}else{
	           				Dom.bottom_font.hide();
	           				Dom.icon_2.removeClass("icon_2_active");
	           				Dom.icon_2.addClass("icon_2");
	           			}
	           		});
	           		$("#bottom_nav_day").click(function(){
	           			if($("#day").text() == "白天"){
	           				$("#day").text("夜晚");
	           				Dom.icon_3.removeClass("icon_3_active");
	           				icon_3_class = "icon_3";
	           				Dom.icon_3.addClass(icon_3_class);
	           				Util.StorageSetter("icon_3_class",icon_3_class);
	           				initialBgcolor = "rgb(255,255,255)";
	           				content.css("background-color",initialBgcolor);
	           				Util.StorageSetter("background-color",initialBgcolor);
	           				initialDay = "夜晚";
	           				Util.StorageSetter("day",initialDay);

	           			}else{
	           				$("#day").text("白天");
	           				Dom.icon_3.removeClass("icon_3");
	           				icon_3_class = "icon_3_active";
	           				Dom.icon_3.addClass(icon_3_class);
	           				Util.StorageSetter("icon_3_class",icon_3_class);
	           				initialBgcolor = "rgb(0,0,0)";
	           				content.css("background-color",initialBgcolor);
	           				Util.StorageSetter("background-color",initialBgcolor);
	           				Util.StorageSetter("text",initialFont);
	           				initialDay = "白天";
	           				Util.StorageSetter("day",initialDay);
	           			}
	           			
	           		});
	           		Win.scroll(function(){
	           			Dom.top_nav.hide();
	           			Dom.bottom_nav.hide();
	           			Dom.bottom_font.hide();
	           			Dom.bottom_font.hide();
	           			Dom.icon_2.removeClass("icon_2_active");
	           			Dom.icon_2.addClass("icon_2");
	           		});

	           	    //字体变大变小事件监控  有最大最小范围
	           		$("#smaller_font").click(function(){
	           			if(initialFont<12){
	           				return;
	           			}else{
		           			initialFont -= 1;
		           			Util.StorageSetter("font_size",initialFont);
		           			ReaderRoot.css("font_size",initialFont);
	           			}
	           		});
	           		$("#bigger_font").click(function(){
	           			if(initialFont>20){
	           				return;
	           			}else{
		           			initialFont += 1;
		           			Util.StorageSetter("font_size",initialFont);
		           			ReaderRoot.css("font_size",initialFont);
	           			}
	           		});
	           		//背景颜色控制
	           		$("#bk1").click(function(){
	           			initialBgcolor = "#D3D3D3";
	           			content.css("background-color",initialBgcolor);
	           			Util.StorageSetter("background-color",initialBgcolor);
	           		});
	           		$("#bk2").click(function(){
						initialBgcolor = "#B0C4DE";
						content.css("background-color",initialBgcolor);
	           			Util.StorageSetter("background-color",initialBgcolor);
	           		});
	           		$("#bk3").click(function(){
						initialBgcolor = "#FFDAB9";
						content.css("background-color",initialBgcolor);
	           			Util.StorageSetter("background-color",initialBgcolor);
	           		});
	           		$("#bk4").click(function(){
	           			initialBgcolor = "#C0C0C0";
	           			content.css("background-color",initialBgcolor);
	           			Util.StorageSetter("background-color",initialBgcolor);
	           		});
	           		$("#bk5").click(function(){
	           			initialBgcolor = "#F5F5F5";
	           			content.css("background-color",initialBgcolor);
	           			Util.StorageSetter("background-color",initialBgcolor);
	           		});
	           		//上一章下一章翻页
	           		$("#prev-button").click(function(){
	           			reader.prevChapter(function(data){
	           				UIReader(data);
	           			});
	           		
	           		});
	           		$("#next-button").click(function(){
	           			reader.nextChapter(function(data){
	           				UIReader(data);
	           			});
	           		});


	           }
	           main();
           })(); 