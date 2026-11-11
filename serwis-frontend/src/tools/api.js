// Aplikacja nie ma logowania, więc "kto zmienił" to nazwa serwisanta wybrana w górnym pasku.
// Zapisujemy ją w przeglądarce i dołączamy do żądań, które coś zmieniają.
// To podpis w historii zmian, a nie uwierzytelnienie.
const KLUCZ_OPERATORA = "operator";

export function pobierzOperatora() {
    try {
        return localStorage.getItem(KLUCZ_OPERATORA) || "";
    } catch {
        return "";
    }
}

export function zapiszOperatora(nazwa) {
    try {
        localStorage.setItem(KLUCZ_OPERATORA, nazwa);
    } catch {
        // brak dostępu do localStorage: nazwa działa do odświeżenia strony
    }
}

// Nagłówki dla żądań zmieniających dane. Nazwa jest zakodowana, bo nagłówki HTTP
// nie przenoszą polskich znaków.
export function naglowkiApi() {
    const naglowki = { "Content-Type": "application/json" };
    const operator = pobierzOperatora();
    if (operator) {
        naglowki["X-Operator"] = encodeURIComponent(operator);
    }
    return naglowki;
}
