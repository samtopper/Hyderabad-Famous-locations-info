var map, marker;

// executes when map fails to load.
function loadingError() {
  "use strict";
  $('#error').html(
    "<h3>Google Maps is not loading. Please check your internet connection.</h3>"
  );
}

//----ViewModel ---- //
function initMap() {
  //API map constructor that creates new map.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 17.401481,
      lng: 78.450091
    },
    zoom: 11
  });

  var bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();
  ko.applyBindings(new ViewModel());

}

var ViewModel = function() {
  var self = this;

  //Make the model array into a knockout observable array.
  this.observableLocations = ko.observableArray(locations);
  console.log(this.observableLocations());

  var defaultIcon = makeMarkerIcon('1D97C4');
  // Highlighting the marker when the user mouses over.
  var highlightedIcon = makeMarkerIcon('AAE12C');

  // This function takes in a color, and then creates a new marker icon of that color.
  var markerImage;

  function makeMarkerIcon(markerColor) {
    markerImage = new google.maps.MarkerImage(
      'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
      markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(22, 35), // 22 px wide by 35 px high.
      new google.maps.Point(0, 0), // origin to (0,0)
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  }

  self.observableLocations().forEach(function(item) {
    // Defining markers for each place.
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(item.position.lat, item.position
        .lng),
      map: map,
      animation: google.maps.Animation.DROP
    });
    item.marker = marker;

    // my Foursquare API keys. Create your own keys from https://developer.foursquare.com/
    var fsquare_id =
      'K3QM5R5HR0FLEUVDY2EU5PWVXL5TAGAC2EAKLVJ5UVZHSSDA';
    var fsquare_secret =
      'BU5ATIO30ETMIMAUGWVCXLBZGIMDQJAZ1ASLKT5NVURXS01W';
    // declaring the contentString as observable, so that every infowindow displays its content.
    var contentString = ko.observable();
    // AJAX request for foursquare data.
    $.ajax({
      url: 'https://api.foursquare.com/v2/venues/explore',
      dataType: 'jsonp',
      type: "GET",
      cache: 'false',
      data: 'limit=1&ll=' + item.position.lat + ',' + item.position
        .lng + '&query=' + item.placeName + '&client_id=' +
        fsquare_id + '&client_secret=' + fsquare_secret +
        '&v=20140806&m=foursquare'
    }).done(function(data) {
      !item.rating ? item.rating = data.response.groups[0].items[0]
        .venue.rating : item.rating = "no rating available.";
      console.log(item.rating);

      // stores the content to be displayed on the infowindow.
      contentString = '<br><div class="labels">' +
        '<div class="title">' + item.placeName +
        '</div><div class="rating">Foursquare rating: ' + item.rating +
        '</div><p>' + item.description + '</p>' + '</div>';

      //self.populateInfoWindow(marker.content, infoWindow);
    }).fail(function(jqXHR, textStatus) {
      console.log("failed to get resources");
      //alert("failed to get resources from Foursquare.");
    });

    google.maps.event.addListener(item.marker, 'click', function() {
      infoWindow.open(map, this);

      item.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        item.marker.setAnimation(null);
      }, 1400);

      infoWindow.setContent(contentString);
    });

    // Two event listeners to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  });

  // to display the clicked list item on map.
  self.showMarker = function(clickedItem) {
    google.maps.event.trigger(clickedItem.marker, 'click');
    // self.populateInfoWindow(clickedItem.marker, infoWindow);
  };

  //This stores the data in the input box into an observable string.
  self.filter = ko.observable('');
  //function to filter the list!
  self.filterList = ko.computed(function() {
    return ko.utils.arrayFilter(self.observableLocations(), function(
      myPlace) {
      var matched = myPlace.placeName.toLowerCase().indexOf(self.filter()
        .toLowerCase()) >= 0;
      myPlace.marker.setVisible(matched);
      return matched;
    });
  });

};

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}