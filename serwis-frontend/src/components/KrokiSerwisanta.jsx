import { useState } from "react";
import styles from './SzczegolyNapraw.module.css';

export default function KrokiSerwisanta({wpisy, idNaprawy, poDodaniu}) {
    const [tresc, setTresc] = useState("");
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState("");
    return (
        <article>
            <h3>Kroki serwisanta</h3>
            {wpisy.length === 0 ? (
                <p>Brak zapisanych kroków</p> )
                : (
                    <ul>
                        {wpisy.map((wpis)=> (
                            <li key={wpis.id}>{wpis.tresc} {wpis.data_utworzenia}</li>
                        ))}
                    </ul>
                )
}           <textarea placeholder="Opisz wykonywany krok..." value={tresc} onChange={(e)=>setTresc(e.target.value)}/>

        </article>
    )

}