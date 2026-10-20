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

const tworzenieMagazyn = db.prepare(
    `CREATE TABLE IF NOT EXISTS MAGAZYN(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa_czesci TEXT NOT NULL,
    stan_magazynowy INTEGER DEFAULT 0,
    cena REAL
    )`
)
tworzenieMagazyn.run();
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

app.put('/naprawy/:id', (req, res)=> {
    if (!req.body.status) {
        return res.status(400).json({blad: "Brak nowego statusu"});
    }
    const idNaprawy = req.params.id;
    const aktualizujStatus = db.prepare(`
        UPDATE NAPRAWY SET status = ? WHERE id = ?
        `);
    const wynik = aktualizujStatus.run(req.body.status, idNaprawy);

    if (wynik.changes === 0) {
        return res.status(400).json({blad: "Nie znaleziono naprawy o podanym ID"});
    }
    return res.status(200).json({wiadomosc: "Status naprawy zaktualizowany"});
})

app.get('/naprawy', (req, res)=> {
    try {
        const zapytanieNaprawy = db.prepare(
            'SELECT naprawy.*, klienci.imie_nazwisko FROM NAPRAWY JOIN KLIENCI ON Klienci.id=Naprawy.id_klienta').all();
            res.status(200).json({listaNapraw: zapytanieNaprawy});
    
        } catch (err) {
            res.status(500).json({blad: "Blad bazy danych"});
        }
        })

app.get('/magazyn', (req, res)=> {
    try {
        const zapytanieMagazyn = db.prepare(
            'SELECT * FROM MAGAZYN'
        ).all();
        res.status(200).json({Magazyn: zapytanieMagazyn})
    } catch (err) {
        res.status(500).json({blad: "Blad bazy danych"});
    }
});

app.post('/magazyn', (req, res)=> {
    if (!req.body.nazwa_czesci || !req.body.stan_magazynowy || !req.body.cena) {
        return res.status(400).json({blad: "NIEPELNE DANE"});      
    }
    const zapytanie = db.prepare(
            `INSERT INTO MAGAZYN (nazwa_czesci, stan_magazynowy, cena) VALUES
            (?, ?, ?)`
        );
    try {
        const zapytanieMagazyn = zapytanie.run(req.body.nazwa_czesci, req.body.stan_magazynowy, req.body.cena);
        res.status(201).json({Sukces: "Dodano część",
            id_czesci: zapytanieMagazyn.lastInsertRowid
        });
    } catch (err) {
        res.status(500).json({Blad: "Blad bazy danych"});
    }
        
})

app.listen(PORT, ()=> {
    console.log(`SERWER DZIALA NA adresie http://localhost:${PORT}`);
});

