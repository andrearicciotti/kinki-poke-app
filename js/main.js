async function main() {
    const response = await fetch('../config.json');

    if (!response.ok) {
        throw new Error('Errore nel recupero dei dati');
    }

    const data = await response.json();
        
    generateBoxHTML(data);
    generateIngredientsHTML(data);
}

function generateBoxHTML(data) {
    const poke = data[0];
    const container = document.querySelector('.ingredients-container');
    console.log(data);

    for (const key in poke.ingredients) {
        console.log(key);
        
        container.innerHTML += 
        `<div class="box my-3 text-center">
            <h2>${key}</h2>
            <ul class="${key+'-list'}">
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
            `<li><span class"btn-reduce>- </span>${ingredient}<span class="btn-increase"> +</span></li>`;
        });
    }
}

main();