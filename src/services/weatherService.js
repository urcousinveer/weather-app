import { DateTime } from "luxon";

const API_KEY = "93d42de33df144236981522e7613bfc0";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const getWeatherData = (infoType, searchParams) => {
    const url = new URL(BASE_URL + "/" + infoType);
    url.search = new URLSearchParams({...searchParams, appid: API_KEY});

    return fetch(url)
        .then((res) => res.json());
};

const formatCurrentWeather = (data) => {
    const {
        coord: {lat, lon},
        main: {temp, feels_like, temp_min, temp_max, humidity},
        name,
        dt,
        sys: {country, sunrise, sunset},
        weather,
        wind: {speed},
    } = data;

    const {main: details, icon} = weather[0];

    return {lat, lon, temp, feels_like, temp_min, temp_max, humidity, name,
    dt, country, sunrise, sunset, details, icon, speed};
};


const formatForecastWeather = (data) => {
    let {list} = data;
    console.log(data);
    
    list = list.slice(1, 6).map((d) => {
        console.log(d.dt);
        console.log(d.main.temp);
        console.log(d.weather[0].icon);
        return {
            title: formatTime(d.dt, 'hh:mm a'),
            temp: d.main.temp,
            icon: d.weather[0].icon,
        };
    });
    console.log(list);
    return {list};
};

const getFormattedWeatherData = async (searchParams) => {
    const formattedCurrentWeather = await getWeatherData(
        "weather", searchParams).then(formatCurrentWeather);

    const {lat ,lon} = formattedCurrentWeather;

    const formattedForecastWeather = await getWeatherData("forecast",{
        lat,
        lon,
        exclude: "current,minutely,alerts",
        units: searchParams.units,
    }).then(formatForecastWeather);

    return {...formattedCurrentWeather, ...formattedForecastWeather};
};

const formatToLocalTime = (
    secs,
    zone,
    format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const formatTime =(
    secs,
    format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).toFormat(format);


const iconUrlFromCode = (code) => 
    `http://openweathermap.org/img/wn/${code}@2x.png`;


export default getFormattedWeatherData;

export {formatToLocalTime, iconUrlFromCode};