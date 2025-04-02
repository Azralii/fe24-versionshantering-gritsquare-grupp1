const base_url =
    "https://fe24-vs-grupp1-slutprojekt-default-rtdb.europe-west1.firebasedatabase.app/.json";
// comments
// ännu mer comments lol
class MessageInfo {
    constructor(name, message) {
        this.name = name;
        this.message = message;
        this.timestamp = new Date().toLocaleString(); // Ger ett läsbart datum och tid
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

// generating color

function createRandomColor() {
    const getRandomValue = () => Math.floor(Math.random() * 156) + 100;

    let red = getRandomValue();
    let green = getRandomValue();
    let blue = getRandomValue();

    const MIN_DIFF = 50;
    if (Math.abs(red - green) < MIN_DIFF) green = (green + 100) % 256;
    if (Math.abs(green - blue) < MIN_DIFF) blue = (blue + 100) % 256;
    if (Math.abs(blue - red) < MIN_DIFF) red = (red + 100) % 256;

    const rgbColor = `rgb(${red}, ${green}, ${blue})`;
    console.log(rgbColor);
    return rgbColor;
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
        setTimeout(() => {
            birthdayDiv.style.display = "none";
        }, 2000);
    } else {
        birthdayDiv.style.display = "none";
    }

    const newMessage = new MessageInfo(name, message);

    const options = {
        method: "POST",
        body: JSON.stringify(newMessage),
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
    };

    try {
        const res = await fetch(base_url, options);
        if (!res.ok)
            throw new Error(
                "Something went wrong when adding a message. Try again!"
            );

        const data = await res.json();
        console.log("Message added:", data);

        fetchMessages();

        nameInput.value = "";
        messageInput.value = "";

        showSuccessNotification(); // Visar en notifiering om att meddelandet skickades
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
        const messageArray = data ? Object.values(data) : [];

        if (messageArray.length === 0) {
            displayNoMessagesMessage();  // Visa meddelande om inga meddelanden finns
        } else {
            displayMessages(messageArray);  // Visa meddelandena
            displayMessageOfTheDay(messageArray);  // Visa dagens meddelande
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Ny funktion för att visa ett meddelande när inga meddelanden finns
function displayNoMessagesMessage() {
    const messageDisplay = document.querySelector("#messageDisplay");

    if (!messageDisplay) {
        console.error("Error: #messageDisplay not found");
        return;
    }

    messageDisplay.innerHTML = "<p>Inga meddelanden än.</p>";
}

export function displayMessages(messages) {
    const messageDisplay = document.querySelector("#messageDisplay");

    if (!messageDisplay) {
        console.error("Error: #messageDisplay not found");
        return;
    }

    messageDisplay.innerHTML = "";

    messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message-item");
        const backgroundColor = createRandomColor();
        messageElement.style.backgroundColor = backgroundColor;

        messageElement.innerHTML = `
                <strong>${message.name}</strong> (${message.timestamp}) <br>
                ${message.message}
                <hr>
            `;
        messageDisplay.prepend(messageElement);
        shakeMessages();
    });
}

// Ny funktion för att visa en notifiering om att meddelandet skickades
function showSuccessNotification() {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = "Meddelandet har skickats!";
    
    document.body.appendChild(notification);

    // Ta bort notifieringen efter 3 sekunder
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchMessages();

    const submitBtn = document.querySelector("#submitButton");
    if (submitBtn) {
        submitBtn.addEventListener("click", addMessage);
    } else {
        console.error("Error");
    }
});

export function displayMessageOfTheDay(messages) {
    const motdContainer = document.querySelector("#motdDisplay");

    if (!motdContainer) {
        console.error("MOTD container not found.");
        return;
    }

    if (messages.length === 0) {
        motdContainer.textContent = "No messages yet.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    const motd = messages[randomIndex];

    motdContainer.innerHTML = `
        <strong>${motd.name}</strong> (${motd.timestamp}) <br>
        "${motd.message}"
    `;
}
