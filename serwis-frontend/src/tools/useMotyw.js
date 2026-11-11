import { useCallback, useState } from "react";

const KLUCZ = "motyw";

// Motyw ustawia na starcie skrypt w index.html (atrybut data-theme na <html>),
// więc hook tylko go odczytuje i przełącza.
function odczytajMotyw() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function useMotyw() {
    const [motyw, setMotyw] = useState(odczytajMotyw);

    const przelacz = useCallback(() => {
        const nastepny = odczytajMotyw() === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nastepny);
        try {
            localStorage.setItem(KLUCZ, nastepny);
        } catch {
            // brak dostępu do localStorage (np. tryb prywatny): motyw działa do odświeżenia strony
        }
        setMotyw(nastepny);
    }, []);

    return { motyw, przelacz };
}
