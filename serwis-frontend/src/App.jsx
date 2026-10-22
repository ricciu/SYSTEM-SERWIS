import { useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import PanelKlientow from "./components/PanelKlientow";
import PanelNapraw from "./components/PanelNapraw";
import SzczegolyNaprawy from "./components/SzczegolyNaprawy";
import './App.css';

export default function App() {
    const [czyPanelOtwarty, setCzyPanelOtwarty] = useState(false);

    return (
        <div className="glowny-uklad">
            <aside className={`panel-boczny ${czyPanelOtwarty ? 'otwarty' : ''}`}>
                <h4>Serwis Ricciu</h4>
                <Link to="/" onClick={() => setCzyPanelOtwarty(false)}>Pulpit</Link>
                <Link to="/naprawy" onClick={() => setCzyPanelOtwarty(false)}>Naprawy</Link>
                <Link to="/klienci" onClick={() => setCzyPanelOtwarty(false)}>Klienci</Link>
                <Link to="/magazyn" onClick={() => setCzyPanelOtwarty(false)}>Magazyn</Link>
            </aside>

            <main className="obszar-roboczy">
                <header className="gorny-pasek">
                    <button className="hamburger" onClick={() => setCzyPanelOtwarty(!czyPanelOtwarty)}>☰</button>
                    <div className="akcje-gorne">
                        <input type="text" placeholder="Szukaj..." />
                        <button className="przycisk-nowy">+ Nowa naprawa</button>
                    </div>
                </header>

                <section className="dynamiczna-sekcja">
                    <Routes>
                        <Route path="/" element={<h2>Panel Główny</h2>} />
                        <Route path="/naprawy" element={<PanelNapraw />} />
                        <Route path="/klienci" element={<PanelKlientow />} />
                        <Route path="/magazyn" element={<h2>Magazyn</h2>} />
                        <Route path="/naprawa/:id" element={<SzczegolyNaprawy/>}/>
                    </Routes>
                </section>
            </main>
        </div>
    );
}