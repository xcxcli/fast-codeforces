// ==UserScript==
// @name        Fast-Codeforces-dev
// @namespace   xcxxcx
// @version     0.2.4
// @match       *://codeforces.com/*
// @match       *://codeforc.es/*
// @match       *://codeforces.ml/*
// @description 使您更方便地使用Codeforces
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @author      xcxxcx
// ==/UserScript==
var $=unsafeWindow.jQuery,math=unsafeWindow.MathJax,JPar=JSON.parse,JStr=JSON.stringify;
var tcount=[],tsum=0;
function empty(){}
function gets(dir){
	if(("fc-"+dir) in localStorage ===false||localStorage["fc-"+dir]==="undefined")return void 0;
	return JPar(localStorage["fc-"+dir]);
}
function puts(dir,val){
	if(val!==void 0)localStorage["fc-"+dir]=JStr(val);
	else localStorage["fc-"+dir]="undefined";
}
var user=$(".lang-chooser>div:eq(1)>a:eq(0)").html(),user_csrf=$("[name=X-Csrf-Token]").attr("content");
function Ajax(url){
	var tmp=++tsum;
	$.ajax({
		method:"GET",url:url,data:{},success:function(e){tcount[tmp]=e;},
		error:function(e){tcount[tmp]="Err";}
	});
	return tmp;
}
function Get(url){
	return $.ajax({
		async:false,method:"GET",url:url,data:{},success:function(e){return e;},
		error:function(e){return e;}
	}).responseText;
}
function show_pre(){$("#pageContent,#pre-bar").show();}
function hide_pre(){$("#pageContent,#pre-bar").hide();}

function show_set(){$("#fc-setting").show();$("#fc-menu-setting").css("background-color","#AAAAAA");}
function hide_set(){$("#fc-setting").hide();$("#fc-menu-setting").css("background-color","white");}
function init_set(){
	$("#pageContent").after($(`<div id="fc-setting" class="fc-main problem-statement" style="display:none;margin:1em;padding-top:1em;min-height:20em">
<div class="header">设置</div>
<p style="color:red">修改之后会刷新页面，请先保存好数据！</p>
<button type="button" id="fc-setting-end">修改</div>
</div>`));
	for(var i=0;i<len;++i)eles[list[i]].sets();
	$("#fc-setting-end").click(function(){
		for(var i=0;i<len;++i)eles[list[i]].setc();
		alert("修改成功！");location.reload();
	});
}

function sets_sub(){}
function setc_sub(){}
function show_sub(){$("#fc-submit").show();$("#fc-menu-submit").css("background-color","#AAAAAA");}
function hide_sub(){$("#fc-submit").hide();$("#fc-menu-submit").css("background-color","white");}
function getsub(){
	var sub=gets("submit");
	if(sub!==void 0){$("#fc-submit-form").html(sub);return;}
	sub=$(Get("/problemset/submit")).find(".submit-form");
	sub.find(".aceEditorTd").html(`<textarea style="width:600px;height:300px;resize:none" name="source"></textarea>`);
	puts("submit",sub.html());$("#fc-submit-form").html(sub.html());
}
function init_sub(){
	$("#pageContent").after($(`<div id="fc-submit" class="fc-main" style="display:none;margin:1em;padding-top:1em;min-height:20em">
<form id="fc-submit-form" method="post" action="/problemset/submit?csrf_token=`+user_csrf+`" enctype="multipart/form-data" target="_blank">
</form></div>`));
	getsub();
}

var pro_default={mem:0},pro_user,prepro,prolist=[],focpro,promap={};
function sets_pro(){
	$("#fc-setting .header").after($(`<div><div class="section-title">题目设置</div><p><span>上一次未关闭的题目是否记录下来，是否自动打开：</span>
<select id="fc-setting-problem-memory">
	<option value="0">否</option>
	<option value="1">记录下来，但我自己决定是否打开上次题目</option>
	<option value="2">是</option>
</select></p></div>`));
	$("#fc-setting-problem-memory>option:eq("+pro_user.mem+")").attr("selected","selected");
}
function setc_pro(){
	pro_user.mem=$("#fc-setting-problem-memory>option:selected").val();
	puts("pro-user",pro_user);
}
function showpro(ID){$("#fc-problem-menu-"+ID).addClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).show();}
function hidepro(ID){$("#fc-problem-menu-"+ID).removeClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).hide();}
function show_pro(){$("#fc-problem,#fc-bar-problem").show();$("#fc-menu-problem").css("background-color","#AAAAAA");}
function hide_pro(){$("#fc-problem,#fc-bar-problem").hide();$("#fc-menu-problem").css("background-color","white");}
function addpro(x,y){
	var tmp=Ajax("/problemset/problem/"+x+"/"+y,true),load=$(`<li id="fc-problem-memu-add-`+x+`"><a></a></li>`),loadstr="";
	x+=y;promap[x]=1;$("#fc-problem-menu").append(load);
	var t=setInterval(function(){
		loadstr=loadstr.length===2?"":loadstr+".";load.find("a").html("Loading "+x+loadstr);
		if(tcount[tmp]===void 0)return;
		load.remove();
		if(tcount[tmp]==="Err"){delete promap[x];alert("添加题目"+x+"失败");}
		var pro=$(tcount[tmp]),len=pro.length,title;
		for(var i=0;i<len;++i)if(pro[i].tagName==="TITLE"){title=pro[i].innerHTML;break;}
		clearInterval(t);
		if(title!=="Problem - "+x+" - Codeforces"){delete promap[x];alert("题目"+x+"不存在");return;}
		pro=[pro.find(`.problem-statement`),pro.find(`#sidebar`)];tcount[tmp]=void 0;promap[x]=0;
		$("#fc-problem-menu-add").before(`<li id="fc-problem-menu-`+x+`"><a>`+x+`</a><a style="bor">X</a></li>`);
		var node=$("#fc-problem-menu-"+x).children();
		$(node[0]).click(function(){
			if(focpro!==void 0)hidepro(focpro);
			showpro(this.innerHTML);focpro=this.innerHTML;
		});
		$(node[1]).click(function(){
			var fa=$(this).parent(),ID=fa.children()[0].innerHTML,pos=prolist.indexOf(ID);
			delete promap[prolist[pos]];prolist.splice(pos,1);
			if(focpro===ID){
				prolist.splice(pos,1);
				if(pos===prolist.length)--pos;
				if(pos!==-1){focpro=prolist[pos];showpro(focpro);}
				else focpro=void 0;
			}
			fa.remove();$("#fc-problem-"+ID).remove();puts("pro-list",prolist);
		});
		$("#fc-problem-contain").append(pro[0].attr("id","fc-problem-"+x));
		$("#fc-bar-problem").append(pro[1].attr("id","fc-bar-problem-"+x));
		if(focpro!==void 0)hidepro(focpro);
		showpro(x);prolist.push(focpro=x);math.Hub.Queue(["Typeset",math.Hub,"fc-problem-"+x]);puts("pro-list",prolist);
	},400);
}
function newpro(ID){
	if(ID===""||ID===null)return;
	if(typeof ID!=="string"){alert("请输入正确的题号");return;}
	if(promap[ID]===0){alert("该题目已在序列中");return;}
	if(promap[ID]===1){alert("该题目正在添加中");return;}
	var pnum=ID.substr(ID.length-1),pl=parseFloat(ID.substr(0,ID.length-1));
	if(parseInt(pl)!==pl){alert("请输入正确的题号");return;}
	addpro(pl,pnum);
}
function init_pro(){
	pro_user=gets("pro-user");
	if(pro_user===void 0){pro_user=pro_default;puts("pro-user",pro_user);puts("pro-list",[]);}
	prepro=gets("pro-list");
	$("#pageContent").after($(`<div id="fc-problem" class="fc-main" style="display:none;margin:1em;padding-top:1em;min-height:20em">
<div class="second-level-menu">
	<ul class="second-level-menu-list" id="fc-problem-menu">
		<li id="fc-problem-menu-add"><a>+add problem</a></li>
		<li id="fc-problem-menu-close"><a>-hide window</a></li>
	</ul>
</div>
<div class="problemindexholder"><div class="ttypography" id="fc-problem-contain"></div></div>
</div>`));
	$("#fc-problem-menu-close").click(function(){Change("problem");});
	$("#fc-problem-menu-add").hover(function(){
		var x=$("#fc-problem-menu>.backLava");
		if(x.length>0)x.remove();
	});
	var link=$("link"),sideCSS=false,statCSS=false;
	for(var i=0;i<link.leng;++i){
		switch($(link[i]).attr("href")){
			case "//sta.codeforces.com/s/63369/css/sidebar-menu.css":sideCSS=true;break;
			case "//sta.codeforces.com/s/31021/css/status.css":statCSS=true;break;
		}
	}
	if(!sideCSS)$("head").append($(`<link rel="stylesheet" href="//sta.codeforces.com/s/37050/css/sidebar-menu.css"/>`));
	if(!statCSS)$("head").append($(`<link rel="stylesheet" href="//sta.codeforces.com/s/31021/css/status.css"/>`));
	$("#fc-bar-menu").after(`<div id="fc-bar-problem" style="display:none"></div>`);$("#fc-problem-menu-add").click(function(){newpro(prompt());});
	if(pro_user.mem==2||(pro_user.mem==1&&prepro.length>0&&confirm("您上次浏览的题目未关闭，确定重新加载吗？"))){
		for(var j=0;j<prepro.length;++j)newpro(prepro[j]);
	}
	else puts("pro-list",[]);
}

function showLogin(){
	$("#fc-menu").html(`<a href="javascript:;" id="fc-start">开始使用Fast Codeforces</a>`);
	$("#fc-start").click(function(){
		if(confirm("Fast Codeforces需要使用您的CSRF-token，您确定要授权吗?")===false)return;
		puts("using",true);alert("授权成功");showMain();
	});
}
function showMain(){
	$("#fc-menu").html(`<a href="javascript:;" id="fc-stop">停止使用Fast Codeforces</a>`);
	$("#fc-stop").click(function(){
		if(confirm("您确认要停止使用Fast Codeforces?")===false)return;
		puts("using",false);alert("Fast Codeforces已停止");showLogin();$("#fc-problem").remove();$("#fc-submit").remove();
	});
	for(var i=0;i<len;++i)CreateEle(list[i]);
}

var eles={
	"problem":{name:"查看题目",init:init_pro,hide:hide_pro,show:show_pro,sets:sets_pro,setc:setc_pro,func:empty},
	"submit":{name:"提交代码",init:init_sub,hide:hide_sub,show:show_sub,sets:sets_sub,setc:setc_sub,func:empty},
	"setting":{name:"设置",init:init_set,hide:hide_set,show:show_set,sets:empty,setc:empty,func:empty},
};
var list=["problem","submit","setting",],len=list.length,ele="pre";
function Change(ID){
	eles[ID].func();
	if(ele===ID){eles[ID].hide();show_pre();ele="pre";}
	else if(ele==="pre"){hide_pre();eles[ID].show();ele=ID;}
	else{eles[ele].hide();eles[ID].show();ele=ID;}
}
function CreateEle(id){
	var obj=eles[id];obj.init();
	$("#fc-stop").before($(`<a id="fc-menu-`+id+`" style="border-radius:3px;background-color:white">`+obj.name+`</a><br/>`));
	$("#fc-menu-"+id).click(function(){Change($(this).attr("id").substr(8));});
}

$(document).ready(function(){
	if($("#sidebar").length===0)return;
	var sidebar=$("#sidebar").html();
	$("#sidebar").html(`<div id="fc-bar">
<style>.fc-main{margin-right:22em !important;}.focpro{background-color:grey;}#fc-problem-menu>li{border-radius:12px;}</style>
<div class="roundbox sidebox" id="fc-bar-menu">
<div class="roundbox-lt">&nbsp;</div><div class="roundbox-rt">&nbsp;</div>
<div class="caption titled">&rarr; Fast Codeforces<div class="top-links"><a href="https://github.com/xcx-xcx/fast-codeforces">帮助</a></div></div>
<div style="padding:0.5em">
	<div id="fc-menu" style="text-align:center;border-bottom:1px solid rgb(185,185,185);margin:0 -0.5em 0.5em -0.5em;padding:0 1em 0.5em 1em"></div>
</div></div></div><div id="pre-bar">`+sidebar+`</div>`);
	if($(".header-bell").length===0)$("#fc-menu").html(`<span>请登录后再使用！</span>`);
	else if(gets("using"))showMain();
	else showLogin();
});
