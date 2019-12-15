// ==UserScript==
// @name        Fast-Codeforces
// @namespace   Violentmonkey Scripts
// @version     0.1.0a
// @match       *://codeforces.com/*
// @match       *://codeforc.es/*
// @match       *://codeforces.ml/*
// @description 使您更方便地使用Codeforces
// @author      xcxxcx
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

const Name="fast-codeforces-",JPar=JSON.parse,JStr=JSON.stringify;
function gets(dir){
	if((Name+dir) in localStorage ===false)return void 0;
	return JPar(localStorage[Name+dir]);
}
function puts(dir,val){if(val!==void 0)localStorage[Name+dir]=JStr(val);}
var user=$(".lang-chooser>div:eq(1)>a:eq(0)").html();
var prolist=gets("problem"),focpro;
if(prolist===void 0){puts("problem",[]);prolist=[];}
function hidepro(ID){$("#fc-problem-menu-"+ID).removeClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).hide();}
function showpro(ID){$("#fc-problem-menu-"+ID).addClass("focpro");$("#fc-problem-"+ID+",#fc-bar-problem-"+ID).show();}
function hidepro_(){$("#fc-problem,#fc-bar-problem").hide();$("#pageContent,#pre-bar").show();$("#fc-menu-problem").css("background-color","white");}
function showpro_(){$("#fc-problem,#fc-bar-problem").show();$("#pageContent,#pre-bar").hide();$("#fc-menu-problem").css("background-color","#AAAAAA");}
function getpro(url){
	var x=$.ajax({
		async:false,
		method:"GET",
		url:"/problemset/problem/"+url,
		data:{},
		success:function(e){return e;},
		error:function(e){console.log("ERROR");return e;}
	});
	x=$(x.responseText);
	return [x.find(`.problem-statement`),x.find(`#sidebar`)];
}
function addpro(x,y){
	$("#fc-problem-menu-add").before(`<li id="fc-problem-menu-`+x+y+`"><a>`+x+y+`</a><a style="bor">X</a></li>`);
	var node=$("#fc-problem-menu-"+x+y).children();
	$(node[0]).click(function(){
		if(focpro!==void 0)hidepro(focpro);
		showpro(this.innerHTML);focpro=this.innerHTML;
	});
	$(node[1]).click(function(){
		var fa=$(this).parent(),ID=fa.children()[0].innerHTML;
		if(focpro===ID){
			var pos=prolist.indexOf(ID);prolist.splice(pos,1);
			if(pos===prolist.length)--pos;
			if(pos!==-1){focpro=prolist[pos];showpro(focpro);}
			else focpro=void 0;
		}
		fa.remove();$("#fc-problem-"+ID).remove();
	});
	var pro=getpro(x+"/"+y);
	$("#fc-problem-contain").append(pro[0].attr("id","fc-problem-"+x+y));
	$("#fc-bar-problem").append(pro[1].attr("id","fc-bar-problem-"+x+y));
	if(focpro!==void 0)hidepro(focpro);
	showpro(x+y);focpro=x+y;prolist.push(focpro);
	MathJax.Hub.Queue(["Typeset", MathJax.Hub,"fc-problem-"+x+y]);
}
function newpro(){
	var ID=prompt("请输入题号");
	if(ID===""||ID===null)return;
	if(typeof ID!=="string"){alert("请输入正确的题号");return;}
	var A=ID.substr(ID.length-1);ID=parseFloat(ID.substr(0,ID.length-1));
	if(parseInt(ID)!==ID){alert("请输入正确的题号");return;}
	addpro(ID,A);
}
function func_pro(){
	if($("#fc-problem").css("display")==="none")showpro_();
	else hidepro_();
}
function init_pro(){
	$("#pageContent").after(`<div id="fc-problem" class="content-with-sidebar" style="display:none;margin:1em;padding-top:1em;min-height:20em">
<div class="second-level-menu">
	<style>
		.focpro{background-color:grey;}
		#fc-problem-menu>li{border-radius:12px;}
	</style>
	<ul class="second-level-menu-list" id="fc-problem-menu">
		<li id="fc-problem-menu-add"><a>+add problem</a></li>
		<li id="fc-problem-menu-close"><a>-hide window</a></li>
	</ul>
</div>
<div class="problemindexholder">
	<div class="ttypography" id="fc-problem-contain"></div>
</div>
</div>`);
	var link=$("link"),sideCSS=false,statCSS;
	for(var i=0;i<link.leng;++i){
		switch($(link[i]).attr("href")){
			case "//sta.codeforces.com/s/63369/css/sidebar-menu.css":sideCSS=true;break;
			case "//sta.codeforces.com/s/31021/css/status.css":statCSS=true;break;
		}
	}
	if(!sideCSS)$("head").append($(`<link rel="stylesheet" href="//sta.codeforces.com/s/37050/css/sidebar-menu.css"/>`));
	if(!statCSS)$("head").append($(`<link rel="stylesheet" href="//sta.codeforces.com/s/31021/css/status.css"/>`));
	$("#fc-bar-menu").after(`<div id="fc-bar-problem" style="display:none"></div>`);
	$("#fc-problem-menu-add").click(newpro);
	$("#fc-problem-menu-close").click(hidepro_);
}
var funclist={"problem":{name:"查看题目",init:init_pro,func:func_pro}};
var list=["problem"],len=list.length;
function CreateEle(id){
	var obj=funclist[id];obj.init();
	$("#fc-stop").before($(`<a id="fc-menu-`+id+`" style="border-radius:3px">`+obj.name+`</a><br/>`));
	$("#fc-menu-"+id).click(obj.func);
}
function showLogin(){
	$("#fc-menu").html(`<a href="javascript:;" id="fc-start">开始使用Fast Codeforces</a>`);
	$("#fc-start").click(function(){
		if(confirm("您确认要使用Fast Codeforces?")===false)return;
		puts("using",true);alert("授权成功");showMain();
	});
}
function showMain(){
	$("#fc-menu").html(`<a href="javascript:;" id="fc-stop">停止使用Fast Codeforces</a>`);
	$("#fc-stop").click(function(){
		if(confirm("您确认要停止使用Fast Codeforces?")===false)return;
		puts("using",false);alert("Fast Codeforces已停止");showLogin();
	});
	for(var i=0;i<len;++i)CreateEle(list[i]);
}
$(document).ready(function(){
	if($("#sidebar").length===0)return;
	var sidebar=$("#sidebar").html();
	$("#sidebar").html(`<div id="fc-bar"><div class="roundbox sidebox" id="fc-bar-menu">
<div class="roundbox-lt">&nbsp;</div>
<div class="roundbox-rt">&nbsp;</div>
<div class="caption titled">&rarr; Fast Codeforces<div class="top-links"><a href="https://github.com/xcx-xcx/fast-codeforces">帮助</a></div></div>
<div style="padding:0.5em">
	<div id="fc-menu" style="text-align:center;border-bottom:1px solid rgb(185,185,185);margin:0 -0.5em 0.5em -0.5em;padding:0 1em 0.5em 1em"></div>
</div></div></div><div id="pre-bar">`+sidebar+`</div>`);
	if($(".header-bell").length===0)$("#fc-menu").html(`<span>请登录后再使用！</span>`);
	else if(gets("using"))showMain();
	else showLogin();
});
