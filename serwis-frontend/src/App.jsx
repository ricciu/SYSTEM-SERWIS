import { useState, useEffect } from "react";
import PanelKlientow from "./components/PanelKlientow";
import './App.css'
import PanelNapraw  from "./components/PanelNapraw";
export default function App() {
    const [aktywnaZakladka, setAktywnaZakladka] = useState(() => {
    return localStorage.getItem("zapisanaZakladka") || "pulpit";
});


useEffect(() => {
    localStorage.setItem("zapisanaZakladka", aktywnaZakladka);
}, [aktywnaZakladka]);
    const [czyPanelOtwarty, setCzyPanelOtwarty] = useState(false);
    return (
        <div className="glowny-uklad">
            <aside className={`panel-boczny ${czyPanelOtwarty ? 'otwarty' :''}`}>
                <h4>Serwis Ricciu</h4>
                <button onClick={()=>{setAktywnaZakladka("pulpit");setCzyPanelOtwarty(false)}}>Pulpit</button>
                <button onClick={()=>{setAktywnaZakladka("naprawy");setCzyPanelOtwarty(false)}}>Naprawy</button>
                <button onClick={()=>{setAktywnaZakladka("klienci");setCzyPanelOtwarty(false)}}>Klienci</button>
                <button onClick={()=>{setAktywnaZakladka("magazyn");setCzyPanelOtwarty(false)}}>Magazyn</button>

            </aside>
            <main className="obszar-roboczy">
                <header className="gorny-pasek">
                    <button className="hamburger" onClick={()=>setCzyPanelOtwarty(!czyPanelOtwarty)}>☰</button>
                    <div className="akcje-gorne">
                    <input type="text" placeholder="Szukaj..."></input><button className="przycisk-nowy">+ Nowa naprawa</button>
                    </div>
                </header>
                <section className="dynamiczna-sekcja">
                        {aktywnaZakladka === 'pulpit' && <h2>Panel Główny</h2>}
                        {aktywnaZakladka === 'naprawy' && <PanelNapraw/>}                    
                        {aktywnaZakladka === 'klienci' && <PanelKlientow/>}
                        {aktywnaZakladka === 'magazyn' && <h2>Magazyn</h2>}
                </section>
            </main>
        </div>
    )
}