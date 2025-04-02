const base_url = "https://fe24-vs-grupp1-slutprojekt-default-rtdb.europe-west1.firebasedatabase.app/.json";

class MessageInfo {
    constructor(name, message) {
        this.name = name;
        this.message = message;
        this.timestamp = new Date().toLocaleString();
    }
}

async function shakeMessages() {
    const allMessages = document.querySelectorAll(".message-item");
    allMessages.forEach((msg) => {
        const delay = Math.random() * 500;
        setTimeout(() => {
            msg.classList.add("shake");
            setTimeout(() => {
                msg.classList.remove("shake");
            }, 1000);
        }, delay);
    });
}

function createRandomColor() {
    const getRandomValue = () => Math.floor(Math.random() * 156) + 100;
    let red = getRandomValue();
    let green = getRandomValue();
    let blue = getRandomValue();

    const MIN_DIFF = 50;
    if (Math.abs(red - green) < MIN_DIFF) green = (green + 100) % 256;
    if (Math.abs(green - blue) < MIN_DIFF) blue = (blue + 100) % 256;
    if (Math.abs(blue - red) < MIN_DIFF) red = (red + 100) % 256;

    return `rgb(${red}, ${green}, ${blue})`;
}

export async function addMessage(event) {
    event.preventDefault();
    const nameInput = document.querySelector("#name");
    const messageInput = document.querySelector("#messageBoard");

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const birthdayDiv = document.querySelector(".birthdayDiv");
    birthdayDiv.style.display = "none";

    if (!name || !message) {
        alert("Provide both name and message");
        return;
    }

    if (message.includes("my birthday")) {
        birthdayDiv.style.display = "block";
        setTimeout(() => birthdayDiv.style.display = "none", 2000);
    }

    const newMessage = new MessageInfo(name, message);

    try {
        const res = await fetch(base_url, {
            method: "POST",
            body: JSON.stringify(newMessage),
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });

        if (!res.ok) throw new Error("Something went wrong!");

        fetchMessages();
        nameInput.value = "";
        messageInput.value = "";
        showSuccessNotification();
    } catch (error) {
        console.error("Error:", error);
        alert("Could not add a message, try again!");
    }
}

export async function fetchMessages() {
    try {
        const res = await fetch(base_url);
        if (!res.ok) throw new Error("Could not fetch messages");

        const data = await res.json();
        const messages = data ? Object.entries(data) : [];

        if (messages.length === 0) {
            displayNoMessagesMessage();
        } else {
            displayMessages(messages);
            displayMessageOfTheDay(messages);
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

function displayNoMessagesMessage() {
    const messageDisplay = document.querySelector("#messageDisplay");
    if (messageDisplay) messageDisplay.innerHTML = "<p>Inga meddelanden än.</p>";
}

export function displayMessages(messages) {
    const messageDisplay = document.querySelector("#messageDisplay");
    if (!messageDisplay) return;

    messageDisplay.innerHTML = "";

    messages.forEach(([id, message]) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message-item");
        messageElement.style.backgroundColor = createRandomColor();

        messageElement.innerHTML = `
            <strong>${message.name}</strong> (${message.timestamp}) <br>
            ${message.message}
            <button class="delete-btn" data-id="${id}">❌</button>
            <hr>
        `;

        messageElement.querySelector(".delete-btn").addEventListener("click", () => deleteMessage(id));
        messageDisplay.prepend(messageElement);
    });

    shakeMessages();
}

async function deleteMessage(messageId) {
    const url = `https://fe24-vs-grupp1-slutprojekt-default-rtdb.europe-west1.firebasedatabase.app/${messageId}.json`;

    try {
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete message");

        fetchMessages();
    } catch (error) {
        console.error("Error deleting message:", error);
        alert("Could not delete the message, try again!");
    }
}

function showSuccessNotification() {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = "Meddelandet har skickats!";
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchMessages();
    const submitBtn = document.querySelector("#submitButton");
    if (submitBtn) submitBtn.addEventListener("click", addMessage);
});

export function displayMessageOfTheDay(messages) {
    const motdContainer = document.querySelector("#motdDisplay");

    if (!motdContainer) return;

    if (messages.length === 0) {
        motdContainer.textContent = "No messages yet.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    const motd = messages[randomIndex][1];

    motdContainer.innerHTML = `
        <strong>${motd.name}</strong> (${motd.timestamp}) <br>
        "${motd.message}"
    `;
}
