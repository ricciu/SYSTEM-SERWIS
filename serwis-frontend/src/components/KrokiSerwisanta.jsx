import { useState } from "react";
import styles from './SzczegolyNapraw.module.css';

export default function KrokiSerwisanta({wpisy, idNaprawy, poDodaniu}) {
    const [tresc, setTresc] = useState("");
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState("");
    async function wyslijKrok(e) {
        e.preventDefault();
        setBlad("");
        setWysylanie(true);
        try {
            const odpowiedz = await fetch(`http://localhost:3000/naprawy/${idNaprawy}/historia`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({tresc: tresc.trim()})
            });
            if (odpowiedz.ok) {
                setTresc("");
                await poDodaniu();
            }
            else {
                setBlad("Nie udalo sie zapisac kroku");
            }
            console.log("wysylam:", tresc);
        }
        catch (err) {
            console.log(err);
            setBlad("Brak polaczenia z serwerem");
        }
        finally {
            setWysylanie(false);
        }
    }
    return (
        <article>
            <h3>Kroki serwisanta</h3>
            <form onSubmit={wyslijKrok}>
             <textarea placeholder="Opisz wykonywany krok..." value={tresc} onChange={(e)=>setTresc(e.target.value)}/>
            <button type="submit" disabled={tresc.trim()===""||wysylanie}>Dodaj krok</button>
            {blad && <p>{blad}</p>}
            </form>
        
            {wpisy.length === 0 ? (
                <p>Brak zapisanych kroków</p> )
                : (
                    <ul>
                        {wpisy.map((wpis)=> (
                            <li key={wpis.id}>{wpis.tresc} {wpis.data_utworzenia}</li>
                        ))}
                    </ul>
                )
}          

        </article>
    )

}