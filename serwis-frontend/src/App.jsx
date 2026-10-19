import { useState, useEffect } from "react";
import PanelKlientow from "./components/PanelKlientow";
import './App.css'
export default function App() {
    const [aktywnaZakladka, setAktywnaZakladka] = useState("pulpit");
    return (
        <div className="glowny-uklad">
            <aside className="panel-boczny">
                <h4>Serwis Ricciu</h4>
                <button onClick={()=>setAktywnaZakladka("pulpit")}>Pulpit</button>
                <button onClick={()=>setAktywnaZakladka("naprawy")}>Naprawy</button>
                <button onClick={()=>setAktywnaZakladka("klienci")}>Klienci</button>
                <button onClick={()=>setAktywnaZakladka("magazyn")}>Magazyn</button>

            </aside>
            <main className="obszar-roboczy">
                <header className="gorny-pasek">
                    <input type="text"></input><button>+ Nowa naprawa</button>
                </header>
                <section className="dynamiczna-sekcja">
                        {aktywnaZakladka === 'pulpit' && <h2>Panel Główny</h2>}
                        {aktywnaZakladka === 'naprawy' && <h2>Naprawy</h2>}                    
                        {aktywnaZakladka === 'klienci' && <PanelKlientow/>}
                        {aktywnaZakladka === 'magazyn' && <h2>Magazyn</h2>}
                </section>
            </main>
        </div>
    )
}