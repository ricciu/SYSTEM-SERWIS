import { useParams, useNavigate, NavLink, Outlet } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import styles from './SzczegolyNapraw.module.css';
import { FiChevronLeft, FiClipboard, FiCreditCard, FiPhone, FiRefreshCw } from "react-icons/fi";
import { naglowkiApi } from "../tools/api";

function klasaStatusu(status) {
    switch(status) {
        case "Przyjęto":
            return styles.przyjeto;
        case "W trakcie diagnozy":
            return styles.wtrakciediagnozy;
        case "Czeka na części":
            return styles.czekanaczesci;
        case "Gotowe":
            return styles.gotowe;
        case "Odebrane":
            return styles.odebrane;
        default:
            return "";
    }
}
export default function SzczegolyNaprawy() {
    const { id } = useParams();
    const nawiguj = useNavigate();
    const [szczegoly, setSzczegoly] = useState(null);
    const [listaCzesci, setListaCzesci] = useState([]);
    const [dodaneKoszty, setDodaneKoszty] = useState([]);
    const [czyStatusOtwarty, setCzyStatusOtwarty] = useState(false);
    const [wybranyRecznyStatus, setWybranyRecznieStatus] = useState(""); 
    const [historia, setHistoria] = useState([]);
    // niezapisana wersja opisu prac: trzymana tutaj, żeby przełączenie zakładek jej nie gubiło
    const [szkicOpisu, setSzkicOpisu] = useState(null);
    useEffect(() => {
    const pobierzDane = async () => {
        try {
            const odpowiedzNaprawa = await fetch(`http://localhost:3000/naprawy/${id}`);
            const daneNaprawa = await odpowiedzNaprawa.json();
            setSzczegoly(daneNaprawa.szczegolyNaprawy);
            setDodaneKoszty(daneNaprawa.kosztorys);

            const odpowiedzMagazyn = await fetch(`http://localhost:3000/magazyn`);
            const daneMagazyn = await odpowiedzMagazyn.json();
            setListaCzesci(daneMagazyn.Magazyn);

        
        } catch (err) {
            console.error("BLAD API");
        }
    };
    
    pobierzDane();
}, [id]);
const pobierzHistorie = useCallback(async () => {
    try {
        const odpowiedz = await fetch(`http://localhost:3000/naprawy/${id}/historia`
        );
        if (!odpowiedz.ok) {
            console.error("BLAD pobierania historii");
            return;
        }
        const daneHistoria = await odpowiedz.json();
        setHistoria(daneHistoria.historia);
    }
    catch (err) {
        console.error("BLAD POBIERANIA HISTORII", err);
    }
}, [id]);
useEffect(()=> {
    pobierzHistorie();
}, [pobierzHistorie]);
    if (szczegoly === null) {
         return <div>Wczytywanie danych zgłoszenia...</div>   
        }
    
async function potwierdzStatus(wybranyStatus) {
    try {
        const odpowiedz = await fetch(`http://localhost:3000/naprawy/${id}`, {
            method: 'PUT',
            headers: naglowkiApi(),
            body: JSON.stringify({status: wybranyStatus})
    });
    if (odpowiedz.ok) {
        setSzczegoly({...szczegoly, status: wybranyStatus});
        pobierzHistorie();
    };
    setCzyStatusOtwarty(false);
    setWybranyRecznieStatus("");
    }
    catch (err) {

    }
}
const kroki_naprawy = ["Przyjęto", "W trakcie diagnozy", "Czeka na części", 
        "Gotowe", "Odebrane"
    ]
const obecny_indeks = kroki_naprawy.indexOf(szczegoly.status)
const nastepny_krok = (obecny_indeks < kroki_naprawy.length - 1 ? kroki_naprawy[obecny_indeks+1] : 'brak');
    const sumaKosztow = dodaneKoszty.reduce((suma, koszt)=>suma + Number(koszt.cena), 0);     

    return (
       <div className={styles.szczegolyNaprawy}>
            <header className={styles.infoNaprawa}>
    <button className={styles.btnPowrot} onClick={() => nawiguj('/naprawy')}>
        <FiChevronLeft /> Naprawy
    </button>
    <div className={styles.daneSprzetu}>
        <h1>{szczegoly.nazwa_sprzetu}</h1>
        <p>RIC-{szczegoly.id} · {szczegoly.imie_nazwisko}</p>
    </div>
    <span className={`${styles.pigulkaStatusu} ${klasaStatusu(szczegoly.status)}`}>{szczegoly.status}</span>
    <div className={styles.wielkaKwotaDoZaplaty}>
        <span className={styles.etykietaWielkaKwota}>Do zapłaty</span>
        <strong>{sumaKosztow.toFixed(2).replace('.', ',')} zł</strong>
    </div>
</header>
<nav className={styles.zakladki}>
    <NavLink to="." end className={({isActive})=>isActive ? styles.zakladkaAktywna : styles.zakladka}><FiClipboard /> Przegląd</NavLink>
    <NavLink to="kosztorys" className={({isActive})=> isActive ? styles.zakladkaAktywna : styles.zakladka}>
        <FiCreditCard /> Kosztorys <span className={styles.licznik}>{dodaneKoszty.length}</span>
    </NavLink>
</nav>

            <section className={styles.obszarRoboczy}>
              <Outlet context={{szczegoly, setSzczegoly, dodaneKoszty, setDodaneKoszty, listaCzesci, historia, odswiezHistorie: pobierzHistorie, szkicOpisu, setSzkicOpisu}}/>
            </section>
            <footer>
                <button className={styles.kontaktKlient}><FiPhone /> Kontakt z klientem</button>
                <button className={styles.zmienStatus} onClick={()=>{setCzyStatusOtwarty(true)}}><FiRefreshCw /> Zmień status</button>
            </footer>
            
            {czyStatusOtwarty  && (
                <div className={styles.malyModalTlo}>
                    <div className={styles.malyModal}>
                        <h3>Zmień status naprawy</h3>
                        {nastepny_krok != 'brak' ? (<button className={styles.btnAwans} onClick={()=> potwierdzStatus(nastepny_krok)}>Zmień na: <span>{nastepny_krok}</span></button>) : (<p>To urządzene osiągnęło już końcowy status.</p>)}
                        <div className={styles.Separator}>
                            Lub
                        </div>
                        <select className={styles.wyborCzesci} value={wybranyRecznyStatus} onChange={(e)=>setWybranyRecznieStatus(e.target.value)}>                            
                            <option value="">Wybierz status...</option>
                            {kroki_naprawy.map((krok)=>(
                                <option key={krok} value={krok}>
                                    {krok}
                                </option>
                            ))}
                        </select>
                        <div className={styles.akcjePrzyciski}>
                            <button className={styles.btnAnuluj} onClick={() => setCzyStatusOtwarty(false)}>Anuluj</button>
                            <button className={styles.btnZapiszKoszt} onClick={()=>potwierdzStatus(wybranyRecznyStatus)}>Zapisz</button>
                        </div>
                    </div>
                </div>
            )}
       </div>
    );
}