function preloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            $('#preloader').css('display', ' none');

            // Find Location => Animation
            $("#findLocation").hide();
            setTimeout(() => {
                $('#findLocationIcon').addClass('_animation');
                $('.find-location').addClass('_animation');

                setTimeout(() => {
                    $("#findLocation").show(300)
                }, 1000);
            }, 200);
        }, 1000);
    });
}

preloader();


let date = new Date()
let hours = date.getHours();

if(hours > 4 && hours < 6) {
    $('.page-background').css('backgroundImage', 'url(../img/Jpg/weather-bg-morning_cold.jpg)');
}


$("#findLocation").on('keydown', (key) => {
    const keyCode = key.keyCode;

    if(keyCode == 13) {
        getWeather($('#findLocation').val());
    }
});

$('#findLocationIcon').click(() => {
    getWeather($('#findLocation').val());
})


function getWeather(cityName) {
    const apiKey = `8635c93cf4a0383f1fdc0ae02896a802`;
    const city = cityName;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        $("#countryFlag").empty();
        $("#countryFlag").append(`<img class="country-flag" src="https://flagsapi.com/${data.sys.country}/flat/64.png">`)

        const coordLat = data.coord.lat;
        const coordLon = data.coord.lon;

        $('#weatherTodayIcon').empty();
        $('#weatherTodayIcon').append(`
            <img src="./img/Svg/weathers-icon/${data.weather[0].icon}.svg" alt="Weather icon">
        `)

        // Sunrise Sunset Time
        displaySunriseSunsetTime(data.sys.sunrise, 'sunrise');
        displaySunriseSunsetTime(data.sys.sunset, 'sunset');

        // More Details Params
        $('#windSpeed').text(`: ${data.wind.speed} m/s`);
        $('#airHumidity').text(`: ${data.main.humidity} %`);
        $('#pressure').text(`: ${data.main.pressure}nbar`);
        $('#weatherState').text(`: ${data.weather[0].description}`);

        // Current Date
        getCurrentDate();

        // Current Temerature
        let currentTemp = data.main.temp;
        let currentTempCelsium = (currentTemp - 273.15).toFixed(1);

        $('#currentTemperature').text(currentTempCelsium < 0 ? `${currentTempCelsium} °C` : `+${currentTempCelsium} °C`);

        // Feels Like 
        let feelsLikeTemp = data.main.feels_like;
        let feelsLikeTempInCelsium = (feelsLikeTemp - 273.15).toFixed(0);

        $("#feelsLikeTemperature").text(feelsLikeTempInCelsium < 0 ? `Fells like ${feelsLikeTempInCelsium} °C` : `Fells like +${feelsLikeTempInCelsium} °C`);

        // Set Days On Week
        setDaysOfWeek();

        // Set Date On Week
        setDateOnWeek();

        $(`#country`).text(data.name);


        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordLat}&lon=${coordLon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {

            $('#weeklyThumb').css('left', '30px');

            for(let i = 0; i < 8; i++) {
                let dailyMinTemp = (data.daily[i].temp.min - 273.15).toFixed(0);
                $(`#weeklyMinTemp${i + 1}`).text(dailyMinTemp < 0 ? dailyMinTemp : `+${dailyMinTemp}`);

                let dailyMaxTemp = (data.daily[i].temp.max - 273.15).toFixed(0);
                $(`#weeklyMaxTemp${i + 1}`).text(dailyMaxTemp < 0 ? dailyMaxTemp : `+${dailyMaxTemp}`);

                $(`#weeklyIcon${i + 1}`).empty();
                $(`#weeklyIcon${i + 1}`).append(`<img src="./img/Svg/weathers-icon/${data.daily[i].weather[0].icon}.svg" alt="Weather icon">`)

                let dailyWeatherDescription = data.daily[i].weather[0].description;
                $(`#weeklyWeather${i + 1}`).text(dailyWeatherDescription[0].toUpperCase() + dailyWeatherDescription.slice(1));
            }

            for (let i = 0; i < 24; i += 3) {
                let milliseconds = data.hourly[i].dt * 1000;
                let date = new Date(milliseconds);
            
                let hours = String(date.getHours()).padStart(2, '0');
                let minutes = String(date.getMinutes()).padStart(2, '0');
            
                if (i % 3 == 0 && i <= 21) {
                    $(`#scheduleTimeSpan${i - Math.floor(i / 3) * 2}`).text(`${hours}:${minutes}`);
                }

                let hourlyTemp = (data.hourly[i].temp - 273.15).toFixed(0);
                if (i % 3 == 0 && i <= 21) {
                    $(`#scheduleTempSpan${i - Math.floor(i / 3) * 2}`).text(hourlyTemp < 0 ? `${hourlyTemp}°` : `+${hourlyTemp}°`);
                }

                if (i % 3 == 0 && i <= 21) {
                    $(`#timeSpanIcon${i - Math.floor(i / 3) * 2}`).empty();
                    $(`#timeSpanIcon${i - Math.floor(i / 3) * 2}`).append(`<img src="./img/Svg/weathers-icon/${data.hourly[i].weather[0].icon}.svg" alt="Weather icon">`);
                }
            }
        })

        $('#preloader').css('display', 'flex');
        setTimeout(() => {
            $('#preloader').css('display', 'none');
        }, 1500);

        $(`.weather-find`).css('display', 'none');
        $(`.weather-app`).css('display', 'block');
    })
    .catch(error => {
        $('.weather-find__error').addClass(`_active`);

        setTimeout(() => {
            $('.weather-find__error').removeClass(`_active`);
        }, 2000);

        console.log(error)
    });
}


function displaySunriseSunsetTime(timeInSeconds, elementID) {
    let timeInMilliseconds = timeInSeconds * 1000;
    let date = new Date(timeInMilliseconds);

    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    $(`#${elementID}`).text(`${hours}:${minutes}`);
}


const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', ];
const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.','May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

function getCurrentDate() {
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
        const minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        const currentWeekdays = weekdays[now.getDay()];
        const currentDate = now.getDate();
        const currentMonths = months[now.getMonth()];

        $('#dateToday').text(`${currentWeekdays} ${currentDate} ${currentMonths} ${hours}:${minutes}`);
    }, 1000)
}



let daysOfWeek;

function setDaysOfWeek() {
    const currentDate = new Date();
    const weekLength = 7;

    daysOfWeek = [];

    for (let i = 0; i < 7; i++) {
        const dayIndex = (currentDate.getDay() + i) % weekLength;
        const dayName = weekdays[dayIndex];
        daysOfWeek.push(dayName);
        $(`#weeklyDay${i + 1}`).text(dayName);
    }

}


const ShortNameOfMonths = [
    'Jan.', 'Feb.', 'Mar.', 'Apr.',
    'May', 'Jun.', 'Jul.', 'Aug.',
    'Sep.', 'Oct.', 'Nov.', 'Dec.'
];

function setDateOnWeek() {
    let currentDate = new Date();
    for (let i = 0; i < 7; i++) {
        const nextDate = new Date(currentDate);

        nextDate.setDate(currentDate.getDate() + i);

        const month = ShortNameOfMonths[nextDate.getMonth()];

        const formattedDate = nextDate.getDate() + " " + month;

        $(`#weeklyDate${i + 1}`).text(formattedDate);

        if (nextDate.getMonth() !== currentDate.getMonth()) {
            currentDate = nextDate;
        }
    }
}

function hideCountryData() {
    if($(window).width() < 500) {
        $('#location').hide(300);
        $('.location-container').css('justifyContent', 'center');
    }
}

function showCountryData() {
    if($(window).width() < 500) {
        $('#location').show(300);
        $('.location-container').css('justifyContent', 'space-between');
    }
}


let changeLocationActive = false;
$('#changeLocation').hide();
$("#changeLocationIcon").click(() => {
    if(!changeLocationActive) {
        $("#changeLocationIcon").addClass('_active');
        $("#changeLocationIcon").css('transform', 'rotate(360deg)');
        $(".change-location").addClass('_active');
        $('#changeLocation').show(300);
        hideCountryData();
        changeLocationActive = true;
    } else {
        getWeather($('#changeLocation').val());
        hideChangeLocation();
        showCountryData();
        changeLocationActive = false;
    }
});

$('#changeLocation').on('keydown', (key) => {
    const keyCode = key.keyCode;

    if(keyCode == 13) {
        getWeather($('#changeLocation').val());
        hideChangeLocation();
        showCountryData();
        changeLocationActive = false;
    }
});

function hideChangeLocation() {
    $('#changeLocation').val('');
    $("#changeLocationIcon").removeClass('_active');
    $("#changeLocationIcon").css('transform', 'rotate(0deg)');
    $(".change-location").removeClass('_active');
    $('#changeLocation').hide(300);
}
