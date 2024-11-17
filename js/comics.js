

function getRandomDate(startDate, endDate) {
    // Convierte las fechas de entrada en objeto fecha (formato fecha)
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calcula un valor aleatorio entre las fechas
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());

    // Crea una nueva fecha a partir del valor aleatorio
    const randomDate = new Date(randomTime);

    // de la fecha aleatoria se obtiene el día, mes y hora
    const year = randomDate.getFullYear();
    const month = String(randomDate.getMonth() + 1).padStart(2, '0'); // Agrega ceros a la izquierda si es necesario
    const day = String(randomDate.getDate()).padStart(2, '0'); // Agrega ceros a la izquierda si es necesario

    // Formatea la fecha en el formato "AAAA-MM-DD"
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
};


function getRandomYear(min, max) {
    // Genera un número aleatorio entre min y max (ambos son inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
};



function getYearsBetweenDates(startDate, endDate) {
    //obtiene los años que hay entre dos fechas
    const startYear = startDate.getFullYear(); //definimos en una constante el año inicial, que será igual al año de la fecha indicada
    const endYear = endDate.getFullYear(); //definimos en una constante el año final, que será igual al año de la fecha indicada
    const years = []; //definimos un array vacío para agregar luego los años

    for (let year = startYear; year <= endYear; year++) {
        //loop para obtener los año entre ambos años y los pusheamos al array years
        years.push(year);
       
    }

    return years;
};





let comics = []; //array vacío donde luego se guardará la data que queramos sobre comics
let comicsConPersonajes = []; //Retorno post filtrar cards con personajes
let filtrados = [];
let autoresEncontrados = new Set();//autores encontrados se arma antes de filtrar por casos con personajes, se debe modificar // ahora está en la función main 
let personajesEncontrados = new Set(); //personajes encontrados se arma antes de filtrar por casos con personajes, se debe modificar!!
let aniosdeInicio = new Set(); // este listado está armandose con comics y no con comics con personajes así que debo revisarlo!!

const cardsContainer = document.querySelector(".cardsContainer");
const textoBuscado = document.querySelector("input");
const yearSelect = document.getElementById('year');
const personajeSelect = document.getElementById("personajeSelect");
const yearSelectStart = document.getElementById('yearStart');
const autorSelect  = document.getElementById("autorSelect");
const pageNumberElement = document.getElementById("page-number");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");


previousButton.style.visibility = "hidden";
nextButton.style.visibility = "hidden";
pageNumberElement.style.visibility = "hidden";

const activeFilter = { 
search: "", 
yearsSelect: [],
yearStart: "",
personajes: [],
autores: [],
precio: 0,
 }; 

let filtercards = () => {filtrados = comicsConPersonajes.filter((comic) => { 

    const resultSearch = !activeFilter.search
     ? true 
     : comic.title.toLocaleLowerCase().includes(activeFilter.search.toLocaleLowerCase());

    const resultYears = 
    !activeFilter.yearsSelect.length || activeFilter.yearsSelect==0
    ? true
    : activeFilter.yearsSelect.some((year) => comic.yearsBetween.includes(year));
    
    const resultYearStart = !activeFilter.yearStart || activeFilter.yearStart==0 || activeFilter.yearStart=="Select" ? true
    : activeFilter.yearStart == comic.yearStart

    const resultCharacter = 
    !activeFilter.personajes.length || activeFilter.personajes =="Select"
    ? true
    : activeFilter.personajes.some((personaje) => comic.characters.includes(personaje));

    const resultCreators = 
    !activeFilter.autores.length || activeFilter.autores =="Select"
    ? true
    : activeFilter.autores.some((autor) => comic.creators.includes(autor));

    return resultSearch && resultYears && resultYearStart && resultCharacter && resultCreators;}); 
    return filtrados;
};




let currentPage = 0;


function mostrarTarjetasPagina(page, comicsListadoAaplicar) {
        const cardsPerPage = 24;
        const startIndex = page * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;
        const comicsToShow = comicsListadoAaplicar.slice(startIndex, endIndex);
        autoresEncontrados.clear();
        personajesEncontrados.clear();
        aniosdeInicio.clear();
        comicsListadoAaplicar.forEach(comic => {
            aniosdeInicio.add(parseInt(comic.yearStart));
            const characterNames = comic.charactersArray;
            const creatorNames = comic.creators.split(', ');

            characterNames.forEach(personaje => {
                const personajeLimpio = personaje.replace(/\([^()]*\)/g, '').trim();
                if (personajeLimpio) {
                    personajesEncontrados.add(personajeLimpio);
                }
            });

            creatorNames.forEach(autor => {
                if (autor.trim() !== "") {
                    autoresEncontrados.add(autor);
                }
            });
            
        });

        cardsContainer.innerHTML = "";
        comicsToShow.forEach(comic => {
            cardsContainer.innerHTML += `
                <div class="comic">
                    <a href="#">
                        <img src="${comic.img}.${comic.imgExtension}" class="img-thumbnailcomic" alt="${comic.title}">
                    </a>
                    <h2 class="title-comic">${comic.title}</h2>
                    <p class="year info">Fecha de Inicio: ${comic.dateStart}</p>
                    <p class="dateEnd info">Fecha de Término: ${comic.dateEnd}</p>
                    <p class="characters info">Personajes: ${comic.characters}</p>
                    <p class="creators info">Autores: ${comic.creators}</p>
                </div>`;
        });

        agregarPersonajesHtml();
        agregarAniosInicioHtml();
        agregarAutoresHtml();
        return comicsToShow;
    
}


function actualizarBotonesNavegacion(listado) {
        if ((currentPage + 1) * 24 >= listado.length) {
            
            nextButton.style.visibility = "hidden";  //visible
        } else {
            
            nextButton.style.visibility = "visible";
        }
        
        if(currentPage !== 0){
            
            previousButton.style.visibility = "visible";
        }
    
        if (currentPage === 0 && listado.length >= 24){
            
            nextButton.style.visibility = "visible";
            previousButton.style.visibility = "hidden";
        }
        if (currentPage === 0 && listado.length < 24){
            
            nextButton.style.visibility = "hidden";
            previousButton.style.visibility = "hidden";
        }

}
    

function irAPagina(pagina) {
    
    if (activeFilter.search === "" &&
        activeFilter.yearsSelect.length === 0 &&
        activeFilter.yearStart === "" &&
        activeFilter.personajes.length === 0 &&
        activeFilter.autores.length === 0){
           
            if (pagina >= 0 && pagina < comicsConPersonajes.length / 24) {
                currentPage = pagina;
                mostrarTarjetasPagina(currentPage, comicsConPersonajes);
                pageNumberElement.textContent = currentPage + 1
            }
    actualizarBotonesNavegacion(comicsConPersonajes)
        
    }
    else{
       
        if (pagina >= 0 && pagina < filtrados.length / 24) {
            currentPage = pagina;
            mostrarTarjetasPagina(currentPage, filtrados);
            pageNumberElement.textContent = currentPage + 1
            
        }

    actualizarBotonesNavegacion(filtrados)
        
    }  
     window.scrollTo(0, 0);
}



async function main() {
    async function fetchData(url) {
        //función asincrónica que espera la deta de la URL y la retorna como json
        const response = await fetch(url);
        return await response.json();
    };
    const getAllComics = async () => {
        try {
            const limit = 100;
            let allComics = [];
            let offset = 0;
    
            const fetchComics = async (offset) => {
                const listaComics = await fetchData(`
                    https://gateway.marvel.com:443/v1/public/comics?ts=1&limit=${limit}&offset=${offset}&apikey=d7cf12973856220d08ecf5548994fc8a&hash=b888ebe8313c15593f65143a8b7480d3`
                );
    
                const comicsData = await Promise.all(
                    listaComics.data.results.map(async (result) => {
                        const text = result.title;
                        const matches = text.match(/\((\d{4})\)/);
                        //let year = (getRandomYear(1970, 2013)).toString();
                        //let yearI = getRandomYear(1970, 2013);
                        let yearI = 1995;
                        if (matches && matches.length > 1) {
                            yearI = matches[1];
                        }
                        let year = parseInt(yearI);
                        const dateStart = `${year}-01-31`;
                        const currentDate = new Date();
                        const startDate = new Date(dateStart);
                        const fechafinal = new Date(getRandomDate(dateStart, currentDate));
                        const fechafinalFormateada = fechafinal.toISOString().slice(0, 10);
                        const yearsBetween = getYearsBetweenDates(startDate, fechafinal);
    
                        const characterNames = result.characters.items.map(character => character.name);
                        const charactersString = characterNames.join(", ");
                        const creatorNames = result.creators.items.map(creator => creator.name);
                        const creatorsString = creatorNames.join(", ");
    
                        const charactersArray = charactersString.split(', ');
                        // charactersArray.forEach(autor => autoresEncontrados.add(autor));
    
                        // charactersArray.forEach(personaje => {
                        //     const personajeLimpio = personaje.replace(/\([^()]*\)/g, '').trim();
                        //     if (personajeLimpio) {
                        //         personajesEncontrados.add(personajeLimpio);
                        //     }
                        //});
    
                        return {
                            title: result.title,
                            characters: charactersString,
                            creators: creatorsString,
                            img: result.thumbnail.path,
                            imgExtension: result.thumbnail.extension,
                            dateStart: dateStart,
                            dateEnd: fechafinalFormateada,
                            yearStart: year,
                            yearsBetween: yearsBetween,
                            charactersArray: charactersArray,
                        };
                    })
                );
    
                return comicsData;
            };
    
            while (allComics.length < 500) {
                const comicsData = await fetchComics(offset);
                if (comicsData.length === 0) {
                    break;
                }
                allComics = allComics.concat(comicsData);
                offset += limit;
            }
            
            comics = allComics;
            return allComics;
        } catch (error) {
            console.error("Error al obtener datos:", error);
            return [];
        }
       
    };
    async function limpiaCardsAmostrar() {
        try {
            const cards = await getAllComics();
    
            comicsConPersonajes = cards.filter(comic => comic.characters !== ''); //luego de declarar la variable comicsConPersonajes como un filtro de comics, debo pasar los datos a las constantes que tienen los años, personajes y autores. ESO!
           
            return comicsConPersonajes;
        } catch (error) {
            console.error("Error al limpiar las tarjetas:", error);
        }
    };
    async function mostrarCards(comicsListadoAaplicar) {
    try {
        await limpiaCardsAmostrar();
        currentPage = 0;
        mostrarTarjetasPagina(currentPage, comicsListadoAaplicar);
        
        return comicsListadoAaplicar;
    }   catch (error) {
        console.error("Error al mostrar las tarjetas:", error);
    }
    };
    

    await mostrarCards(await limpiaCardsAmostrar());
    await mostrarCards(comicsConPersonajes);
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'none';
    
    nextButton.style.visibility = "visible";
    pageNumberElement.style.visibility = "visible";

    
    
}

document.addEventListener('DOMContentLoaded', main);






textoBuscado.addEventListener("input", function () {  
    const texto = textoBuscado.value.toLowerCase();
    activeFilter.search = texto;
    
    filtercards();
    displayFilteredComics();
});




// function filterComicsByYear() {
//         const selectedYearRange = yearSelect.value;
//         const selectedYears = selectedYearRange.split('-').map(year => Number(year));
//         activeFilter.yearsSelect = selectedYears
//         
//         filtercards();
//         displayFilteredComics(filtrados);
//        
        
// };
  

function displayFilteredComics() {
    const cardsContainer = document.querySelector(".cardsContainer");
    cardsContainer.innerHTML = "";
    mostrarTarjetasPagina(currentPage, filtrados);
    actualizarBotonesNavegacion(filtrados);
    irAPagina(0);


};
    

yearSelectStart.addEventListener('change', filterComicsByYearStart);

function filterComicsByYearStart() {
    const selectedYear = yearSelectStart.value; 
    activeFilter.yearStart = selectedYear
    filtercards();
    displayFilteredComics();
    if (selectedYear !== "Select"){
        activeSelect.anio = true;
        filterOptions(activeSelect.anio, activeSelect.personaje, activeSelect.autor);
        OptionToAplicate(listasOpciones);
        return activeSelect.anio;
        }
    if (selectedYear == "Select"){
        activeSelect.anio = false;
        filterOptions(activeSelect.anio, activeSelect.personaje, activeSelect.autor);
        OptionToAplicate(listasOpciones);
        return activeSelect.anio;
    }
    return activeSelect.anio;
};


function agregarAniosInicioHtml() {
    const selectedOptionInitial = yearSelectStart.value;
    const aniosArray = Array.from(aniosdeInicio);

    const uniqueAniosArray = [...new Set(aniosArray)];

    uniqueAniosArray.sort((a, b) => a - b);
    yearSelectStart.innerHTML = '';

    const selectOption = document.createElement('option');
    selectOption.text = 'Select';
    yearSelectStart.add(selectOption);

    uniqueAniosArray.forEach(anio => {
        const option = document.createElement('option');
        option.text = anio;
        yearSelectStart.add(option);
    });
    if (selectedOptionInitial){yearSelectStart.value = selectedOptionInitial;}
}




function agregarPersonajesHtml() {
    const selectedOptionInitial = personajeSelect.value;
    
    
    personajeSelect.innerHTML = '';

    const selectOption = document.createElement('option');
    selectOption.text = 'Select';
    personajeSelect.add(selectOption);

    const personajesOrdenados = [...personajesEncontrados].sort();
    


    personajesOrdenados.forEach(personaje => {
      const option = document.createElement('option');
      option.text = personaje;
      personajeSelect.add(option);
    });
    if (selectedOptionInitial){personajeSelect.value = selectedOptionInitial;}
}


personajeSelect.addEventListener('change', filterComicsByCharacter);

function filterComicsByCharacter() {
    const characterFilter = personajeSelect.value.trim(); // trim elimina espacios en blanco
    activeFilter.personajes = characterFilter.split(',').map(personaje => personaje.trim()); // Convierte la cadena en un array de personajes
    filtercards();
    displayFilteredComics();
    if (characterFilter !== "Select"){
        activeSelect.personaje = true;
        filterOptions(activeSelect.anio, activeSelect.personaje, activeSelect.autor);
        OptionToAplicate(listasOpciones);
        return activeSelect.personaje;
        }
    if (characterFilter == "Select"){
        activeSelect.personaje = false;
        filterOptions(activeSelect.anio, activeSelect.personaje, activeSelect.autor);
        OptionToAplicate(listasOpciones);
        return activeSelect.personaje;
    }
    
    return activeSelect.personaje;
    
    
};





function agregarAutoresHtml() {
    const selectedOptionInitial = autorSelect.value;
    
    autorSelect.innerHTML = '';

    const selectOption = document.createElement('option');
    selectOption.text = 'Select';
    autorSelect.add(selectOption);

    const autoresOrdenados = [...autoresEncontrados].sort();
    


    autoresOrdenados.forEach(autor => {
      const option = document.createElement('option');
      option.text = autor;
      autorSelect.add(option);
    });
    if (selectedOptionInitial){autorSelect.value = selectedOptionInitial;}
}



autorSelect.addEventListener('change', filterComicsByCreators);

    function filterComicsByCreators() {
    const creatorsFilter = autorSelect.value.trim(); 
    activeFilter.autores = creatorsFilter.split(',').map(autor => autor.trim()); 
    
    filtercards();
    displayFilteredComics();
    if (creatorsFilter !== "Select"){
        activeSelect.autor = true;
        filterOptions(activeSelect.anio, activeSelect.personaje, activeSelect.autor);
        OptionToAplicate(listasOpciones);
        return activeSelect.autor;
    }
    if (creatorsFilter == "Select"){
        activeSelect.autor = false;
        filterOptions(activeSelect.anio, activeSelect.personaje, activeSelect.autor);
        OptionToAplicate(listasOpciones);
        return activeSelect.autor;
    }
    return activeSelect.autor;
};
    




const listasOpciones = [];
const activeSelect = {
    anio: false,
    personaje: false,
    autor: false,
    };

function filterOptions(){
    if (!activeSelect.anio && listasOpciones.includes('anios')) {
        const index = listasOpciones.indexOf('anios');
        if (index !== -1) {
            listasOpciones.splice(index, 1);
        }
    }
    if (!activeSelect.personaje && listasOpciones.includes('personaje')) {
        const index = listasOpciones.indexOf('personaje');
        if (index !== -1) {
            listasOpciones.splice(index, 1);
        }
    }
    if (!activeSelect.autor && listasOpciones.includes('autor')) {
        const index = listasOpciones.indexOf('autor');
        if (index !== -1) {
            listasOpciones.splice(index, 1);
        }
    }
    if (activeSelect.anio && !listasOpciones.includes('anios')) {
        listasOpciones.push('anios');
    }
    if (activeSelect.personaje && !listasOpciones.includes('personaje')) {
        listasOpciones.push('personaje');
    }
    if (activeSelect.autor && !listasOpciones.includes('autor')) {
        listasOpciones.push('autor');
    }
};

function OptionToAplicate(listasOpciones) {
    if (listasOpciones.length == ""){actualizaListadoYearsStar(); actualizaListadoAutores();actualizaListadoCharacters();}
    if (listasOpciones.includes("personaje")&& listasOpciones.length == 1) {
        actualizaListadoYearsStar(); actualizaListadoAutores();
    }

    if (listasOpciones.includes("anios")&& listasOpciones.length == 1) {
        actualizaListadoCharacters(); actualizaListadoAutores();
    }
    if (listasOpciones.includes("autor")&& listasOpciones.length == 1) {
        actualizaListadoCharacters();  actualizaListadoYearsStar();
    }
    if (listasOpciones.includes("personaje")&& listasOpciones.includes("anios")&&listasOpciones.length == 2) {
        actualizaListadoCharacters(); actualizaListadoYearsStar();
    }
    if (listasOpciones.includes("anios")&& listasOpciones.length > 1) {
        actualizaListadoYearsStar();
    }
    if (listasOpciones.includes("autor")&& listasOpciones.length > 1) {
        actualizaListadoAutores();
    }
   
};


function actualizaListadoYearsStar(){

    aniosdeInicio.clear();
   
   filtrados.forEach(comic => {
    aniosdeInicio.add(parseInt(comic.yearStart));
   });
   agregarAniosInicioHtml();
};

function actualizaListadoCharacters(){
	personajesEncontrados.clear();
    filtrados.forEach(comic => {
            const characterNames = comic.charactersArray;
            characterNames.forEach(personaje => {
                const personajeLimpio = personaje.replace(/\([^()]*\)/g, '').trim();
                if (personajeLimpio) {
                    personajesEncontrados.add(personajeLimpio);
                }

            });


    });
    agregarPersonajesHtml()
};

function actualizaListadoAutores(){
    autoresEncontrados.clear();
    filtrados.forEach(comic => {
        const creatorNames = comic.creators.split(', ');
        creatorNames.forEach(autor => {
            if (autor.trim() !== "") {
                autoresEncontrados.add(autor);
            }
        });
    });
    agregarAutoresHtml();
};

   

const resetFiltersButton = document.getElementById("resetFiltersButton");


resetFiltersButton.addEventListener("click", function () {
    
    activeFilter.search = "";
    activeFilter.yearsSelect = [];
    activeFilter.yearStart = "";
    activeFilter.personajes = [];
    activeFilter.autores = "";
    
    
    listasOpciones.length = 0;
    
    
    mostrarTarjetasPagina(currentPage, comicsConPersonajes);
    OptionToAplicate(listasOpciones);
    actualizarBotonesNavegacion(comicsConPersonajes)
    irAPagina(0);
    
    
    agregarAniosInicioHtml();
    agregarPersonajesHtml();
    agregarAutoresHtml();
    
    
    yearSelectStart.value = "Select";
    personajeSelect.value = "Select";
    autorSelect.value = "Select";
    textoBuscado.value = "";
    
    
});


// que las cards iniciales se muestren en orden alfabético? --> evaluar, ahora no tienen ningún orden

