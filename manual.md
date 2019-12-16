# Fast Codeforces 使用

## 安装

您需要先安装Tampermonkey、Violentmonkey、Greasemonkey之类的脚本插件。

然后打开<https://greasyfork.org/zh-CN/scripts/393752-fast-codeforces>，点击“安装此脚本”。

## 使用

**Fast-Codeforces需要使用您在Codeforces上的CSRF-token，并保证只将其在您提交题目的时候使用。**

本脚本的使用并没有难度，您可以自己探索。

## 自定义的功能

真正的神仙肯定不用往下看就知道了。

找到`eles`这个对象，并在后面加上功能名称及对应的函数。对象各种键值的定义如下：

|键值|功能|
|-|-|
|name|名称|
|init|初始化|
|func|点击时的函数|
|show|显示|
|hide|隐藏|

并在`list`中加上功能的名称。
