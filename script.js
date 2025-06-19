document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const popup = document.getElementById("event-popup");
  const popupDate = document.getElementById("popup-date");
  const popupText = document.getElementById("event-text");
  const closeBtn = document.getElementById("close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.classList.add("hidden");
    });
  } else {
    console.warn("Element #close-btn nebyl nalezen.");
  }

  function createCalendar() {
    calendarEl.innerHTML = "";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Zobrazíme 7 dní: 3 před dneškem, dnešek, 3 po dnešku
    for (let i = -3; i <= 3; i++) {
      let currentDay = day + i;
      let active = (i === 0);

      // Ošetření přetečení do předchozího nebo následujícího měsíce
      let displayDay = currentDay;
      let displayMonth = month + 1;
      let displayYear = year;

      if (currentDay < 1) {
        // Přejdeme na předchozí měsíc
        const prevMonthDate = new Date(year, month, 0); // poslední den předchozího měsíce
        displayDay = prevMonthDate.getDate() + currentDay; // currentDay je záporné
        displayMonth = month; // měsíc je předchozí (0-index)
        if (month === 0) displayYear = year - 1;
      } else if (currentDay > daysInMonth) {
        // Přejdeme na další měsíc
        displayDay = currentDay - daysInMonth;
        displayMonth = month + 2; // měsíc následující
        if (month === 11) displayYear = year + 1;
      }

      const cell = document.createElement("div");
      cell.className = "day";
      cell.innerText = displayDay;

      // Výpočet vzdálenosti od středu pro opacity a scale
      const distanceFromCenter = Math.abs(i);
      const opacity = 1 - distanceFromCenter * 0.2; // 1, 0.8, 0.6, 0.4
      const scale = 1 - distanceFromCenter * 0.1; // 1, 0.9, 0.8, 0.7

      cell.style.opacity = opacity;
      cell.style.transform = `scale(${scale})`;

      if (active) {
        cell.addEventListener("click", () => showEvent(displayDay, displayMonth));
      } else {
        cell.classList.add("inactive-day");
      }

      calendarEl.appendChild(cell);
    }
  }

  async function showEvent(day, month) {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`;

    popup.classList.remove("hidden");
    popupDate.innerText = `${day}.${month}.`;
    popupText.innerText = "Načítám událost...";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Chyba v síti");

      const data = await response.json();
      const events = data.events;

      if (events && events.length > 0) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        popupText.innerText = `${randomEvent.year}: ${randomEvent.text}`;
      } else {
        popupText.innerText = "Žádné události nenalezeny.";
      }
    } catch (error) {
      console.error("Chyba při získávání dat:", error);
      popupText.innerText = "Nepodařilo se načíst událost.";
    }
  }

  createCalendar();

  // -- Téma (tmavý/světlý režim) --
  const themeBtn = document.getElementById("toggle-theme");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "☀️";
    themeBtn.classList.remove("light-btn"); // tmavý režim = tlačítko světlé
  } else {
    themeBtn.classList.add("light-btn"); // světlý režim = tlačítko tmavé
  }

  themeBtn.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark-mode");

    themeBtn.textContent = dark ? "☀️" : "🌙";

    if (dark) {
      themeBtn.classList.remove("light-btn");
    } else {
      themeBtn.classList.add("light-btn");
    }

    localStorage.setItem("theme", dark ? "dark" : "light");
  });
});
