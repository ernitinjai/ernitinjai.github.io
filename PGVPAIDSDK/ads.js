/*var Ads = function() {
   


};

Ads.prototype.vastXML = function(vastResp) {
  var videoContainer = document.getElementById('vjs-video-container');
   var videoElement = document.getElementById('video-js');

    this.adResp = atob(vastResp);

      var adPluginOpts = {
              "adCancelTimeout":20000,// Wait for ten seconds before canceling the ad.
              "adsEnabled": true,
              //"adTagXML":this.adResp
              "url":'https://ads.personagraph.com/ad/med/ss?adv_type=VIDEO&pid=PG-2-500239-00000545&ad_type=VPIMP4&app_name=netorman&app_domain=com.sega.vectormancom&bundle_id=com.ega.vectormancom&appstore_url=https://itunes.apple.com/us/app/id1176426500?mt=8&device_id=236A005B-700F-4889-B9CE-999EAB2B605E&ip=122.23.6.9&ua=Mozilla%2F5.0%20%28Linux%3B%20Android%204.2.1%3B%20Nexus%207%20%20Build%2FJOP40D%29%20AppleWebKit%2F535.19%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F18.0.%201025.166%20%20%20Safari%2F535.19&latitude=%%LATITUDE%%&longitude=%%LONGITUDE%%&cb=%%CACHEBUSTER%%'
        };
          //adPluginOpts.plugins["ads-setup"].adTagXML = XML
      this.player = videojs(videoElement);
      //, adPluginOpts, function() {});


      this.player.vastClient(adPluginOpts);

      this.player.play();
     //this.player.on('vpaid.AdVideoFirstQuartile', function() { alert ('test');});
};*/

   var Ads = function() {

   this.player = videojs('content_video');
   this.adResp = '';

  // Remove controls from the player on iPad to stop native controls from stealing
  // our click
  var contentPlayer =  document.getElementById('content_video_html5_api');
  if ((navigator.userAgent.match(/iPad/i) ||
          navigator.userAgent.match(/Android/i)) &&
      contentPlayer.hasAttribute('controls')) {
    contentPlayer.removeAttribute('controls');
  }

  // Start ads when the video player is clicked, but only the first time it's
  // clicked.
  var startEvent = 'click';
  if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) {
    startEvent = 'touchend';
  }
  this.player.one(startEvent, this.bind(this, this.init));

  this.options = {
    id: 'content_video'
  };

  this.events = [
    pgads.AdEvent.Type.ALL_ADS_COMPLETED,
    pgads.AdEvent.Type.CLICK,
    pgads.AdEvent.Type.COMPLETE,
    pgads.AdEvent.Type.FIRST_QUARTILE,
    pgads.AdEvent.Type.LOADED,
    pgads.AdEvent.Type.MIDPOINT,
    pgads.AdEvent.Type.PAUSED,
   // pgads.AdEvent.Type.STARTED,
    pgads.AdEvent.Type.THIRD_QUARTILE,
    pgads.AdEvent.Type.STOPPED,
  ];

  this.console = document.getElementById('pg-sample-console');
  this.player.pgads(
      this.options,
      this.bind(this, this.adsManagerLoadedCallback));

};

Ads.prototype.SAMPLE_AD_TAG = 'http://pubads.g.doubleclick.net/gampad/ads?' +
    'sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&' +
    'ad_rule=1&impl=s&gdfp_req=1&env=vp&output=xml_vmap1&' +
    'unviewed_position_start=1&' +
    'cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&' +
    'vid=short_onecue&correlator=';

Ads.prototype.init = function() {
  // if (this.adResp == '') {
  //   this.log('Error: please fill in an ad tag');
  // } else {

  //   this.player.pgads.initializeAdDisplayContainer();
  //   this.player.pgads.setContentWithAdsResponse(null, this.adResp, true);
  //   this.player.pgads.requestAds();
  //   this.player.play();
  // }
};

Ads.prototype.adsManagerLoadedCallback = function() {
  for (var index = 0; index < this.events.length; index++) {
    this.player.pgads.addEventListener(
        this.events[index],
        this.bind(this, this.onAdEvent));
  }
  var a = this.player.pgads.startFromReadyCallback();
};

Ads.prototype.onAdEvent = function(event) {
 
  if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i)) {
      window.location.href = 'vpaid2imaevent://'+ event.type;
  } else if(navigator.userAgent.match(/Android/i)) {
    Android.showToast(''+ event.type)
  }
  this.log('Ad event: ' + event.type);
};

Ads.prototype.vastXML = function(vastResp) {
   alert('vastxml function');
    this.adResp = 'xml'; //atob(vastResp);
    if (this.adResp == '') {
      this.onAdEvent('allAdsCompleted');
      this.log('Error: please fill in an ad tag');
  } else {
    

    this.player.pgads.initializeAdDisplayContainer();

    this.player.pgads.setContentWithAdsResponse(null, this.adResp, true);

    this.player.pgads.requestAds();
  }

};

Ads.prototype.log = function(message) {
  this.console.innerHTML = this.console.innerHTML + '<br/>' + message;
};

Ads.prototype.bind = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};



