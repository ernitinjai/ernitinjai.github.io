// pgads_defaults
// PGAdsPlugin
// videojs.pgads
// //vast client
// //value: ['AdLoaded', 'AdStarted', 'AdStopped', 'AdSkipped', 'AdSkippableStateChange', // VPAID 2.0 new event
// //    'AdSizeChange', // VPAID 2.0 new event
// //    'AdLinearChange', 'AdDurationChange', // VPAID 2.0 new event
// //    'AdExpandedChange', 'AdRemainingTimeChange', // [Deprecated in 2.0] but will be still fired for backwards compatibility
// //    'AdVolumeChange', 'AdImpression', 'AdVideoStart', 'AdVideoFirstQuartile', 'AdVideoMidpoint', 'AdVideoThirdQuartile', 'AdVideoComplete', 'AdClickThru', 'AdInteraction', // VPAID 2.0 new event
// //    'AdUserAcceptInvitation', 'AdUserMinimize', 'AdUserClose', 'AdPaused', 'AdPlaying', 'AdLog', 'AdError']
//Player events
// this.on(this.tech_, 'loadstart', this.handleTechLoadStart_);//     this.on(this.tech_, 'waiting', this.handleTechWaiting_);
//     this.on(this.tech_, 'canplay', this.handleTechCanPlay_);//     this.on(this.tech_, 'canplaythrough', this.handleTechCanPlayThrough_);
//     this.on(this.tech_, 'playing', this.handleTechPlaying_);//     this.on(this.tech_, 'ended', this.handleTechEnded_);
//     this.on(this.tech_, 'seeking', this.handleTechSeeking_);//     this.on(this.tech_, 'seeked', this.handleTechSeeked_);
//     this.on(this.tech_, 'play', this.handleTechPlay_);//     this.on(this.tech_, 'firstplay', this.handleTechFirstPlay_);
//     this.on(this.tech_, 'pause', this.handleTechPause_);
//     this.on(this.tech_, 'durationchange', this.handleTechDurationChange_);//     this.on(this.tech_, 'fullscreenchange', this.handleTechFullscreenChange_);
//     this.on(this.tech_, 'error', this.handleTechError_);//     this.on(this.tech_, 'loadedmetadata', this.updateStyleEl_);
//     this.on(this.tech_, 'posterchange', this.handleTechPosterChange_);//     this.on(this.tech_, 'textdata', this.handleTechTextData_);
// Adsmanager which use vastclient object// this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adContainerDiv, this.contentPlayer);
//       this.currentAd = adEvent.getAd();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var pgads = {};

pgads.AdsRequest = function () {
	this.adTagUrl;
	this.adsResponse;
	this.forceNonLinearFullSlot;
	this.linearAdSlotWidth;
	this.linearAdSlotHeight;
	this.nonLinearAdSlotWidth;
	this.nonLinearAdSlotHeight;
}



//ViewMode
pgads.ViewMode = {
	'NORMAL' : 'normal',
	'THUMBNAIL' : 'thumbnail',
	'FULLSCREEN' : 'fullscreen'
}

pgads.AdErrorEvent = function (errorMsg) {
	this.errorMsg = errorMsg;

	this.getError = function () {
		return this.errorMsg;
	}
}

pgads.AdEventInfo = function(eventType,adsManager) {
	this.type = eventType;
	this.error = '';
	this.adsManager = adsManager;

	this.setError = function(error) {
		this.error = error;
	}

	this.getError =  function () {
		return this.error;
	}

	this.getAd = function() {
		return this.adsManager.adPodInfo[0];
	}

	this.isInline = function () {
		if(this.adsManager.adPodInfo[0].inline) {
			return true;
		} else {
			return false;
		}
	}

	this.isLinear = function () {
		return this.adsManager.vastResponse.hasLinear();
	}

	this.getAdPosition = function () {
		return 0;
	}

	this.getTotalAds = function () {
		return this.adsManager.adPodInfo.length;
	}

	this.getContentType = function () {
		return 'application/javascript';
	}
};

pgads.AdEvent = {};

//AdEvent
pgads.AdEvent.Type = {
	'ALL_ADS_COMPLETED' : '',
	'CLICK' : 'AdClickThru',
	'COMPLETE' : 'AdVideoComplete',
	'FIRST_QUARTILE' : 'AdVideoFirstQuartile',
	'LOADED' : 'AdLoaded',
	'MIDPOINT' : 'AdVideoMidpoint',
	'PAUSED' : 'AdPaused',
	'STARTED' : 'AdVideoStart',
	'THIRD_QUARTILE' : 'AdVideoThirdQuartile',
	'AD_BREAK_READY' : '',
	'SKIPPED' : 'AdSkipped',
	'CONTENT_PAUSE_REQUESTED' : 'pause',
	'CONTENT_RESUME_REQUESTED' : 'seeked',
	'AD_ERROR': 'AdError',
	'ADS_MANAGER_LOADED' : 'AdsManagerLoaded',
	'STOPPED' : 'AdStopped',
	'FULLSCREEN': 'fullscreenchange'
}

////AdsManager
pgads.AdsManager =  function(player){
	this.player = player;
	this.adsManagerLoaderEvents = [];
	this.volume = 0;
	this.width = 0;
	this.height = 0;
	this.viewMode = pgads.ViewMode.NORMAL;
	this.vastResponse;
	this.adPodInfo;
    this.currentPlayerTime;

	var adManagerObj = this;


	this.init = function(width,
              height,
              viewMode) {
		this.width = width;
		this.height = height;
		this.viewMode = viewMode;
	};

	this.setVolume = function(volume) {
		this.volume = volume;
	};

	this.getRemainingTime= function () {
		return this.player.duration()-this.player.currentTime();
	}

	this.getDuration = function () {
		return this.player.duration();
	}

	this.resize = function(width,height,viewMode) {

	};

	this.addEventListener = function(event, callback) {
		this.adsManagerLoaderEvents.push({
	   			 key:   event,
	    	   	value: callback
			});
	};

	this.start = function () {
		//this.player.play();
	};

	this.resume = function () {
		//var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED,adManagerObj);
		//pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED)(adEvent);
		adManagerObj.player.vast.adUnit.resumeAd();
	};

	this.destroy = function () {
		
	};

	this.pause = function () {
		//this.player.pause();
		adManagerObj.player.vast.adUnit.pauseAd();
		//adManagerObj.player.trigger('pause');
		//adManagerObj.player.pause();
	}
	
	this.player.on('pause', function () {
		adManagerObj.player.trigger('content-resuming');
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.CONTENT_PAUSE_REQUESTED,adManagerObj);
		pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.CONTENT_PAUSE_REQUESTED)(adEvent);
	});

	this.player.on('loadedmetadata', function () {
		//alert(this.vast.vastResponse.ads[0].inLine.creatives.Length);
	});

	this.player.on('error',function () {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.AD_ERROR,adManagerObj);
		pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.AD_ERROR)(adEvent);
	});

	this.player.on('ended', function () {
		 //alert('ended');
   });

	this.player.on('fullscreenchange', function() {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.FULLSCREEN,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.FULLSCREEN)(adEvent);
	});

	this.player.on('vpaid.AdLoaded', function() {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.LOADED,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.LOADED)(adEvent);
	});

	this.player.on('vpaid.AdStarted', function() {
		if(this.vast.vastResponse != 'undefined'); {
       		 adManagerObj.vastResponse = this.vast.vastResponse;
    	}
        if(this.vast.vastResponse.ads != 'undefined'); {
    		adManagerObj.adPodInfo = this.vast.vastResponse.ads;
        }
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.STARTED,adManagerObj);
    	pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.STARTED)(adEvent);
	});

	this.player.on('vpaid.AdStopped', function() {
		if(adManagerObj.player.currentSrc()) {
 			var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED,adManagerObj);
    		 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED)(adEvent);
    	} else {
    		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.ALL_ADS_COMPLETED,adManagerObj);
    		pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.ALL_ADS_COMPLETED)(adEvent);
    	}
	});

	this.player.on('vpaid.AdVideoFirstQuartile', function() {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.FIRST_QUARTILE,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.FIRST_QUARTILE)(adEvent);
	});

	this.player.on('vpaid.AdVideoMidpoint', function() {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.MIDPOINT,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.MIDPOINT)(adEvent);
	});

	this.player.on('vpaid.AdVideoThirdQuartile', function() {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.THIRD_QUARTILE,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.THIRD_QUARTILE)(adEvent);
	});
	this.player.on('vpaid.AdVideoComplete', function() {

		//TODO: send content resume callback
       var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.COMPLETE,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.COMPLETE)(adEvent);
    });

	this.player.on('vpaid.AdPaused', function() {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.PAUSED,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.PAUSED)(adEvent);
	});

	this.player.on('vast.adError', function(error) {
		var adEvent = new pgads.AdEventInfo(pgads.AdEvent.Type.AD_ERROR,adManagerObj);
    	 pgads.getEventsCallback(adManagerObj.adsManagerLoaderEvents,pgads.AdEvent.Type.AD_ERROR)(adEvent);
	});

	function getMethods(obj) {
		  var result = [];
		  for (var id in obj) {
		    try {
		      if (typeof(obj[id]) == "function") {
		        result.push(id + ": " + obj[id].toString());
		      }
		    } catch (err) {
		      result.push(id + ": inaccessible");
		    }
		  }
	  return result;
	}
}

pgads.getEventsCallback = function(eventsData,key) {

	for (var i = eventsData.length - 1; i >= 0; i--) {
			object = eventsData[i]
			if(object.key == key) {
				return object.value;
			}
		}
}

//////AdsLoader
pgads.AdsLoader = function (adDisplayContainer,player) {
	
	alert('AdsLoader 1');
	this.player = player;
	this.adsLoaderEvents = [];
    selfAdsLoader = this;
	
	this.requestAds = function (adRequest) {

	     

		 var adPluginOpts = {
              "adCancelTimeout":20000,// Wait for ten seconds before canceling the ad.
              "adsEnabled": true,
              //"adTagXML":this.adResp
              //"url":'https://ads.personagraph.com/ad/med/ss?app_name=Wiz+Khalifa%27s+Weed+Farm&player_width=1212&player_height=640&ip=162.233.130.60&cb=15354200772&adv_type=VIDEO&pid=PG-1102-19066-00000477&ad_type=VPIMP4&bundle_id=com.wiz.weed.game&appstore_url=&vpaid=true&ua=Mozilla%2F5.0+%28iPhone%3B+CPU+iPhone+OS+10_3_1+like+Mac+OS+X%29+AppleWebKit%2F603.1.30+%28KHTML%2C+like+Gecko%29+Mobile%2F14E304&device_id=E5809BB5-C699-4905-B053-2C55280592A6&app_domain='
              "url" : 'https://rtr.innovid.com/r1.5554946ab01d97.36996823;cb=%25%CACHEBUSTER%25%25'
              //"url" : 'http://ec2-184-72-178-33.compute-1.amazonaws.com/med/samplevast/vast3_all'
              //"url" : "http://127.0.0.1/vast3_all.xml"
        };
		this.player.vastClient(adPluginOpts);
		alert('AdsLoader function');
		pgads.getEventsCallback(this.adsLoaderEvents,pgads.AdEvent.Type.ADS_MANAGER_LOADED)();
	};

	this.contentComplete = function () {
          
	};

	this.addEventListener = function (event, callback, isTrue) { 
		this.adsLoaderEvents.push({
	   			 key:   event,
	    	   	value: callback
			});
	};

	function getMethods(obj) {
		  var result = [];
		  for (var id in obj) {
		    try {
		      if (typeof(obj[id]) == "function") {
		        result.push(id + ": " + obj[id].toString());
		      }
		    } catch (err) {
		      result.push(id + ": inaccessible");
		    }
		  }
	  return result;
	}
}

//AdDisplayContainer
pgads.AdDisplayContainer = function (adContainerDiv,contentPlayer) {

	this.adContainerDiv = adContainerDiv;
	this.contentPlayer = contentPlayer;

	this.initialize = function () {
			
	}

}





