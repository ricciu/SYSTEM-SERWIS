import { useParams, useOutletContext } from "react-router-dom";
import { useState } from "react";
import styles from './SzczegolyNapraw.module.css';
import { FiCreditCard, FiEdit2, FiTrash } from "react-icons/fi";


export default function Kosztorys() {
    const {id} = useParams();
    const {dodaneKoszty, setDodaneKoszty, listaCzesci} = useOutletContext();
    const [czyKosztyOtwarte, setCzyKosztyOtwarte] = useState(false);
    const [wybranaCzesc, setWybranaCzesc] = useState("");
    const [wpisanaCena, setWpisanaCena] = useState("");
    const [kosztDoUsuniecia, setKosztDoUsuniecia] = useState(null);
    const [kosztDoEdycji, setKosztDoEdycji] = useState(null);
    const [nowaCenaEdycji, setNowaCenaEdycji] = useState("");
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
const sumaKosztow = dodaneKoszty.reduce((suma, koszt)=>suma + Number(koszt.cena), 0);     

    return (
        <div className={styles.Kosztorys}>
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
            </div>
    );
}