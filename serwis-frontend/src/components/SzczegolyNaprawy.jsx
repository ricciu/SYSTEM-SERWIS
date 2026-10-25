import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from './SzczegolyNapraw.module.css';
import {FaWrench, FaCoins} from "react-icons/fa";
export default function SzczegolyNaprawy() {
    const { id } = useParams();
    const nawiguj = useNavigate();
    const [szczegoly, setSzczegoly] = useState(null);
    const [czyKosztyOtwarte, setCzyKosztyOtwarte] = useState(false);
    const [listaCzesci, setListaCzesci] = useState([]);
    const [wybranaCzesc, setWybranaCzesc] = useState("");
    const [dodaneKoszty, setDodaneKoszty] = useState([]);
    const [wpisanaCena, setWpisanaCena] = useState("");
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
    if (szczegoly === null) {
         return <div>Wczytywanie danych zgłoszenia...</div>   
        }
    const dodajKosztDoListy = async () => {
        try {
            const dodajKoszt = await fetch('http://localhost:3000/kosztorys',
                {method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id_zlecenia: id,
                    id_czesci: wybranaCzesc,
                    cena: wpisanaCena
                }
            )
        });
            if (dodajKoszt.ok) {
                setCzyKosztyOtwarte(false);
                setWybranaCzesc("");
                setWpisanaCena("");
                const znalezionaCzesc = listaCzesci.find(czesc => czesc.id.toString() === wybranaCzesc.toString());
                const nowyKoszt = {...znalezionaCzesc, cena: wpisanaCena};
                setDodaneKoszty([...dodaneKoszty, nowyKoszt]);
            }
        }
        catch (err) {
            console.error("BLAD SIECI", err);
            alert("NIE UDALO SIE ZAPISAC KOSZTU");
        }
    };  
    const sumaKosztow = dodaneKoszty.reduce((suma, koszt)=>suma + Number(koszt.cena), 0);     
    return (
       <div className={styles.szczegolyNaprawy}>
            <header className={styles.infoNaprawa}>
                <div className={styles.status}><span className={styles.id}>RIC-{szczegoly.id}</span><span className={styles.pigulkaStatusu}>{szczegoly.status}</span><button className={styles.btnZamknij} onClick={()=>nawiguj('/naprawy')}>X</button></div>
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
                    <div className={styles.kosztorysNaglowek}>
                        <h3>Kosztorys</h3>
                        <button className={styles.btnDodajKoszt}
                        onClick={()=>setCzyKosztyOtwarte(true)}>
                            + Dodaj koszt
                        </button>
                    </div>
                    {dodaneKoszty.map((koszt, index)=>(
                                <p key={index}>
                                    {koszt.nazwa_czesci} ({koszt.cena} zł)
                                </p>
                            ))}
                    <div className={styles.podsumowanieKosztow}>
                        <strong>RAZEM: {sumaKosztow} zł</strong>
                    </div>
                </article>
            </section>
            <footer>
                <button className={styles.kontaktKlient}>Kontakt z klientem</button>
                <button className={styles.zmienStatus}>Zmień status</button>
            </footer>
            {czyKosztyOtwarte && (
                <div className={styles.malyModalTlo}>
                    <div className={styles.malyModal}>
                        <h3>Wybierz część / usługę</h3>
                        <select className={styles.wyborCzesci} value={wybranaCzesc} onChange={(e)=>setWybranaCzesc(e.target.value)}>
                            
                            <option value="">Wybierz z magazynu...</option>
                            {listaCzesci.map((czesc)=>(
                                <option key={czesc.id} value={czesc.id}>
                                    {czesc.nazwa_czesci}
                                </option>
                            ))}
                        </select>
                        <input 
                                type="number"
                                placeholder="Wpisz cenę..."
                                value={wpisanaCena}
                                onChange={(e)=>setWpisanaCena(e.target.value)}
                                className={styles.inputCeny}
                            />
                    
                    <div className={styles.malyModalAkcje}>
                        <button className={styles.btnAnuluj} onClick={()=>setCzyKosztyOtwarte(false)}>
                            Anuluj
                        </button>
                        <button className={styles.btnZapiszKoszt} onClick={dodajKosztDoListy}>
                            Dodaj do wyceny
                        </button>
                    </div>
                    </div>
                </div>
            )}
       </div>
    );
}