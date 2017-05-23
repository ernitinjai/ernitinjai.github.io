var Ads = function() {

   this.player = videojs('content_video');
   this.adResp = '';

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
      //window.location.href = 'vpaid2imaevent://'+ event.type;
    //alert('ios');
  } else if(navigator.userAgent.match(/Android/i)) {
    //Android.showToast(''+ event.type);
    //alert('android');
  }
  this.log('Ad event: ' + event.type);
};

Ads.prototype.vastXML = function(vastResp,width,height,tagUrl) {

   pgads.initAdpluginOpts(width,height,tagUrl);

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
    pgads.AdEvent.Type.STARTED,
    pgads.AdEvent.Type.THIRD_QUARTILE,
    pgads.AdEvent.Type.STOPPED,
    pgads.AdEvent.Type.FULLSCREEN,
    pgads.AdEvent.Type.LOAD_META_DATA
    
  ];

  this.console = document.getElementById('pg-sample-console');
  this.player.pgads(
      this.options,
      this.bind(this, this.adsManagerLoadedCallback));
   
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



