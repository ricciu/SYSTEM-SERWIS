import { useState } from "react";
import { FiClipboard, FiSave, FiRotateCcw } from "react-icons/fi";
import styles from './OpisPrac.module.css';
import { naglowkiApi } from "../tools/api";

// Jedno pole z opisem wykonanych prac. Edytujesz je w miejscu i zapisujesz;
// nie powstają osobne wpisy. Każdy zapis trafia do historii zmian (kto i kiedy).
//
// Wersja robocza (szkic) jest trzymana wyżej, w widoku naprawy, więc przełączenie
// zakładki na Kosztorys i powrót nie gubi niezapisanych zmian.
export default function OpisPrac({opis, szkic, naZmianeSzkicu, idNaprawy, poZapisie}) {
    const [zapisywanie, setZapisywanie] = useState(false);
    const [zapisano, setZapisano] = useState(false);
    const [blad, setBlad] = useState("");

    const tekst = szkic ?? opis;
    const zmieniony = szkic !== null && szkic.trim() !== opis.trim();

    function zmienTekst(e) {
        naZmianeSzkicu(e.target.value);
        setZapisano(false);
        setBlad("");
    }

    function cofnij() {
        naZmianeSzkicu(null);
        setBlad("");
    }

    async function zapisz() {
        if (!zmieniony || zapisywanie) return;
        setZapisywanie(true);
        setBlad("");
        try {
            const odpowiedz = await fetch(`http://localhost:3000/naprawy/${idNaprawy}/opis`, {
                method: 'PUT',
                headers: naglowkiApi(),
                body: JSON.stringify({opis: tekst.trim()})
            });
            if (odpowiedz.ok) {
                const dane = await odpowiedz.json();
                // oba zapisy stanu w tym samym momencie, żeby pole nie mignęło starym tekstem
                const odswiezanie = poZapisie(dane.opis);
                naZmianeSzkicu(null);
                setZapisano(true);
                await odswiezanie;
            }
            else {
                setBlad("Nie udało się zapisać opisu");
            }
        }
        catch (err) {
            console.error(err);
            setBlad("Brak połączenia z serwerem");
        }
        finally {
            setZapisywanie(false);
        }
    }

    // Ctrl+Enter albo Ctrl+S zapisuje
    function obsluzKlawisze(e) {
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && (e.key === "Enter" || e.key.toLowerCase() === "s")) {
            e.preventDefault();
            zapisz();
        }
    }

    return (
        <article className={styles.karta}>
            <h3><FiClipboard /> Opis wykonanych prac</h3>
            <textarea
                className={styles.pole}
                value={tekst}
                onChange={zmienTekst}
                onKeyDown={obsluzKlawisze}
                placeholder="Opisz, co zostało zrobione: diagnoza, wymienione części, wyniki testów..."
                maxLength={5000}
            />
            {blad && <p className={styles.blad}>{blad}</p>}
            <div className={styles.pasek}>
                {zmieniony ? (
                    <span className={styles.niezapisane}>Niezapisane zmiany</span>
                ) : zapisano ? (
                    <span className={styles.zapisane}>Zapisano</span>
                ) : (
                    <span className={styles.podpowiedz}>Ctrl + Enter zapisuje</span>
                )}
                <div className={styles.akcje}>
                    <button type="button" className={styles.przyciskDrugi} onClick={cofnij} disabled={!zmieniony || zapisywanie}>
                        <FiRotateCcw /> Cofnij
                    </button>
                    <button type="button" className={styles.przycisk} onClick={zapisz} disabled={!zmieniony || zapisywanie}>
                        <FiSave /> Zapisz
                    </button>
                </div>
            </div>
        </article>
    )
}
