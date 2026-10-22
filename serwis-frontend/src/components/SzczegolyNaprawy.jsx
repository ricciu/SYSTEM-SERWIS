import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SzczegolyNaprawy() {
    const { id } = useParams();
    const nawiguj = useNavigate();
    const [szczegoly, setSzczegoly] = useState(null);
    useEffect(() => {
    const pobierzSzczegoly = async () => {
        try {
            const odpowiedz = await fetch(`http://localhost:3000/naprawy/${id}`);
            const dane = await odpowiedz.json();
            setSzczegoly(dane);
        } catch (err) {
            console.error("BLAD API");
        }
    };
    
    pobierzSzczegoly();
}, [id]);
    if (szczegoly === null) {
         return <div>Wczytywanie danych zgłoszenia...</div>   
        }
    return (
        
        <div>
            <button onClick={()=>nawiguj('/naprawy')}>← Wróć do listy</button>
            <h2>Karta naprawy nr: {id}</h2>
            <h3>{szczegoly.nazwa_sprzetu}</h3>
        </div>
    );
}