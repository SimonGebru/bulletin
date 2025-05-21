// Hämtar huvudcontainern där allt innehåll ska renderas
const app = document.getElementById("app");

// Kollar om användaren redan är inloggad, annars visa inloggningsformulär
function init() {
  const savedUser = localStorage.getItem("user");
  

  if (savedUser) {
    const user = JSON.parse(savedUser);
    console.log(" Användare hittad i localStorage:", user);
    showDashboard(user);
  } else {
    console.log(" Ingen användare hittad, visar inloggningsformulär");
    renderLoginForm();
  }
}

// Visar formulär för att logga in eller skapa konto
function renderLoginForm() {
  
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="w-full max-w-md bg-white shadow-md rounded p-6">
        <h2 class="text-xl font-bold mb-4 text-center">Logga in / Skapa konto</h2>
        <form id="loginForm" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium">Användarnamn</label>
            <input type="text" id="username" name="username" required class="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium">E-post (för registrering)</label>
            <input type="email" id="email" name="email" class="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <button type="submit" class="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition">Fortsätt</button>
        </form>
        <p id="message" class="mt-4 text-center text-red-500"></p>
      </div>
    </div>
  `;

  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");
  

  // Händelse för när man klickar på "Fortsätt" i formuläret
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = form.username.value.trim();
  const email = form.email.value.trim();

  console.log("Försöker logga in med:", { username, email });

  try {
    const res = await fetch(`http://localhost:4000/users/${username}`);
    console.log(" GET /users/:username svar:", res);

    if (res.ok) {
      const user = await res.json();
      console.log(" Användare hittad:", user);
      localStorage.setItem("user", JSON.stringify(user));
      showDashboard(user);
    } else if (res.status === 404) {
      console.log(" Användare hittades inte, försöker skapa ny...");

      if (!email) {
        message.textContent = "Fyll i e-postadress för att registrera nytt konto.";
        return;
      }

      const createRes = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      console.log(" POST /users svar:", createRes);

      if (createRes.ok) {
        const newUser = await createRes.json();
        console.log(" Ny användare skapad:", newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        showDashboard(newUser);
      } else {
        message.textContent = "Kunde inte skapa användare.";
      }
    } else {
      message.textContent = "Något gick fel vid inloggning.";
    }
  } catch (err) {
    console.error(" Fel:", err);
    message.textContent = "Kunde inte kontakta servern.";
  }
});
}

// Visar användarens dashboard när man är inloggad
function showDashboard(user) {
  app.innerHTML = `
    <div class="bg-white p-6 rounded shadow-md w-full max-w-xl mx-auto mt-10">
      <h2 class="text-2xl font-bold mb-4 text-center">Hej ${user.username}!</h2>
      
      <form id="channelForm" class="mb-6">
        <label for="channelName" class="block mb-2 font-medium">Skapa ny kanal:</label>
        <input 
          type="text" 
          id="channelName" 
          class="w-full border border-gray-300 rounded px-3 py-2 mb-4" 
          placeholder="Namn på kanal" 
          required
        />
        <button 
          type="submit" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Skapa kanal
        </button>
        <p id="channelMessage" class="text-red-500 mt-2 text-sm"></p>
      </form>

      <div id="channelList" class="mt-8"></div>
      <div id="subscribedList" class="mt-10"></div>

      <button id="logoutBtn" class="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full">
        Logga ut
      </button>
    </div>
  `;

  const form = document.getElementById("channelForm");
  const message = document.getElementById("channelMessage");

 // Skapa ny kanal om formuläret för det skickas in
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("channelName").value.trim();

  console.log(" Försöker skapa ny kanal med namn:", name);

  try {
    const res = await fetch("http://localhost:4000/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ownerId: user.id }),
    });

    console.log(" POST /channels svar:", res);

    if (res.ok) {
      const createdChannel = await res.json();
      console.log(" Ny kanal skapad:", createdChannel);
      message.textContent = `Kanal "${createdChannel.name}" skapad! `;
      message.className = "text-green-600 mt-2 text-sm";
      form.reset();
      loadChannels(user);
      loadSubscriptions(user);
    } else {
      const errData = await res.json();
      console.warn("⚠️ Fel vid skapande av kanal:", errData);
      message.textContent = errData.error || "Något gick fel.";
    }
  } catch (err) {
    console.error(" Fel vid skapande av kanal:", err);
    message.textContent = "Kunde inte kontakta servern.";
  }
});

  // Logga ut och visa formuläret igen
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    renderLoginForm();
  });

  // Ladda in kanaler och prenumerationer
  loadChannels(user);
  loadSubscriptions(user);
}


// Hämta och visa alla kanaler
function loadChannels(user) {
  const listContainer = document.getElementById("channelList");
  listContainer.innerHTML = `<p class="text-sm text-gray-500">Laddar kanaler...</p>`;

  console.log(" Gör GET /channels för att hämta alla kanaler");

  fetch("http://localhost:4000/channels")
    .then((res) => {
      console.log(" Svar från GET /channels:", res);
      return res.json();
    })
    .then((channels) => {
      console.log(" Kanaler hämtade från servern:", channels);

      if (channels.length === 0) {
        listContainer.innerHTML = `<p class="text-gray-500">Det finns inga kanaler ännu.</p>`;
        return;
      }

      listContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Alla kanaler:</h3>
        <ul class="space-y-2">
          ${channels
            .map(
              (channel) => `
              <li class="bg-gray-100 p-4 rounded shadow flex justify-between items-center">
                <div class="flex-1 mr-4 cursor-pointer" onclick="viewChannelMessages(${channel.id}, '${channel.name}')">
                  <strong>${channel.name}</strong><br/>
                  <span class="text-sm text-gray-500">Ägare: ${channel.owner_id}</span>
                </div>
                <button 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onclick="subscribeToChannel(${user.id}, ${channel.id}, this)"
                >
                  Prenumerera
                </button>
              </li>
            `
            )
            .join("")}
        </ul>
      `;
    })
    .catch((err) => {
      console.error(" Fel vid hämtning av kanaler:", err);
      listContainer.innerHTML = `<p class="text-red-500">Kunde inte hämta kanaler.</p>`;
    });
}

// Prenumerera på en kanal
window.subscribeToChannel = async function (userId, channelId, button) {
  console.log(` Försöker prenumerera på kanal ${channelId} som användare ${userId}`);

  try {
    const res = await fetch("http://localhost:4000/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, channelId }),
    });

    console.log(" POST /subscriptions svar:", res);

    if (res.ok) {
      console.log(` Användare ${userId} prenumererar nu på kanal ${channelId}`);
      button.textContent = "Prenumererad";
      button.disabled = true;
      button.classList.remove("bg-blue-500", "hover:bg-blue-600");
      button.classList.add("bg-green-500");

      loadSubscriptions({ id: userId });
    } else {
      const errorData = await res.json();
      console.warn(" Fel vid prenumeration:", errorData);
      alert(errorData.error || "Kunde inte prenumerera.");
    }
  } catch (err) {
    console.error(" Fel vid prenumeration:", err);
    alert("Kunde inte kontakta servern.");
  }
};

// Visa vilka kanaler användaren prenumererar på
function loadSubscriptions(user) {
  const container = document.getElementById("subscribedList");
  container.innerHTML = `<p class="text-sm text-gray-500">Laddar dina prenumerationer...</p>`;

  console.log(` Gör GET /subscriptions/${user.id} för att hämta användarens prenumerationer`);

  fetch(`http://localhost:4000/subscriptions/${user.id}`)
    .then((res) => {
      console.log("Svar från GET /subscriptions:", res);
      return res.json();
    })
    .then((channels) => {
      console.log(" Prenumerationer hämtade:", channels);

      if (channels.length === 0) {
        container.innerHTML = `<p class="text-gray-500">Du prenumererar inte på några kanaler ännu.</p>`;
        return;
      }

      container.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Dina prenumerationer:</h3>
        <ul class="space-y-2">
          ${channels
            .map(
              (channel) => `
              <li class="bg-green-100 p-3 rounded shadow">
                <strong>${channel.name}</strong><br/>
                Ägare: ${channel.owner_id}
              </li>
            `
            )
            .join("")}
        </ul>
      `;
    })
    .catch((err) => {
      console.error("Fel vid hämtning av prenumerationer:", err);
      container.innerHTML = `<p class="text-red-500">Kunde inte hämta dina prenumerationer.</p>`;
    });
}

// Visa meddelanden i en kanal + skicka nytt meddelande
window.viewChannelMessages = async function (channelId, channelName) {
  const container = document.getElementById("channelList");

  container.innerHTML = `
    <h3 class="text-lg font-bold mb-4">Meddelanden i ${channelName}</h3>
    <div id="messages" class="space-y-4 mb-6">Laddar...</div>

    <form class="mb-6" onsubmit="event.preventDefault(); sendMessageToChannel(${channelId})">
      <textarea 
        id="messageInput" 
        rows="3" 
        placeholder="Skriv ett meddelande..." 
        class="w-full border border-gray-300 rounded px-3 py-2 mb-2"
      ></textarea>
      <button 
        type="submit" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Skicka
      </button>
    </form>

    <button onclick="loadChannels(JSON.parse(localStorage.getItem('user')))" class="text-blue-500 underline">⬅ Tillbaka till kanaler</button>
  `;

  console.log(`Gör GET /channels/${channelId}/messages för att hämta meddelanden i kanalen`);

  try {
    const res = await fetch(`http://localhost:4000/channels/${channelId}/messages`);
    console.log(" Svar från GET /channels/:id/messages:", res);

    const messages = await res.json();
    console.log("Meddelanden hämtade:", messages);

    const messagesHTML = messages.length
      ? messages.map(msg => `
          <div class="bg-white p-4 rounded shadow">
            <p class="mb-1">${msg.content}</p>
            <p class="text-sm text-gray-500">
              Av: <strong>${msg.author}</strong> • ${new Date(msg.created_at).toLocaleString()}
            </p>
          </div>
        `).join("")
      : `<p class="text-gray-500">Inga meddelanden ännu.</p>`;

    document.getElementById("messages").innerHTML = messagesHTML;
  } catch (err) {
    console.error(" Fel vid hämtning av meddelanden:", err);
    document.getElementById("messages").innerHTML = `<p class="text-red-500">Kunde inte hämta meddelanden.</p>`;
  }
};

// Skicka ett nytt meddelande till kanalen
window.sendMessageToChannel = async function (channelId) {
  const content = document.getElementById("messageInput").value.trim();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!content) {
    alert("Meddelandet får inte vara tomt!");
    return;
  }

  // Loggar vad vi försöker skicka till backend
  console.log(" Försöker skicka meddelande:", {
    content,
    userId: user.id,
    channelId,
  });

  try {
    const res = await fetch("http://localhost:4000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        userId: user.id,
        channelId,
      }),
    });

    console.log("Svar från POST /messages:", res);

    if (res.ok) {
      const newMessage = await res.json();
      console.log("Meddelande skickades och sparades:", newMessage);

      // Lägg till meddelandet direkt i listan
      const container = document.getElementById("messages");
      const msgHTML = `
        <div class="bg-white p-4 rounded shadow">
          <p class="mb-1">${newMessage.content}</p>
          <p class="text-sm text-gray-500">
            Av: <strong>${user.username}</strong> • just nu
          </p>
        </div>
      `;
      container.innerHTML += msgHTML;
      document.getElementById("messageInput").value = "";
    } else {
      const errData = await res.json();
      console.warn(" Kunde inte skicka meddelande:", errData);
      alert(errData.error || "Kunde inte skicka meddelandet.");
    }
  } catch (err) {
    console.error("Fel vid skickande av meddelande:", err);
    alert("Kunde inte kontakta servern.");
  }
};

// Hjälpfunktion som laddar om kanaler + prenumerationer
window.loadChannels = function (user) {
  loadChannels(user);
  loadSubscriptions(user);
};

// Starta allt
init();