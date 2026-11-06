import { useParams, useOutletContext } from "react-router-dom";
import { useState } from "react";
import styles from './SzczegolyNapraw.module.css';

export default function KrokiSerwisanta({wpisy, idNaprawy, poDodaniu}) {
    
    return (
        <article>
            <h3>Kroki serwisanta</h3>
            {wpisy.length === 0 ? (
                <p>Brak zadan</p> )
                : (
                    <ul>
                        {wpisy.map((wpis)=> (
                            <li key={wpis.id}>{wpis.nazwa} {wpis.data_utworzenia}</li>
                        ))}
                    </ul>
                )
}
        </article>
    )

}