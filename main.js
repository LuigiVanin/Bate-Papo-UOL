const messageBody = {
    from: "Salesiano colégio e curso",
    to: "Todos",
    text: "",
    type: "message",
};
let lastMessage = "";

function setEnterAction() {
    document.addEventListener("keypress", (event) => {
        if (event.key !== "Enter") {
            return;
        }
        sendMessage();
    });
}

function updateTargetNotification() {
    const notification = document.querySelector("p.notification");
    let visStatus =
        messageBody.type === "private_message" ? "(reservadamente)" : "";

    notification.innerHTML = `Enviando para ${messageBody.to}${visStatus}`;
}

function changeVisibility(option, element) {
    if (option === messageBody.type) {
        return;
    }
    messageBody.type = option;
    document.querySelector(".type li.selected").classList.remove("selected");
    element.classList.add("selected");
    updateTargetNotification();
}

function toggleSideBar() {
    const sideBar = document.querySelector("aside");
    const blur = document.querySelector(".blur");

    blur.classList.toggle("hidden");
    sideBar.classList.toggle("hidden");
}

function changeTargetParticipant(name) {
    if (messageBody.to === name) return;
    messageBody.to = name;
    getParticipants();
    updateTargetNotification();
}

function defaultParticipant() {
    let selected = document
        .querySelector("ul.people")
        .querySelector("li.selected");
    if (selected === null) {
        document.querySelector("li").classList.add("selected");
        messageBody.to = "Todos";
    }
    updateTargetNotification();
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

function updateParticipants(response) {
    const data = response.data;
    const participants = document.querySelector("ul.people");
    participants.innerHTML = renderLiTemplate("Todos");
    for (let i = 0; i < data.length; i++) {
        if (data[i].name !== messageBody.from)
            participants.innerHTML += renderLiTemplate(data[i].name);
    }
    defaultParticipant();
}

function sendMessage() {
    const textInput = document.querySelector("input.text-field");
    messageBody.text = textInput.value;

    let men = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/messages",
        messageBody
    );

    men.then(getMessages);
    men.catch((err) => {
        if (err.response.status === 400) {
            alert(
                "A mensagem não pode estar vazia ou participante selecionado saiu da sala"
            );
        }
    });
    textInput.value = "";
}

function getMessages() {
    axios
        .get("https://mock-api.driven.com.br/api/v4/uol/messages")
        .then(renderMessages);
}

function buidText(msg) {
    let private = msg.type === "private_message" ? "reservadamente" : "";
    return msg.type !== "status"
        ? ` ${private} para <strong>${msg.to}</strong>: `
        : " ";
}

function buildMessage(msg) {
    const text = buidText(msg);
    let type = msg.type;
    if (msg.to === "Todos" && msg.type !== "status") {
        type = "message";
    }

    if (
        msg.type === "private_message" &&
        !(
            msg.from === messageBody.from ||
            msg.to === messageBody.from ||
            msg.to === "Todos"
        )
    ) {
        return "";
    }

    html = `
    <p class="msg ${type}">
        <span class="time">
            (${msg.time})
        </span>
        <span class="text">
            <strong>${msg.from}</strong>${text} ${msg.text}
        </span>
    </p>`;
    return html;
}

function renderMessages(response) {
    // const messages = ;
    const msgContainer = document.querySelector(".container");
    msgContainer.innerHTML = ``;
    for (let i = 0; i < response.data.length; i++) {
        msgContainer.innerHTML += buildMessage(response.data[i]);
    }
    let message = document.querySelectorAll(".msg");
    message = message[message.length - 1];

    if (lastMessage != message.innerHTML) {
        message.scrollIntoView();
    }
    lastMessage = message.innerHTML;
}

function getParticipants() {
    axios
        .get("https://mock-api.driven.com.br/api/v4/uol/participants")
        .then(updateParticipants);
}

function keepConnection() {
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {
        name: messageBody.from,
    });
}

async function initChat() {
    getParticipants();
    document.querySelector(".start-screen").remove();
    await axios
        .get("https://mock-api.driven.com.br/api/v4/uol/messages")
        .then(renderMessages);

    setEnterAction();

    setInterval(getMessages, 3000);
    setInterval(keepConnection, 5000);
    setInterval(getParticipants, 10000);
}

function login() {
    messageBody.from = document.querySelector("input.login").value;
    const name = { name: messageBody.from };
    let conn = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        name
    );
    conn.then(initChat);
    conn.catch((err) => {
        if (err.response.status === 400) {
            alert(
                "Nome de usuário já está na sala. Tente outro nome ou espere!"
            );
        }
    });
}
