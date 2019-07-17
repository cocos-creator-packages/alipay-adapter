cc.loader.downloader.loadSubpackage = function (name, completeCallback) {
    // Not support for now on Alipay platform
    completeCallback && completeCallback();
};

function downloadScript (item, callback, isAsync) {
    var url = '../../' + item.url;
    require(url);
    callback(null, item.url);
}

function loadFont (item) {
    // var url = item.url;
    // var fontFamily = my.loadFont(url);
    // return fontFamily || 'Arial';

    // loadFont not supported on Alipay
    return 'Arial';
}

cc.loader.downloader.addHandlers({
    js : downloadScript
});

cc.loader.loader.addHandlers({
    // Font
    font: loadFont,
    eot: loadFont,
    ttf: loadFont,
    woff: loadFont,
    svg: loadFont,
    ttc: loadFont,
});
