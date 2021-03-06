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

pgads.AdType = {
	'VPAID' : 'application/javascript',
	'VAST' : 'video/mp4'
}

pgads.PGVideoAdQuartile = {
	'PGVideoAdQuartileFirst' : 0,
    'PGVideoAdQuartileSecond' : 1,
    'PGVideoAdQuartileThird' : 2,
    'PGVideoAdQuartileFourth' : 3
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

	this.getPodIndex = function () {
		return 0;
	}

	this.getTotalAds = function () {
		return this.adsManager.adPodInfo.length;
	}

	this.getContentType = function () {
	if(typeof this.adsManager.vastResponse != 'undefined') {
		if(adsManager.isVPAID(this.adsManager.vastResponse)) {
			return 'application/javascript';
		} else {
			return 'video/mp4';
		} 
	} else {
		return 'application/javascript';
	}
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
	'FULLSCREEN': 'fullscreenchange',
	'LOAD_META_DATA':'loadmetadata',
	'VAST_EMPTY_RESPONSE_ERROR':'VAST_EMPTY_RESPONSE_ERROR',
	'VAST_INVALID_TAG_ERROR':'VAST_INVALID_TAG_ERROR',
	'AD_PLAYING' : 'AdPlaying'
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
    this.adCompleted;
    this.isShowControlOnAdCompleted;
    this.adPaused = false;
	var adManagerObj = this;
	this.currentQuartileToBeSend = pgads.PGVideoAdQuartile.PGVideoAdQuartileFirst;


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
		//alert(this.player.vastClient);
		//VPAIDIntegrator.resizeAd(width,height,viewMode);
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
		if(this.adCompleted == true) {
			adManagerObj.player.play();
		} else {
			adManagerObj.player.vast.adUnit.resumeAd();
		}
	};

	this.destroy = function () {
		
	};

	this.pause = function () {
		if(this.adCompleted == true) {
			adManagerObj.player.pause();
		} else {
			adManagerObj.player.vast.adUnit.pauseAd();
		}
	}

	this.player.on('pause', function () {
		 adManagerObj.sendCallback(pgads.AdEvent.Type.CONTENT_PAUSE_REQUESTED);
		 adManagerObj.player.off('pause');
	});

	this.player.on('vpaid.AdPlaying', function () {
		if(adManagerObj.adPaused) {
			adManagerObj.sendCallback(pgads.AdEvent.Type.AD_PLAYING);
		}
	});

	this.player.on('loadedmetadata', function () {
		adManagerObj.sendCallback(pgads.AdEvent.Type.LOAD_META_DATA);
	});

	this.player.on('error',function () {
		adManagerObj.sendCallback(pgads.AdEvent.Type.AD_ERROR);
	});

	this.player.on('ended', function () {
		 //alert('ended');
   });

	this.player.on('fullscreenchange', function() {
		adManagerObj.sendCallback(pgads.AdEvent.Type.FULLSCREEN);
	});

	//VPAID EVENT
	this.player.on('vpaid.AdClickThru', function () {
		//alert('adclick');
		 adManagerObj.sendCallback(pgads.AdEvent.Type.CLICK);
  	 });

	this.player.on('vpaid.AdLoaded', function() {
		adManagerObj.sendCallback(pgads.AdEvent.Type.LOADED);
	});

	this.player.on('vpaid.AdSkipped', function() {
		//alert('adskip');
        adManagerObj.sendCallback(pgads.AdEvent.Type.SKIPPED);
	});

	this.player.on('vpaid.AdStarted', function() {
	
		if(this.vast.vastResponse != 'undefined'); {
       		adManagerObj.vastResponse = this.vast.vastResponse;
    	}
        if(this.vast.vastResponse.ads != 'undefined'); {
    		adManagerObj.adPodInfo = this.vast.vastResponse.ads;
        }
        adManagerObj.sendCallback(pgads.AdEvent.Type.STARTED);
	});

	this.player.on('vpaid.AdStopped', function() {
				//alert('stopped');
		//if(adManagerObj.player.currentSrc()) {
			adManagerObj.sendCallback(pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED);	
//     	} else {
//     		adManagerObj.sendCallback(pgads.AdEvent.Type.ALL_ADS_COMPLETED);
//     	}
	});

	this.player.on('vpaid.AdVideoFirstQuartile', function() {
		adManagerObj.sendCallback(pgads.AdEvent.Type.FIRST_QUARTILE);
	});

	this.player.on('vpaid.AdVideoMidpoint', function() {
		adManagerObj.sendCallback(pgads.AdEvent.Type.MIDPOINT);
	});

	this.player.on('vpaid.AdVideoThirdQuartile', function() {
		adManagerObj.sendCallback(pgads.AdEvent.Type.THIRD_QUARTILE);
	});

	this.player.on('vpaid.AdVideoComplete', function() {
		adManagerObj.isShowControlOnAdCompleted = true;
		adManagerObj.adCompleted = true;
		adManagerObj.sendCallback(pgads.AdEvent.Type.COMPLETE);
		//TODO: send content resume callback
    });

	this.player.on('vpaid.AdPaused', function() {
		adManagerObj.adPaused = true;
		adManagerObj.sendCallback(pgads.AdEvent.Type.PAUSED);
	});

	//VAST Event
	this.player.on('vast.adError', function(error) {
		//alert('aderror');
		adManagerObj.sendCallback(pgads.AdEvent.Type.AD_ERROR);
	});

	this.player.on('vast.adStart', function() {
	    if(this.vast.vastResponse != 'undefined'); {
       		adManagerObj.vastResponse = this.vast.vastResponse;
    	}
        if(this.vast.vastResponse.ads != 'undefined'); {
    		adManagerObj.adPodInfo = this.vast.vastResponse.ads;
        }
        adManagerObj.sendCallback(pgads.AdEvent.Type.STARTED);
	});

	this.player.on('vast.adSkip', function() {
	      adManagerObj.sendCallback(pgads.AdEvent.Type.SKIPPED);
	});

	this.player.on('vast.adEnd', function() {
		adManagerObj.isShowControlOnAdCompleted = true;
	    adManagerObj.adCompleted = true;
		adManagerObj.sendCallback(pgads.AdEvent.Type.COMPLETE);
		adManagerObj.sendCallback(pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED);
	});

	this.player.on('timeupdate' ,function() {
		if(adManagerObj.adCompleted == true) {
			if((this.duration()-this.currentTime()) ==  0.0) {
				this.pgads.showControls();
			}
		}
		if(typeof adManagerObj.vastResponse != 'undefined') {
			if(!adManagerObj.isVPAID(adManagerObj.vastResponse)) {
				var currentPlayedPercentage = (this.currentTime() / this.duration()) * 100;
				 switch(adManagerObj.currentQuartileToBeSend){  
					    case pgads.PGVideoAdQuartile.PGVideoAdQuartileFirst:
						    if(currentPlayedPercentage > 25.0) {
							  adManagerObj.sendCallback(pgads.AdEvent.Type.FIRST_QUARTILE);
							  adManagerObj.currentQuartileToBeSend = pgads.PGVideoAdQuartile.PGVideoAdQuartileSecond;
							} 
					     break;  
					    case pgads.PGVideoAdQuartile.PGVideoAdQuartileSecond:
							if(currentPlayedPercentage > 50.0) {
								adManagerObj.sendCallback(pgads.AdEvent.Type.MIDPOINT);
								 adManagerObj.currentQuartileToBeSend = pgads.PGVideoAdQuartile.PGVideoAdQuartileThird;
							} 
					    break;  
					    case pgads.PGVideoAdQuartile.PGVideoAdQuartileThird: 
						    if (currentPlayedPercentage > 75.0) {
							  adManagerObj.sendCallback(pgads.AdEvent.Type.THIRD_QUARTILE);
							  adManagerObj.currentQuartileToBeSend = pgads.PGVideoAdQuartile.PGVideoAdQuartileFourth;
							}
					    break;  
					    case pgads.PGVideoAdQuartile.PGVideoAdQuartileFourth: 
							if(currentPlayedPercentage >= 100.0) {
								this.off('timeupdate');
								//adManagerObj.sendCallback(pgads.AdEvent.Type.CONTENT_RESUME_REQUESTED);
							}
					    break;
				    }  
			}
		}
	});
 
   this.sendCallback = function(key) {
   		var adEvent = new pgads.AdEventInfo(key,this);
   		//pgads.getEventsCallback(this.adsManagerLoaderEvents,key)(adEvent);
    	var adEventsCallback = pgads.getEventsCallbacks(this.adsManagerLoaderEvents,key);
        for (var i = adEventsCallback.length - 1; i >= 0; i--) {
        	(function(i){ 
        		adEventsCallback[i](adEvent) 
        	})(i);
        }
   };

   this.isVPAID = function(vastResponse) {
	    var i, len;
	    var mediaFiles = vastResponse.mediaFiles;
	    for (i = 0, len = mediaFiles.length; i < len; i++) {
	    	var mediafile = mediaFiles[i];
	         if(mediafile.type === pgads.AdType.VPAID){
	          return true;
	      	}
	      }
	    return false;
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

pgads.getEventsCallbacks = function(eventsData,key) {
    
    var eventsCallback = [];

	    for (var i = eventsData.length - 1; i >= 0; i--) {
			object = eventsData[i]
			if(object.key == key) {
				eventsCallback.push(object.value);
			}
		}

	return eventsCallback;
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
	this.player = player;
	this.adsLoaderEvents = [];
    selfAdsLoader = this;
    this.pgadPluginOpts;
	
	
	
	this.requestAds = function (adRequest) {

		//alert("adTagXML 1 "+adRequest.adsResponse);

		//alert("adTagUrl "+adRequest.adTagUrl);

		

		if(typeof adRequest.adTagUrl != 'undefined' ){

			
			
			this.pgadPluginOpts = {
	      		"adCancelTimeout":20000,// Wait for ten seconds before canceling the ad.
	      		"adsEnabled": true,
	      		"autoResize":true,
	      		"verbosity":4,
	      		//"vpaidFlashLoaderPath":'/VPAIDFlash.swf',
	      		"adTagUrl":adRequest.adTagUrl    
			}

		}else if(typeof adRequest.adsResponse != 'undefined' ) { 

	
			function requestVASTXML(callback) {
    		//The setTimeout below is to simulate asynchrony
   			 setTimeout(function(){
        	callback(null, adRequest.adsResponse);
    			}, 0);
			}

			this.pgadPluginOpts = {
	      		"adCancelTimeout":20000,// Wait for ten seconds before canceling the ad.
	      		"adsEnabled": true,
	      		"autoResize":true,
	      		"verbosity":4,
	      		//"vpaidFlashLoaderPath":'/VPAIDFlash.swf',
	      		"adTagXML":requestVASTXML    
			};
		}
	  var vastclient = this.player.vastClient(this.pgadPluginOpts);

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
pgads.AdDisplayContainer = function (adContainerDiv,adContainerTopDiv,contentPlayer) {

	this.adContainerDiv = adContainerDiv;
	this.contentPlayer = contentPlayer;
	this.adContainerTopDiv = adContainerTopDiv;


	this.initialize = function () {
			
	}
}





