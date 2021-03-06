$(document).ready(function() {

  // fixes bug where date was getting dropped into place
  $('#place').val('');

  // Timepicker search options code
  //define start end
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
  const beforeShow =  (input, inst) =>
    setTimeout(() =>
        inst.dpDiv.css({
            top: $(input).offset().top + input.offsetHeight,
        }), 0);

  const calOpts = {
    minDate: now.toDate(),
    hideIfNoPrevNext: true,
    dateFormat: 'm/d/y',
    daysNameMin: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    nextText: "",
    prevText: "",
    beforeShow,
    beforeShowDay: function(date) {
      const sel  = moment(date);
      return [true,
        (sel.isAfter(start, 'day') && sel.isBefore(end, 'day')) ? "bet-highlight" :
        (sel.isSame(start, 'day')) && (sel.isSame(end, 'day')) ? 'both-highlight' :
        (sel.isSame(start, 'day')) ? 'start-highlight' :
        (sel.isSame(end, 'day')) ? 'end-highlight' : ""
      ];
    },
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
    setTimeout(() => $( "#end-date" ).datepicker('show'), 100);
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

  modifyEndAgainstStart = () => {
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
      end = start.clone().add(1, 'h');
      setEndDateAndTime(end);
    }
    modifyEndAgainstStart()
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



  $( "#end-time" ).timepicker(timepickerOptions);
  $( "#start-time" ).timepicker(timepickerOptions);
  $( "#start-time" ).on('change', changeStartTime);

  $( "#end-date" ).datepicker({...calOpts, onSelect: changeEndDate });
  $( "#start-date" ).datepicker({ ...calOpts, onSelect: changeStartDate });
  initializeDatePickers();

  // add default viewport
  this.viewport;
  // mapViewport is used for mapview, and simple search
  this.mapViewport;

  let urlHostName = "www.getaround.com"

  // google maps stuff
  const input2 = $('#search-place')[0];

  const autocomplete2 = new google.maps.places.Autocomplete(input2);

  const assignViewportToSearch = (vp, isMap) => {
    const vpS = `${vp.ma.j},${vp.ga.j},${vp.ma.l},${vp.ga.l}`;
    if (isMap) {
      this.mapViewport = vpS;
    } else {
      this.viewport = vpS;
    }
  }

  this.placesChangedHandler = () => {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
      } else {
        if (place.geometry.viewport) {
          const vp = place.geometry.viewport;
          assignViewportToSearch(vp);
        } else {
          window.alert("No details available for input: '" + place.name + "'");
        }
      }
    }

  let geocoder;
  const input = $('#place')[0];

  const autocomplete = new google.maps.places.Autocomplete(input);

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
        if (results[0]) {
          autocomplete.set("place", results[0])
          try {
            const adminLevel1 = results[0].address_components.find(c => c.types.indexOf("administrative_area_level_1") > -1).long_name;
            const locality = results[0].address_components.find(c => c.types.indexOf("locality") > -1).long_name;
            $('#place').val(`${locality}, ${adminLevel1}`);
            setTimeout(() => $('#place').blur(), 1000);
          } catch (e) {

          }
        } else {
          // no results found at current location
        }
      } else {
        // browser did not allow location services
      }
    });
  }

  this.getSearchParams = (useMapVP) => {
    const params = new URLSearchParams();
    params.set('end_time', end.format(MOMENT_FORMAT));
    params.set('start_time', end.format(MOMENT_FORMAT));
    params.set('use', 'CARSHARE');
    params.set('viewport', useMapVP ? this.mapViewport : this.viewport);
    return params;
  }

  this.redirectToSearch = (e, data) => {
    e.preventDefault();
    const mvp = data ? data.mvp : false;
    const searchParams = this.getSearchParams(mvp);
    window.location.href = `https://www.getaround.com/search?${searchParams.toString()}`;
  }

  $("#submit-search").on("click", e => this.redirectToSearch(e, {mvp: false}));

    const initialize = () => {
      geocoder = new google.maps.Geocoder();
      getLocation();
    }

    autocomplete.setFields(['address_components', 'geometry','name']);
    autocomplete2.setFields(['address_components', 'geometry','name']);
    autocomplete.addListener('place_changed', this.placesChangedHandler);
    autocomplete2.addListener('place_changed', this.placesChangedHandler);

    initialize();
});
