import {  useOutletContext, useParams } from "react-router-dom";

import styles from './SzczegolyNapraw.module.css';
import PrzebiegNaprawy from "./PrzebiegNaprawy";
import KrokiSerwisanta from "./KrokiSerwisanta";
export default function Przeglad() {
    const {szczegoly, historia, odswiezHistorie} = useOutletContext();
    const {id} = useParams();
    const notatki = historia.filter((notatka)=> 
        notatka.typ === 'notatka')
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
                        
                        <KrokiSerwisanta wpisy={notatki} idNaprawy={id} poDodaniu={odswiezHistorie}/>
                        
                        <article className={styles.Przebieg}>
                            <PrzebiegNaprawy aktualnyStatus={szczegoly.status}/>
                        </article>
        </div>
    )
}