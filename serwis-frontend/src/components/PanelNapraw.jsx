import { useState, useEffect } from "react";
import styles from './PanelNapraw.module.css';
import { useNavigate } from "react-router-dom";
export default function PanelNapraw() {
    const [listaNapraw, setListaNapraw] = useState([]);
    const [aktywnyFiltr, setAktywnyFiltr] = useState("Wszystkie");
    const nawiguj = useNavigate();
    useEffect(()=> {
        const pobierzNaprawy = async ()=> {
            try {
                const odpowiedz = await fetch('http://localhost:3000/naprawy');
                const dane = await odpowiedz.json();
                setListaNapraw(dane.listaNapraw);
            }
            catch (err) {
                console.error("BLAD API", err);
            }
        };
        pobierzNaprawy();
    }, []);
    const wszystkie = listaNapraw.length;
    const wTrakcie = listaNapraw.filter(naprawa=>naprawa.status==='W trakcie diagnozy' || naprawa.status ==='Czeka na części').length;
    const przyjete = listaNapraw.filter(naprawa=>naprawa.status==='Przyjęto').length;
    const gotowe = listaNapraw.filter(naprawa=>naprawa.status==='Gotowe').length;
   
    const wyswietlaneNaprawy = (aktywnyFiltr==='Wszystkie' ? listaNapraw : listaNapraw.filter(naprawa=>naprawa.status===aktywnyFiltr));

    return (
        <div className={styles.widokNapraw}>
            <header className={styles.naglowekGorny}>
                <div>
                <h2>Naprawy</h2>
                <p>Wszystkie zgłoszenia serwisowe</p>
                </div>
                <button className={styles.dodajNaprawe}>+Dodaj naprawę</button>
            </header>
            <div className={styles.kartyStatystyk}>
                <div className={styles.wszystkieZlecenia}>
                <h3>{wszystkie}</h3>
                <p>Wszystkie</p>
                </div>
                <div className={styles.Przyjete}>
                    <h3>{przyjete}</h3>
                    <p>Przyjęte</p>
                </div>
                <div className={styles.wNaprawie}>
                    <h3>{wTrakcie}</h3>
                    <p>W naprawie</p>
                </div>
                <div className={styles.gotowe}>
                    <h3>{gotowe}</h3>
                    <p>Gotowe do odbioru</p>
                </div>
            </div>

            <div className={styles.panelTabela}>
                <div className={styles.przyciskiStatusow}>
                    <button onClick={()=>setAktywnyFiltr('Wszystkie')} className={aktywnyFiltr==='Wszystkie' ? styles.aktywny : ''}>Wszystkie</button>
                    <button onClick={()=>setAktywnyFiltr('Przyjęto')} className={aktywnyFiltr==='Przyjęto' ? styles.aktywny: ''}>Przyjęte</button>
                    <button onClick={()=>setAktywnyFiltr('W trakcie diagnozy')} className={aktywnyFiltr==='W trakcie diagnozy' ? styles.aktywny : ''}>W naprawie</button>
                    <button onClick={()=>setAktywnyFiltr('Czeka na części')} className={aktywnyFiltr==='Czeka na części' ? styles.aktywny : ''}>Oczekujące</button>
                    <button onClick={()=>setAktywnyFiltr('Gotowe')} className={aktywnyFiltr === 'Gotowe' ? styles.aktywny : ''}>Gotowe</button>
                </div>
                
                <div className={styles.tabelaDanych}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID ZGŁOSZENIA</th>
                                <th>URZĄDZENIE</th>
                                <th>KLIENT</th>
                                <th>STATUS</th>
                                <th>AKCJE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wyswietlaneNaprawy.map((naprawa)=> (
                                <tr key={naprawa.id}>
                                    <td>RIC-{naprawa.id}</td>
                                    
                                    <td>
                                    {naprawa.nazwa_sprzetu}
                                    </td>
                                    <td className={styles.imieInicjaly}>
                                        <div className={styles.inicjaly}>{naprawa.imie_nazwisko[0]}</div>
                                        <span className={styles.Imie}>{naprawa.imie_nazwisko}</span>
                                    </td>
                                    <td><span className={styles.status}>{naprawa.status}</span></td>
                                    <td><button className={styles.szczegoly} onClick={()=>nawiguj(`/naprawa/${naprawa.id}`)}>Szczegóły</button></td>
                                </tr>
                            )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}