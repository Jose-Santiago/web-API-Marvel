// son 1563 personajes. --extensiones .gif no estan y las otras con el path de http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available

//capturamos el DOM
const containerCards = document.querySelector(".container-cards");
const selectOrder = document.getElementById("selectOrder");
const searchInput = document.getElementById("searchInput");
/* const btnSearch = document.getElementById("btnSearch"); */

const loadingMessage = document.getElementById("loading-message");

const containerVerMas = document.querySelector(".container-verMas");

const panelDetalles = document.getElementById("panelCard"); // div para mostrar mas info del personaje

const btnPrevious = document.getElementById("previous");
const btnNext = document.getElementById("next");
const numberPage = document.getElementById("page-number");

const itemsCards = document.getElementById("numCards"); // selected de numero de cards a mostrar

const urlRespuestaAPI =
  "https://gateway.marvel.com:443/v1/public/characters?ts=1&apikey=e415e430852405d2fd41e4cbc487f4c3&hash=8a547ca72f62c1c255b5764ddcb7e703";
const urlPersonajes = "https://gateway.marvel.com:443/v1/public/characters?";
const ts = 1;
const publicK = "e415e430852405d2fd41e4cbc487f4c3";
const hash = "8a547ca72f62c1c255b5764ddcb7e703";
let offset = 0;
const limit = 100;

let totalHeroes = 0;
let personajesMarvelAPI = [];

let cardsPorPagina = Number(itemsCards.value);
let personajesObtenidos = false;

let detailURL;
let wikiURL;

let ultimaPagina = 0;
let nextPage = 0;

let isSearching = false; // Variable para controlar si se está realizando una búsqueda

//funcion para verificar la conexion con la API
async function verifiyConnectionAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return false;
    throw new Error("error: ", response.status);
  }
  const objJson = await response.json();
  console.log("Conexion a la API exitosa, status: ", objJson.code);
  totalHeroes = parseInt(objJson.data.total);
  console.log("EL total de Personajes es: " + totalHeroes);
  console.log("respuesta.json", objJson);
  return true;
}

//funcion que llama a la API, con los datos necesarios para los end points
async function callMarvelAPI(offset) {
  const urlAPI = `${urlPersonajes}ts=${ts}&apikey=${publicK}&hash=${hash}&offset=${offset}&limit=${limit}`;
  console.log(urlAPI);
  const response = await fetch(urlAPI);
  if (!response.ok) {
    throw new Error("error: ", response.status);
  }
  return response.json();
}

//funcion para obtener todos los personajes de la API
async function getAllHeroes() {
  const conexion = await verifiyConnectionAPI(urlRespuestaAPI);
  console.log("La verificacion de conexion es: ", conexion);

  if (conexion) {
    personajesMarvelAPI = [];
    const llamadasAlaAPI = Math.ceil(totalHeroes / limit);
    const promesas = [];

    for (let i = 0; i < llamadasAlaAPI; i++) {
      const offset = i * limit;
      promesas.push(callMarvelAPI(offset));
    }

    try {
      const responses = await Promise.all(promesas);
      // let arraySecundario = responses.flatMap(
      //   (response) => response.data.results
      // );
      personajesMarvelAPI = responses.flatMap(
        (response) => response.data.results
      );

      //guardo la data en el localStorage
      //localStorage.setItem("marvelPersonajes", JSON.stringify(personajesMarvelAPI)); // demasiada info para el LS

      personajesObtenidos = true;
    } catch (error) {
      console.error("Error al obtener los héroes:", error);
    }
  }
}

// Función para mostrar datos en las Cards
function printCards(obj, numCards, inicio) {
  ultimaPagina = Math.floor(totalHeroes / cardsPorPagina);
  containerCards.innerHTML = "";
  //spinner.style.display = "none";
  loadingMessage.style.display = "none";
  let contentHTML = "";
  let contador = 0;
  for (let i = inicio; i < obj.length; i++) {
    let idHero = obj[i].id;
    let nameHero = obj[i].name;
    let imgHero = obj[i].thumbnail.path + "." + obj[i].thumbnail.extension;
    contentHTML += `
            <div class="card" id="${idHero}">
                <div class="imgHeroContainer">
                    <img src="${imgHero}" alt="${nameHero}" class="imgHero">
                </div>
                <h3 class = "contName">
                  <span>${nameHero}</span>
                </h3>
                <div id="${idHero}">
                  <input type="button" value="Ver Mas" class="btnVerMas" data-target="panelCard">
                </div>
            </div>
          `;
    contador++;
    if (contador === numCards) {
      break;
    }
  }

  containerCards.innerHTML = contentHTML;
  clicVerMas();
  btnPrevious.style.display = "block";
  btnNext.style.display = "block";
  if (obj.length <= cardsPorPagina) {
    numberPage.style.visibility = "hidden";
  } else {
    numberPage.style.visibility = "visible";
  }
  numberPage.textContent = `${nextPage + 1} de ${ultimaPagina}`;
}

//funcion que captura todos los botones ver mas y agrega el evento click
function clicVerMas() {
  const btnsVerMas = document.querySelectorAll(".btnVerMas"); // capturamos todos los elementos que tengan clase btnVerMas

  btnsVerMas.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      panelDetalles.style.display = "flex"; // muestro el panel detalles al hacer click
      const targetId = btn.getAttribute("data-target");
      const tarElement = document.getElementById(targetId);

      // obtengo el elemento div padre del boton al hacer clik
      const elementPadre = event.target.parentElement;

      // obtengo el id del padre o div en este caso donde se encuentra el boton
      const idSelected = parseInt(elementPadre.id);

      printCardDetalles(getPersonajeId(idSelected));

      // Realiza un desplazamiento hasta el elemento "container-verMas"
      tarElement.scrollIntoView({ behavior: "smooth" });
    });
  });
}

//funcion que captura el boton cerrar del panes de mas detalles y agrega el evento click para cerrar el panel de card.
function closeVerMas() {
  const btnClose = document.getElementById("btnClose");
  btnClose.addEventListener("click", () => {
    containerVerMas.innerHTML = "";
    panelDetalles.style.display = "none";
  });
}

//funcion que muestra más info del personaje seleccionado
function printCardDetalles(personaje) {
  containerVerMas.innerHTML = "";
  let contentHTML = "";

  const idHero = personaje.id;
  const nameHero = personaje.name;
  const imgHero =
    personaje.thumbnail.path + "." + personaje.thumbnail.extension;
  let descrip = personaje.description;
  if (descrip === "" || descrip === " ") {
    descrip = "Sin descripcion del Personaje.";
  }
  detailURL = personaje.urls[0].url;
  wikiURL = personaje.urls[1].url;

  contentHTML += `
            <div class="card-detalles" id="${idHero}">
                <div>
                  <span class = "id-detalles">ID: ${idHero}</span>
                </div>
                <div class="imgHeroContainer-detalles">
                  <img src="${imgHero}" alt="${nameHero}" class="imgHero-detalles">
                </div>
                <h2 class = "contName">
                  <span>${nameHero}</span>
                </h2>
                <div class = "contDescription">
                  <span class = "textDescription">Descripción:</span>
                  <p class="descripcion">${descrip}</p>
                </div>
                  
                <div class="container-btns">
                    <input type="button" value="Ver Detalles" class="btn" id="details" onclick = "openURLDetail(detailURL)">
                    <input type="button" value="Ver Wiki" class="btn" id="wiki" onclick = "openURLDetail(wikiURL)">
                    <input type="button" value="cerrar" class="btn" id="btnClose">
                </div>
            </div>
          `;

  containerVerMas.innerHTML = contentHTML;
  console.log("El personaje seleccionado es: ", personaje);

  closeVerMas();
}

// funcion para redirigir  a pagina de detalles desde servidor marvel
function openURLDetail(url) {
  window.open(url, "_blank");
}

// funcion para redirigir  a pagina wiki o comiklink desde servidor marvel
function openURLWiki(url) {
  window.open(url, "_blank");
}
//funcion para ordenar array de personajes por ID
function orderIdPersonajes(array) {
  array.sort((a, b) => a.id - b.id);
  console.log("Array Ordenado por ID");
}

//funcion que ordena el array de personajes por Nombre
function orderNamePersonajes(array) {
  array.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    } else {
      return 0;
    }
  });
  console.log("Array Ordenado por Nombres");
}

//funcion que imprime las cards ordenadas segun eleccion del usuario
function orderSelected() {
  const opcSelect = selectOrder.value;

  if (opcSelect === "id") {
    //el usuario selecciono ordenamiento por id
    console.log("Usuario cambio ordenamiento por ID");
    orderIdPersonajes(personajesMarvelAPI);
    //containerCards.innerHTML = "";
    printCards(personajesMarvelAPI, cardsPorPagina, offset);
  } else if (opcSelect === "nombre") {
    //el usuario selecciono ordenamiento por nombre
    console.log("Usuario cambio ordenamiento por Nombre de Personaje");
    orderNamePersonajes(personajesMarvelAPI);
    //containerCards.innerHTML = "";
    printCards(personajesMarvelAPI, cardsPorPagina, offset);
  }
}

function numItemsSelected() {
  const opc = parseInt(itemsCards.value);
  cardsPorPagina = opc;
  printCards(personajesMarvelAPI, cardsPorPagina, offset);
  console.log("cambio el numero de tarjetas a:", opc);
}

//funcion de busqueda de personajes po ID o Nombre
function searchPersonaje() {
  let arrayAuxiliar = personajesMarvelAPI;
  //guardamos lo que se escribe en el input y lo convertimos a minusculas y eliminamos espacios en blanco al inicio y fin
  const textSearch = searchInput.value.trim().toLowerCase();
  if (textSearch) {
    isSearching = true;
    //creamos un filtro que devuelve un array
    const filtroPersonajes = personajesMarvelAPI.filter((personaje) => {
      const personajeNameMinusculas = personaje.name.toLowerCase(); // nombre de personaje a minusculas
      const idPersonajeTexto = personaje.id.toString(); // id de personaje a texto
      return (
        personajeNameMinusculas.includes(textSearch) ||
        idPersonajeTexto.includes(textSearch)
      );
    });
    personajesMarvelAPI = filtroPersonajes;
    //limpiamos el conteiner de las cards para mostrar los resultados de busqueda
    containerCards.innerHTML = "";
    printCards(personajesMarvelAPI, cardsPorPagina, 0);

    if (personajesMarvelAPI.length <= cardsPorPagina) {
      btnNext.style.visibility = "hidden";
      btnPrevious.style.visibility = "hidden";
    } else {
      btnNext.style.visibility = "visible";
      btnPrevious.style.visibility = "visible";
    }
  } else {
    if (isSearching) {
      personajesMarvelAPI = arrayAuxiliar;
      containerCards.innerHTML = "";
      printCards(personajesMarvelAPI, cardsPorPagina, 0);
    }
  }
  containerCards.innerHTML = "";
  printCards(personajesMarvelAPI, cardsPorPagina, 0);
  clicVerMas();
  personajesMarvelAPI = arrayAuxiliar;
}

//funcion de busqueda por id para obtener solo los datos de ese personaje
function getPersonajeId(id) {
  const personaje = personajesMarvelAPI.find((obj) => obj.id === id);
  return personaje || "No encontrado";
}

// Función principal
async function main() {
  try {
    if (personajesObtenidos) {
      loadingMessage.style.display = "none";
      printCards(personajesMarvelAPI, cardsPorPagina, 0);
      console.log("Personajes ya obtenidos no se llama a API");
    } else {
      console.log("se realiza llamado a API para obtener DATA");
      await getAllHeroes();
      loadingMessage.style.display = "none";
      printCards(personajesMarvelAPI, cardsPorPagina, offset);
    }
  } catch (error) {
    console.error("Error en la función main:", error);
  }
}

// agregamos la funcion de busqueda por id o nombre cada que se escriba algo en el input
searchInput.addEventListener("input", (e) => {
  searchPersonaje();
});

//agregamos la funcion de ordenar cards cuando se seleccione una opcion en el select
selectOrder.addEventListener("change", orderSelected);

itemsCards.addEventListener("change", numItemsSelected); ///

//evento clik a botones de paginacion
btnPrevious.addEventListener("click", () => {
  const targetId = btnPrevious.getAttribute("data-target");
  const tarElement = document.getElementById(targetId);
  if (offset != 0) {
    offset -= cardsPorPagina;
    nextPage--;
    printCards(personajesMarvelAPI, cardsPorPagina, offset);

    //Realiza un desplazamiento hasta el elemento "container-verMas"
    tarElement.scrollIntoView({ behavior: "smooth" });
  }
});

btnNext.addEventListener("click", () => {
  ultimaPagina = Math.floor(totalHeroes / cardsPorPagina);
  const targetId = btnNext.getAttribute("data-target");
  const tarElement = document.getElementById(targetId);
  if (nextPage < ultimaPagina) {
    offset += cardsPorPagina;
    nextPage++;
    printCards(personajesMarvelAPI, cardsPorPagina, offset);

    // Realiza un desplazamiento hasta el elemento "container-verMas"
    tarElement.scrollIntoView({ behavior: "smooth" });
  }
});
// Llamamos a la función principal cuando se cargue la página
document.addEventListener("DOMContentLoaded", main);
