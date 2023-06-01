

$(document).ready(function () { // using ready() method to warp all the codes to make sure the HTML is fully loaded before running any other codes 
  var apiKey = "e9fca33cb368be842d7fa15031d8b7e5"; // puze zhong's openweather API key for weather info


  function loadData(city) {
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey;// openweather webside  this is for when user enter city then the server side API will display the weather info, it require personal API key which i included above

    fetch(weatherApiUrl)
      .then(response => {
        if (response => ok) {
          return response.json();
        } else {
          throw new Error('Error: ' + response.statusText);
        }
      }) //close fetch


      .then(answer => {
        var weatherInfoHtml = "<div><h2>Weather for " + city + "</h2><div class='forecast-container'>"; // weather for any city that user entered  will display at FlyDrvie page 

        for (var i = 0; i < answer.list.length; i +=8) { // for loop  i have 5 days weather so i set i += 8 so the code for weather only display only once
          var date = new Date(answer.list[i].dt * 1000);
          var temperatureC = answer.list[i].main.temp - 273.15;  //-273.15 so i can get Celsius
          var temperatureF = temperatureC * 9 / 5 + 32;// use this formula to change to from C to Fahrenheit
          var weatherDescription = answer.list[i].weather[0].description;// description for weather infomation
          var weatherIcon = answer.list[i].weather[0].icon; // Get the weather icon ID
          weatherInfoHtml += "<div class='forecast'>";
          // Create the image element for the weather icon // this url is found at "openweathermap.org/weather-conditions" website 
          var weatherIconUrl = "http://openweathermap.org/img/wn/" + weatherIcon + ".png"; // create a icon for weather status // https://openweathermap.org/weather-conditions this is icon webURL and then i want my icon display in .png
          var weatherIconHtml = '<img src="' + weatherIconUrl + '" alt="' + weatherDescription + '">';// insert the icon


          weatherInfoHtml += '<h3>' + date.toLocaleDateString() + '</h3>'; //create a h3 element and add the data info for display in web page and use toLocalDateString() to formatted the date information
          weatherInfoHtml += '<p>Temperature: ' + temperatureF.toFixed(0) + '°F' + weatherIconHtml + '</p>'; // temperature info will display in F  and i set tofix(0) so i can get a whole nume for temperture  in stead of getting any decimal  
          weatherInfoHtml += '<p>Weather status: ' + weatherDescription + '</p>'; 
          weatherInfoHtml += "</div>"; // create a p element for weather status  display 

          // We could have instead dynamically created, added attributes, text, etc ... then Appended each to the DOM
         // var tempEl = document.createElement("div");
         // tempEl.classList.add('forecast-container');
        } //for loop
        weatherInfoHtml += "</div></div>";
        // Here we are attaching our Dynamic Created Content to the DOM (id='weather-info' element) 
        $('#weather-info').html(weatherInfoHtml);
        localStorage.setItem('weatherInfo', weatherInfoHtml);// stores the weather information HTML  in the browser local storage so the info will display when page is load


        // set time when i click the search button at home page then it will take i sec and then load to the other page 
        setTimeout(function () {
          window.location.href = './FlyDriveWeather.html';
        }, 100);  //100 = 1sec
      })
      .catch(error => console.log('Error: ', error));

  }// close function loadData




var weatherInfo = localStorage.getItem('weatherInfo');// store the weather info and sign to wearher info
if (weatherInfo) { // use if statment to check if the weather info has a value or not, if has a value then save the weather infomtaion to local storage
  $('#weather-info').html(weatherInfo);// add the wather infomation  in to html so that the weather infomation can display in web page
}

// click function for  search button//////////////
$('#search-btn').click(function (event) { // click function that link to id search-btn 
  event.preventDefault();
  var destination = $('#city-input').val();
  localStorage.setItem('destination', destination);
  console.log("Button clicked"); // im just testing make sure my click function is working //after testing it is working 
  var city = $('#city-input').val(); // add val() method to id city-input and gave it a var name city so when input random city the brower will remember the cityName  user just entered
  if (city !== "") { // city input can't not be empty. if is not empty then call the function loadData
    loadData(city); // Call your function here
  }// closing if statement
}); // closing click fucntion


});// closing ready() method

