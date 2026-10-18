const Database = require('better-sqlite3');
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
const db = new Database('serwis.db');
db.pragma('foreign_keys=ON')

const tworzenie_klienci = db.prepare(
    `CREATE TABLE IF NOT EXISTS KLIENCI (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imie_nazwisko TEXT NOT NULL,
    nr_tel TEXT NOT NULL
    )`)
tworzenie_klienci.run();
const tworzenie_naprawy = db.prepare(
    `CREATE TABLE IF NOT EXISTS NAPRAWY(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa_sprzetu TEXT NOT NULL,
    opis_usterki TEXT NOT NULL, 
    status TEXT DEFAULT 'Przyjęto' NOT NULL,
    id_klienta INTEGER NOT NULL,
    FOREIGN KEY (id_klienta) REFERENCES klienci(id)
    )`
);
tworzenie_naprawy.run();

app.post('/klienci', (req, res)=>{
    if (!req.body.imie_nazwisko || !req.body.nr_tel) {
        return res.status(400).json({blad: "BRAK KOMPLETNYCH DANYCH"});
    }
    const dodajKlienta = db.prepare(`
        INSERT INTO KLIENCI (imie_nazwisko, nr_tel)
        VALUES (?, ?)
        `);
    const dodawanieKlienta = dodajKlienta.run(req.body.imie_nazwisko, req.body.nr_tel);
    return res.status(201).json({wiadomosc: "Poprawnie dodano klienta", 
        id: dodawanieKlienta.lastInsertRowid
    });

})

app.get('/klienci', (req, res)=> {
    const zapytanie = db.prepare('SELECT * FROM KLIENCI');
    const listaKlientow = zapytanie.all();
    return res.status(200).json({lista_klientow: listaKlientow});
})

app.post('/naprawy', (req, res)=> {
    const dodajNaprawe = db.prepare(`
        INSERT INTO NAPRAWY (nazwa_sprzetu, opis_usterki, id_klienta)
        VALUES (?, ?, ?);
        `);
    if (!req.body.nazwa_sprzetu || !req.body.opis_usterki || !req.body.id_klienta) {
        return res.status(400).json({blad: "NIEPELNE DANE"});
    }
    try {
        const wynik = dodajNaprawe.run(req.body.nazwa_sprzetu, 
            req.body.opis_usterki, req.body.id_klienta
        );
        return res.status(201).json({
            wiadomosc: "Sprzęt przyjęty na serwis", 
            id_naprawy: wynik.lastInsertRowid
        });
    }
    catch (error) {
        return res.status(400).json({blad: "Nie znaleziono klienta o danym ID"});
    }
})

app.listen(PORT, ()=> {
    console.log(`SERWER DZIALA NA adresie http://localhost:${PORT}`);
});