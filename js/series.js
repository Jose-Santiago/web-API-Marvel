let timestamp = Date.now();
const publicKey = "1e083f86eec698bd6998a349caff708f";
const hash = "b4e122ee77cadc8bd816190965296d5d";
const IMAGE_SIZE = "portrait_uncanny";
timestamp = 56486215;
let cardsTemplates = [];
let itemsSeries = [];
let offset = 0;
let limit = 100;
let totalCards = 0;

const authUrl = `?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
cargarTodoItemsSeries(consumeAPI);

let botonOcultar = document.querySelector(".button_ocultar_detalle");

async function filtrarPorTexto(){
  const textoBusqueda = document.querySelector('#inputBusqueda').value.toLowerCase();
  if (textoBusqueda.length === 0) {
    mostrarPorNumItems();
    return;
  }

							   
  let cardsFiltradas = itemsSeries.filter(item => item.title.toLowerCase().includes(textoBusqueda));

  prepararHtmlCards(cardsFiltradas);
}

function mostrarPorNumItems() {
    const numeroItems = parseInt(document.querySelector("#numItems").value);
											   
    let copiaCards = itemsSeries;
    prepararHtmlCards(copiaCards.slice(0, numeroItems));
}

function prepararHtmlCards(items){
					   
    let divContent = document.getElementById("content");
    
    cards = [];
    divContent.innerHTML = '';
    
    cardsTemplates = [];
    items.forEach(element => {
      let descripcion = (element.description===null)?'':element.description;
      
      let titulo = element.title.replace(/[\(\)]/g, '');
      let card = `<div id="${element.id}" class="card">
                    <div class="div_portada"><img src="${element.thumbnail.path}/${IMAGE_SIZE}.jpg"></div>
                    <div class="div_titulo"><h2>${titulo}</h2></div>
                    <div class="div_anio"><h4>${element.startYear} - ${element.endYear}</h4></div>
                    <div class="div_descripcion"><p>${descripcion.length>105?descripcion.substr(0,105)+"...":descripcion}</p></div>
                    <div class="div_button_detalles">
                      <button id="button_${element.id}" class="button_detalles" type="button"  onclick="mostrarMasInfo(${element.id})">+ Detalles</button>
                    </div>
                    </div>`;
      
      cardsTemplates.push(card);
      divContent.innerHTML += card;
      
    });  
}

function ocultarDetalles(){
  let divDetalles = document.getElementById("div_detalles_card");

  divDetalles.classList.add("div_detalles_card--hide");
}

function mostrarMasInfo(id){
  let card = itemsSeries.find(card => card.id.toString() === id.toString());
  let divDetalles = document.getElementById("div_detalles_card");

  console.log(card);
  divDetalles.innerHTML = `<div class="div_card_detalle">                            
                            <div class="div_header_detalle_card">
                              <div class="div_titulo"><h1>${card.title}</h1></div>
                              <div class="div_anio"><h3>${card.startYear} - ${card.endYear}</h3></div>
                            </div>
                            <div class="div_body_detalle_card">
                              <div class="div_portada_detalle"><img src="${card.thumbnail.path}/${IMAGE_SIZE}.jpg"></div>
                              <div class="div_personajes"></div>
                              <div class="div_descripcion_detalle"><h4>Descripción</h4><p>${card.description===null?'No tenemos más información':card.description}</p></div>
                            </div>
                            <div class="div_button_ocultar_detalle">
                              <button class="button_ocultar_detalle" onclick="ocultarDetalles()">Ocultar detalles</button>
                            </div>
                          </div>`;
  creaListaCaracteres(card.characters.items);
  divDetalles.classList.remove("div_detalles_card--hide")

}



function creaListaCaracteres(listaPersonajes){
  let div_personajes = document.querySelector(".div_personajes");

  div_personajes.innerHTML = `<h4>Personajes</h4><ul>`;
  if(listaPersonajes.length===0)
    div_personajes.innerHTML += `Sin información`;
  else
    listaPersonajes.forEach(personaje => div_personajes.innerHTML += `<li><p>${personaje.name}<p></li>`);
  div_personajes.innerHTML += `</ul>`;
}

function cargarTodoItemsSeries(callbackConsumeAPI){
  consumeAPI(offset, 25, true);
  
  let i = 0;
  while(i < 3) {
    offset += limit;
    callbackConsumeAPI(offset, limit, false);
    i++;
  }
  
}


function consumeAPI(_offset, _limit, primerConsumo){
  fetch(`https://gateway.marvel.com/v1/public/series${authUrl}&offset=${_offset}&limit=${_limit}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('La solicitud no fue exitosa');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  
      if(itemsSeries.length===0)
        itemsSeries = data.data.results;
      else
        itemsSeries = itemsSeries.concat(data.data.results);
     
      console.log(itemsSeries);
      /*prepararHtmlCards(data.data.results);*/
      
      if(primerConsumo) {
        mostrarPorNumItems();
        totalCards = data.data.total;
        console.log("totalCards: " + totalCards);
								 
							  
													  
        /*asignarFooter(data.attributionText);*/
      }
  })

  .catch(error => {
    console.error('Error:', error);
  });

					 
									 
	   
}

function asignarFooter(stringFooter){
  let footer = document.getElementById("sectionFooter");

  /* Código para footer */
  footer.innerHTML = "";
  let textFooter = document.createElement("p");
  var texto = document.createTextNode(stringFooter);
  textFooter.appendChild(texto);

  footer.appendChild(textFooter);
}