$(document).ready(function () {
  var APIKey = "TnY7dgkAkdBckSWhls81z22VTZLosfGM"; // Sarah's Amadeus API key for travel info
  var SECRET_KEY = '294cZnBTO3GbEjQS';

  // fly API info
  function loadFlights(destinationCity, departureCity, departureDate) {
    var travelApiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?currencyCode=USD&originLocationCode=${departureCity.toUpperCase()}&destinationLocationCode=${destinationCity.toUpperCase()}&departureDate=${departureDate}&adults=1&nonStop=false&max=10`;

    var securityUrl = `https://test.api.amadeus.com/v1/security/oauth2/token`;
    fetch(securityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${APIKey}&client_secret=${SECRET_KEY}`
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      console.log(data);
      var token = data.access_token;
      fetch(travelApiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);

          var flightsInfoHtml = '<h2 style="font-weight: bold; font-size: 24px; text-align: center;">Flights information for ' + destinationCity + '</h2>';

          if (data && data.data) {
            for (var i = 0; i < data.data.length; i++) {
              var itinerary = data.data[i].itineraries[0];
              var firstSegment = itinerary.segments[0];
              var lastSegment = itinerary.segments[itinerary.segments.length - 1];

              flightsInfoHtml += '<div style="margin-bottom:20px;padding:10px;border:1px solid #ddd;border-radius:10px;background-color:rgba(255, 255, 255, 0.5);">';
              flightsInfoHtml += '<h3 style="margin-bottom:10px;color:#333;">Flight ' + (i + 1) + '</h3>';
              flightsInfoHtml += '<p style="margin-bottom:5px;"><strong>Departure:</strong> ' + firstSegment.departure.iataCode + ' at ' + new Date(firstSegment.departure.at).toLocaleString() + '</p>';
              flightsInfoHtml += '<p style="margin-bottom:5px;"><strong>Arrival:</strong> ' + lastSegment.arrival.iataCode + ' at ' + new Date(lastSegment.arrival.at).toLocaleString() + '</p>';
              flightsInfoHtml += '<p style="margin-bottom:5px;"><strong>Duration:</strong> ' + itinerary.duration + '</p>';
              flightsInfoHtml += '</div>'; // closing div
            }
          } else {
            console.error('Invalid API response:', data);
          }
          $('#flights-info').html(flightsInfoHtml);

        });
    });
  }

  $('#confirm-btn').click(function (event) {
    event.preventDefault();

    var departureCity = $('#departure-input').val().trim();
    var destinationCity = $('#destination-input').val().trim();
    var departureDate = $('#departure-date-input').val().trim();



    /**show and hide modal css tailwind **/
    function showErrorModal(errorMessage) {
      $('#error-text').text(errorMessage);
      $('#error-modal').show();
    }

    $('#ok-btn-modal').click(function (event) {
      event.preventDefault();
      $('#error-modal').hide();
    });

    if (!destinationCity || destinationCity.length !== 3) {
      showErrorModal('Please enter a valid 3-letter destination city code.');
      return;
    }

    if (!departureCity || departureCity.length !== 3) {
      showErrorModal('Please enter a valid 3-letter departure city code.');
      return;
    }


    loadFlights(destinationCity, departureCity, departureDate);
  });

});
