import {  useOutletContext } from "react-router-dom";

import styles from './SzczegolyNapraw.module.css';
import PrzebiegNaprawy from "./PrzebiegNaprawy";

export default function Przeglad() {
    const {szczegoly, historia} = useOutletContext();
    
    return (
        <div className={styles.Przeglad}>
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
        
                        
                        <article className={styles.Przebieg}>
                            <PrzebiegNaprawy aktualnyStatus={szczegoly.status}/>
                        </article>
        </div>
    )
}