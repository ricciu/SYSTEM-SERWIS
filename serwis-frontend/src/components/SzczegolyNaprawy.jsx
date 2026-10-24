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
                <div className={styles.status}><span>RIC-{szczegoly.id}</span><span>{szczegoly.status}</span><button className={styles.btnZamknij} onClick={()=>nawiguj('/naprawy')}>X</button></div>
                <h1>{szczegoly.nazwa_sprzetu}</h1>
                <p>{szczegoly.opis_usterki}</p>
            </header>
            <section className={styles.obszarRoboczy}>
              <div className={styles.wierszKart}>  
                <div className={styles.kartaKlienta}>
                    <span>KLIENT</span>
                    <div className={styles.profilKlienta}>
                    <div className={styles.inicjaly}>{szczegoly.imie_nazwisko[0]}</div>
                    <div className={styles.daneKlienta}>
                        <strong>{szczegoly.imie_nazwisko}</strong>
                        <p>{szczegoly.nr_tel}</p>
                    </div>
                    </div>
                </div>
                <div className={styles.planowanyTermin}>
                    <span>PLANOWANY TERMIN </span>
                    <strong>Brak danych</strong>
                </div>
              </div>
                <article className={styles.infUrzadzenie}>
                    <h3>Informacje o urządzeniu</h3>
                    <p>{szczegoly.opis_usterki}</p>
                </article>
                <article className={styles.kosztorys}>
                    <h3>Kosztorys</h3>
                </article>
            </section>
            <footer>
                <button className={styles.kontaktKlient}>Kontakt z klientem</button>
                <button className={styles.zmienStatus}>Zmień status</button>
            </footer>
       </div>
    );
}