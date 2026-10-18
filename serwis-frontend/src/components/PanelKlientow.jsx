import { useState, useEffect } from "react";
export default function PanelKlientow() {
    const [listaKlientow, setListaKlientow] = useState([]);
    useEffect(()=> {
        const  pobierzKlientow = async ()=> {
            try {
                const odpowiedz = await fetch('http://localhost:3000/klienci');
                const dane = await odpowiedz.json();
                setListaKlientow(dane.lista_klientow);

            }
            catch (err) {
                console.error("BLAD API", err);
            }
        };
        pobierzKlientow();
    }, []);
    return (
        <div className="panel-kontener">
            <div className="naglowek-sekcji">
                <h2>Baza klientów</h2>
                <button className="przycisk-akcja">+ Nowy Klient</button>
            </div>
            <table className="tabela-danych">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Klient</th>
                        <th>Telefon</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {listaKlientow.map((pojedynczyKlient)=> (
                        <tr key={pojedynczyKlient.id}>
                            <td>{pojedynczyKlient.id}</td>
                            <td>{pojedynczyKlient.imie_nazwisko}</td>
                            <td>{pojedynczyKlient.nr_tel}</td>
                            <td><button>Edytuj</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}