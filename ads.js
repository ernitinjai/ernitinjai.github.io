/**
 * Copyright 2014 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
    google.ima.AdEvent.Type.CLICK,
    google.ima.AdEvent.Type.COMPLETE,
    google.ima.AdEvent.Type.FIRST_QUARTILE,
    google.ima.AdEvent.Type.LOADED,
    google.ima.AdEvent.Type.MIDPOINT,
    google.ima.AdEvent.Type.PAUSED,
    google.ima.AdEvent.Type.STARTED,
    google.ima.AdEvent.Type.THIRD_QUARTILE
  ];

  this.console = document.getElementById('ima-sample-console');
  this.player.ima(
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
  if (this.adResp == '') {
    this.log('Error: please fill in an ad tag');
  } else {
    this.player.ima.initializeAdDisplayContainer();
    this.player.ima.setContentWithAdsResponse(null, this.adResp, true);
    this.player.ima.requestAds();
    this.player.play();
  }
};

Ads.prototype.adsManagerLoadedCallback = function() {
  for (var index = 0; index < this.events.length; index++) {
    this.player.ima.addEventListener(
        this.events[index],
        this.bind(this, this.onAdEvent));
  }
  var a = this.player.ima.startFromReadyCallback();
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
    this.adResp = atob(vastResp);
    if (this.adResp == '') {
      this.onAdEvent('allAdsCompleted');
      this.log('Error: please fill in an ad tag');
  } else {
    alert("display container");
    this.player.ima.initializeAdDisplayContainer();
    
    this.player.ima.setContentWithAdsResponse(null, this.adResp, true);
    
    this.player.ima.requestAds();
    
    this.player.play();
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
