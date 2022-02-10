const messageBody = {
    from: "Salesiano colégio e curso",
    to: "Todos",
    text: "nada",
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

function toggleSideBar() {
    const sideBar = document.querySelector("aside");
    const blur = document.querySelector(".blur");

    blur.classList.toggle("hidden");
    sideBar.classList.toggle("hidden");
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

function updateMessage(response) {
    const messages = response.data;
    const msgContainer = document.querySelector(".container");
    msgContainer.innerHTML = ``;
    for (let i = 0; i < messages.length; i++) {
        msgContainer.innerHTML += buildMessage(messages[i]);
    }
    // document.querySelectorAll(".msg")[99].scrollIntoView();
}

function getMessages() {
    axios
        .get("https://mock-api.driven.com.br/api/v4/uol/messages")
        .then(updateMessage);
}

function keepConnection() {
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {
        name: messageBody.from,
    });
}

async function initChat() {
    const name = { name: messageBody.from };
    await axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        name
    );
    await axios
        .get("https://mock-api.driven.com.br/api/v4/uol/messages")
        .then(updateMessage);
    document.querySelectorAll(".msg")[99].scrollIntoView();
    setEnterAction();

    setInterval(getMessages, 3000);
    setInterval(keepConnection, 5000);
}

// async function getUserName(){
//     messageBody.from = prompt("Qual é nome do seu usuário?")
//     const name = { name: messageBody.from };
//     await axios.post(
//         "https://mock-api.driven.com.br/api/v4/uol/participants",
//         name
//     );
// }

initChat();
