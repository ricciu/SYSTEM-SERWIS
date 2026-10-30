import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from './SzczegolyNapraw.module.css';
import PrzebiegNaprawy from "./PrzebiegNaprawy";
import { FiTool, FiCreditCard, FiEdit2, FiTrash } from "react-icons/fi";
export default function SzczegolyNaprawy() {
    const { id } = useParams();
    const nawiguj = useNavigate();
    const [szczegoly, setSzczegoly] = useState(null);
    const [czyKosztyOtwarte, setCzyKosztyOtwarte] = useState(false);
    const [listaCzesci, setListaCzesci] = useState([]);
    const [wybranaCzesc, setWybranaCzesc] = useState("");
    const [dodaneKoszty, setDodaneKoszty] = useState([]);
    const [wpisanaCena, setWpisanaCena] = useState("");
    const [kosztDoUsuniecia, setKosztDoUsuniecia] = useState(null);
    const [kosztDoEdycji, setKosztDoEdycji] = useState(null);
    const [nowaCenaEdycji, setNowaCenaEdycji] = useState("");
    const [czyStatusOtwarty, setCzyStatusOtwarty] = useState(false);
    const [wybranyRecznyStatus, setWybranyRecznieStatus] = useState(""); 
    
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
                const odpowiedzSerwera = await dodajKoszt.json();
                setCzyKosztyOtwarte(false);
                setWybranaCzesc("");
                setWpisanaCena("");
                const znalezionaCzesc = listaCzesci.find(czesc => czesc.id.toString() === wybranaCzesc.toString());
               
                const nowyKoszt = {...znalezionaCzesc, cena: wpisanaCena, 
                    id_kosztorysu: odpowiedzSerwera.id_kosztorysu
                };
                setDodaneKoszty([...dodaneKoszty, nowyKoszt]);
            }
        }
        catch (err) {
            console.error("BLAD SIECI", err);
            alert("NIE UDALO SIE ZAPISAC KOSZTU");
        }
    };
   
const potwierdzUsuniecie = async () => {
    if (!kosztDoUsuniecia) return;
    try {
        const odpowiedz = await fetch(`http://localhost:3000/kosztorys/${kosztDoUsuniecia}`, {
            method: 'DELETE'
        });
        if (odpowiedz.ok) {
            setDodaneKoszty(dodaneKoszty.filter(koszt => koszt.id_kosztorysu !== kosztDoUsuniecia));
            setKosztDoUsuniecia(null); // Zamknięcie modala
        }
    } catch (error) {
        alert("Błąd połączenia z serwerem");
    }
};

const potwierdzEdycje = async () => {
    if (!kosztDoEdycji || !nowaCenaEdycji.toString().trim()) return;
    try {
        const odpowiedz = await fetch(`http://localhost:3000/kosztorys/${kosztDoEdycji}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({cena: nowaCenaEdycji})
        });
        if (odpowiedz.ok) {
            setDodaneKoszty(dodaneKoszty.map(koszt =>
                koszt.id_kosztorysu === kosztDoEdycji ? {...koszt, cena: nowaCenaEdycji} : koszt
            ));
            setKosztDoEdycji(null); 
        }
    } catch (error) {
        alert("Błąd podczas edycji");
    }
};
async function potwierdzStatus(wybranyStatus) {
    try {
        const odpowiedz = await fetch(`http://localhost:3000/naprawy/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: wybranyStatus})
    });
    if (odpowiedz.ok) {
        setSzczegoly({...szczegoly, status: wybranyStatus})
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
    <div className={styles.status}>
        <span className={styles.id}>RIC-{szczegoly.id}</span>
        <span className={styles.pigulkaStatusu}>{szczegoly.status}</span>
        <button className={styles.btnZamknij} onClick={() => nawiguj('/naprawy')}>X</button>
    </div>
    <div className={styles.glownaSekcjaNaglowka}>
        <div className={styles.daneSprzetu}>
            <h1>{szczegoly.nazwa_sprzetu}</h1>
            <p>{szczegoly.opis_usterki}</p>
        </div>
        <div className={styles.wielkaKwotaDoZaplaty}>
            <span className={styles.etykietaWielkaKwota}>Do zapłaty</span>
            <strong>{sumaKosztow.toFixed(2).replace('.', ',')} zł</strong>
        </div>
    </div>
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
                        <h3><FiCreditCard className={styles.ikonaNaglowka}/>  Kosztorys</h3>
                        <button className={styles.btnDodajKoszt}
                        onClick={()=>setCzyKosztyOtwarte(true)}>
                            + Dodaj
                        </button>
                    </div>
                    <div className={styles.listaKosztowContainer}>
                        {dodaneKoszty.map((koszt, index)=> (
                            <div key={index} className={styles.wierszKosztu}>
                                <span className={styles.nazwaCzesci}>{koszt.nazwa_czesci}</span>
                                <div className={styles.akcjeKosztu}>
                                    <span className={styles.cenaCzesci}>
                                        {Number(koszt.cena).toFixed(2).replace('.', ',')} zł
                                    </span>
                                    <button onClick={() => { setKosztDoEdycji(koszt.id_kosztorysu); setNowaCenaEdycji(koszt.cena); }} className={styles.btnAkcja}>
                                        <FiEdit2 />
                                    </button>
                                    <button onClick={() => setKosztDoUsuniecia(koszt.id_kosztorysu)} className={styles.btnAkcja}>
                                        <FiTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.podzielnik}></div>
                    <div className={styles.podsumowanieKosztow}>
                    <div className={styles.kwotaLacznie}>
                        <span className={styles.etykietaLacznie}>Łącznie brutto</span>
                        <strong>{sumaKosztow.toFixed(2).replace('.', ',')}zł</strong>
                    </div>
                    <span className={styles.infoVat}>VAT 23% wliczony</span>
                    </div>
                </article>
                <article className={styles.Przebieg}>
                    <PrzebiegNaprawy aktualnyStatus={szczegoly.status}/>
                </article>
            </section>
            <footer>
                <button className={styles.kontaktKlient}>Kontakt z klientem</button>
                <button className={styles.zmienStatus} onClick={()=>{setCzyStatusOtwarty(true)}}>Zmień status</button>
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
            {kosztDoUsuniecia && (
                <div className={styles.malyModalTlo}>
                    <div className={styles.malyModal}>
                        <h3>Potwierdź usunięcie</h3>
                        <p style={{marginBottom: '20px', color: '#94a3b8'}}>Czy na pewno chcesz usunąć tę pozycję z kosztorysu?</p>
                        <div className={styles.malyModalAkcje}>
                            <button className={styles.btnAnuluj} onClick={() => setKosztDoUsuniecia(null)}>Anuluj</button>
                            <button className={styles.btnZapiszKoszt} style={{backgroundColor: '#ef4444'}} onClick={potwierdzUsuniecie}>Usuń</button>
                        </div>
                    </div>
                </div>
            )}

            {kosztDoEdycji && (
                <div className={styles.malyModalTlo}>
                    <div className={styles.malyModal}>
                        <h3>Edytuj cenę</h3>
                        <input 
                            type="number"
                            value={nowaCenaEdycji}
                            onChange={(e) => setNowaCenaEdycji(e.target.value)}
                            className={styles.inputCeny}
                        />
                        <div className={styles.malyModalAkcje}>
                            <button className={styles.btnAnuluj} onClick={() => setKosztDoEdycji(null)}>Anuluj</button>
                            <button className={styles.btnZapiszKoszt} onClick={potwierdzEdycje}>Zapisz</button>
                        </div>
                    </div>
                </div>
            )}
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