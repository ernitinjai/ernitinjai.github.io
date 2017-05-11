function initForm(width,height,tagUrl) {



    //var width = tagObj.width;
    //var height = tagObj.height;
    //var tagUrl = tagObj.tagUrl;
    //var tagEl = document.getElementById('input.tag-el');
    var videoContainer = document.getElementById('vjs-video-container');
    var videoElement = document.getElementById('video-js');
    
    document.getElementsByTagName("video")[0].setAttribute("width", width);
    document.getElementsByTagName("video")[0].setAttribute("height", height);

    videoElement.style.width = width;
    

    var adPluginOpts = {
              "adCancelTimeout":20000,// Wait for ten seconds before canceling the ad.
              "adsEnabled": true,
              //"adTagXML":this.adResp
              "url":tagUrl
        };
          //adPluginOpts.plugins["ads-setup"].adTagXML = XML
      this.player = videojs(videoElement, adPluginOpts, function() {
       });


      var vastAd = this.player.vastClient(adPluginOpts);

      this.player.play();
    
    

  }
