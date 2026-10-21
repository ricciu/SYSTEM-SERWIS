import { useState, useEffect } from "react";
import styles from './PanelNapraw.module.css';
export default function PanelNapraw() {
    const [listaNapraw, setListaNapraw] = useState([]);
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
                    <button className={styles.aktywny}>Wszystkie</button>
                    <button>Przyjęte</button>
                    <button>W naprawie</button>
                    <button>Oczekujące</button>
                    <button>Gotowe</button>
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
                            {listaNapraw.map((naprawa)=> (
                                <tr key={naprawa.id}>
                                    <td>RIC-{naprawa.id}</td>
                                    
                                    <td>
                                    {naprawa.nazwa_sprzetu}
                                    </td>
                                    <td className={styles.imieInicjaly}>
                                        <div className={styles.inicjaly}>K</div>
                                        <span className={styles.Imie}>{naprawa.imie_nazwisko}</span>
                                    </td>
                                    <td><span className={styles.status}>{naprawa.status}</span></td>
                                    <td><button className={styles.szczegoly}>Szczegóły</button></td>
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