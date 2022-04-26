import axios from '../node_modules/axios';

//form fields
const form = document.querySelector('.form-data');
const region = document.querySelector('.region-name');
const apikey = document.querySelector('.api-key')
// 
// results
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const usage = document.querySelector('.carbon-usage');
const fossilfuel = document.querySelector('.fossil-fuel');
const myregion = document.querySelector('.my-region');
const clearBtn = document.querySelector('.clear-btn');

// adding event listeners and clear btn to the form
form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));
init();//adds the call to initialize the app

//5
//imposta la chiave api e la regione per l'utente
function init(){
    //if anything is in local storage, pick it up
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegion = localStorage.getItem('regionName');

    //set icon to be generic green
    //todo
    if(storedApiKey === null || storedRegion === null){
        //if we don't have the keys, show the form
        form.style.display = 'block';
        results.style.display = 'none';
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent = '';
    } else{
        //if we have saved keys/regions in localStorage, show results
        displayCarbonUsage(storedApiKey, storedRegion);
        results.style.display = 'none';
        form.style.display = 'none';
        clearBtn.style.display = 'block';
    }
};

function reset(e){
    e.preventDefault();
    //clear local storage for region only
    localStorage.removeItem('regionName');
    init();
}

function handleSubmit(e){
    e.preventDefault();
    setUpUser(apikey.value, region.value);
}
// This function accepts an event argument (e), we want to stop th event from propagating
// we call the new function setUpUser by passing the arguments apiKey.value and region.value


//setUpUser function -- where we set local storage values for apiKey and regionName
function setUpUser(apiKey, regionName){
    localStorage.setItem('apiKey', apikey);
    localStorage.setItem('regioName', regionName);
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';
    //make initial call
    displayCarbonUsage(apiKey, regionName);
}
// This function sets a loading message to show while the API key is called


async function displayCarbonUsage(apiKey, region){
    try{
        await axios
            .get('https://api.co2signal.com/v1/latest', {
                params: {
                    countryCode: region,
                },
                headers: {
                    'auth-token': apiKey,
                },
            })
            .then((response) => {
                let CO2 = Math.floor(response.data.data.carbonIntensity);

                //calculateColor(CO2)

                loading.style.display = 'none';
                form.style.display = 'none';
                myregion.textContent = region;
                usage.textContent = Math.round(response.data.data.carbonIntensity) 
                        + 'grams (grams CO2 emitted per kilowatt hour';
                fossilfuel.textContent = 
                        response.data.data.fossilFuelPercentage.toFixed(2) +
                        '% (percentage of fossil fuels used to generate electricity';
                results.style.display = 'block'; 
            });
    } catch (error) {
        console.log(error);
        loading.style.display = 'none';
        results.style.display = 'none';
        errors.textContent = 'Sorry, we have no data for the region you have requested';
    }
}
// function contains a try/catch block since it will return a promise when the API returns data
//The try/catch block applies also since we don't know if the API will respond at all


function calculateColor(value){
    let co2Scale = [0, 150, 600, 750, 800];
    let colors = ['#2AA364', '#F5EB40', '#9E4229', '#381D02', '#381D02'];

    let closestNum = co2Scale.sort((a,b) => {
        return Math.abs(a-value) - Math.abs(b-value);
    })[0];
    console.log(value + 'is closest to ' +closestNum);
    let num = (element) => element > closestNum;
    let scaleIndex = co2Scale.findIndex(num);

    let closestColor = colors[scaleIndex];
    console.log(scaleIndex, closestColor);

    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
}


// gestisce l'invio del form

//3 controlli iniziali

//2
// imposta i listeners e la partenza dell'app
