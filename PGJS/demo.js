//var dom = require('./miniDom');
//var adsSetupPlugin = require('./ads-setup-plugin');
//var messages = require('./messages');

//videojs.plugin('ads-setup', adsSetupPlugin);

dom.onReady(function() {
  
  videojs.plugin('ads-setup', function (opts) {
    var player = this;
    var adsCancelTimeout = 3000;

    var vastAd = player.vastClient({
      //Media tag URL
      adTagUrl: "http://pubads.g.doubleclick.net/gampad/ads?env=....",
      playAdAlways: true,
      //Note: As requested we set the preroll timeout at the same place than the adsCancelTimeout
      adCancelTimeout: adsCancelTimeout,
      adsEnabled: !!options.adsEnabled
    });
});

   

    
});
