let map;

function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    disableDefaultUI: true,
    gestureHandling: 'none',
    zoomControl: false,
  });
}


$(document).ready(function() {
  const MOMENT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'

  const assignViewportToSearch = (vp, isMap) => {
    const vpS = `${vp.ma.j},${vp.ga.j},${vp.ma.l},${vp.ga.l}`;
    if (isMap) {
      this.mapViewport = vpS;
    } else {
      this.viewport = vpS;
    }
  }

  const recenterMapOnCity = (viewport) => {
    map.fitBounds(viewport);
  }



  const icon = {
    url: 'https://www.getaround.com/img/icons/map_marker_pin.png',
    scaledSize: new google.maps.Size(20,30)
  }

  const populateMapWithCars = carList => {
    const markers = carList.map(car =>
      new google.maps.Marker({
        position: {
          lat: car.latitude,
          lng: car.longitude,
        },
        clickable: false,
        icon,
        map: map,
      }));

      var markerCluster = new MarkerClusterer(map, markers,
            {
              styles: [
                {
                  url: 'https://uploads-ssl.webflow.com/5c16e90c8f6920b098f834e5/5c9b4968cce07f0b92f0e020_map_marker_pin_multi.png',
                  height: 26,
                  width: 18,
                  textColor: 'rgba(0,0,0,0)'
                },
              ],
              gridSize: 10,
            });
  }

  const makeCarApiRequest = (backupUrl) => {
    let url = backupUrl || `https://index.getaround.com/v1.0/search`;
    url = `${url}?product=web&viewport=${this.mapViewport}&use=CARSHARE`;
    fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data && data.cars) {
        populateMapWithCars(data.cars)
      }
    }).catch(() => backupUrl ? console.error() : makeCarApiRequest(`https://index.g3staging.getaround.com/v1.0/search`))
  }


  const getCityViewport = () => {

    const urlCityList = [
      {url: 'atlanta-car-rental', city: 'Atlanta, GA'},
      {url: 'berkeley-car-rental', city: 'Berkeley, CA'},
      {url: 'boston-car-rental', city: 'Boston, MA'},
      {url: 'chicago-car-rental', city: 'Chicago, IL'},
      {url: 'denver-car-rental', city: 'Denver, CO'},
      {url: 'los-angeles-car-rental', city: 'Los Angeles, CA'},
      {url: 'miami-car-rental', city: 'Miami, FL'},
      {url: 'new-jersey-car-rental', city: 'Jersey City, NJ'},
      {url: 'new-york-car-rental', city: 'New York City, NY'},
      {url: 'oakland-car-rental', city: 'Oakland, CA'},
      {url: 'philadelphia-car-rental', city: 'Philadelphia, PA'},
      {url: 'portland-car-rental', city: 'Portland, OR'},
      {url: 'san-diego-car-rental', city: 'San Diego, CA'},
      {url: 'san-francisco-car-rental', city: 'San Francisco, CA'},
      {url: 'seattle-car-rental', city: 'Seattle, WA'},
      {url: 'washington-dc-car-rental', city: 'Washington, D.C.'},
    ];
    const url = window.location.href;
    const last = url.split('/')[url.split('/').length - 1];
    const { city } = urlCityList.find(i => last.search(i.url) > -1) || { city: 'San Francisco, CA' };
    var request = {
        query: city,
        fields: ['geometry'],
      };

      $('#search-place').val(city);

      var service = new google.maps.places.PlacesService(document.createElement('div'));

      service.findPlaceFromQuery(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const viewport = results[0].geometry.viewport;
          assignViewportToSearch(viewport, true);
          recenterMapOnCity(viewport);
          makeCarApiRequest();
        }
      });
  }

  const initialize = () => {
    geocoder = new google.maps.Geocoder();
    // getLocation();
    getCityViewport();
  }

  initialize();
  const REVIEW_MOMENT_FORMAT = 'MMMM Do, YYYY';
  const MD = 768;
  const SM = 576;

  const width = () => $( window ).width();

  const apiUrl = 'https://us-central1-getaround3.cloudfunctions.net/api';

  const getNum = () => {
    if (width() > MD) {
      return 4;
    }
    if (width() > SM) {
      return 3;
    }
    return 1;
  }

  this.num = getNum();
  this.offset = 0;
  this.reviews = [];

  const populateReviewsItem = (newReviews) => {

    if (newReviews && newReviews.length) {
      const cards = newReviews.map(review =>
        `<div class="col-12 col-md-4 col-lg-3 card-wrapper">
          <div class="card">
            <div class="card-body">
              <div class="card-title d-flex">
                <h5 class="col-9">${review.name}<br /><span>${moment(review.date).format(REVIEW_MOMENT_FORMAT)}</span></h5>
                <div class="col-3" style="background-image: url(${review['persona-image'].url})" />
              </div>
              <div class="row stars-holder">
                ${[...Array(4)].map((e, i) => '<i class="fas fa-star" />').join('')}
              </div>
              <p class="card-text">
                ${review.comment}
              </p>
            </div>
          </div>
        <div>`
      )
      $('#reviews-wrapper').append(cards)
    }
  }

  const fetchItems = ({ num = 8, offset = 0 } = {}) => {
    fetch(`${apiUrl}/collections/5ca580d63640517502cd743d?num=${num}&offset=${offset}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.items) {
        let items = data.items
        const maxItems = width() <= MD ? 21 : 20;
        if (items.length + this.reviews.length >= maxItems) {
          $('#load-more').hide();
          items = items.slice(0, maxItems-this.reviews.length);
        }
        this.reviews = this.reviews.concat(items);
        populateReviewsItem(items);
      }
    })
    .catch(console.error)
    .catch(console.error);
  }

  this.cars = [];

  const toShow = () => {
    if (width() < SM) {
      return 1;
    }
    if (width() <= MD) {
      return 2;
    }
    return 4;
  }

  const populateCarsItem = (newCars) => {
    if (newCars && newCars.length) {
      $("#carousel").slick({
        slidesToShow: toShow(),
        centerMode: width() <= MD,
        arrows: width() > SM,
        nextArrow: '<i class="arrow fas fa-chevron-right fa-2x" ></i>',
        prevArrow: '<i class="arrow fas fa-chevron-left fa-2x" ></i>',
        // autoplay: true,
      });
      newCars.forEach(car => {
        $("#carousel").slick('slickAdd',`
        <div class="wrapper">
          <div class="item">
            <div class="bg-img" style="background-image: url(${car['car-photo'].url})" />
            <div class="caption">
              <h3>${car.name}</h3>
              <p>from $${car.price}/hr</p>
              <a href='https://${car['car-url']}'>${car.name.split(' in ')[0]}</a>
            </div>
          </div>
        </div>
        `);
      }
      )
    }
  }

  const fetchCars = ({ num = 12, offset = 0 } = {}) => {
    fetch(`${apiUrl}/collections/5ca580d6364051d9fecd7443?num=${num}&offset=${offset}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.items) {
        this.cars = this.cars.concat(data.items);
        populateCarsItem(data.items);
      }
    })
    .catch(console.error)
    .catch(console.error);
  }

  const initData = () => {
    this.cars = [];
    fetchCars({ num: 12 });
    this.reviews = [];
    fetchItems({ num: this.num * 2 });
    this.offset = this.num;
  }

  const loadMore = () => {
    this.offset = this.offset + getNum();
    fetchItems({ num: this.num, offset: this.offset });
  }

  const resize = () => {
    this.num = getNum();
    this.offset = 2 * getNum();
    const children = $('#reviews-wrapper').children();
    let i;
    for (i = 0; i < children.length; i++) {
      children[i].remove();
    }
    initData();
  }

  $("#load-more").on('click', loadMore);

  initData();


    this.getSearchParams = (useMapVP) => {
      const params = new URLSearchParams();
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

    $("#simple-submit-search").on("click", e => this.redirectToSearch(e, {mvp: true}));
    $("#overlay").on("click", e => this.redirectToSearch(e, {mvp: true}));
});
