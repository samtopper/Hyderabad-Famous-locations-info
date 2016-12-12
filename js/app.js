var map;
// executes when map fails to load.
function loadingError() {
    "use strict";
    document.getElementById('error').innerHTML = "<h2>Google Maps is not loading. Please check your internet connection.</h2>";
}

//----ViewModel ---- //
function initMap() {
  //API map constructor that creates new map.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 17.401481, lng: 78.450091},
    zoom: 11
  });

  var bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();
  ko.applyBindings(new ViewModel());
}


var ViewModel = function(){
  var self = this;

  //Make the model array into a knockout observable array.
  self.placeLocation = ko.observableArray(locations);

  //This stores the data in the input box into an observable string.
  self.filter = ko.observable('');

  var defaultIcon = makeMarkerIcon('1D97C4');
  // Highlighting the marker when the user mouses over.
  var highlightedIcon = makeMarkerIcon('AAE12C');

  // This function takes in a color, and then creates a new marker icon of that color.
  function makeMarkerIcon(markerColor) {
   var markerImage = new google.maps.MarkerImage(
    'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(22, 35),  // 22 px wide by 35 px high.
    new google.maps.Point(0, 0),   // origin to (0,0)
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
    return markerImage;
  }





  //Loop over all model data elements and give them a marker
  for (i=0; i<locations.length; i++) {
    var name = locations[i].placeName;
    var position = locations[i].position;
    var description = locations[i].description;

    marker = new google.maps.Marker({
      map: map,
      position: position,
      title: name,
      description: description,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP
    });

    //push new marker to the array of markers
    self.placeLocation()[i].marker = marker;

    //add click listener to open window for this marker
    marker.addListener('click', function() {
      self.populateInfoWindow(this, infoWindow);
    });

    // Two event listeners to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  //Creates an infoWindow for each marker.
  self.populateInfoWindow = function(marker, infoWindow) {
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;
      //marker.content = '<br><div class="labels">' + '<div class="title">' + item.placeName + '</div><div class="rating">Foursquare rating: ' + item.rating + '</div><p>' + item.description + '</p>' + '</div>';
      // infoWindow.setContent(marker.content);
      // infoWindow.setContent('<div><p>' + marker.title + '</p> <p>' + marker.description + '</p> </div>');
      infoWindow.open(map, marker);
      infoWindow.addListener('closeClick', function() {
        infoWindow.setMarker(null);
      })
      infoWindow.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        marker.setAnimation(null);
      }, 1400);
    }
  };
  // to display the clicked list item on map.
  self.showMarker = function(clickedItem) {
    self.populateInfoWindow(clickedItem.marker, infoWindow);
  }

//function to filter the list!
  self.filterList = ko.computed(function() {
    return ko.utils.arrayFilter(self.placeLocation(), function(myPlace) {
      var matched = myPlace.placeName.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0;
      myPlace.marker.setVisible(matched);
      return matched;
    });
  });

  var fsquare_id = 'K3QM5R5HR0FLEUVDY2EU5PWVXL5TAGAC2EAKLVJ5UVZHSSDA';
  var fsquare_secret = 'BU5ATIO30ETMIMAUGWVCXLBZGIMDQJAZ1ASLKT5NVURXS01W';

  var requestTimeout = setTimeout(function(){
      // $wikiElem.text("failed to get wikipedia resources.");
      console.log("failed to get resources");
  }, 8000);

  locations.forEach(function(item){
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/explore',
        dataType: 'jsonp',
        type: "GET",
        cache: 'false',
        data: 'limit=1&ll=' + item.position.lat + ',' + item.position.lng + '&query=' + item.placeName + '&client_id=' + fsquare_id + '&client_secret=' + fsquare_secret + '&v=20140806&m=foursquare'
    }).done(function(data){
        item.rating = data.response.groups[0].items[0].venue.rating;
        console.log(item.rating);
        if (!item.rating) {
            item.rating = 'No rating in foursquare';
        }
        infoWindow.open(map, marker);
        marker.content = '<br><div class="labels">' + '<div class="title">' + item.placeName + '</div><div class="rating">Foursquare rating: ' + item.rating + '</div><p>' + item.description + '</p>' + '</div>';
        //self.populateInfoWindow(marker.content, infoWindow);
        infoWindow.setContent(marker.content);


        clearTimeout(requestTimeout);
    });
  });

}



function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

