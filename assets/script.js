

$(document).ready(function () { // using ready() method to warp all the codes to make sure the HTML is fully loaded before running any other codes 
  var apiKey = "e9fca33cb368be842d7fa15031d8b7e5"; // puze zhong's openweather API key for weather info
  var APIKey = "TnY7dgkAkdBckSWhls81z22VTZLosfGM"; // Sarah's Amadeus API key for travel info
  var SECRET_KEY = '294cZnBTO3GbEjQS'
  function loadFlights(city) {
    var travelApiUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers?currencyCode=USD&originLocationCode=SYD&destinationLocationCode=BKK&departureDate=2023-05-30&adults=1&nonStop=false&max=10"
    // SYD&destinationLocationCode=BKK&departureDate=2023-05-02&adults=1&nonStop=false&max=250
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
        });

    });

  }

  loadFlights('');

  function loadData(city) {
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey;// openweather webside  this is for when user enter city then the server side API will display the weather info, it require personal API key which i included above

    $.ajax({ // im using this function becuase it it can exchange data with a server, update parts of the page without reloading the whole page.
      url: weatherApiUrl, // set URL to request weatherApiurl to captch data
      method: 'GET', //i need use GET method to request data from weather URL
      success: function (answer) { // Set a function that will be called when the request succeeds



        // creat a HTML string(h2) this is use to display weather infomation 
        var weatherInfoHtml = '<h2>Weather for ' + city + '</h2>'; // weather for any city that user entered  will display at FlyDrvie page 

        for (var i = 0; i < answer.list.length; i += 7) { // for loop  i have 5 days weather so i set i += 7 so the code for weather only display only once
          var date = new Date(answer.list[i].dt * 1000);  // .dt(data receiving time)  *1000 to obtain timestamp to date format
          var temperatureC = answer.list[i].main.temp - 273.15;  //-273.15 so i can get Celsius
          var temperatureF = temperatureC * 9 / 5 + 32;// use this formula to change to from C to Fahrenheit
          var weatherDescription = answer.list[i].weather[0].description;// description for weather infomation
          var weatherIcon = answer.list[i].weather[0].icon; // Get the weather icon ID

          // Create the image element for the weather icon // this url is found at "openweathermap.org/weather-conditions" website 
          var weatherIconUrl = "http://openweathermap.org/img/wn/" + weatherIcon + ".png"; // create a icon for weather status // https://openweathermap.org/weather-conditions this is icon webURL and then i want my icon display in .png
          var weatherIconHtml = '<img src="' + weatherIconUrl + '" alt="' + weatherDescription + '">';// insert the icon


          weatherInfoHtml += '<h3>' + date.toLocaleDateString() + '</h3>'; //create a h3 element and add the data info for display in web page and use toLocalDateString() to formatted the date information
          weatherInfoHtml += '<p>Temperature: ' + temperatureF.toFixed(0) + '°F' + weatherIconHtml + '</p>'; // temperature info will display in F  and i set tofix(0) so i can get a whole nume for temperture  in stead of getting any decimal  
          weatherInfoHtml += '<p>Weather status: ' + weatherDescription + '</p>'; // create a p element for weather status  display 
        } //for loop

        $('#weather-info').html(weatherInfoHtml);
        localStorage.setItem('weatherInfo', weatherInfoHtml);// stores the weather information HTML  in the browser local storage so the info will display when page is load


        // set time when i click the search button at home page then it will take i sec and then load to the other page 
        setTimeout(function () {
          window.location.href = './FlyDriveWeather.html';
        }, 100);  //100 = 1sec
      },// closing success 


      error: function (error) { // if the ajax function fails then return error
        console.log('Error:', error); // will need inspect if i want test my code and see this console.log msg
      }// closing error()

    });//closing ajax()

  } // closing loadData()


  $('#search-btn').click(function (event) { // click function that link to id search-btn 
    event.preventDefault();
    console.log("Button clicked"); // im just testing make sure my click function is working //after testing it is working 
    var city = $('#city-input').val(); // add val() method to id city-input and gave it a var name city so when input random city the brower will remember the cityName  user just entered
    if (city !== "") { // city input can't not be empty. if is not empty then call the function loadData
      loadData(city); // Call your function here
    }// closing if statement
  }); // closing click fucntion

  ///////////////  END OF OpenWeather API ///////////////////////////////









});// closing ready() method

