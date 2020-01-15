// ==UserScript==
// @name        Fast-Codeforces-dev
// @namespace   xcxxcx
// @version     0.3.4
// @match       *://codeforces.com/*
// @match       *://codeforc.es/*
// @match       *://codeforces.ml/*
// @description Make Codeforces convenient
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @author      xcxxcx
// ==/UserScript==
let $=window.$,math=unsafeWindow.MathJax.Hub,Codeforces=unsafeWindow.Codeforces;
String.prototype.frl=function(c){
	if(this.indexOf(c)===-1)return this;
	return this.substr(0,this.indexOf(c));
};
String.prototype.frr=function(c){
	if(this.indexOf(c)===-1)return this;
	return this.substr(this.indexOf(c)+c.length);
};
function obj_default(obj,val){
	for(let i in val)if(!(i in obj))obj[i]=val[i];
	return obj;
}
function gets(dir,val){
	if(("fc-"+dir)in localStorage===false||localStorage["fc-"+dir]==="undefined")return val;
	return JSON.parse(localStorage["fc-"+dir]);
}
function puts(dir,val){
	if(val!==void 0)localStorage["fc-"+dir]=JSON.stringify(val);
	else localStorage["fc-"+dir]="undefined";
}
function GetTitle(val){return val.substr(0,val.indexOf("</title>")).substr(val.indexOf("<title>")+7);}
let version="v0.3.4",fc=obj_default(gets("fc",{}),{version:version,list:[],using:false});puts("fc",fc);

let user=$(".lang-chooser>div:eq(1)>a:eq(0)").html(),user_csrf=$("[name=X-Csrf-Token]").attr("content");
function show_pre(){$("#pageContent,#pre-bar").show();}
function hide_pre(){$("#pageContent,#pre-bar").hide();}

let menu,need=["fc","pro-user","sub-user","sta-user"];
function Clear(){
	for(let i in localStorage){
		if(i.substr(0,3)!=="fc-")continue;
		let j=i.substr(3);console.log(j);
		if(need.indexOf(j)<0)delete localStorage[i];
	}
}
function default_set(){for(let i in localStorage)if(i.substr(0,3)==="fc-"&&i!=="fc-fc")delete localStorage[i];}
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
	$("#fc-setting-clear").before($(`<div><div class="section-title">目录设置<span class="fc-care">*</span></div><br/><h6>当前目录</h6>
<ul id="fc-setting-menu-add"></ul><h6>剩余目录</h6><ul id="fc-setting-menu-sub"></ul><button id="fc-setting-menu-end">修改</button><hr/></div>`));
	for(let i=0;i<len;++i)add_menu(list[i]);
	for(let i in eles)if(list.indexOf(i)===-1)sub_menu(i);
	$("#fc-setting-menu-end").click(function(){Reload();fc.list=menu;puts("fc",fc);showMain();alert("修改成功");});
}
function show_set(){$("#fc-setting").show();$("#fc-menu-setting").css("background-color","#AAAAAA");}
function hide_set(){$("#fc-setting").hide();$("#fc-menu-setting").css("background-color","white");}
function init_set(){
	$("#pageContent").after($(`<div id="fc-setting" class="fc-main problem-statement" style="display:none">
<div class="header"><div class="title">设置</div><div>带有<span class="fc-care">*</span>的选项在修改后，需要重新加载才能生效。</div></div>
<div><div class="section-title">Fast Codeforces版本:`+version+`</div></div><hr/>
<button type="button" class="fc-care" id="fc-setting-clear">清理缓存</button><br/><br/>
<button type="button" class="fc-care" id="fc-setting-default">恢复默认设置</button></div>`));
	for(let i=0;i<len;++i)eles[list[i]].set();
	$("#fc-setting-clear").click(function(){
		if(confirm("您确定要清除缓存?")===false)return;
		Clear();alert("清除缓存成功");
	});
	$("#fc-setting-default").click(function(){
		if(confirm("您确定要恢复默认设置?请先保存好您的文件")===false)return;
		Reload();default_set();showMain();alert("恢复默认设置成功");
	});
}
function remove_set(){$("#fc-setting").remove();}

let sta_default={auto_open:true,interval:10000},sta_user,sta_t=0,sta_cnt=0;
function get_sta(user,cnt,page=1,show=true){
	let tmp={csrf_token:user_csrf,action:"toggleShowUnofficial"},load=$("#fc-status-load"),loadstr="",t=sta_t;
	if(show)tmp.showUnofficial="on";
	clearInterval(sta_t);load.html("");
	if(cnt!==sta_cnt)return;
	sta_t=setInterval(function(){loadstr=loadstr.length===2?"":loadstr+".";$("#fc-status-load").html("Loading"+loadstr);},500);
	$.ajax({url:"/submissions/"+user+"/page/"+page,type:"POST",data:tmp,error:function(e){alert("出错了");return;},
	success:function(e){
		clearInterval(sta_t);load.html("");
		if(cnt!==sta_cnt)return;
		let val=$(e),tpage=val.find(".active").attr("pageindex");
		try{if(val.find(".second-level-menu-list a:eq(0)").html().toLowerCase()!==user.toLowerCase()){alert("该用户不存在");return;}}
		catch(e){alert("该用户不存在");return;}
		if(tpage!=page&&(tpage!==void 0||page!=1)){alert("该记录不存在");return;}
		val=val.find("#pageContent");val.children(":eq(0)").remove();val.children(":eq(0)").remove();val.find(".pagination").remove();
		$("#fc-status-main").html(val.html());
		if(sta_user.interval>=0)setTimeout(function(){get_sta(user,cnt,page,show);},sta_user.interval);
	}});
}
function set_sta(){
	$("#fc-setting-clear").before(`<div><div class="section-title">提交记录设置</div><br/>
<input type="checkbox" id="fc-setting-status-auto_open"><span>是否自动打开自己的提交记录</span><br/><br/>
自动刷新间隔（不刷新为-1）：<input type="number" min="-1" value="`+sta_user.interval+`" id="fc-setting-status-interval"/>毫秒<br/><br/>
<button type="button" id="fc-setting-status-end">修改</button><hr/></div>`);
	if(sta_user.auto_open)$("#fc-setting-status-auto_open").attr("checked","checked");
	$("#fc-setting-status-end").click(function(){
		let interval=parseInt($("#fc-setting-status-interval").val());
		if(typeof interval!=="number"||interval!==interval){alert("自动刷新间隔应为大于等于-1的整数");return;}
		if(interval<0)interval=1;$("#fc-setting-status-interval").val(interval);
		sta_user={auto_open:$("#fc-setting-status-auto_open:checked").length===1,interval:interval};puts("sta-user",sta_user);alert("修改成功");
	});
}
function show_sta(){$("#fc-status").show();$("#fc-menu-status").css("background-color","#AAAAAA");}
function hide_sta(){$("#fc-status").hide();$("#fc-menu-status").css("background-color","white");}
function init_sta(){
	sta_user=obj_default(gets("sta-user",{}),sta_default);puts("sta-user",sta_user);
	$("#pageContent").after($(`<div id="fc-status" class="fc-main" style="display:none"><div id="fc-status-head">
用户：<input type="text" id="fc-status-user"value="`+user+`"/>&nbsp;&nbsp;&nbsp;页码：<input type="text" id="fc-status-page" value="1"/>&nbsp;&nbsp;&nbsp;
<input type="checkbox" id="fc-status-show"/ checked>show unofficial&nbsp;&nbsp;&nbsp;<button type="button" id="fc-status-see">查看</button>
&nbsp;&nbsp;&nbsp;<button type="button" id="fc-status-stop">停止本次自动刷新</button>
<a id="fc-status-load"></a></div><div id="fc-status-main"></div></div>`));
	$("#fc-status-stop").click(function(){++sta_cnt;clearInterval(sta_t);$("#fc-status-load").html("");});
	$("#fc-status-see").click(function(){
		get_sta($("#fc-status-user").val(),++sta_cnt,$("#fc-status-page").val(),$("#fc-status-show:checked").length===1);
	});
	if(sta_user.auto_open)get_sta(user,0);
}
function remove_sta(){$("#fc-status").remove();}

let sub_default={auto_open:true},sub_user;
function set_sub(){
	$("#fc-setting-clear").before(`<div><div class="section-title">提交设置</div><br/>
<span>点击提交时：</span><select name="auto_open" id="fc-setting-submit-auto_open">
<option value="true">若开启了“查看状态”，则进行跳转</option><option value="false">打开“status”页面</option>
</select><span class="fc-care">*</span><br/><br/><button type="button" id="fc-setting-submit-end">修改</button><hr/></div>`);
	$("#fc-setting-submit-auto_open>option:eq("+(sub_user.auto_open===true?0:1)+")").attr("selected","selected");
	$("#fc-setting-submit-end").click(function(){
		sub_user={auto_open:$("#fc-setting-submit-auto_open>option:selected").val()==="true"};puts("sub-user",sub_user);
	});
}
function show_sub(){$("#fc-submit").show();$("#fc-menu-submit").css("background-color","#AAAAAA");}
function hide_sub(){$("#fc-submit").hide();$("#fc-menu-submit").css("background-color","white");}
function getsub(func){
	let sub=gets("sub");
	if(sub!==void 0){$("#fc-submit-form").html(sub);func();return;}
	$.ajax({type:"GET",data:{},url:"/problemset/submit",error:function(e){alert("获取提交界面失败");},
	success:function(e){
		sub=$(e).find(".submit-form");sub.find("tr:nth-child(5)").remove();sub.find(".submit").attr("id","fc-submit-button");
		sub.find(".aceEditorTd").html(`<textarea style="width:600px;height:300px;resize:none" name="source"></textarea><br/>`);
		sub.find("[name=submittedProblemCode]").attr("name","submittedProblemIndex");
		sub=sub.html();puts("sub",sub);$("#fc-submit-form").html(sub);func();
	}});
}
function init_sub(){
	sub_user=obj_default(gets("sub-user",{}),sub_default);puts("sub-user",sub_user);
	$("#pageContent").after($(`<div id="fc-submit" class="fc-main" style="display:none">
<form id="fc-submit-form" method="post" enctype="multipart/form-data" target="_blank"></form></div>`));
	getsub(function(){
	$("#fc-submit-button").click(function(){
		$("#fc-submit .fc-care").remove();let val=$("#fc-submit [name=submittedProblemIndex]").val();
		if(val===""){
			$("#fc-submit .error__submittedProblemIndex").html(`<span class="fc-care">Choose the problem</span>`);return false;}
		console.log(val);
		let cid=parseInt(val.substr(0,val.length-1)),id=val.substr(-1);
		if(cid!==cid||!id.match(/[a-zA-Z]/)){
			$("#fc-submit .error__submittedProblemIndex").html(`<span class="fc-care">Input a legal problem</span>`);return false;}
		if($("#fc-submit [name=source]").val()===""){
			$("#fc-submit .aceEditorTd").append(`<span class="fc-care">Put you source into the textarea</span>`);return false;}
		$("#fc-submit [name=submittedProblemIndex]").val(id);
		if(!sub_user.auto_open||list.indexOf("status")<0){$("#fc-submit-form").attr("action",`/contest/`+cid+`/submit?csrf_token=`+user_csrf);return true;}
		$.ajax({type:"POST",url:`/contest/`+cid+`/submit?csrf_token=`+user_csrf,error:function(e){alert("提交失败");return;},data:{
			csrf_token:user_csrf,action:"submitSolutionFormSubmitted",submittedProblemIndex:$("#fc-submit [name=submittedProblemIndex]").val(),
			programTypeId:$("#fc-submit [name=programTypeId]>option:selected").val(),source:$("#fc-submit [name=source]").val()},
			success:function(e){
				let sub=$(e);
				if(!sub.find(`#sidebar a[href="/contest/`+cid+`"]`).length){alert("该题目不存在!");return;}
				if(sub.find(".error.for__source").length){alert("您已经提交过相同的代码!");return;}
				if(GetTitle(e).substr(0,6)!=="Status"){alert("该题目不存在!");return;}
			}
		});
		return false;
		Change("status");$("#fc-status-user").val(user);$("#fc-status-page").val(1);$("#fc-status-show").attr("checked","checked");
		$("#fc-status-see").click();document.documentElement.scrollTop=0;return false;
	});});
}
function remove_sub(){$("#fc-submit").remove();}

let pro_default={mem:0,auto_open:false},pro_user,prepro,prolist,focpro,promap={};
function set_pro(){
	$("#fc-setting-clear").before($(`<div><div class="section-title">题目设置</div><br/>
<p><span>上一次未关闭的题目是否打开：</span><select id="fc-setting-problem-memory">
	<option value="0">否</option><option value="1">我自己决定是否打开</option><option value="2">自动打开</option>
</select></p><input type="checkbox" id="fc-setting-problem-auto_open"/><span>点击题目链接时在"查看题目"中将其打开<span class="fc-care">*</span></span>
<br/><br/><button type="button" id="fc-setting-problem-end">修改</button><hr/></div>`));
	if(pro_user.auto_open)$("#fc-setting-problem-auto_open").attr("checked","checked");
	$("#fc-setting-problem-end").click(function(){
		pro_user={mem:$("#fc-setting-problem-memory>option:selected").val(),auto_open:$("#fc-setting-problem-auto_open:checked").length===1};
		puts("pro-user",pro_user);alert("修改成功");
	});
	$("#fc-setting-problem-memory>option:eq("+pro_user.mem+")").attr("selected","selected");
}
function showpro(ID){$("#fc-problem-menu-"+ID).addClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).show();}
function hidepro(ID){$("#fc-problem-menu-"+ID).removeClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).hide();}
function show_pro(){$("#fc-problem,#fc-bar-problem").show();$("#fc-menu-problem").css("background-color","#AAAAAA");}
function hide_pro(){$("#fc-problem,#fc-bar-problem").hide();$("#fc-menu-problem").css("background-color","white");}
function addpro(x,y){
	let load=$(`<li id="fc-problem-memu-add-`+x+y+`"><a></a></li>`),loadstr="";
	promap[x+y]=1;$("#fc-problem-menu").append(load);
	let t=setInterval(function(){loadstr=loadstr.length===2?"":loadstr+".";load.find("a").html("Loading "+x+y+loadstr);},400);
	$.ajax({type:"GET",data:{},url:"/contest/"+x+"/problem/"+y,error:function(e){clearInterval(t);load.remove();alert("出错了！");},
	success:function(e){
		clearInterval(t);load.remove();
		let pro=$(e),title=GetTitle(e);
		if((title!=="Problem - "+y+" - Codeforces (Unofficial mirror site by GGAutomaton, accelerated for Chinese users)"&&title!=="Problem - "+y+
			" - Codeforces")||!pro.find(`#sidebar a[href="/contest/`+x+`"]`).length){delete promap[x+y];alert("题目"+x+y+"不存在");return;}
		x+=y;pro=[pro.find(`.problem-statement`),pro.find(`#sidebar`)];promap[x]=0;
		$("#fc-problem-menu-add").before(`<li id="fc-problem-menu-`+x+`"><a>`+x+`</a><a>X</a></li>`);
		$("#fc-problem-menu-"+x+">a:eq(0)").click(function(){if(focpro!==void 0)hidepro(focpro);showpro(this.innerHTML);focpro=this.innerHTML;});
		$("#fc-problem-menu-"+x+">a:eq(1)").click(function(){
			let fa=$(this).parent(),ID=fa.children()[0].innerHTML,pos=prolist.indexOf(ID);delete promap[prolist[pos]];prolist.splice(pos,1);
			if(focpro===ID){
				if(pos===prolist.length)--pos;
				if(pos!==-1){focpro=prolist[pos];showpro(focpro);}
				else focpro=void 0;
			}
			fa.remove();$("#fc-problem-"+ID).remove();puts("pro-list",prolist);
		});
		$("#fc-problem-contain").append(pro[0].attr("id","fc-problem-"+x));$("#fc-bar-problem").append(pro[1].attr("id","fc-bar-problem-"+x));
		if(focpro!==void 0)hidepro(focpro);
		showpro(x);prolist.push(focpro=x);math.Queue(["Typeset",math,"fc-problem-"+x]);puts("pro-list",prolist);
	}});
}
function newpro(ID){
	if(ID===""||ID===null)return;
	if(typeof ID!=="string"){alert("请输入正确的题号");return;}
	if(promap[ID]===0){alert("该题目已在序列中");return;}
	if(promap[ID]===1){alert("该题目已在添加队列中");return;}
	let id=ID.substr(ID.length-1),cid=parseFloat(ID.substr(0,ID.length-1));
	if(parseInt(cid)!==cid||!id.match(/[a-zA-Z]/)){alert("请输入正确的题号");return;}
	addpro(cid,id);
}
function init_pro(){
	pro_user=obj_default(gets("pro-user",{}),pro_default);prolist=[];promap={};puts("pro-user",pro_user);prepro=gets("pro-list");
	$("#pageContent").after($(`<div id="fc-problem" class="fc-main" style="display:none"><div class="second-level-menu">
<ul class="second-level-menu-list" id="fc-problem-menu">
	<li id="fc-problem-menu-add"><a>+add problem</a></li><li id="fc-problem-menu-close"><a>-hide window</a></li>
</ul></div><div class="problemindexholder">
<a href="javascript:;" id="fc-problem-submit" style="float:right">提交</a><div class="ttypography" id="fc-problem-contain"></div></div></div>`));
	$("#fc-problem-submit").click(function(){
		if(list.indexOf("submit")<0){alert("请先在设置中打开“快速提交”功能");return;}
		Change("submit");$("#fc-submit [name=source]").focus();
		if(focpro!==void 0)$("#fc-submit [name=submittedProblemIndex]").val(focpro);
	});
	$("#fc-problem-menu-close").click(function(){Change("problem");});$("#fc-problem-menu-add").click(function(){newpro(prompt());});
	$("#fc-problem-menu-add").hover(function(){let x=$("#fc-problem-menu>.backLava");if(x.length>0)x.remove();});
	$("#fc-bar-menu").after(`<div id="fc-bar-problem" style="display:none"></div>`);
	if(pro_user.mem==2||pro_user.mem==1&&prepro.length>0&&confirm("您上次浏览的题目未关闭，要重新加载吗？"))for(let i=0;i<prepro.length;++i)newpro(prepro[i]);
	else puts("pro-list",[]);
	if(pro_user.auto_open){$("a").click(function(){
		let url=$(this).attr("href");
		if(url==null)return true;
		let protrol=url.frl("://");url=url.frr("://");let domain=url.frl("/");url=url.frr("/");
		if(protrol!==url&&protrol!=="http"&&protrol!=="https")return true;
		if(domain!==""&&domain!=="codeforces.com"&&domain!=="codeforc.es"&&domain!=="codeforces.ml")return true;
		if(!url.match(/^problemset\/problem\/[1-9][0-9]*\/[A-Z]$/)&&!url.match(/^contest\/[1-9][0-9]*\/problem\/[A-Z]$/))return true;
		Change("problem");newpro(url.match(/[1-9][0-9]*/)[0]+"/"+url.match(/[A-Z]/)[0]);return false;
	});}
}
function remove_pro(){$("#fc-problem").remove();$("#fc-bar-problem").remove();}

let eles={
	"problem":{name:"查看题目",init:init_pro,remove:remove_pro,hide:hide_pro,show:show_pro,set:set_pro,js:[],css:["sidebar-menu","status"]},
	"submit":{name:"提交代码",init:init_sub,remove:remove_sub,hide:hide_sub,show:show_sub,set:set_sub,js:[],css:[]},
	"status":{name:"查看状态",init:init_sta,remove:remove_sta,hide:hide_sta,show:show_sta,set:set_sta,js:["facebox"],css:["status","facebox"]},
	"setting":{name:"设置",init:init_set,remove:remove_set,hide:hide_set,show:show_set,set:set_menu,js:[],css:[]},
},list,len,ele="pre",css_ready=[],js_ready=[];
function Change(ID){
	if(ele===ID){eles[ID].hide();show_pre();ele="pre";}
	else if(ele==="pre"){hide_pre();eles[ID].show();ele=ID;}
	else{eles[ele].hide();eles[ID].show();ele=ID;}
}
function CreateEle(id){
	let obj=eles[id],js=obj.js,css=obj.css;obj.init();
	for(let i=0;i<js.length;++i){if(js_ready.indexOf(js[i])==-1){
		$("head").append($(`<script src="//sta\.codeforces\.com/s/0/js/`+js[i]+`.js"></script>`));js_ready.push(js[i]);
	}}
	for(let i=0;i<css.length;++i){if(css_ready.indexOf(css[i])==-1){
		$("head").append($(`<link rel="stylesheet" href="//sta\.codeforces\.com/s/0/css/`+css[i]+`.css"/>`));css_ready.push(css[i]);
	}}
	$("#fc-stop").before($(`<a>&nbsp;&nbsp;<span id="fc-menu-`+id+`" style="border-radius:3px">`+obj.name+`</span>
<span style="float:right">&#8635;</span></a><br/>`));
	$("#fc-menu-"+id).click(function(){Change(this.id.substr(8));});
	$("#fc-menu-"+id).siblings().click(function(){
		if(ele===id)Change(id);
		obj.remove();obj.init();alert("加载成功！");
	});
}
function Reload(id){
	if(ele!=="pre")Change(ele);
	for(let i=0;i<len;++i)eles[list[i]].remove();
}
function showLogin(){
	Reload();$("#fc-menu").html(`<a href="javascript:;" id="fc-start">开始使用Fast Codeforces</a>`);
	$("#fc-start").click(function(){
		if(confirm("Fast Codeforces需要使用您的CSRF-token，您确定要授权吗?")===false)return;
		fc.using=true;puts("fc",fc);alert("授权成功");showMain();
	});
}
function showMain(){
	list=fc.list;
	if(list.length===0)list=["problem","submit","status","setting"];
	if(list.indexOf("setting")===-1)list.push("setting");
	fc.list=list;puts("fc",fc);len=list.length;ele="pre";$("#fc-menu").html(`<a href="javascript:;" id="fc-stop">停止使用Fast Codeforces</a>`);
	$("#fc-stop").click(function(){
		if(confirm("您确认要停止使用Fast Codeforces?")===false)return;
		fc.using=false;puts("fc",fc);alert("Fast Codeforces已停止");showLogin();
	});
	for(let i=0;i<len;++i)if(list[i]!=="setting")CreateEle(list[i]);
	if(list.indexOf("setting")>=0)CreateEle("setting");
}

$(function(){
	if($("#sidebar").length===0)return;
	let sidebar=$("#sidebar").html();
	$("#sidebar").html(`<div id="fc-bar">
<style>
	.fc-main{margin-right:22em !important;margin:1em;padding-top:1em;min-height:20em;}#fc-menu>a>span{cursor:pointer}
	.focpro{background-color:grey;}#fc-problem-menu>li{border-radius:12px;}.fc-care{color:red}
</style>
<div class="roundbox sidebox" id="fc-bar-menu">
<div class="roundbox-lt">&nbsp;</div><div class="roundbox-rt">&nbsp;</div>
<div class="caption titled">&rarr; Fast Codeforces<div class="top-links"><a id="fc-menu-turn">-</a>
<a href="https://github.com/xcx-xcx/fast-codeforces">帮助</a></div></div>
<div style="padding:0.5em">
	<div id="fc-menu" style="text-align:center;border-bottom:1px solid rgb(185,185,185);margin:0 -0.5em 0.5em -0.5em;padding:0 1em 0.5em 1em"></div>
</div></div></div><div id="pre-bar">`+sidebar+`</div>`);
	$("#fc-menu-turn").click(function(){
		if(this.innerHTML==="-"){this.innerHTML="+";$("#fc-menu").hide();}
		else{this.innerHTML="-";$("#fc-menu").show();}
	});
	Codeforces.countdown();let js=$("script"),css=$("link"),tmp;
	for(let i=0;i<js.length;++i){
		tmp=$(js[i]).attr("src");
		if(tmp!==void 0&&tmp.match(/^\/\/(sta\.codeforces\.com|subdomains\.codeforces.\ml\/sta)\/s\/[0-9]+\/js\/.*\js/)){
			js_ready.push(tmp.substr(0,tmp.length-3).substr(tmp.indexOf('/js/')+4));}
	}
	for(let i=0;i<css.length;++i){
		tmp=$(css[i]).attr("href");
		if(tmp!==void 0&&tmp.match(/^\/\/(sta\.codeforces\.com|subdomains\.codeforces.\ml\/sta)\/s\/[0-9]+\/css\/.*\.css/)){
			css_ready.push(tmp.substr(0,tmp.length-4).substr(tmp.indexOf('/css/')+5));}
	}
	if($(".header-bell").length===0)$("#fc-menu").html(`<span>请登录后再使用！</span>`);
	else if(fc.using)showMain();
	else showLogin();
	if(version!==fc.version){fc.version=version;puts("fc",fc);setTimeout(function(){alert("Fast Codeforces的版本已经更新了，赶快去设置看看呗");},500);}
});
