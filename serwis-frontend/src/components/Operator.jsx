import { useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { pobierzOperatora, zapiszOperatora } from "../tools/api";

// Wybór serwisanta w górnym pasku. Nazwa trafia do historii zmian jako "kto".
export default function Operator() {
    const [nazwa, setNazwa] = useState(pobierzOperatora);
    const [edycja, setEdycja] = useState(false);
    const [szkic, setSzkic] = useState("");
    const anulowano = useRef(false);

    function zacznij() {
        anulowano.current = false;
        setSzkic(nazwa);
        setEdycja(true);
    }

    function zapisz() {
        if (anulowano.current) return;
        const czysta = szkic.trim().slice(0, 40);
        zapiszOperatora(czysta);
        setNazwa(czysta);
        setEdycja(false);
    }

    function obsluzKlawisze(e) {
        if (e.key === "Enter") {
            zapisz();
        }
        else if (e.key === "Escape") {
            anulowano.current = true;
            setEdycja(false);
        }
    }

    if (edycja) {
        return (
            <div className="operator">
                <FiUser />
                <input
                    className="operator-pole"
                    value={szkic}
                    onChange={(e) => setSzkic(e.target.value)}
                    onKeyDown={obsluzKlawisze}
                    onBlur={zapisz}
                    maxLength={40}
                    placeholder="Twoje imię"
                    autoFocus
                />
            </div>
        );
    }

    return (
        <button
            className={nazwa ? "operator operator-przycisk" : "operator operator-przycisk brak-nazwy"}
            onClick={zacznij}
            title="Podpis widoczny w historii zmian. Kliknij, żeby zmienić."
        >
            <FiUser /> <span>{nazwa || "Ustaw serwisanta"}</span>
        </button>
    );
}
