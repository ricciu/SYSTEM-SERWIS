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

const tworzenieKosztorys = db.prepare(
    `CREATE TABLE IF NOT EXISTS KOSZTORYS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_zlecenia INTEGER NOT NULL,
    id_czesci INTEGER NOT NULL,
    cena_koncowa NUMERIC NOT NULL,
    FOREIGN KEY (id_zlecenia) REFERENCES naprawy(id),
    FOREIGN KEY (id_czesci) REFERENCES magazyn(id)
    )`
)
tworzenieKosztorys.run();

const sprawdzMagazyn = db.prepare('SELECT COUNT(*) as count FROM Magazyn');
if (sprawdzMagazyn.count===0) {
    const dodajCzesc = db.prepare('INSERT INTO MAGAZYN (nazwa_czesci, stan_magazynowy, cena) VALUES (?, ?, ?)');
    const wstawStartowe = db.transaction(()=> {
        dodajCzesc.run('Wymiana matrycy', 10, 350.0);
        dodajCzesc.run('Czyszczenie układu chłodzenia', 15, 120.0);
        dodajCzesc.run('Wymiana baterii', 20, 150.0);
        dodajCzesc.run('Diagnoza', 999, 50.00);
    });
    wstawStartowe();
}
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
        return res.status(404).json({blad: "Nie znaleziono klienta o danym ID"});
    }
})
const DOZWOLONE_STATUSY = [
    'Przyjęto',
    'W trakcie diagnozy',
    'Czeka na części',
    'Gotowe',
    'Odebrane'
];
app.put('/naprawy/:id', (req, res)=> {
    if (!req.body.status) {
        return res.status(400).json({blad: "Brak nowego statusu"});
    }
    if (!DOZWOLONE_STATUSY.includes(req.body.status)) {
        return res.status(400).json({
                blad: "Niepoprawny status",
                dozwolone: DOZWOLONE_STATUSY
            });
        }
    const idNaprawy = req.params.id;
    const aktualizujStatus = db.prepare(`
        UPDATE NAPRAWY SET status = ? WHERE id = ?
        `);
    const wynik = aktualizujStatus.run(req.body.status, idNaprawy);

    if (wynik.changes === 0) {
        return res.status(404).json({blad: "Nie znaleziono naprawy o podanym ID"});
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

app.get('/naprawy/:id', (req, res)=> {
    const idNaprawy = req.params.id;
    try {
        const zapytanie = db.prepare('SELECT Naprawy.*, Klienci.imie_nazwisko, Klienci.nr_tel FROM Naprawy JOIN Klienci ON Klienci.id = Naprawy.id_klienta WHERE Naprawy.id= ?');
        const szczegolyNaprawy = zapytanie.get(idNaprawy);

        const zapytanieKosztorys = db.prepare(`SELECT Kosztorys.id AS id_kosztorysu, Magazyn.nazwa_czesci, Kosztorys.cena_koncowa AS cena FROM Magazyn JOIN Kosztorys ON Magazyn.id=Kosztorys.id_czesci WHERE Kosztorys.id_zlecenia=?
`).all(idNaprawy);
        
        return res.status(200).json({szczegolyNaprawy: szczegolyNaprawy, kosztorys: zapytanieKosztorys});
    } catch (err) {
        res.status(500).json({blad: "Blad  bazy danych"});
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
    if (!req.body.nazwa_czesci || req.body.stan_magazynowy === undefined || req.body.cena===undefined) {
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

app.post('/kosztorys', (req, res)=>{
    try {
        const id_zlecenia = req.body.id_zlecenia;
        const id_czesci = req.body.id_czesci;
        const cena = req.body.cena;
        const zapytanie = db.prepare(`INSERT INTO KOSZTORYS (id_zlecenia, id_czesci, cena_koncowa) VALUES
    (?, ?, ?)`);
        const zapytanieKosztorys = zapytanie.run(id_zlecenia, id_czesci, cena);
        res.status(201).json({Sukces: "Dodano kosztorys", id_kosztorysu: zapytanieKosztorys.lastInsertRowid })
    }
    catch (err) {
        res.status(500).json({Blad: "BLAD DODAWANIA DO BAZY DANYCH"})
    }
})

app.delete('/kosztorys/:id', (req, res)=> {
    try {
        const idDoUsuniecia = req.params.id;
        const zapytanie = db.prepare('DELETE FROM Kosztorys WHERE id = ?');
        const usuniecie = zapytanie.run(idDoUsuniecia);
        res.status(201).json({Sukces: "Poprawnie usunieto wiersz"});
    }   
    catch (err) {
        res.status(500).json({Blad: "Blad usuwania wiersza"});
    } 
});

app.put('/kosztorys/:id', (req, res)=> {
    try {
        const nowaCena = req.body.cena;
        const idDoUsuniecia = req.params.id;
        const zapytanie = db.prepare('UPDATE KOSZTORYS SET cena_koncowa = ? WHERE id = ?')
        const aktualizacja = zapytanie.run(nowaCena, idDoUsuniecia)
        res.status(201).json({Sukces: "Pomyslnie zaktualizowano rekord"});
    }
    catch (err) {
        res.status(500).json({Blad: "Blad aktualizacji"});
    }
})

app.listen(PORT, ()=> {
    console.log(`SERWER DZIALA NA adresie http://localhost:${PORT}`);
});
