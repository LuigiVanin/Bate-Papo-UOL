const messageBody = {
    from: "Salesiano colégio e curso",
    to: "Todos",
    text: "",
    type: "message",
};

function setEnterAction() {
    document.addEventListener("keypress", (event) => {
        if (event.key !== "Enter") {
            return;
        }
        sendMessage();
    });
}

function sendMessage() {
    const textInput = document.querySelector("input");
    messageBody.text = textInput.value;

    if (messageBody.to !== "Todos") {
        messageBody.type = "private_message";
    } else {
        messageBody.type = "message";
    }
    axios
        .post("https://mock-api.driven.com.br/api/v4/uol/messages", messageBody)
        .then(getMessages);
    textInput.value = "";
}

function buidText(msg) {
    return msg.to !== "Todos"
        ? ` reservadamente para <strong>${msg.to}</strong>`
        : msg.type === "status"
        ? ""
        : ":";
}

function buildMessage(msg) {
    const text = buidText(msg);
    const type = msg.to !== "Todos" ? "private_message" : msg.type;

    html = `
    <p class="msg ${type}">
        <span class="time">
            (${msg.time})
        </span>
        <span class="text">
            <strong>${msg.from}${text}</strong> ${msg.text}
        </span>
    </p>`;
    return html;
}

function toggleSideBar() {
    const sideBar = document.querySelector("aside");
    const blur = document.querySelector(".blur");

    blur.classList.toggle("hidden");
    sideBar.classList.toggle("hidden");
}

async function changeTargetParticipant(name) {
    if (messageBody.to === name) return;
    messageBody.to = name;
    getParticipants();
}

function defaultParticipant() {
    let selected = document
        .querySelector("ul.people")
        .querySelector("li.selected");
    if (selected === null) {
        document.querySelector("li").classList.add("selected");
        messageBody.to = "Todos";
    }
}

function renderLiTemplate(name) {
    const icon =
        name === "Todos"
            ? "<ion-icon name='people'></ion-icon>"
            : "<ion-icon name='person'></ion-icon>";
    const elementClass = messageBody.to === name ? "selected" : "";
    return `
            <li class="${elementClass}" onclick="changeTargetParticipant('${name}')">
                <div class="label">
                    ${icon} <span> ${name} </span>

                </div>
                <ion-icon name="checkmark"></ion-icon>
            </li>
    `;
}

function updateSideBar(response) {
    const data = response.data;
    const participants = document.querySelector("ul.people");
    participants.innerHTML = renderLiTemplate("Todos");
    for (let i = 0; i < data.length; i++) {
        if (data[i].name !== messageBody.from)
            participants.innerHTML += renderLiTemplate(data[i].name);
    }
    defaultParticipant();
}

function getMessages() {
    axios
        .get("https://mock-api.driven.com.br/api/v4/uol/messages")
        .then(updateMessage);
}

function updateMessage(response) {
    const messages = response.data;
    const msgContainer = document.querySelector(".container");
    msgContainer.innerHTML = ``;
    for (let i = 0; i < messages.length; i++) {
        msgContainer.innerHTML += buildMessage(messages[i]);
    }
    // document.querySelectorAll(".msg")[99].scrollIntoView();
}

function getParticipants() {
    axios
        .get("https://mock-api.driven.com.br/api/v4/uol/participants")
        .then(updateSideBar);
}

function keepConnection() {
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {
        name: messageBody.from,
    });
}

async function initChat() {
    getParticipants();
    // getMessage()
    await axios
        .get("https://mock-api.driven.com.br/api/v4/uol/messages")
        .then(updateMessage);
    document.querySelectorAll(".msg")[99].scrollIntoView();
    setEnterAction();

    setInterval(getMessages, 3000);
    setInterval(keepConnection, 5000);
    setInterval(getParticipants, 10000);
}

function getUserName() {
    messageBody.from = prompt("Qual é nome do seu usuário?");
    const name = { name: messageBody.from };
    let conn = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        name
    );
    conn.then(initChat);
    conn.catch(getUserName);
}

getUserName();
