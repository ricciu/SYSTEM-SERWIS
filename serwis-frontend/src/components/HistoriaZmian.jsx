import { FiList } from "react-icons/fi";
import styles from './HistoriaZmian.module.css';
import { formatujDate, formatujDateKrotko } from "../tools/formatujDate";

// Dyskretny panel z historią zmian: kto, kiedy i co zmienił (status, opis prac, kosztorys).
// Wpisy zapisuje backend razem z samą zmianą. Panel ma służyć tylko do przejrzenia
// w razie potrzeby, dlatego jest mały i przygaszony.
export default function HistoriaZmian({wpisy}) {
    return (
        <aside className={styles.panel}>
            <h4 className={styles.tytul}><FiList /> Historia zmian</h4>
            {wpisy.length === 0 ? (
                <p className={styles.pusto}>Brak zapisanych zmian</p>
            ) : (
                <ul className={styles.lista}>
                    {wpisy.map((wpis) => (
                        <li key={wpis.id} className={styles.wpis}>
                            <div className={styles.meta}>
                                <time className={styles.czas} title={formatujDate(wpis.data_utworzenia)}>
                                    {formatujDateKrotko(wpis.data_utworzenia)}
                                </time>
                                <span className={styles.autor}>{wpis.autor || "Nieznany"}</span>
                            </div>
                            {wpis.poprzednio ? (
                                // zmiana opisu: pełną poprzednią wersję można rozwinąć
                                <details className={styles.rozwijane}>
                                    <summary className={styles.tresc}>{wpis.tresc}</summary>
                                    <pre className={styles.poprzednio}>{wpis.poprzednio}</pre>
                                </details>
                            ) : (
                                <span className={styles.tresc}>{wpis.tresc}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    )
}
