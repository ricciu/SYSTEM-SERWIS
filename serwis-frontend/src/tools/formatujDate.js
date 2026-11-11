// SQLite zapisuje czas w UTC jako "2026-11-10 14:30:00" (bez strefy).
// Zamieniamy to na zapis ISO z literą Z ("2026-11-10T14:30:00Z"), żeby przeglądarka
// potraktowała tekst jako UTC i przeliczyła na czas lokalny.
function naDate(tekstZBazy) {
    return new Date(tekstZBazy.replace(" ", "T") + "Z");
}

// pełna data i godzina, np. "10.11.2026, 15:30:00"
export function formatujDate(tekstZBazy) {
    return naDate(tekstZBazy).toLocaleString("pl-PL");
}

// krótko, do wąskich paneli, np. "10.11, 15:30"
export function formatujDateKrotko(tekstZBazy) {
    return naDate(tekstZBazy).toLocaleString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
