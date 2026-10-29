import styles from './PrzebiegNaprawy.module.css';
import {FiCheck, FiCircle} from 'react-icons/fi';

export default function PrzebiegNaprawy({aktualnyStatus}) {
    const kroki = ["Przyjęto", "W trakcie diagnozy", "Czeka na części", 
        "Gotowe", "Odebrane"
    ]
    const obecny_indeks = kroki.indexOf(aktualnyStatus);
    return (
        <div className={styles.glownyKontenerStatus}>
            <h3>Przebieg naprawy</h3>
            <section className={styles.blokPrzebiegu}>
                {kroki.map((krok, index)=> {
                let stan_kroku = "oczekujacy";
                if (index < obecny_indeks) stan_kroku = "zakonczony";
                if (index === obecny_indeks) stan_kroku = "aktywny";
                let wygenerowana_ikona="";
                if (stan_kroku === 'zakonczony') {
                    wygenerowana_ikona = <FiCheck />
                }
                else if (stan_kroku === 'aktywny') {
                    wygenerowana_ikona = <FiCircle />
                }
                else {
                    wygenerowana_ikona = <FiCircle />
                }
                return (
                    <div key={index} className={`${styles.wierszKroku} ${styles[stan_kroku]}`}>
                        <div className={styles.znacznikKroku}>
                            {wygenerowana_ikona}
                        </div>
                        <div className={styles.opisKroku}>
                            <span>{krok}</span>
                        </div>
                    </div>
                )
                })}
            </section>
        </div>
    )
}