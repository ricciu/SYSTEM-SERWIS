import {  useOutletContext, useParams } from "react-router-dom";
import { FiUser, FiPhone, FiCalendar, FiAlertTriangle } from "react-icons/fi";

import styles from './SzczegolyNapraw.module.css';
import PrzebiegNaprawy from "./PrzebiegNaprawy";
import OpisPrac from "./OpisPrac";
import HistoriaZmian from "./HistoriaZmian";
export default function Przeglad() {
    const {szczegoly, setSzczegoly, historia, odswiezHistorie, szkicOpisu, setSzkicOpisu} = useOutletContext();
    const {id} = useParams();

    // wpisy historii zmian zapisuje serwer (typ 'system'); dawne wpisy typu 'notatka' są już częścią opisu prac
    const zmiany = historia.filter((wpis)=> wpis.typ === 'system');

    // szkic opisu jest przypisany do konkretnej naprawy, więc nie przecieka na inną
    const szkic = szkicOpisu && szkicOpisu.idNaprawy === id ? szkicOpisu.tekst : null;
    function zmienSzkic(tekst) {
        setSzkicOpisu(tekst === null ? null : {idNaprawy: id, tekst});
    }
    function poZapisieOpisu(nowyOpis) {
        setSzczegoly((poprzednie) => ({...poprzednie, opis_prac: nowyOpis}));
        return odswiezHistorie();
    }

    return (
        <div className={styles.Przeglad}>
            {/* kolumna 1: kto i kiedy */}
            <div className={styles.kolumna}>
                <article className={styles.kartaKlienta}>
                    <div className={styles.naglowekKarty}><FiUser /> Klient</div>
                    <div className={styles.profilKlienta}>
                        <div className={styles.inicjaly}>{szczegoly.imie_nazwisko[0]}</div>
                        <div className={styles.daneKlienta}>
                            <strong>{szczegoly.imie_nazwisko}</strong>
                            <a className={styles.telefon} href={`tel:${szczegoly.nr_tel}`}>
                                <FiPhone /> {szczegoly.nr_tel}
                            </a>
                        </div>
                    </div>
                </article>
                <article className={styles.planowanyTermin}>
                    <div className={styles.naglowekKarty}><FiCalendar /> Planowany termin</div>
                    <strong className={styles.wartoscKarty}>Brak danych</strong>
                </article>
            </div>

            {/* kolumna 2: co jest zepsute i co zrobiono */}
            <div className={styles.kolumna}>
                <article className={styles.infUrzadzenie}>
                    <div className={styles.naglowekKarty}><FiAlertTriangle /> Zgłoszona usterka</div>
                    <p className={styles.opisUsterki}>{szczegoly.opis_usterki}</p>
                </article>
                <OpisPrac
                    opis={szczegoly.opis_prac || ""}
                    szkic={szkic}
                    naZmianeSzkicu={zmienSzkic}
                    idNaprawy={id}
                    poZapisie={poZapisieOpisu}
                />
            </div>

            {/* kolumna 3: etap naprawy, a pod nim cicha historia zmian */}
            <div className={styles.kolumna}>
                <article className={styles.Przebieg}>
                    <PrzebiegNaprawy aktualnyStatus={szczegoly.status}/>
                </article>
                <HistoriaZmian wpisy={zmiany} />
            </div>
        </div>
    )
}
