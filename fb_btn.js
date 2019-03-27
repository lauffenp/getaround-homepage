

$(document).ready(function() {
  var debugString = false;
  var debugOwner = false;
  this.urlHostName = window.location.hostname;
  this.urlPort = window.location.port;
  this.urlProtocol = window.location.protocol;
  if (this.urlHostName == "w.getaround.com" || this.urlHostName == "getaround.webflow.io") {
      this.urlHostName = "www.getaround.com"
  }
  this.pageHost = this.urlPort + "//" + this.urlHostName;
  if (this.urlPort !== "") {
      this.urlHostName += ":";
  }
  this.apiHost = this.urlProtocol + "//" + this.urlHostName + this.urlPort;
  if (window.location.search) {
    debugString = window.location.search.indexOf("debug") != -1;
    debugOwner = window.location.search.indexOf("owner") != -1;
  }
  var useMockedResponse = false || debugString;
  // Retrieve the object from storage
  window.retrievedObject = undefined;
  try {
    if (window.localStorage != undefined) {
      var t = localStorage.getItem('ga-data');
      if (t) {
        window.retrievedObject = JSON.parse(t);
      }
      if (localStorage.getItem('ga-debug') === "DEBUG") {
        useMockedResponse = true;
      }
    }
  } catch (e) { }
  window.triggerDataLayerReady = function () {
    dataLayer.push({'event': 'user-ready-external-host'});
  };
  var versions = [{
    appId: "10153365504806675"
  },
  {
    // production
    appId: "195409021674"
  }];
  window.fbAsyncInit = function() {
    FB.init({
        appId: window.app_version.appId,
        oauth: true,
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xbml: true,
        version: 'v2.5'
    });
  };
  window.getUserState = function() {
    var state = "NOAUTH";
    if (retrievedObject.user) {
      state = "REGISTERED-RENTER";
      if (retrievedObject.user.isOwner === true) {
        state = "REGISTERED-OWNER";
      }
    }
    return state;
  };
  window.fb_login = function(event) {
    event.preventDefault();
    FB.login(function(response) {
      var host = window.getHost();
      if (response.authResponse) {
        var access_token = response.authResponse.accessToken; //get access token
        var user_id = response.authResponse.userID; //get FB UID
        var granted = response.authResponse.grantedScopes;
        document.location = host +"/search?auth=1&success=1&fb_atok=" + access_token + "&fb_user_id=" + user_id + "&fb_granted=" + granted;
      } else {
        document.location = host + "/search?auth=1";
      }
    }, {
      scope: 'email,public_profile,user_friends',
      return_scopes: true
    });
  };
  window.getHost = function() {
    return this.pageHost;
  }.bind(this);
  // Set to 1 for production
  window.app_version = versions[1];
  if (window.retrievedObject != undefined) {
    window.__wire(false);
  }
  window.wire = function(toAnimate) {
    var duration = toAnimate ? 500 : 0;
    $(".ga-wf-fb-button").on("click", window.fb_login);
    $('#car-day-fb').on("click", window.fb_login);
    $('#how-it-works-fb').on("click", window.fb_login);
    var path = window.getHost() + "/search?auth=1";
    $(".gnavuserlink").attr("href", path);
  };
  window.wire();
});
