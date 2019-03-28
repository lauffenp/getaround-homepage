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

  const calOpts = {
    minDate: now.toDate(),
    hideIfNoPrevNext: true,
    dateFormat: 'm/d/y',
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

  $( "#end-date" ).datepicker({...calOpts, onSelect: changeEndDate });
  $( "#start-date" ).datepicker({ ...calOpts, onSelect: changeStartDate });
  $( "#end-time" ).timepicker(timepickerOptions);
  $( "#start-time" ).timepicker(timepickerOptions);
  $( "#start-time" ).on('change', changeStartTime);
  initializeDatePickers();

  // add default viewport
  this.viewport;
  // mapViewport is used for mapview, and simple search
  this.mapViewport;

  let urlHostName = "www.getaround.com"

  // google maps stuff
  const input = $('#place')[0];
  const input2 = $('#search-place')[0];

  const autocomplete = new google.maps.places.Autocomplete(input);
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

  autocomplete.setFields(['address_components', 'geometry','name']);
  autocomplete2.setFields(['address_components', 'geometry','name']);
  autocomplete.addListener('place_changed', this.placesChangedHandler);
  autocomplete2.addListener('place_changed', this.placesChangedHandler);

  this.getSearchParams = (useMapVP) => {
    const end_time = `end_time=${end.format(MOMENT_FORMAT)}`;
    const start_time = `start_time=${start.format(MOMENT_FORMAT)}`;
    const use = 'use=CARSHARE';
    const viewport = `viewport=${useMapVP ? this.mapViewport : this.viewport}`;
    return `${start_time}&${end_time}&${use}&${viewport}`;
  }

  this.redirectToSearch = e => {
    e.preventDefault();
    const { mvp } = e.data ? e.data : {mvp: false};
    const searchParams = this.getSearchParams(mvp);
    window.location.href = `https://www.getaround.com/search?${searchParams}`;
  }

  $(".btn.search-inputs").on("click", this.redirectToSearch, {mvp: true});
});
