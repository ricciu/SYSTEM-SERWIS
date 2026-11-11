import { useState } from "react";
import { Route, Routes, NavLink } from "react-router-dom";
import { FiHome, FiTool, FiUsers, FiPackage, FiMenu, FiSearch, FiPlus, FiSun, FiMoon } from "react-icons/fi";
import PanelKlientow from "./components/PanelKlientow";
import PanelNapraw from "./components/PanelNapraw";
import SzczegolyNaprawy from "./components/SzczegolyNaprawy";
import Kosztorys from "./components/ZakladkaKosztorys";
import Przeglad from "./components/ZakladkaPrzeglad";
import Operator from "./components/Operator";
import { useMotyw } from "./tools/useMotyw";
import './App.css';

const SZEROKOSC_DESKTOP = 900;

function klasaPozycjiMenu({ isActive }) {
    return isActive ? "pozycja-menu aktywna" : "pozycja-menu";
}

export default function App() {
    // na szerokim ekranie menu jest otwarte od początku, na wąskim zwinięte
    const [czyPanelOtwarty, setCzyPanelOtwarty] = useState(() => window.innerWidth >= SZEROKOSC_DESKTOP);
    const { motyw, przelacz } = useMotyw();

    // po kliknięciu w menu zwijamy je tylko na wąskim ekranie
    function zamknijNaWaskim() {
        if (window.innerWidth < SZEROKOSC_DESKTOP) {
            setCzyPanelOtwarty(false);
        }
    }

    return (
        <div className="glowny-uklad">
            <aside className={`panel-boczny ${czyPanelOtwarty ? 'otwarty' : ''}`}>
                <div className="marka">
                    <span className="marka-logo"><FiTool /></span>
                    <span className="marka-nazwa">Serwis Ricciu</span>
                </div>
                <nav className="menu">
                    <NavLink to="/" end className={klasaPozycjiMenu} onClick={zamknijNaWaskim}>
                        <FiHome /> <span>Pulpit</span>
                    </NavLink>
                    <NavLink to="/naprawy" className={klasaPozycjiMenu} onClick={zamknijNaWaskim}>
                        <FiTool /> <span>Naprawy</span>
                    </NavLink>
                    <NavLink to="/klienci" className={klasaPozycjiMenu} onClick={zamknijNaWaskim}>
                        <FiUsers /> <span>Klienci</span>
                    </NavLink>
                    <NavLink to="/magazyn" className={klasaPozycjiMenu} onClick={zamknijNaWaskim}>
                        <FiPackage /> <span>Magazyn</span>
                    </NavLink>
                </nav>
            </aside>

            <main className="obszar-roboczy">
                <header className="gorny-pasek">
                    <button className="hamburger" onClick={() => setCzyPanelOtwarty(!czyPanelOtwarty)} aria-label="Pokaż lub ukryj menu">
                        <FiMenu />
                    </button>
                    <div className="akcje-gorne">
                        <div className="szukaj">
                            <FiSearch />
                            <input type="text" placeholder="Szukaj..." />
                        </div>
                        <Operator />
                        <button
                            className="przycisk-ikona"
                            onClick={przelacz}
                            aria-label={motyw === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
                            title={motyw === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
                        >
                            {motyw === 'dark' ? <FiSun /> : <FiMoon />}
                        </button>
                        <button className="przycisk-nowy"><FiPlus /> Nowa naprawa</button>
                    </div>
                </header>

                <section className="dynamiczna-sekcja">
                    <Routes>
                        <Route path="/" element={<h2>Panel Główny</h2>} />
                        <Route path="/naprawy" element={<PanelNapraw />} />
                        <Route path="/klienci" element={<PanelKlientow />} />
                        <Route path="/magazyn" element={<h2>Magazyn</h2>} />
                        <Route path="/naprawa/:id" element={<SzczegolyNaprawy/>}>
                            <Route index element={<Przeglad/>}/>
                            <Route path="kosztorys" element={<Kosztorys/>}/>
                        </Route>
                    </Routes>
                </section>
            </main>
        </div>
    );
}
