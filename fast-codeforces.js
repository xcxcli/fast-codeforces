// ==UserScript==
// @name        Fast-Codeforces-dev
// @namespace   xcxxcx
// @version     0.3.0
// @match       *://codeforces.com/*
// @match       *://codeforc.es/*
// @match       *://codeforces.ml/*
// @description 使您更方便地使用Codeforces
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @author      xcxxcx
// ==/UserScript==
let $=window.$,math=unsafeWindow.MathJax,JPar=JSON.parse,JStr=JSON.stringify;
function gets(dir){
	if(("fc-"+dir)in localStorage===false||localStorage["fc-"+dir]==="undefined")return void 0;
	return JPar(localStorage["fc-"+dir]);
}
function puts(dir,val){
	if(val!==void 0)localStorage["fc-"+dir]=JStr(val);
	else localStorage["fc-"+dir]="undefined";
}
let user=$(".lang-chooser>div:eq(1)>a:eq(0)").html(),user_csrf=$("[name=X-Csrf-Token]").attr("content"),tcount=[],tsum=0;
function Ajax(url,data={},type="GET"){
	let tmp=++tsum;
	$.ajax({type:type,url:url,data:data,success:function(e){tcount[tmp]=e;},error:function(e){tcount[tmp]="Err";}});
	return tmp;
}
function Get(url){
	return $.ajax({async:false,type:"GET",url:url,data:{},success:function(e){return e;},error:function(e){return e;}}).responseText;
}
function show_pre(){$("#pageContent,#pre-bar").show();}
function hide_pre(){$("#pageContent,#pre-bar").hide();}
let menu;
function default_set(){for(let i in localStorage)if(i.substr(0,3)==="fc-"&&i!=="fc-using"&&i!=="fc-version")delete localStorage[i];}
function add_menu(ele){
	$("#fc-setting-menu-add").append(`<li><a id="fc-setting-menu-`+ele+`">`+eles[ele].name+`</a></li>`);
	$("#fc-setting-menu-"+ele).click(function(){let ID=this.id.substr(16);$(this).parent().remove();menu.splice(menu.indexOf(ID),1);sub_menu(ID);});
}
function sub_menu(ele){
	$("#fc-setting-menu-sub").append(`<li><a id="fc-setting-menu-`+ele+`">`+eles[ele].name+`</a></li>`);
	$("#fc-setting-menu-"+ele).click(function(){let ID=this.id.substr(16);$(this).parent().remove();menu.push(ID);add_menu(ID);});
}
function set_menu(){
	menu=list.slice();
	$("#fc-setting-default").before($(`<div><div class="section-title">目录设置</div><br/><h6>当前目录</h6><ul id="fc-setting-menu-add"></ul>
<h6>剩余目录</h6><ul id="fc-setting-menu-sub"></ul><button id="fc-setting-menu-end">修改</button><hr/></div>`));
	for(let i=0;i<len;++i)add_menu(list[i]);
	for(let i in eles)if(list.indexOf(i)===-1)sub_menu(i);
	$("#fc-setting-menu-end").click(function(){Clear();puts("list",menu);showMain();alert("修改成功");});
}
function show_set(){$("#fc-setting").show();$("#fc-menu-setting").css("background-color","#AAAAAA");}
function hide_set(){$("#fc-setting").hide();$("#fc-menu-setting").css("background-color","white");}
function init_set(){
	$("#pageContent").after($(`<div id="fc-setting" class="fc-main problem-statement" style="display:none">
<div class="header"><div class="title">设置</div></div><button type="button" style="color:red" id="fc-setting-default">恢复默认设置</button></div>`));
	for(let i=0;i<len;++i)eles[list[i]].set();
	$("#fc-setting-default").click(function(){
		if(confirm("您确定要恢复默认设置")===false)return;
		Clear();default_set();showMain();alert("恢复默认设置成功");
	});
}
function remove_set(){$("#fc-setting").remove();}
let sta_default={interval:10000},sta_user=sta_default,sta_t;
function get_sta(user,page=1,show=false){
	let tmp={csrf_token:user_csrf,action:"toggleShowUnofficial"},load=$(`<a id="fc-status-load"></a>`),loadstr="";
	if(show)tmp.showUnofficial="on";tmp=Ajax("/submissions/"+user+"/page/"+page,tmp,"POST");$("#fc-status-head").append(load);clearInterval(sta_t);
	sta_t=setInterval(function(){
		loadstr=loadstr.length===2?"":loadstr+".";load.html("Loading"+loadstr);
		if(tcount[tmp]===void 0)return;
		clearInterval(sta_t);load.remove();
		if(tcount[tmp]===void 0){alert("出错了");return;}
		let val=$(tcount[tmp]),tpage=val.find(".active").attr("pageindex");
		if(tpage!=page&&(tpage!==void 0||page!=1)){alert("该记录不存在");return;}
		val=val.find("#pageContent");val.children(":eq(0)").remove();val.children(":eq(0)").remove();
		$("#fc-status-main").html(val.html());
	},400);
}
function set_sta(){}
function show_sta(){$("#fc-status").show();$("#fc-menu-status").css("background-color","#AAAAAA");}
function hide_sta(){$("#fc-status").hide();$("#fc-menu-status").css("background-color","white");}
function init_sta(){
	$("#pageContent").after($(`<div id="fc-status" class="fc-main" style="display:none"><div id="fc-status-head">
用户：<input type="text" id="fc-status-user"value="`+user+`"/>&nbsp;&nbsp;&nbsp;页码：<input type="text" id="fc-status-page" value="1"/>&nbsp;&nbsp;&nbsp;
<input type="checkbox" id="fc-status-show"/>show unofficial&nbsp;&nbsp;&nbsp;<button type="button" id="fc-status-button">查看</button>
</div><div id="fc-status-main"></div></div>`));
	$("#fc-status-button").click(function(){get_sta($("#fc-status-user").val(),$("#fc-status-page").val(),$("#fc-status-show:checked").length===1);});
}
function remove_sta(){$("#fc-status").remove();}
function set_sub(){}
function show_sub(){$("#fc-submit").show();$("#fc-menu-submit").css("background-color","#AAAAAA");}
function hide_sub(){$("#fc-submit").hide();$("#fc-menu-submit").css("background-color","white");}
function getsub(){
	let sub=gets("submit");
	if(sub!==void 0){$("#fc-submit-form").html(sub);return;}
	sub=$(Get("/problemset/submit")).find(".submit-form");
	sub.find(".aceEditorTd").html(`<textarea style="width:600px;height:300px;resize:none" name="source"></textarea>`);
	sub=sub.html();puts("submit",sub);$("#fc-submit-form").html(sub);
}
function init_sub(){
	$("#pageContent").after($(`<div id="fc-submit" class="fc-main" style="display:none">
<form id="fc-submit-form" method="post" action="/problemset/submit?csrf_token=`+user_csrf+`" enctype="multipart/form-data" target="_blank">
</form></div>`));
	getsub();
}
function remove_sub(){$("#fc-submit").remove();}
let pro_default={mem:0},pro_user,prepro,prolist,focpro,promap={};
function set_pro(){
	$("#fc-setting-default").before($(`<div><div class="section-title" class="fc-setting-problem">题目设置</div>
<p><span>上一次未关闭的题目是否记录下来，是否自动打开：</span>
<select id="fc-setting-problem-memory">
	<option value="0">否</option>
	<option value="1">记录下来，但我自己决定是否打开上次题目</option>
	<option value="2">是</option>
</select></p><button type="button" id="fc-setting-problem-end">修改</button><hr/></div>`));
	$("#fc-setting-problem-end").click(function(){
		alert("修改成功");pro_user.mem=$("#fc-setting-problem-memory>option:selected").val();puts("pro-user",pro_user);
	});
	$("#fc-setting-problem-memory>option:eq("+pro_user.mem+")").attr("selected","selected");
}
function showpro(ID){$("#fc-problem-menu-"+ID).addClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).show();}
function hidepro(ID){$("#fc-problem-menu-"+ID).removeClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).hide();}
function show_pro(){$("#fc-problem,#fc-bar-problem").show();$("#fc-menu-problem").css("background-color","#AAAAAA");}
function hide_pro(){$("#fc-problem,#fc-bar-problem").hide();$("#fc-menu-problem").css("background-color","white");}
function addpro(x,y){
	let tmp=Ajax("/problemset/problem/"+x+"/"+y),load=$(`<li id="fc-problem-memu-add-`+x+y+`"><a></a></li>`),loadstr="";
	x+=y;promap[x]=1;$("#fc-problem-menu").append(load);prolist=[];promap={};
	let t=setInterval(function(){
		loadstr=loadstr.length===2?"":loadstr+".";load.find("a").html("Loading "+x+loadstr);
		if(tcount[tmp]===void 0)return;
		clearInterval(t);load.remove();
		if(tcount[tmp]==="Err"){delete promap[x];alert("出错了！");return;}
		let pro=$(tcount[tmp]),len=pro.length,title;
		for(let i=0;i<len;++i)if(pro[i].tagName==="TITLE"){title=pro[i].innerHTML;break;}
		if(title!=="Problem - "+x+" - Codeforces"){delete promap[x];alert("题目"+x+"不存在");return;}
		pro=[pro.find(`.problem-statement`),pro.find(`#sidebar`)];tcount[tmp]=void 0;promap[x]=0;
		$("#fc-problem-menu-add").before(`<li id="fc-problem-menu-`+x+`"><a>`+x+`</a><a style="bor">X</a></li>`);
		let node=$("#fc-problem-menu-"+x).children();
		$(node[0]).click(function(){if(focpro!==void 0)hidepro(focpro);showpro(this.innerHTML);focpro=this.innerHTML;});
		$(node[1]).click(function(){
			let fa=$(this).parent(),ID=fa.children()[0].innerHTML,pos=prolist.indexOf(ID);delete promap[prolist[pos]];prolist.splice(pos,1);
			if(focpro===ID){
				prolist.splice(pos,1);
				if(pos===prolist.length)--pos;
				if(pos!==-1){focpro=prolist[pos];showpro(focpro);}
				else focpro=void 0;
			}
			fa.remove();$("#fc-problem-"+ID).remove();puts("pro-list",prolist);
		});
		$("#fc-problem-contain").append(pro[0].attr("id","fc-problem-"+x));$("#fc-bar-problem").append(pro[1].attr("id","fc-bar-problem-"+x));
		if(focpro!==void 0)hidepro(focpro);
		showpro(x);prolist.push(focpro=x);math.Hub.Queue(["Typeset",math.Hub,"fc-problem-"+x]);puts("pro-list",prolist);
	},400);
}
function newpro(ID){
	if(ID===""||ID===null)return;
	if(typeof ID!=="string"){alert("请输入正确的题号");return;}
	if(promap[ID]===0){alert("该题目已在序列中");return;}
	if(promap[ID]===1){alert("该题目正在添加中");return;}
	let pnum=ID.substr(ID.length-1),pl=parseFloat(ID.substr(0,ID.length-1));
	if(parseInt(pl)!==pl){alert("请输入正确的题号");return;}
	addpro(pl,pnum);
}
function init_pro(){
	let i;pro_user=gets("pro-user");
	if(pro_user===void 0)pro_user={};
	for(i in pro_default)if(!(i in pro_user))pro_user[i]=pro_default[i];
	puts("pro-user",pro_user);prepro=gets("pro-list");
	$("#pageContent").after($(`<div id="fc-problem" class="fc-main" style="display:none">
<div class="second-level-menu">
	<ul class="second-level-menu-list" id="fc-problem-menu">
		<li id="fc-problem-menu-add"><a>+add problem</a></li>
		<li id="fc-problem-menu-close"><a>-hide window</a></li>
	</ul>
</div><div class="problemindexholder"><div class="ttypography" id="fc-problem-contain"></div></div></div>`));
	$("#fc-problem-menu-close").click(function(){Change("problem");});$("#fc-problem-menu-add").click(function(){newpro(prompt());});
	$("#fc-problem-menu-add").hover(function(){let x=$("#fc-problem-menu>.backLava");if(x.length>0)x.remove();});
	$("#fc-bar-menu").after(`<div id="fc-bar-problem" style="display:none"></div>`);
	if(pro_user.mem==2||(pro_user.mem==1&&prepro.length>0&&confirm("您上次浏览的题目未关闭，确定重新加载吗？")))for(i=0;i<prepro.length;++i)newpro(prepro[i]);
	else puts("pro-list",[]);
}
function remove_pro(){$("#fc-problem").remove();$("#fc-bar-problem").remove();}
let eles={
	"problem":{name:"查看题目",init:init_pro,remove:remove_pro,hide:hide_pro,show:show_pro,set:set_pro,js:[],css:["sidebar-menu","status"]},
	"submit":{name:"提交代码",init:init_sub,remove:remove_sub,hide:hide_sub,show:show_sub,set:set_sub,js:[],css:[]},
	"status":{name:"查看状态",init:init_sta,remove:remove_sta,hide:hide_sta,show:show_sta,set:set_sta,js:["facebox"],css:["status","facebox"]},
	"setting":{name:"设置",init:init_set,remove:remove_set,hide:hide_set,show:show_set,set:set_menu,js:[],css:[]},
},list,len,ele="pre",css_ready=[],js_ready=[],day;
function Change(ID){
	if(ele===ID){eles[ID].hide();show_pre();ele="pre";}
	else if(ele==="pre"){hide_pre();eles[ID].show();ele=ID;}
	else{eles[ele].hide();eles[ID].show();ele=ID;}
}
function CreateEle(id){
	let obj=eles[id],js=obj.js,css=obj.css;obj.init();
	for(let i=0;i<js.length;++i){if(js_ready.indexOf(js[i])==-1){
		$("head").append($(`<script src="//sta.codeforces.com/s/`+day+`/js/`+js[i]+`.js"></script>`));js_ready.push(js[i]);
	}}
	for(let i=0;i<css.length;++i){if(css_ready.indexOf(css[i])==-1){
		$("head").append($(`<link rel="stylesheet" href="//sta.codeforces.com/s/`+day+`/css/`+css[i]+`.css"/>`));css_ready.push(css[i]);
	}}
	$("#fc-stop").before($(`<a id="fc-menu-`+id+`" style="border-radius:3px;background-color:white">`+obj.name+`</a><br/>`));
	$("#fc-menu-"+id).click(function(){Change(this.id.substr(8));});
}
function Clear(id){
	if(ele!=="pre")Change(ele);
	for(let i=0;i<len;++i)eles[list[i]].remove();
}
function showLogin(){
	Clear();
	$("#fc-menu").html(`<a href="javascript:;" id="fc-start">开始使用Fast Codeforces</a>`);
	$("#fc-start").click(function(){
		if(confirm("Fast Codeforces需要使用您的CSRF-token，您确定要授权吗?")===false)return;
		puts("using",true);alert("授权成功");showMain();
	});
}
function showMain(){
	list=gets("list");
	if(list===void 0)list=["problem","submit","status","setting"];
	if(list.indexOf("setting")===-1)list.push("setting");
	puts("list",list);len=list.length;ele="pre";$("#fc-menu").html(`<a href="javascript:;" id="fc-stop">停止使用Fast Codeforces</a>`);
	$("#fc-stop").click(function(){
		if(confirm("您确认要停止使用Fast Codeforces?")===false)return;
		puts("using",false);alert("Fast Codeforces已停止");showLogin();
	});
	for(let i=0;i<len;++i)if(list[i]!=="setting")CreateEle(list[i]);
	if(list.indexOf("setting"))CreateEle("setting");
}
$(document).ready(function(){
	if($("#sidebar").length===0)return;
	let sidebar=$("#sidebar").html();
	$("#sidebar").html(`<div id="fc-bar">
<style>
	.fc-main{margin-right:22em !important;margin:1em;padding-top:1em;min-height:20em;}
	.focpro{background-color:grey;}#fc-problem-menu>li{border-radius:12px;}
</style>
<div class="roundbox sidebox" id="fc-bar-menu">
<div class="roundbox-lt">&nbsp;</div><div class="roundbox-rt">&nbsp;</div>
<div class="caption titled">&rarr; Fast Codeforces<div class="top-links"><a href="https://github.com/xcx-xcx/fast-codeforces">帮助</a></div></div>
<div style="padding:0.5em">
	<div id="fc-menu" style="text-align:center;border-bottom:1px solid rgb(185,185,185);margin:0 -0.5em 0.5em -0.5em;padding:0 1em 0.5em 1em"></div>
</div></div></div><div id="pre-bar">`+sidebar+`</div>`);
	let js=$("script"),css=$("link"),tmp;
	for(let i=0;i<js.length;++i){
		tmp=$(js[i]).attr("src");
		if(tmp!==void 0&&tmp.match(/\/\/sta.codeforces.com\/s\/[0-9]{5}\/js\//))js_ready.push(tmp.substr(0,tmp.length-3).substr(32));
	}
	for(let i=0;i<css.length;++i){
		tmp=$(css[i]).attr("href");
		if(tmp.match(/\/\/sta.codeforces.com\/s\/[0-9]{5}\/css\//)){day=tmp.substr(23,5);css_ready.push(tmp.substr(0,tmp.length-4).substr(33));}
	}
	if($(".header-bell").length===0)$("#fc-menu").html(`<span>请登录后再使用！</span>`);
	else if(gets("using"))showMain();
	else showLogin();
});
let version="0.3.1";
if(gets("version")!==version){setTimeout(function(){alert("Fast Codeforces的版本已经更新了，赶快去设置看看呗");},100);puts("version",version);}
