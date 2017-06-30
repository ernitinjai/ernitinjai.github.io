(function () {
    if (!window._pgjssdk) {
        var baseUrl = 'ads.personagraph.com/ad/med/ss',
            trackingServerUrl = 'pixel.personagraph.com/cookieCallback',
            intOverlay,
            intOverlayId,
            intAdLoaded = false,
            intOverlayAdContainer,
            intOverlayAdContainerId,
            versionString = 'v2.0',
            defaultParams = {
                pid: '',
                ua: navigator.userAgent,
                device_id: '',
                bundle_id: window.location.host,
                sdk: 'true',
                ad_source: 'js-sdk',
                ad_type: 'false',
                adv_type: 'DISPLAY',
                in_app: 'false',
                path:window.location.pathname
            },
            mandatoryParams = ['pid', 'ad_width', 'ad_height'],
            acceptedParams = {
                pid: 'pid',
                ad_width: 'ad_width',
                ad_height: 'ad_height',
                ua: 'ua',
                ad_source: 'ad_source',
                device_id: 'device_id',
                bundle_id: 'bundle_id',
                sdk: 'sdk',
                adv_type: 'adv_type',
                ad_type: 'ad_type',
                path:'path'
            },
            valid_ad_slots = [
                '88X31',
                '120X20',
                '120X60',
                '120X240',
                '125X125',
                '180X150',
                '168X28',
                '216X36',
                '200X200',
                '200X446',
                '300X50',
                '320X48',
                '300X250',
                '336X280',
                '728X90',
                '468X60',
                '120X600',
                '320X480',
                '320X50',
                '768X1024',
                '800X1280',
                '160X600',
                '480X75',
                '500X130',
                '292X60',
                '250X250',
                '250X125',
                '480X320',
                '1024X768',
                '1280X800',
                '320X100',
                '220X90',
                '234X60',
                '240X133',
                '292X30',
                '300X31',
                '300X100',
                '300X600',
                '300X1050',
                '320X100',
                '960X90',
                '970X66',
                '970X250',
                '375X50',
                '414X736',
                '736X414',
                '1024X90',
                '970X90',
                '980X120',
                '930X180',
                '425X600',
                '240X400',
                '250X360',
                '480X32',
                '580X400',
                '750X300',
                '750X200',
                '750X100',
                '950X90',
                '300X57'
            ];
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        var createCookieId = function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        var setCookie = function (value) {
            var name = '_pg_c_id';
            var exp = 10 * 365 * 24 * 3600;

            if (exp) {
                var date = new Date();
                date.setTime(date.getTime() + (exp * 1000));
                var exp = "expires=" + date.toGMTString();
            }
            else {
                var exp = "";
            }
            document.cookie = name + "=" + value + "; " + exp + ";path=/;";
            return value;
        }

        var getCookie = function () {
            var c_name = '_pg_c_id';
            if (document.cookie.length > 0) {
                c_start = document.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) {
                        c_end = document.cookie.length;
                    }
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        }

        var hitTrackingServer = function(config){
            var xmlhttp;
            if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            }
            else
            {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4){
                    if(xmlhttp.status == 200) {
                        var res = JSON.parse(xmlhttp.responseText);
                        setCookie(res.cookie_id);
                    }
                }
            };
            xmlhttp.withCredentials = true;
            var url = getTrackingServerUrl(config);
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        }

        var checkForCookie = function(config){
            if (!isMobile()) {
                var c_id = getCookie();
                if(!c_id){
                    c_id = createCookieId();
                    config.jscookie = true;
                }
                config.device_id = c_id; // For ad server
                config.cookie_id = c_id; // for tracking server
                config.bundle_id = getHostName();//window.location.host;
                hitTrackingServer(config);
            } else {
                config.in_app = 'true';
            }
            return config;
        }

        var validateConfig = function (config) {

            for (var i = 0; i < mandatoryParams.length; i++) {
                var k = mandatoryParams[i];
                if (!config.hasOwnProperty(k) || config[k] === null || config[k].length === 0) {
                     console.error("pgjs.js: ERROR: missing required config parameter '" + k + "'");
                }
            }

            if (isMobile()) {
                if (!config.device_id)
                    console.error("pgjs.js: ERROR: missing required config parameter device_id");
                if (!config.bundle_id)
                    console.error("pgjs.js: ERROR: missing required config parameter bundle_id")
            }

            var adSlot = config.ad_width + "X" + config.ad_height;

            if (valid_ad_slots.indexOf(adSlot) == -1) {
                config.invalid_dimension = 1;
                console.error("pgjs.js: ERROR: invalid value of ad dimension");
            }
        }

        var getProtocol = function () {
            var protocol = isMobile() ? 'http:' : window.location.protocol;
            return protocol ? protocol : 'http:'
        }

        var mergeDefaultParams = function (config) {
            for (var k in defaultParams) {
                if (!config[k]) {
                    config[k] = defaultParams[k];
                }
            }
            if (config.ad_type && config.ad_type.toLowerCase() === 'int') {
                config.ad_type = true;
            }
            //Set the CB, if its passed by publisher
            if(!config.cb){
                config.cb = Math.floor((Math.random() * 100000000) + 1);
            }

            return config
        }

        var isMobile = function () {
            var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
            if (app) {
                return true;
            } else {
                return false;
            }
        }

        var parseURL = function(url) {
            var a=document.createElement('a');
            a.href=url;
            return a.hostname;
        }

        var inIframe = function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        }

        var getHostName = function(){
            try{
                if(inIframe() && document && document.referrer){
                    return parseURL(document.referrer);
                }else{
                    return window.location.host;
                }
            }catch(e){
                return window.location.host;
            }
        }

        var getHostUrl = function(){
            try{
                if(inIframe()){
                    return document.referrer;
                }else{
                    return window.location.host + window.location.pathname + window.location.search;
                }
            }catch(e){
                return window.location.host + window.location.pathname + window.location.search;;
            }
        }

        var getQueryString = function (config) {
            var qry = [], k;
            for (k in config) {
                if (k != 'ad_container_id' && k != 'click_track_url' && k != 'imp_track_url') {
                    var value = config[k];
                    qry.push(encodeURIComponent(k) + "=" + encodeURIComponent(value))
                }
            }

            //TODO: add for ip , hardcoded
            qry.push(encodeURIComponent('ip') + "=" + encodeURIComponent('12.107.176.9'));
            return qry.join("&");
        }

        var getReqUrl = function (config) {
            var url = getProtocol() + "//" + baseUrl + "?" + getQueryString(config);
            return url;
        }

        var getClickUrl = function(config){
            var url = getProtocol() + "//" + baseUrl + "/click?" + getQueryString(config);
            return url;
        }

        var getImpUrl = function(config){
            var url = getProtocol() + "//" + baseUrl + "/impression?" + getQueryString(config);
            return url;
        }

        var getTrackingServerUrl = function(config){
            var trackingParams = {};
            if(config.pid){
                trackingParams.partner_id = config.pid.split("-")[1] | '';
            }
            trackingParams.pub_hostname = getHostName();//window.location.host;
            trackingParams.pub_url = getHostUrl();//window.location.host + window.location.pathname + window.location.search;
            trackingParams.cookie_id = config.cookie_id || '';
            trackingParams.ua = navigator.userAgent;
            var url = getProtocol() + "//" + trackingServerUrl + "?" + getQueryString(trackingParams);
            return url;
        }

        var getRandomId = function () {
            var str = "", charsets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", i;
            for (i = 0; i < 6; i++) {
                str += charsets.charAt(Math.floor(Math.random() * charsets.length))
            }
            return str;
        }

        var wrapResponseInHtml = function (a) {
            var b = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/></head><body style="margin: 0px;padding: 0px;background-color: black;">';
            return b += a, b += "</body></html>"
        }

        var getAdFromServer = function(url,config,cb){

            var xmlhttp;
            if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            }
            else
            {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4){
                    if(xmlhttp.status == 200) {
                        var e = xmlhttp.responseText;
                        -1 == e.indexOf("<html") && (e = wrapResponseInHtml(e))
                        e.replace("<body>", '<body style="margin:0px;padding:0px;">');
                        config.network = xmlhttp.getResponseHeader('X-PG-Mediation-NW');
                        var adProvider = xmlhttp.getResponseHeader('X-PG-Ad-Provider');
                        config.reqId = xmlhttp.getResponseHeader('X-PG-Request-Id');
                        cb(null,e,adProvider);
                    }else{
                        cb({message:"some error"});
                    }
                }
            };
            xmlhttp.withCredentials = true;
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        }

        var createAd = function (iFrame, adContainer, config) {
            return {
                iFrameRef: iFrame,
                adContainer:adContainer,
                config: config,
                getNewAd: function (config) {
                    return ad(this, config)
                }
            }
        }

        var adCloseButton = function (iframe, config) {
            var closeButton = document.createElement("div");
            closeButton.setAttribute("class", "pg-sdk-close-btn");
            closeButton.setAttribute("style", "position: fixed; top:10px; right:10px; z-index:6000003");
            closeButton.innerHTML = "<img src='http://cdn.personagraph.com/sdk/closeIcon.png' width='40px' height='40px' onclick='window._pgjssdk.closeAd(this);' />";
            iframe.parentNode.insertBefore(closeButton, iframe.parentNode.firstChild)
        }

        var windoWidth = function(){

            var wih = window.innerHeight ? window.innerHeight:0;
            var dch = (document.documentElement && document.documentElement.clientHeight)? document.documentElement.clientHeight :0;
            var dbh = document.body.clientHeight ? document.body.clientHeight : 0;
            var max = wih;
            if(max < dch){
                max = dch
            }
            if(max < dbh){
                max = dbh
            }
            return max;

        }

        var showBGPopup = function(){

            if(!intOverlay){
                intOverlay = document.createElement("div");
                intOverlayId = 'pg-int-overlay-' + getRandomId();
                intOverlay.id = intOverlayId;
                intOverlay.style.position = 'fixed';
                intOverlay.style.margin = '2px';
                intOverlay.display = 'block';
                intOverlay.style.top = "0px";
                intOverlay.style.background = "#999";
                intOverlay.style.opacity = 0.5;
                intOverlay.style.zIndex = 6000001;
                intOverlay.style.width = "100%";
                intOverlay.style.height = windoWidth() + 'px';
                intOverlay.scrolling = "no";
                document.body.appendChild(intOverlay);
            }

        }

        var checkIfAdSlot = function(elem,id){
            for(i=0;i<2;i++){
                if(elem){
                    if(elem.id === id){
                        return true
                    }else {
                        elem = elem.parentNode;
                    }
                }else{
                    return false;
                }
            }
            return false;
        }

        var hitClickTracking = function(config){
            var url = getClickUrl(config);
            var img1 = document.createElement('img');
            img1.src = url;
            if(config.click_track_url){
                var img2 = document.createElement('img');
                img2.src = config.click_track_url;
            }
        }

        var initAd = function (config,c) {
            var randomId = getRandomId();
            var iFrameID = 'pg-ifame-' + randomId, iframe;
            var iframe = document.createElement("iframe");
            var adContainer = document.createElement("div");
            adContainer.style.display = 'none';

            var adContainerId = 'ad-c-'+randomId;
            adContainer.id = adContainerId;

            if ((config.ad_type === 'int' || config.ad_type == true)) {
                if(!intAdLoaded){
                    intAdLoaded = true;
                    adContainer.style.position = 'fixed';
                    adContainer.style.top = "0px";
                    adContainer.scrolling = "no";
                    var marginLeft = Math.ceil((window.innerWidth - config.ad_width) / 2);
                    marginLeft = marginLeft > 0 ? marginLeft : 0;
                    var marginTop = Math.ceil((window.innerHeight - config.ad_height) / 2);
                    marginTop = marginTop > 0 ? marginTop : 0;
                    adContainer.style.marginLeft = marginLeft + 'px';
                    adContainer.style.marginTop = marginTop + 'px';
                    document.body.appendChild(adContainer);
                    adContainer.style.zIndex = 6000002;
                }else{
                    c && c(!1)
                    return true;
                }
            } else {
                var container;
                if(config.ad_container_id && (container = document.getElementById(config.ad_container_id))){
                    container.appendChild(adContainer);
                }else{
                    var scriptContainer = document.getElementById(config.pid);
                    if (scriptContainer) {
                        scriptContainer.parentNode.insertBefore(adContainer, scriptContainer);
                    }else{
                        config.wrong_cid = 1;
                        console.error("pgjs.js: ERROR: Either pass ad container id or assign pid as html id to the script tag");
                    }
                }
            }

            iframe.class = "pg-sdk-ad";
            iframe.id = iFrameID;
            iframe.style.width = config.ad_width;
            iframe.style.height = config.ad_height;
            iframe.style.border = "none";
            iframe.style.overflow = "hidden";
            iframe.scrolling = "no";
            iframe.marginHeight = "0px";
            iframe.marginWidth="0px";
            var url = getReqUrl(config);

            getAdFromServer(url,config,function(err,response,adProvider){
                if(!err){
                    adContainer.appendChild(iframe);
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(response);
                    iframe.contentWindow.document.close();
                    iframe.style.display = "block";
                    iframe.style.width =  config.ad_width + "px";
                    iframe.style.height = config.ad_height + "px";
                    adContainer.style.display = 'block';


                    if(adProvider && adProvider == 'SERVO'){
                        iframe.style.display="none";
                    }else{
                        iframe.style.display="block";
                    }

                    if(config.ad_type == 'int' || config.ad_type == true){
                        adCloseButton(iframe,config);
                        showBGPopup();
                    }

                    //Pub Impression tracking
                    if(config.imp_track_url){
                        var imgTrack = document.createElement('img');
                        imgTrack.src = config.imp_track_url;
                    }

                    //PG Impression tracking
                    var pgImpTrack = document.createElement('img');
                    pgImpTrack.src = getImpUrl(config);

                    //To check if its clicked
                    var clickTracked = false;

                    //IF ad loads inside iframe
                    var monitor = setInterval(function(){
                        var elem = document.activeElement;
                        var isAdSlot = elem?checkIfAdSlot(elem.parentNode,adContainerId):false;
                        if(isAdSlot){
                            clickTracked = true;
                            hitClickTracking(config);
                            clearInterval(monitor);
                        }
                    },500);

                    //if ad loads inside script tag
                    adContainer.onclick=function(){
                        if(!clickTracked)
                           hitClickTracking(config);
                        clickTracked = true;
                        clearInterval(monitor);
                    }

                    c && c(!0);
                }else{
                    c && c(!1);
                }
                return '';
            });
        }

        var initVideoAd = function (config,c) {

            var randomId = getRandomId();
            var adRequest;
            if(config.adv_type === 'VIDEO_INT') {
                    var videoContainer = document.getElementById('video-container');
                    createVideoEl(videoContainer);
                    config.adv_type = 'VIDEO';
                    adRequest = new Ads();
                 
                    videoContainer.style.position = 'fixed';
                    videoContainer.style.top = "0px";
                    videoContainer.scrolling = "no";
                    var marginLeft = Math.ceil((window.innerWidth - config.ad_width) / 2);
                    marginLeft = marginLeft > 0 ? marginLeft : 0;
                    var marginTop = Math.ceil((window.innerHeight - config.ad_height) / 2);
                    marginTop = marginTop > 0 ? marginTop : 0;
                    videoContainer.style.marginLeft = marginLeft + 'px';
                    videoContainer.style.marginTop = marginTop + 'px';
                    videoContainer.style.zIndex = 6000002;

                    var closeButton = document.createElement("div");
                    closeButton.setAttribute("class", "pg-sdk-close-btn");
                    closeButton.setAttribute("style", "position: fixed; top:10px; right:10px; z-index:6000003");
                    closeButton.innerHTML = "<img src='http://cdn.personagraph.com/sdk/closeIcon.png' width='40px' height='40px' onclick='window._pgjssdk.closeVideoAd(this);' />";
                    document.body.appendChild(closeButton);
                    showBGPopup();
            } else {
                 adRequest = new Ads();
            }

            var url = getReqUrl(config);

            //adRequest.executeVastTagUrl(url,'300px','150px');
            adRequest.executeVastTagUrl('https://rtr.innovid.com/r1.5554946ab01d97.36996823;cb=%25%CACHEBUSTER%25%25','300px','150px');
            //Pub Impression tracking
            if(config.imp_track_url){
                var imgTrack = document.createElement('img');
                imgTrack.src = config.imp_track_url;
            }

            //PG Impression tracking
            var pgImpTrack = document.createElement('img');
            pgImpTrack.src = getImpUrl(config);

            //send error callback
            //     c && c(!0);
            // }else{
            //     c && c(!1);
            // }
        }

        function createVideoEl (container) {
          const videoTag = '<video id="pg_content_video" class="video-js vjs-default-skin" playsinline autoplay muted>' +
           '</video>';

         container.innerHTML = videoTag;
    }

        window._pgjssdk = {
            showAd: function (config, cb) {
                setTimeout(function () {
                    validateConfig(config);
                    config = checkForCookie(config);
                    config = mergeDefaultParams(config);
                    initAd(config,cb);
                }, 0);
            },
            closeAd: function (ele) {
                var rmEl = ele.parentNode.parentNode;
                if (rmEl) {
                    ele.parentNode.parentNode.parentNode.removeChild(rmEl)
                }
                if (intOverlay) {
                    document.body.removeChild(intOverlay);
                }
            },
            showVideoAd: function(config, cb) {
                setTimeout(function () {
                    validateConfig(config);
                    config = checkForCookie(config);
                    config = mergeDefaultParams(config);
                    initVideoAd(config,cb);
                    
                }, 0);
            },
            closeVideoAd: function (ele) {
                if (ele) {
                    ele.remove();
                }
                if (intOverlay) {
                    document.body.removeChild(intOverlay);
                }
                var elem = document.getElementsByClassName('video-js')[0];
                elem.remove();
            }
        }
    } else {
        console.log('File was already included');
    }
})();
