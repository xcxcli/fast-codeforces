# Fast Codeforces 使用

## 安装

您需要先安装Tampermonkey、Violentmonkey、Greasemonkey之类的脚本插件。

然后打开<https://greasyfork.org/zh-CN/scripts/393752-fast-codeforces>，点击“安装此脚本”。

## 使用

**Fast Codeforces需要使用您在Codeforces上的CSRF-token，并保证不作其它用途。**

本脚本的使用并没有难度，您可以自己探索。

## 自定义的功能

真正的神仙肯定不用往下看就知道了。

找到`eles`这个对象，并在后面加上功能名称及对应的函数。对象各种键值的定义如下：

|键值|功能|
|:--|:--|
|name|名称|
|init|初始化函数|
|remove|删除函数|
|show|显示函数|
|hide|隐藏函数|
|set|设置函数|
|js|所需javascript文件|
|css|所需css文件|

注意这些文件必须以`//sta.codeforces.com/s/day/type/file.type`为结构，其中`type`为`js/css`，`day`为当日的标号，`file`为你所需的文件的名称。**注意对象中只用填写`file`，不需要额外文件则需添加空数组。**

完成这些后在设置中进行设置即可。
