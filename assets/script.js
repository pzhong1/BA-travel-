

$(document).ready(function() { // using ready() method to warp all the codes to make sure the HTML is fully loaded before running any other codes 
  var apiKey = "75c5af5c353621d37f558f040992d1fd"; // puze zhong's openweather API key for weather info

  function loadData(city) {
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey; // openweather webside  this is for when user enter city then the server side API will display the weather info, it require personal API key which i included above

      $.ajax({ // im using this function becuase it it can exchange data with a server, update parts of the page without reloading the whole page.
        url: weatherApiUrl, // set URL to request weatherApiurl to captch data
        method: 'GET', //i need use GET method to request data from weather URL
        success: function(response) { // Set a function that will be called when the request succeeds
          var temperatureC = response.main.temp - 273.15; // Convert Kelvin to Celsius
          var temperatureF = temperatureC * 9/5 + 32; // Convert Celsius to Fahrenheit
  
          var weatherDescription = response.weather[0].description; // stores the weather description from the server's response into the weatherDescription variable. array[0] stand for the first element
  
  
          // creat a HTML string(h2) this is use to display eather infomation 
          var weatherInfoHtml = '<h2>Weather Information</h2>';
          weatherInfoHtml += '<p>Temperature: ' + temperatureF.toFixed(2) + '°F</p>'; // Show temperature up to 2 decimal places im using Fahrenheit instead of Celsius
          weatherInfoHtml += '<p>Description: ' + weatherDescription + '</p>'; // weather description from the weather website
  
          $('#weather-info').html(weatherInfoHtml); //Use jQuery here to  overwrite the existing content of that element.
  
        }, // closing success
  
        error: function(error) { // if the ajax function fails then return error
          console.log('Error:', error); // will need inspect if i want test my code and see this console.log msg
        }// closing error()

      });//closing ajax()

  } // closing loadData()

  
  $('#search-btn').click(function() { // click function that link to id search-btn 
    console.log("Button clicked"); // im just testing make sure my click function is working //after testing it is working 
    var city = $('#city-input').val(); // add val() method to id city-input and gave it a var name city so when input random city the brower will remember the cityName  user just entered
    if (city !== " ") { // city input can't not be empty. if is not empty then call the function loadData
      loadData(city); // Call your function here
    }// closing if statement
  }); // closing click fucntion




  


    // Hotel info 
   

    // Local attractions and ratings info 
    


});// closing ready() method

