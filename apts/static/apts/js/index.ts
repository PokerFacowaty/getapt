function main(): void{
    const addAptBtn = document.createElement("button");
    addAptBtn.innerHTML = "Add apartment";
    addAptBtn.id = "add-apt-btn";
    addAptBtn.addEventListener("click", addInput);

    const table = document.querySelector("table");
    table.insertAdjacentElement("beforebegin", addAptBtn);
}

function addInput(e: MouseEvent): void {
    e.target.removeEventListener("click", addInput);
    e.target.addEventListener("click", removeInput);
    const input = document.createElement("div");
    input.id = "input";
    input.innerHTML = ('<label for="link">Link:</label>'
                       + '<input type="text" id="link">'
                       + '<label for="square-meters">Square Meters:</label>'
                       + '<input type="number" id="square-meters">'
                       + '<label for="rooms">Rooms:</label>'
                       + '<input type="number" id="rooms">'
                       + '<label for="location">Location:</label>'
                       + '<input type="text" id="location">'
                       + '<label for="notes">Notes:</label>'
                       + '<input type="textarea" id="notes">'
                       + '<button id="send-apt-btn">Submit</button>'
                       + '<button id="add-cost-btn">Add cost</button>');
    document.getElementById("add-apt-btn").insertAdjacentElement(
                           "afterend", input);
    document.getElementById("add-cost-btn").addEventListener("click", addCost);
    document.getElementById("send-apt-btn").addEventListener("click", addCostsAndApt);
}

function removeInput(e: MouseEvent): void {
    document.getElementById("input").remove();
    e.target.removeEventListener("click", removeInput);
    e.target.addEventListener("click", addInput);
}

function addCost(e: MouseEvent): void {
    // e.target.removeEventListener("click", addCost);
    const cost = document.createElement("div");
    cost.classList.add("cost");
    cost.innerHTML = ('<label for="cost-name">Name:</label>'
                      + '<input type="text" id="cost-name">'
                      + '<label for="cost-price">Price:</label>'
                      + '<input type="number" id="cost-price">'
                      + '<label for="is-estimated">Estimated:</label>'
                      + '<input type="checkbox" id="is-estimated">');
    document.getElementById("send-apt-btn").insertAdjacentElement("afterend",
                                                                  cost);
}

async function addCostsAndApt(e: MouseEvent){
    const cost_url = window.location.origin + '/add_cost/';

    const costs_arr = Array.from(document.getElementsByClassName("cost"));
    let costs_ids: Number[] = [];
    let name: string;
    let price: Number;
    let is_est: boolean;
    for (const cost_div of costs_arr){
        let name_field = cost_div.querySelector("#cost-name") as HTMLInputElement;
        name = name_field.value;
        let price_filed = cost_div.querySelector("#cost-price") as HTMLInputElement;
        price = Number(price_filed.value);
        let is_est_field = cost_div.querySelector("#is-estimated") as HTMLInputElement;
        is_est = is_est_field.checked;

        costs_ids.push(await fetch(cost_url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": CSRFTOKEN
            },
            body: JSON.stringify({payload: {name: name, price: price, priceIsEstimated: is_est}})
        })
        .then(response => {
            if (response.ok){
                return new Promise(resolve => {resolve(response.json())});
            }
        })
        .then((data: {cost_id: Number}) => {
            console.log(data);
            return data.cost_id;
        }));
    }
    console.log(costs_ids);
}

function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(
                                                 name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const CSRFTOKEN: string = getCookie('csrftoken');

window.onload = main;
