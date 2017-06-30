var Ads = function() {

   this.player = videojs('pg_content_video');
   this.adResp = '';
 // Remove controls from the player on iPad to stop native controls from stealing
  // our click
  var contentPlayer =  document.getElementById('pg_content_video_html5_api');
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
    id: 'pg_content_video'
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
      //comment below line in case of mobile browser
      document.location.href = 'vpaidpgevent://'+ event.type;
  } else if(navigator.userAgent.match(/Android/i)) {
    if(event.type == pgads.AdEvent.Type.CLICK) {
      //Android.showToast(''+ event.type+ '~'+ event.getClickThruUrl());
    } else {
      //Android.showToast(''+ event.type);
    }
  }

  this.log('Ad event: ' + event.type);
};

Ads.prototype.executeVastXML = function(vastResp,width,height) {

  
 var adResp = atob(vastResp);
  if (vastResp == '' && vastResp.length > 0) {
      this.onAdEvent('VAST_EMPTY_RESPONSE_ERROR');
      this.log('Error: please fill in an ad tag');
  } else {
    this.player.pgads.initializeAdDisplayContainer();
    this.player.pgads.setContentWithAdsResponse(null, adResp, true); 
    this.player.pgads.requestAds();
     var elem = document.getElementsByClassName('video-js')[0];
    elem.style.width = width;
    elem.style.height = height;
  }
};

Ads.prototype.executeVastTagUrl = function(tagUrl,width,height) {
  
  if (this.tagUrl == ''  && tagUrl.length > 0) {
      this.onAdEvent('VAST_INVALID_TAG_ERROR');
      this.log('Error: please fill in an ad tag');
  } else {
    this.player.pgads.initializeAdDisplayContainer();
    this.player.pgads.setContentWithAdTag(null, tagUrl, true); 
    this.player.pgads.requestAds();
    var elem = document.getElementsByClassName('video-js')[0];
    elem.style.width = width;
    elem.style.height = height;
  }
};


Ads.prototype.log = function(message) {
  //this.console.innerHTML = this.console.innerHTML + '<br/>' + message;
};

Ads.prototype.bind = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};



