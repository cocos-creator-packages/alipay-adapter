require('./adapter/my-builtin');
var Parser = require('./adapter/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('./adapter/engine/Platform');
require('./adapter/my-downloader.js');
require('./src/settings');
require('./main');
require('./cocos2d-js');
require('./adapter/engine/index');

// Adjust devicePixelRatio
cc.view._maxPixelRatio = 3;

myDownloader.REMOTE_SERVER_ROOT = "";
myDownloader.SUBCONTEXT_ROOT = "";
var pipeBeforeDownloader = cc.loader.subPackPipe || cc.loader.md5Pipe || cc.loader.assetLoader;
cc.loader.insertPipeAfter(pipeBeforeDownloader, myDownloader);

// Release Image objects after uploaded gl texture
cc.macro.CLEANUP_IMAGE_CACHE = true;

myDownloader.init();
window.boot();