let config;
let poke = {};
const translations = {
    bases: "Base",
    proteins: "Proteine",
    greens: "Verdure",
    toppings: "Condimenti",
    sauces: "Salse",
}

async function main() {
    const response = await fetch('../config.json');
    let storage = JSON.parse(localStorage.getItem('cart')) || [];

    if (!response.ok) {
        throw new Error('Errore nel recupero dei dati');
    }

    const data = await response.json();
    config = data[0];
    
    generateBoxHTML(data);
    generateIngredientsHTML(data);
    togglePokeBadge(storage.cart?.length);
    generateCart(storage);
}

function generateCart(storage) {
    const cart = storage.cart;
    const cartBody = document.querySelector('.cart-body');
    const cartTotal = document.querySelector('.ms-price');
    let html = '';

    if (cart.length > 0) {
        cartTotal.innerHTML = `${storage.totalPrice} €`;
        cart.forEach(poke => {
            
            html += `
                <div class="poke-item p-2 d-flex justify-content-between align-items-center gap-3 my-3">
                <button type="button" class="poke-btn-delete"></button>
                    <div class="poke-img d-flex flex-column justify-content-between align-items-center">
                        <img src="./img/poke.png" alt="immagine poke" class="px-auto h-100">
                        <span class="fw-bold">${poke.price.toFixed(2)} €</span>
                    </div>
                    <div class="poke-resume d-flex flex-column align-items-start justify-content-start">
            `;

            for (const type in poke) {
                if(type == 'price') continue;
                let sIngredients = '';
                html += `
                        <div class="type-resume">
                            <strong>${translations[type]}: </strong><span>
                `;

                for (const ingredient in poke[type]) {
                    sIngredients += `
                        ${ingredient} (<strong>${poke[type][ingredient]}</strong>)
                    `
                }

                html += `
                    ${sIngredients}.
                `;
                html += `</span></div>`;
            }
            
            html += `</div></div>`;
        })

        cartBody.innerHTML = html;
    } else {
        cartBody.innerHTML = 'Nessuna poke nel carrello';
    }
}

function generateBoxHTML(data) {
    const config = data[0];
    const container = document.querySelector('.ingredients-container');
    let priceContainer = document.querySelector('.price');

    priceContainer.innerHTML = '';
    container.innerHTML = '';

    let i = 0;
    let mb = '';

    
    for (const key in config.ingredients) {
        i++;

        if (Object.keys(config.ingredients).length == i) {
            mb = 'mb-6'
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
    let quantity = 0;

    for (const keyIngredient in poke[type]) {
        quantity = poke[type][keyIngredient] + 1;
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
            title.style.backgroundColor = 'rgb(135, 180, 135)';
            title.style.color = 'white';
        }
        if (rect.top > 0) {
            title.style.backgroundColor = '';
            title.style.color = '';
        }
    });
}

function togglePokeBadge(nPokes) {
    const pokeBadge = document.querySelector('.poke-badge');
    
    if (nPokes && nPokes > 0) {
        pokeBadge.innerText = nPokes.toString();
        pokeBadge.classList.remove('badge-hidden')
    }
}

function savePoke() {
    let pokeKeys = Object.keys(poke).length;

    if (pokeKeys > 0) {
        let storage = JSON.parse(localStorage.getItem('cart')) || {};
    
        if (!storage.cart) {
            storage['cart'] = [];
        }
    
        storage.cart.push(poke);
        localStorage.setItem('cart', JSON.stringify(storage.cart));
        
        const totalPrice = storage.cart.reduce((total, currentPoke) => total + currentPoke.price, 0).toFixed(2);
        
        localStorage.setItem('cart', JSON.stringify({ cart: storage.cart, totalPrice: totalPrice }));
        
        togglePokeBadge(storage.cart.length);
        poke = {};
        main();
    } else {
        return
    }
}

window.addEventListener('scroll', checkStickyStatus);

main();