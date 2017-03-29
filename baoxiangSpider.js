var express = require('express');
var url = require('url'); //解析操作url
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
// var targetUrl = 'https://cnodejs.org/';
var targetUrl = 'http://m.bxjr.com:1515/';
var DB_CONN_STR = 'mongodb://localhost:27017/storage'

superagent.get(targetUrl)
    .end(function (err, res) {
        if (err) {
            return console.error(err);
        }
        var baoxiangTest = res.text.match(/宝象/);
        if (baoxiangTest && baoxiangTest.length > 0) {
            console.log('找到宝象');
            console.log('位置:' + targetUrl);
        }
        // console.log(res);
        var urls = [];
        var subUrls = [];

        var $ = cheerio.load(res.text);
        //通过CSS selector来筛选数据
        $('a').each(function (idx, element) {
            var $element = $(element);
            if (!$element.attr('href')) {
                return;
            }
            if ($element.attr('href').match(/javascript/)) {
                return;
            }
            var href = url.resolve(targetUrl, $element.attr('href'));
            if (!href.match(/bxjr/)) {
                return;
            }
            if (href.match(/qq/)) {
                return;
            }
            // console.log(href);
            urls.push(href);
        });
        console.log(urls.length);
        //第三步：确定放出事件消息的
        urls.forEach(function (topicUrl) {
            superagent.get(topicUrl)
                .end(function (err, res1) {
                    console.log('fetch ' + topicUrl + ' successful');
                    if (!res1) {
                        return;
                    }
                    if (!res1.text) {
                        return;
                    }
                    var $ = cheerio.load(res1.text);
                    //通过CSS selector来筛选数据
                    $('a').each(function (idx, element) {
                        var $element = $(element);
                        if (!$element.attr('href')) {
                            return;
                        }
                        if ($element.attr('href').match(/javascript/)) {
                            return;
                        }
                        var href = url.resolve(targetUrl, $element.attr('href'));
                        if (!href.match(/bxjr/)) {
                            return;
                        }
                        if (href.match(/qq/)) {
                            return;
                        }
     
                        // console.log(href);
                        // if (subUrls.length > 400) {
                        //     return;
                        // }
                        subUrls.push(href);
                        // console.log(subUrls.length);
                    });
                    var baoxiangTest = res1.text.match(/宝象/);
                    if (baoxiangTest && baoxiangTest.length > 0) {
                        console.log('找到宝象');
                        console.log('位置:' + topicUrl);
                    }
                });
        });
        setTimeout(() => {
            console.log(subUrls.length);
            subUrls.forEach(function (topicUrl) {
                superagent.get(topicUrl)
                    .end(function (err, res) {
                        if (!res) {
                            return;
                        }
                        if (!res.text) {
                            return;
                        }
                        if (topicUrl == 'http://m.bxjr.com:1515/') {
                            return;
                        }
                        console.log('fetch ' + topicUrl + ' successful');
                        var baoxiangTest = res.text.match(/宝象/);
                        if (baoxiangTest && baoxiangTest.length > 0) {
                            console.log('找到宝象');
                            console.log('位置:' + topicUrl);
                        }
                    });
            });
        }, 20000)
    });
