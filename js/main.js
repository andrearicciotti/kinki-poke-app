let config;
let poke = {};

async function main() {
    const response = await fetch('../config.json');

    if (!response.ok) {
        throw new Error('Errore nel recupero dei dati');
    }

    const data = await response.json();
    config = data[0];
    console.log('File di configurazione: ', config);
        
    generateBoxHTML(data);
    generateIngredientsHTML(data);
}

function generateBoxHTML(data) {
    const poke = data[0];
    const container = document.querySelector('.ingredients-container');
    let i = 0;

    for (const key in poke.ingredients) {
        i++;
        let translations = {
            bases: "Base",
            proteins: "Proteine",
            greens: "Verdure",
            toppings: "Condimenti",
            sauces: "Salse",
        }
        
        container.innerHTML += 
        `<div class="box my-3 text-center">
            <h2 style="z-index:${i}" class="mt-3 mb-4 py-3 fw-bolder ms-title fs-1">${translations[key]}</h2>
            <ul class="${key+'-list'} d-flex flex-column align-items-center">
            </ul>
        </div>`;
    }
}

function generateIngredientsHTML(data) {
    const poke = data[0];
    let list;

    for (const key in poke.ingredients) {
        
        poke.ingredients[key].forEach(ingredient => {
            list = document.querySelector('.'+key+'-list');
            list.innerHTML += 
            `<li class="ingredient my-2 d-flex align-items-center justify-content-between position-relative"><i class="fa-solid fa-minus me-3" onclick="btnClick(false,'${key}','${ingredient}')"></i></i><span class="ingredient-text">${ingredient}</span><i class="fa-solid fa-plus ms-3" onclick="btnClick(true,'${key}','${ingredient}')"></i><span id="${key}-${ingredient}" class="ingredient-badge position-absolute ingredient-badge-hidden"></span></li>`;
        });
    }
}

main();

function btnClick(add, type, ingredient) {
    let badge = document.getElementById(type+'-'+ingredient);
    console.log(add, type, ingredient);

    if (add) {
        if (!poke[type]) {
            poke[type] = {}
        }

        poke[type][ingredient] = (poke[type][ingredient] | 0) + 1;
        badge.innerText = poke[type][ingredient];
        badge.classList.remove('ingredient-badge-hidden');
    }

    if (!add) {
        if (poke[type][ingredient] > 0) {
            poke[type][ingredient] -= 1;
        }
        if (poke[type][ingredient] > 0) {
            badge.innerText = poke[type][ingredient];
        } else {
            badge.classList.add('ingredient-badge-hidden');
        }
    }

    console.log(poke[type]);
    
}

function checkStickyStatus() {
    let titles = document.querySelectorAll('.ms-title');
    
    titles.forEach(title => {
        const rect = title.getBoundingClientRect();
        
        if (rect.top <= 0) {
            title.style.backgroundImage = 'url(./img/icon.png)';
            title.style.backgroundColor = 'rgb(135, 180, 135)';
        }
        if (rect.top > 0) {
            title.style.backgroundImage = '';
            title.style.backgroundColor = '';
        }
    });
}

window.addEventListener('scroll', checkStickyStatus);