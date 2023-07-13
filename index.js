/*
@author CaptainCluster
https://github.com/CaptainCluster
*/

if (document.readyState !== "loading") {
  mainFunction();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    mainFunction();
  });
}

function mainFunction(){
  const searchButtonElement = document.getElementById("searchButton");
  //We don't want to fetch any data if the new input matches the previous one
  let previousUserInput = "";
  searchButtonElement.addEventListener("click", async function(){
    //The country user types in as an input will be sent in as a parameter
    //to be merged with the beginning of the URL so that we can find the data.
    const htmlInputCountry = document.getElementById("userInputCountry");
    let countryUserInput = htmlInputCountry.value; 
    let data = "";
    countryUserInput = manageCountryExceptions(countryUserInput);
    //Here we want to make sure the user input is reasonable so that we don't
    //go through the process unnecessarily.
    if(countryUserInput != "" && countryUserInput != previousUserInput){
      data = await getData(countryUserInput);
      //If the user input does not provide data for a country, we will get
      //error 404 and normally the program would crash, thus the program
      //has to stop the process immediately after detecting the error.
      if(data.status != 404){
        const processedData = processData(data);
        displayResults(processedData);
        previousUserInput = countryUserInput;
      } else{
        handleDataExceptions(404);
        previousUserInput = "";
      }
    }
  });
  defaultContent();
}

function defaultContent(){
  //Once the user boots the program up, we want to display things that
  //should help them use it. 
  const countryNameDisplay = document.getElementById("countryName");
  countryNameDisplay.textContent =  "Enter the name of the country you want to search.";
  const coreInfoDisplay = document.getElementById("coreInformation"); 
  const defaultPTag = document.createElement("p");
  defaultPTag.textContent = "The information will be displayed here.";
  coreInfoDisplay.appendChild(defaultPTag);
}

function manageCountryExceptions(countryUserInput){
  //Here we handle exceptions when searching for real nations that the API has data 
  //for.. For instance, by searching "China", the API gives data  of Taiwan as 
  //default, when data regarding that country can be found by searching "Taiwan". 
  if(countryUserInput == "china" || countryUserInput == "China"){
    countryUserInput = "zho"; 
  }
  return countryUserInput;
}

function handleDataExceptions(error){
  //When fetching data, error 404 is one of the potential errors user can get.
  //This function helps handle errors such as these.
  if(error == 404){
    resetCoreDisplayInfo();
    const countryNameDisplay = document.getElementById("countryName");
    countryNameDisplay.textContent = "Error 404 detected! Give a valid country name next time!";
    const coreInfoDisplay = document.getElementById("coreInformation");
    const defaultPTag = document.createElement("p");
    defaultPTag.textContent = "The information will be displayed here.";
    coreInfoDisplay.appendChild(defaultPTag);
  }
}

async function getData(countryUserInput){
  //We get our data from the API provided by restworld.com. The user gives the 
  //country name as an input and this function will get all the necessary data.

  //The URL's beginning part is always the same, but the country name at the 
  //end (determined by the user in urlCountryInput) is what decides which country's
  //data we get.
  const urlBeginning = "https://restcountries.com/v3.1/name/";
  const url = urlBeginning + countryUserInput;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function processData(data){
  //This is where we take all the gathered data and take pieces of information
  //out of it, based on our needs. We then return it all in a list so that
  //the function that makes the HTML file display the information gets
  //all the required data.
  const countryNameOfficial = data[0].name.official;
  const population = data[0].population;
  const region = data[0].region;
  const capital = data[0].capital;

  //The following three will be in arrays.
  const languages = Object.values(data[0].languages);
  const currency = Object.values(data[0].currencies)[0].name;
  const currencySymbol = Object.values(data[0].currencies)[0].symbol;
  const borderNations = Object.values(data[0].borders);

  const imageFlag = data[0].flags.png;
  const locationMap = data[0].maps.openStreetMaps; 

  const processedDataList = [
    countryNameOfficial,
    population,
    region,
    capital,
    languages,
    currency,
    currencySymbol,
    imageFlag,
    locationMap,
    borderNations
  ]
  return processedDataList;
}

function displayResults(processedData){
  //We want to display the following information for the user: the name of 
  //the country, population, capital, currency, region, languages, 
  //flag (image) and location on the map.
  const languagesDisplayForm = processLanguages(processedData[4]);
  const borderNationsDisplayForm = processBorderNations(processedData[9]);
  const languageContentType = languageAmountChecker(processedData[4]);
  const currenciesDisplayForm = processedData[5] + " " + processedData[6];
  const borderContentType = borderNationAmountChecker(processedData[9]);

  //These will be displayed in front of the values fetched from the data
  const listContentType = [
    "Population: ", 
    "Region: ", 
    "Capital: ", 
    languageContentType, 
    "Currency: ",
    borderContentType
  ];
  const coreTextInformation = [
    processedData[1], //Population
    processedData[2], //Region
    processedData[3], //Capital
    languagesDisplayForm,
    currenciesDisplayForm, 
    borderNationsDisplayForm
  ];

  //Here we clear all the information regarding previous search results
  const coreInfoDisplay = document.getElementById("coreInformation");
  resetCoreDisplayInfo();

  const countryNameDisplay = document.getElementById("countryName");
  countryNameDisplay.textContent = processedData[0];

  //Each piece of information will get its own p tag.
  for(let i=0; i<coreTextInformation.length; i++){
    const informationPTag = document.createElement("p");
    informationPTag.textContent = listContentType[i] + coreTextInformation[i];
    coreInfoDisplay.appendChild(informationPTag);
  }

  const flagImageHolder = document.createElement("img");
  flagImageHolder.src = processedData[7];
  coreInfoDisplay.appendChild(flagImageHolder);
}

function processLanguages(languagesList){
  //Here we process the array of languages and put them in
  //a form where we can display them appropriately.
  let languages = "";
  for(let i = 0; i < languagesList.length; i++){
    if(languages == ""){
      languages = languages + languagesList[i];
    } else{
      languages = languages + ", " + languagesList[i];
    }
  }
  return languages;
}

function processBorderNations(borderNationsList){
  let borderNations = "";
  for(let i = 0; i < borderNationsList.length; i++){
    if(borderNations == ""){
      borderNations = borderNations + borderNationsList[i];
    } else{
      borderNations = borderNations + ", " + borderNationsList[i];
    }
  }
  return borderNations;
}

function languageAmountChecker(languagesList){
  //Selects whether either "language" or "languages" is displayed
  //based on how many languages a country has.
  if(languagesList.length == 1){
    languageContentType = "Language: ";
  } else{
    languageContentType = "Languages: ";
  }
  return languageContentType;
}

function borderNationAmountChecker(borderNationsList){
  if(borderNationsList.length == 1){
    borders = "Bordering nation: ";
  } else{
    borders = "Bordering nations: ";
  }
  return borders;
}

function resetCoreDisplayInfo(){
  const coreInfoDisplay = document.getElementById("coreInformation");
  while(coreInfoDisplay.firstChild){
  coreInfoDisplay.firstChild.remove();
  }
}