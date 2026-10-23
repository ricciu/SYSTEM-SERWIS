import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from './SzczegolyNapraw.module.css';
export default function SzczegolyNaprawy() {
    const { id } = useParams();
    const nawiguj = useNavigate();
    const [szczegoly, setSzczegoly] = useState(null);
    useEffect(() => {
    const pobierzSzczegoly = async () => {
        try {
            const odpowiedz = await fetch(`http://localhost:3000/naprawy/${id}`);
            const dane = await odpowiedz.json();
            setSzczegoly(dane.szczegolyNaprawy);
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
       <div className={styles.szczegolyNaprawy}>
            <header className={styles.infoNaprawa}>
                <span className={styles.idNaprawy}>RIC-{szczegoly.id}</span>
                <span className={styles.statusNaprawy}>{szczegoly.status}</span>
                <span className={styles.nazwaSprzetu}>{szczegoly.nazwa_sprzetu}</span>
                <span className={styles.opisUsterki}>{szczegoly.opis_usterki}</span>
                <button onClick={()=>nawiguj('/naprawy')}>X</button>
            </header>
       </div>
    );
}