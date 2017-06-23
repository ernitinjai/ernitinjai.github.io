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
      Android.showToast(''+ event.type+ '~'+ event.getClickThruUrl());
    } else {
      Android.showToast(''+ event.type);
    }
  }

  this.log('Ad event: ' + event.type);
};

Ads.prototype.executeVastXML = function(vastResp,width,height) {

  
 var adResp = '<?xml version="1.0" encoding="UTF-8"?><VAST version="3.0"><Ad id="f2ff0693_SkHe93OQZ"><Wrapper><AdSystem>BidSwitch</AdSystem><VASTAdTagURI><![CDATA[http://va.tag.clrstm.com/vast/5Mv_eGOtqVp8hLzG-ay1A6uzSPWa9XoNPcbEBtCc_knEIB0fbv-_Kz0LYvQUXKiZZnB1PEprF_rA3nEfrCXekv0uI_IMr-i9Jw-8MffLKdNMmDw30O5mewsVxyr3a7MsJcBQAvre3qxdLSMoZMjjplPqojAD8niNhLzBQFKd97ii9TsP_qleJwVzaAdFmrAfYr0sAc-768Ws6eq1pYZHhS1Za6rp-RGdd0U4OIXnJwwVNeDwRhW0PcXbdpRQH8t5ezPqPphEh2OE8rkewX-JxC4TkE79ob-VO1g0HC9K1oKAZp8S6olPgNnIGhpFW0NfunT0UzcTjm8V7RiBbiC9wpsZFbLpvL_bshdXW76-UFltlbJV8pUQZ7Ke4iZaXLgEpGO4__wyNmOEgfGrsawCYoPekjw4QxX-3WYIQhLWG8iSI2y48IKavFf1holCFeoqY_0uDA-C9YEZqcmIMDJVu-cj96VcIn-Q8sipkkaU_zTPjEt3T-uyV4_H8OwdJmpcscJ9Mgw8pEUxPHx7B92cDNWi03KcI8w25QdvyfyIkXLJpeTrQAnJ39uM7WLyMwl75hLbat3_ebDz4ABCcYmbJ321YFjZpwCUYzLu0dk1XZjicVWKSyEyt_Ux3NuePxdlgPcFSJNuNDtTGC__p7zC_MSM24aKbais9T8MyCOg75FaZ3zaPIShSJkaSZbxo7E4URh5u9a-IfYckZFTlK0NrBIUQdovJDCKA_bSYLr8ETyvC3SDVZSozLgVKwrN9EWrbba5pgb-YIyMY1CBEvKtmN7LzyDy63ebH1LhX8Bo0jp5e2KMZXUroxc-e-bLRx4lKx_QCs7-w5BDe_0ttkZFVfJy29GV9iX0E74]]></VASTAdTagURI><Error><![CDATA[http://gce-sc.bidswitch.net/vast_error/WzhY140cUwGVLAupqiH5pMLI4gozh5slUlx_AxCzoUCa-FF2rIuMKwPGry6LteozhdmJ0oSV0-FVF7Qk6E6fB82AEw1FssS7Hm_33aIl3dLl3H-_hA7uGn23gXmqnETBwXrDKgZRNZbMFQjzeZesQ0X6-LSDKiXnkyiLj7fcij_XugtNm2xBAcpEkS1uoIqjm4yL1NwdHYiUoCD_PojDO5-Nyfjka6gEMQI0lyD0zNS61FNiAEDtUpdEbv5bl3P9is2CEzkVyFnnDQ332pGs5EQI6f3ZLxdwxYjUEQ_2KDsmHNMjYXm1ZZj31W8z2L1KXRCvZL8tixPDjzWkhzDTK2ajZTIDZ-ovqgvNZ2yx7vcQPHnKwBMxRbC2R0a4VkonPp75GhOfSvMFqKvn8rnff6e2BAram7d-hakuUpwI8DB1tqUahkVS3WNZpD-GtPEVYzcP90G4KIEFFkUzq_e7bMajbCGylENBGb5ruBInuaeXCRAv_xkXi8mC-GA8zryEJYO4Urs6WGwVij6MPA0WFQ-Y27GbRnlon8mjvkdUy7Rd3hnPglPm9jpb20mnvStgT2t5_CxF7LZAv9sdoY-o3-TUkQ/]]></Error><Impression><![CDATA[http://gce-sc.bidswitch.net/imp/10/BSWhttp_A_B_Bva.tag.clrstm.com_Bimp_Badi_B5Mv__eOfg47F551gj1YNfCD24Fzl9XtfnqafsM6C-NaRzViJCoJ9y3h4sDo20VssR7blTJ-3DhOudN__RHDNlc4dvo4ZiFw8bzCF61rrI2J37tOrv7C-PsYStpo8oAkvTlCLabdqxRsSdxGHil1sqnIhX__l5y61cUtA13IqiHPluzQ9pIrEKQBmjJ2Jr8KivEfZrce2bY3e2pIs-E5CWowViYlSZ61Jv0AoldOSaaebSQkazSmiJu2CXKz7DdLQ6KhLVkbvVBSWlv8bPvAC4pqRZDsLbBPQIhboo-agFuhH2TYGc-gzGhWWlgbCsuPGqv2LUHL6iFWvbw2Vhhy0I3d7IApcb9dv9LBFWRDQiVVrp__WULim6v76__A9i1qaaa3gcMLe5PoZ2D690Ncp8jzBuVXLF0PbEa9GtNJwNufIAz8Wl0Px30m6cPFQlmFPxZG35Z96gEVtfGcEbDhTnQFEn0o6ufeEv9954csGE07meEkmo4-q3CA9BjXvwBS5tvXjQUGJ__pQu-NJQOvjO0huWBe69SuQgWohvjeP24jTY0PhnXOVQXGZy8oksW3TRyHB8ncgP8J2h3d9mpNRqaaTO3nHqjMwqaVbOOpV4BtncY8wLtrt__cnTaZ1ay8EgD4XnqePCXpli1wlMlAkFlPK9jO__qORGMGJx33YmX3lpjXL1N86RD__mD3vWPrZ1__sSWNqzN2fLJYkfrRiISIlLJ9JKwPVB3-pRCCo9KLuyPGg67XBxX-91Q0Ez__cCC2KBE__zz7Ft6ALb38JA4K1iWXmONtIRW1PI1k0IwDjdBosTLYK2bI2lwboDF7YK7Xws8c-XkTs81TSkugMReTmF7kYeoei__Z6rETVKuVMcPYU_B_I_WAUCTION__PRICE_X_B_I_WCLICK__URL_AURLENCODE_X/WzhY140cUwGVLAupqiH5pMLI4gozh5slUlx_AxCzoUCa-FF2rIuMKwPGry6LteozhdmJ0oSV0-FVF7Qk6E6fB82AEw1FssS7Hm_33aIl3dLl3H-_hA7uGn23gXmqnETBwXrDKgZRNZbMFQjzeZesQ0X6-LSDKiXnkyiLj7fcij_XugtNm2xBAcpEkS1uoIqjm4yL1NwdHYiUoCD_PojDO5-Nyfjka6gEMQI0lyD0zNS61FNiAEDtUpdEbv5bl3P9is2CEzkVyFnnDQ332pGs5EQI6f3ZLxdwxYjUEQ_2KDsmHNMjYXm1ZZj31W8z2L1KXRCvZL8tixPDjzWkhzDTK2ajZTIDZ-ovqgvNZ2yx7vcQPHnKwBMxRbC2R0a4VkonPp75GhOfSvMFqKvn8rnff6e2BAram7d-hakuUpwI8DB1tqUahkVS3WNZpD-GtPEVYzcP90G4KIEFFkUzq_e7bMajbCGylENBGb5ruBInuaeXCRAv_xkXi8mC-GA8zryEJYO4Urs6WGwVij6MPA0WFQ-Y27GbRnlon8mjvkdUy7Rd3hnPglPm9jpb20mnvStgT2t5_CxF7LZAv9sdoY-o3-TUkQ/]]></Impression><Impression><![CDATA[http://us-east-sync.bidswitch.net/sync?ssp=personagraph&dsp_id=26&imp=1]]></Impression><Creatives></Creatives></Wrapper></Ad></VAST>'; //atob(vastResp);
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



