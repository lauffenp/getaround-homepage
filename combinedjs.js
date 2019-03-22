

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
  $('#place').val('');
  let start = moment();
  let end = moment();
  const now = moment();
  const MOMENT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'
  const SHORT_FORMAT = 'YYYY-MM-DD'
  // initialize both datepickers

  const setStartDateAndTime = m => {
    $( "#start-date" ).datepicker("setDate", m.toDate());
    $("#start-time").timepicker('setTime', m.toDate());
    setMinEndAnHourLater();
  }

  const setEndDateAndTime = m => {
    $( "#end-date" ).datepicker("setDate", m.toDate());
    $("#end-time").timepicker('setTime', m.toDate());
    setMinEndAnHourLater();
  }

  const setMinEndAnHourLater = () => {
    if (start.clone().add(1, 'h').isAfter(start.clone().endOf('day')) ||
      start.clone().endOf('day').isSameOrAfter(end.clone().endOf('day'))
  ) {
      $("#end-time").timepicker('option','minTime', start.clone().add(1, 'h').toDate());
    } else {
      $("#end-time").timepicker('option','minTime', 0);
    }
  }

  const roundToNextFifteenMin = min => (Math.ceil(min/15) * 15) % 60;

  const roundUpHour = min => (Math.ceil(min/15) * 15) % 60 ? 0 : 1;

  const addDayAndHourAfterMidnight = ({ m, h = 0, d = 0, min = 0 }) =>
    m.add(d, 'd')
    .startOf('d')
    .add(h, 'h')
    .add(roundToNextFifteenMin(min), 'm')
    .add(roundUpHour(min), 'h');

  const initializeDatePickers = () => {
    const dotw = now.day();
    const hour = now.hour();

    if (!dotw || dotw === 6) { // is saturday or sunday
      if (hour > 5 && hour < 19) { //between 6AM and 6PM
        start = addDayAndHourAfterMidnight({ m: start, d: 0, h: now.hour() + 1, min: now.minutes() });
        end = addDayAndHourAfterMidnight({ m: end, d: 0, h:  now.hour() + 1 + 12, min: now.minutes()  });
        // should start 1 hour from now
        // should end 12 hours after start
      } else if (dotw === 0 && hour >=19) {
        start = addDayAndHourAfterMidnight({ m: start, d: 1, h: 9 });
        end = addDayAndHourAfterMidnight({ m: end, d: 1, h: 9 + 12 });
        // not defined. setting as default
      } else {
        start = addDayAndHourAfterMidnight({ m: start, d: 1, h: 9 });
        end = addDayAndHourAfterMidnight({ m: end, d: 1, h:  9 + 12  });
        //should start sunday 10am
        //should end 12 hours after start
      }
    } else if (dotw !==5) { // not friday
      if (hour > 5 && hour < 15) { //between 6 and 2
        start = addDayAndHourAfterMidnight({ m: start, d: 0, h: now.hour() + 3, min: now.minutes() });
        end = addDayAndHourAfterMidnight({ m: end, d: 0, h:  now.hour() + 3 + 12, min: now.minutes()  });
        // start is 3 hours from now
        // end is 12 hours after
      } else { //2pm to 6am
        start = addDayAndHourAfterMidnight({ m: start, d: 1, h: 9 });
        end = addDayAndHourAfterMidnight({ m: end, d: 1, h: 9 + 12 });
        // start day is next day, time is 9am
        // end 12 hours after start
      }
    } else { // is friday
      if (hour > 5 && hour < 15) { //between 6 and 2
        start = addDayAndHourAfterMidnight({ m: start, d: 0, h: now.hour() + 3, min: now.minutes() });
        end = addDayAndHourAfterMidnight({ m: end, d: 0 , h: now.hour() + 3 + 12, min: now.minutes() });
        // start is 3 hours from now
        // end is 12 hours after
      } else { //2pm to 6am
        start = addDayAndHourAfterMidnight({ m: start, d: 1, h: 9 });
        end = addDayAndHourAfterMidnight({ m: end, d: 1 , h: 9 + 24 });
        // start day is next day, time is 9am
        // end 24 hours after start
      }
    }
    setStartDateAndTime(start);
    setEndDateAndTime(end);
  }

  const calendarOptions = {
    minDate: now.toDate(),
    hideIfNoPrevNext: true,
    dateFormat: 'm/d/y',
    // altFormat: 'm/d/y'
  }

  const convertValDateText = valDateText => moment(valDateText, 'M/D/YY').format('MM/DD/YYYY');

  const changeStartDate = valDateText => {
    const dateText = convertValDateText(valDateText)
    const [m, d, y] = dateText.split('/');
    start.set({ 'y': y, 'M': parseInt(m, 10) - 1, 'D': d }); // months are zero indexed
    // change endDateMin

    $( "#end-date" ).datepicker('option', 'minDate', dateText);
    adjustEndTimeAgainstStart()
    setEndDateAndTime(end);
    setStartDateAndTime(start);
    $( "#start-date" ).blur();
  }

  const changeEndDate = valDateText => {
    const dateText = convertValDateText(valDateText)
    const [m, d, y] = dateText.split('/');
    end.set({'y': y, 'M': parseInt(m, 10) - 1, 'D': d}); // months are zero indexed
    adjustEndTimeAgainstStart()
    setEndDateAndTime(end);
  }

  const timepickerOptions = {
    step: 15,
    maxTime: '24:00',
    timeFormat: 'h:i A',
  }

  adjustEndDateAgainstStart = () => {
    if (start.clone().add(1, 'h').isAfter(start.clone().endOf('day'))) {
      // then we need to push the end, and min end, to the next day
      const minEndDate = start.clone().add(1, 'd');
      $( "#end-date" ).datepicker('option', 'minDate', minEndDate.toDate());
    } else {
      $( "#end-date" ).datepicker('option', 'minDate', start.toDate());
    }
  }

  const adjustEndTimeAgainstStart = () => {
    if (start.clone().add(1, 'h').isAfter(end)) {
      end.set({h: start.hour() + 1, m: start.minutes()})
    }
    if (start.day() === 5) { // is friday, so set default start time to 48 hours ahead
      end.set({D: start.date() + 2, h: start.hour(), m: start.minutes()})
    }
    adjustEndDateAgainstStart()
  }

  const changeStartTime = (e) => {
    e.preventDefault();
    const newStartTime = moment($('#start-time').timepicker('getTime'));
    const h = newStartTime.hours();
    const m = newStartTime.minutes();
    start.set({h, m});
    adjustEndTimeAgainstStart()

    setEndDateAndTime(end);
    setStartDateAndTime(start);
  }

  $( "#end-date" ).datepicker({...calendarOptions, onSelect: changeEndDate });
  $( "#start-date" ).datepicker({ ...calendarOptions, onSelect: changeStartDate });
  $( "#end-time" ).timepicker(timepickerOptions);
  $( "#start-time" ).timepicker(timepickerOptions);
  $( "#start-time" ).on('change', changeStartTime);
  initializeDatePickers();


  // add default viewport
  this.viewport;

  this.urlPort = window.location.port;
  let urlHostName = window.location.hostname;
  if (urlHostName == "w.getaround.com" || urlHostName == "getaround.webflow.io" || !urlHostName || urlHostName === '' ) {
      urlHostName = "www.getaround.com"
  }
  const pageHost = urlHostName;
  if (this.urlPort !== "") {
      this.urlHostName += ":";
  }

  // google maps stuff
  const input = $('#place')[0];
  const autocomplete = new google.maps.places.Autocomplete(input);

  this.placesChangedHandler = () => {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
      } else {
        if (place.geometry.viewport) {
          const vp = place.geometry.viewport;
          this.viewport = `${vp.ma.j},${vp.ga.j},${vp.ma.l},${vp.ga.l}`;
        } else {
          window.alert("No details available for input: '" + place.name + "'");
        }
      }
    }

  autocomplete.setFields(['address_components', 'geometry','name']);
  autocomplete.addListener('place_changed', this.placesChangedHandler);

  this.getSearchParams = () => {
    const end_time = `end_time=${end.format(MOMENT_FORMAT)}`;
    const start_time = `start_time=${start.format(MOMENT_FORMAT)}`;
    const use = 'use=CARSHARE';
    const viewport = `viewport=${this.viewport}`;
    return `${start_time}&${end_time}&${use}&${viewport}`;
  }
  this.redirectToSearch = e => {
    e.preventDefault();
    const searchParams = this.getSearchParams();

    window.location.href = `https://www.getaround.com/search?${searchParams}`;
  }
  $("#submit-search").on("click", this.redirectToSearch);

  let geocoder;

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  }

  const showPosition = position => {
    codeLatLng(position.coords.latitude, position.coords.longitude);
  }

  const codeLatLng = (lat, lng) => {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({
      'latLng': latlng
    }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          autocomplete.set("place", results[1])
          $('#place').val(results[1].formatted_address);
          $('#place').focus();
          setTimeout(() => $('#place').blur(), 1000);
        } else {
          // no results found at current location
        }
      } else {
        // browser did not allow location services
      }
    });
  }

  const initialize = () => {
    geocoder = new google.maps.Geocoder();
    getLocation();
  }
  initialize();
});
