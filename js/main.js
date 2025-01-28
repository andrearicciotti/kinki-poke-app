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
    const config = data[0];
    const container = document.querySelector('.ingredients-container');
    let i = 0;
    let mb = '';

    
    for (const key in config.ingredients) {
        i++;

        if (Object.keys(config.ingredients).length == i) {
            mb = 'mb-6'
        }

        let translations = {
            bases: "Base",
            proteins: "Proteine",
            greens: "Verdure",
            toppings: "Condimenti",
            sauces: "Salse",
        }
        
        container.innerHTML += 
        `<div class="box my-2 ${mb} text-center">
            <h2 style="z-index:${i}" class="mt-3 mb-4 py-3 fw-bolder ms-title fs-1">${translations[key]}</h2>
            <ul class="${key+'-list'} d-flex flex-column align-items-center">
            </ul>
        </div>`;
    }
}

function generateIngredientsHTML(data) {
    const config = data[0];
    let list;

    for (const key in config.ingredients) {
        
        config.ingredients[key].forEach(ingredient => {
            list = document.querySelector('.'+key+'-list');

            list.innerHTML += 
            `<li class="ingredient my-2 d-flex align-items-center justify-content-between position-relative"><i class="fa-solid fa-minus me-3" onclick="btnClick(false,'${key}','${ingredient.replace("'", "\\'")}')"></i></i><span class="ingredient-text">${ingredient}</span><i class="fa-solid fa-plus ms-3" onclick="btnClick(true,'${key}','${ingredient.replace("'", "\\'")}')"></i><span id="${key}-${ingredient}" class="ingredient-badge position-absolute badge-hidden"></span></li>`;
        });
    }
}

main();

function btnClick(add, type, ingredient) {
    let badge = document.getElementById(type+'-'+ingredient);
    let priceContainer = document.querySelector('.price');

    if (add) {
        if (priceContainer.innerText == '') {
            priceContainer.innerText = `${config.price} €`;    
        }

        if (!poke[type]) {
            poke[type] = {}
        }

        if (checkMaximals(type)) {
            if (poke[type][ingredient]) {
                poke[type][ingredient] ++;
            } else {
                poke[type][ingredient] = 1;
            }
    
            badge.innerText = poke[type][ingredient];
            badge.classList.remove('badge-hidden');
        }
    }

    if (!add) {
        if (poke[type][ingredient] > 0) {
            poke[type][ingredient] -= 1;
        }
        if (poke[type][ingredient] > 0) {
            badge.innerText = poke[type][ingredient];
        } else {
            badge.classList.add('badge-hidden');
        }
    }

    checkLimits();
}

function checkMaximals(type) {
    let maximals = config.maximals[type]
    let quantity;
    
    for (const keyType in poke) {
        quantity = 1;
        for (const keyIngredient in poke[keyType]) {
            quantity += poke[keyType][keyIngredient];
        }
    }

    return quantity <= maximals
}

function checkLimits() {
    let priceContainer = document.querySelector('.price');
    let price = parseFloat(config.price);
    let toAdd = 0;

    for (const keyType in poke) {
        let limit = config.limits[keyType];
        let quantity = 0;

        for (const keyIngredient in poke[keyType]) {
            quantity += poke[keyType][keyIngredient];
        }

        if (quantity > 0) {
            priceContainer.innerText = `${price.toFixed(2)} €`;
        } else {
            priceContainer.innerText = '';
        }

        if (quantity > limit) {
            toAdd += (quantity - limit) * config.extra[keyType];
        }
    }

    if (toAdd > 0) {
        price += toAdd;
    }

    priceContainer.innerText = `${price.toFixed(2)} €`;
    poke['price'] = price;
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

function savePoke() {
    let storage = JSON.parse(localStorage.getItem('cart')) || [];
    console.log(storage);

    storage.cart.push(poke);
    localStorage.setItem('cart', JSON.stringify(storage.cart));

    const totalPrice = storage.cart.reduce((total, currentPoke) => total + currentPoke.price, 0);

    localStorage.setItem('cart', JSON.stringify({ cart: storage.cart, totalPrice: totalPrice }));

    poke = {};
}

window.addEventListener('scroll', checkStickyStatus);