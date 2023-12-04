function main(): void{
    const addAptBtn = document.createElement("button");
    addAptBtn.innerHTML = "Add apartment";
    addAptBtn.id = "add-apt-btn";
    addAptBtn.addEventListener("click", addInput);

    const table = document.querySelector("table");
    table.insertAdjacentElement("beforebegin", addAptBtn);
    document.getElementsByTagName("tr")[0].addEventListener("click", sortTable);
}

function addInput(e: MouseEvent): void {
    e.target.removeEventListener("click", addInput);
    e.target.addEventListener("click", removeInput);
    const input = document.createElement("div");
    input.id = "input";
    input.innerHTML = ('<div style="display: flex"><label for="apt-link">Link:</label>'
                       + '<input type="text" id="apt-link"></div>'
                       + '<div><label for="location">Location:</label>'
                       + '<input type="text" id="location"></div>'
                       + '<div><label for="rooms">Rooms:</label>'
                       + '<input type="number" id="rooms"></div>'
                       + '<div><label for="square-meters">Square Meters:</label>'
                       + '<input type="number" id="square-meters"></div>'
                       + '<div><label for="notes">Notes:</label>'
                       + '<textarea id="notes" rows="10" cols="35"></textarea></div>'
                       + '<div><button id="add-cost-btn">Add cost</button>'
                       + '<button id="send-apt-btn">Submit</button></div>');
    const predefiniedAttrsList = Array.from(document.getElementById("attr-list").children) as HTMLLIElement[];
    let predefiniedAttrs: string[] = [];
    document.getElementById("add-apt-btn").insertAdjacentElement(
                            "afterend", input);
    for (const el of predefiniedAttrsList){
        // predefiniedAttrs.push(el.innerText);
        const attr_fieldset = document.createElement("fieldset");
        attr_fieldset.innerHTML += `<legend>${el.innerText}</legend>`;
        attr_fieldset.innerHTML += (''
                                    + `<input type="radio" name="${el.innerText}" id="?${el.innerText}" value="?" checked />`
                                    + `<label for="?${el.innerText}">Not mentioned / Maybe</label>`

                                    + `<input type="radio" name="${el.innerText}" id="+${el.innerText}" value="+" />`
                                    + `<label for="+${el.innerText}">Yes</label>`

                                    + `<input type="radio" name="${el.innerText}" id="-${el.innerText}" value="-" />`
                                    + `<label for="-${el.innerText}">No</label>`

                                    + '')
        document.getElementById("add-cost-btn").insertAdjacentElement("beforebegin", attr_fieldset);
    }
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
    cost.innerHTML = ('<div><label for="cost-name">Name:</label>'
                      + '<input type="text" id="cost-name"></div>'
                      + '<div><label for="cost-price">Price:</label>'
                      + '<input type="number" id="cost-price"></div>'
                      + '<div><label for="is-estimated">Estimated:</label>'
                      + '<input type="checkbox" id="is-estimated"></div>');
    document.getElementById("add-cost-btn").insertAdjacentElement("beforebegin",
                                                                  cost);
}

async function addCostsAndApt(e: MouseEvent){
    const costs_ids = await addCosts();
    const attrs_ids = await addAttrs();
    addApt(costs_ids, attrs_ids);
}

async function addCosts(){
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
    return costs_ids;
}

async function addAttrs(){
    const attr_url = window.location.origin + '/add_attr/';

    const fieldsets_arr = Array.from(document.getElementsByTagName("fieldset")) as HTMLFieldSetElement[];
    let attrs_ids: Number[] = [];
    let name: string;
    let is_: boolean | null;
    for (const fs of fieldsets_arr){
        const inputs = Array.from(fs.elements) as HTMLInputElement[];
        for (const input of inputs){
            if (!input.checked) continue;
            name = input.name;

            if (input.value === "?") is_ = null;
            else if (input.value === "+") is_ = true;
            else if (input.value === "-") is_ = false;

            attrs_ids.push(await fetch(attr_url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": CSRFTOKEN
                },
                body: JSON.stringify({payload: {attr: {name: name, is: is_}}})
            })
            .then(response => {
                if (response.ok){
                    return new Promise(resolve => {resolve(response.json())});
                }
            })
            .then((data: {attr_id: Number}) => {
                return data.attr_id;
            }));
        }
    }
    return attrs_ids;
}

async function addApt(costs_ids: Number[], attr_ids: Number[]){
    console.log(attr_ids);
    const apt_url = window.location.origin + '/add_apt/';

    const apt_div = document.getElementById("input") as HTMLDivElement;
    const link_field = apt_div.querySelector("#apt-link") as HTMLInputElement;
    const link = link_field.value;
    const sqm_field = apt_div.querySelector("#square-meters") as HTMLInputElement;
    const sqm = Number(sqm_field.value);
    const rooms_field = apt_div.querySelector("#rooms") as HTMLInputElement;
    const rooms = Number(rooms_field.value);
    const location_field = apt_div.querySelector("#location") as HTMLInputElement;
    const location = location_field.value;
    const notes_field = apt_div.querySelector("#notes") as HTMLInputElement;
    const notes = notes_field.value;

    fetch(apt_url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": CSRFTOKEN
        },
        body: JSON.stringify({payload:
                              {link: link, squareMeters: sqm, rooms: rooms,
                               location: location, notes: notes,
                               costs: costs_ids, attrs: attr_ids}})
    })
    .then(response => {
        if (response.ok){
            return new Promise(resolve => {resolve(response.json())});
        }
    })
    .then(data => {
        const costs_arr = Array.from(document.getElementsByClassName("cost"));
        for (const cost of costs_arr){
            cost.remove();
        }
        document.getElementById("input").remove();
       window.location.reload();
    });
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

function sortTable(e: MouseEvent){
    const url = new URL(window.location.href);
    const target = e.target as HTMLTableCellElement;
    const key = target.innerText;

    if (["Rooms", "m2", "Total", "Attributes"].includes(key)){
        if (url.searchParams.get("sortby") === key && url.searchParams.get("reverse") == "True"){
            url.searchParams.set("reverse", "False");
        }
        else if (url.searchParams.get("sortby") === key){
            url.searchParams.set("reverse", "True");
        }
        else {
            url.searchParams.set("sortby", key);
            if (url.searchParams.has("reverse")){
                url.searchParams.delete("reverse");
            }
        }
        window.location.href = String(url);
    }
}

const CSRFTOKEN: string = getCookie('csrftoken');

window.onload = main;
