const Database = require('better-sqlite3');
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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
    opis_prac TEXT,
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
const tworzenieHistoria = db.prepare(
    `CREATE TABLE IF NOT EXISTS HISTORIA(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_naprawy INTEGER NOT NULL,
    typ TEXT NOT NULL CHECK (typ IN ('system', 'notatka')),
    tresc TEXT NOT NULL,
    data_utworzenia DATETIME DEFAULT CURRENT_TIMESTAMP,
    autor TEXT,
    poprzednio TEXT,
    FOREIGN KEY (id_naprawy) REFERENCES naprawy(id)
    )`
)

tworzenieHistoria.run();

// Migracje: CREATE TABLE IF NOT EXISTS nie zmienia istniejących tabel,
// więc brakujące kolumny dodajemy ręcznie.
function maKolumne(tabela, kolumna) {
    return db.prepare(`PRAGMA table_info(${tabela})`).all().some((k) => k.name === kolumna);
}
if (!maKolumne('HISTORIA', 'autor')) {
    db.exec("ALTER TABLE HISTORIA ADD COLUMN autor TEXT");
}
if (!maKolumne('HISTORIA', 'poprzednio')) {
    db.exec("ALTER TABLE HISTORIA ADD COLUMN poprzednio TEXT");
}
if (!maKolumne('NAPRAWY', 'opis_prac')) {
    db.exec("ALTER TABLE NAPRAWY ADD COLUMN opis_prac TEXT");
    // dawne "kroki serwisanta" (wpisy typu 'notatka') łączymy w jeden opis prac
    db.exec(`UPDATE NAPRAWY SET opis_prac = (
            SELECT group_concat(tresc, char(10)) FROM HISTORIA
            WHERE HISTORIA.id_naprawy = NAPRAWY.id AND HISTORIA.typ = 'notatka')
        WHERE EXISTS (
            SELECT 1 FROM HISTORIA WHERE HISTORIA.id_naprawy = NAPRAWY.id AND HISTORIA.typ = 'notatka')`);
}

// Historia zmian: wpisy typu 'system' zapisuje wyłącznie backend,
// zawsze w tej samej transakcji co sama zmiana.
const wstawLog = db.prepare("INSERT INTO HISTORIA (id_naprawy, typ, tresc, autor, poprzednio) VALUES (?, 'system', ?, ?, ?)");
function zapiszLog(idNaprawy, tresc, autor, poprzednio = null) {
    wstawLog.run(idNaprawy, tresc, autor, poprzednio);
}

// "Kto": aplikacja nie ma logowania, więc nazwę serwisanta wysyła frontend w nagłówku
// X-Operator (zakodowaną, bo nagłówki nie przenoszą polskich znaków). To podpis, a nie uwierzytelnienie.
function autorZmiany(req) {
    const naglowek = req.get('X-Operator');
    if (!naglowek) return 'Nieznany';
    try {
        return decodeURIComponent(naglowek).trim().slice(0, 40) || 'Nieznany';
    } catch {
        return 'Nieznany';
    }
}
function kwota(wartosc) {
    return Number(wartosc).toFixed(2).replace('.', ',') + ' zł';
}
function skroc(tekst, max = 60) {
    return tekst.length > max ? tekst.slice(0, max) + '…' : tekst;
}

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
    try {
        const naprawa = db.prepare("SELECT status FROM NAPRAWY WHERE id = ?").get(idNaprawy);
        if (naprawa === undefined) {
            return res.status(404).json({blad: "Nie znaleziono naprawy o podanym ID"});
        }
        // zmiana statusu i wpis w historii zapisują się razem albo wcale
        const zmienStatus = db.transaction(() => {
            db.prepare("UPDATE NAPRAWY SET status = ? WHERE id = ?").run(req.body.status, idNaprawy);
            if (naprawa.status !== req.body.status) {
                zapiszLog(idNaprawy, `Status: ${naprawa.status} → ${req.body.status}`, autorZmiany(req));
            }
        });
        zmienStatus();
        return res.status(200).json({wiadomosc: "Status naprawy zaktualizowany"});
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({blad: "Blad bazy danych"});
    }
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
        const dodajPozycje = db.transaction(() => {
            const wynik = zapytanie.run(id_zlecenia, id_czesci, cena);
            const czesc = db.prepare("SELECT nazwa_czesci FROM MAGAZYN WHERE id = ?").get(id_czesci);
            zapiszLog(id_zlecenia, `Kosztorys: dodano „${czesc.nazwa_czesci}” (${kwota(cena)})`, autorZmiany(req));
            return wynik;
        });
        const zapytanieKosztorys = dodajPozycje();
        res.status(201).json({Sukces: "Dodano kosztorys", id_kosztorysu: zapytanieKosztorys.lastInsertRowid })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({Blad: "BLAD DODAWANIA DO BAZY DANYCH"})
    }
})

app.delete('/kosztorys/:id', (req, res)=> {
    try {
        const idDoUsuniecia = req.params.id;
        // dane pozycji pobieramy PRZED usunięciem, bo potem już ich nie ma
        const pozycja = db.prepare(`SELECT Kosztorys.id_zlecenia, Kosztorys.cena_koncowa, Magazyn.nazwa_czesci
            FROM Kosztorys JOIN Magazyn ON Magazyn.id = Kosztorys.id_czesci
            WHERE Kosztorys.id = ?`).get(idDoUsuniecia);
        if (pozycja === undefined) {
            return res.status(404).json({Blad: "Nie znaleziono pozycji kosztorysu"});
        }
        const usunPozycje = db.transaction(() => {
            db.prepare('DELETE FROM Kosztorys WHERE id = ?').run(idDoUsuniecia);
            zapiszLog(pozycja.id_zlecenia, `Kosztorys: usunięto „${pozycja.nazwa_czesci}” (${kwota(pozycja.cena_koncowa)})`, autorZmiany(req));
        });
        usunPozycje();
        res.status(200).json({Sukces: "Poprawnie usunieto wiersz"});
    }   
    catch (err) {
        res.status(500).json({Blad: "Blad usuwania wiersza"});
    } 
});

app.put('/kosztorys/:id', (req, res)=> {
    try {
        const nowaCena = req.body.cena;
        const idDoUsuniecia = req.params.id;
        if (nowaCena === undefined || nowaCena === "" || Number.isNaN(Number(nowaCena))) {
            return res.status(400).json({Blad: "Niepoprawna cena"});
        }
        const pozycja = db.prepare(`SELECT Kosztorys.id_zlecenia, Kosztorys.cena_koncowa, Magazyn.nazwa_czesci
            FROM Kosztorys JOIN Magazyn ON Magazyn.id = Kosztorys.id_czesci
            WHERE Kosztorys.id = ?`).get(idDoUsuniecia);
        if (pozycja === undefined) {
            return res.status(404).json({Blad: "Nie znaleziono pozycji kosztorysu"});
        }
        const zmienCene = db.transaction(() => {
            db.prepare('UPDATE KOSZTORYS SET cena_koncowa = ? WHERE id = ?').run(nowaCena, idDoUsuniecia);
            if (Number(pozycja.cena_koncowa) !== Number(nowaCena)) {
                zapiszLog(pozycja.id_zlecenia, `Kosztorys: „${pozycja.nazwa_czesci}” ${kwota(pozycja.cena_koncowa)} → ${kwota(nowaCena)}`, autorZmiany(req));
            }
        });
        zmienCene();
        res.status(200).json({Sukces: "Pomyslnie zaktualizowano rekord"});
    }
    catch (err) {
        res.status(500).json({Blad: "Blad aktualizacji"});
    }
})

app.get('/naprawy/:id/historia', (req, res) => {
    const idNaprawy = req.params.id;    
    try {
        const zapytanieHistoria = db.prepare("SELECT * FROM HISTORIA WHERE Historia.id_naprawy=? ORDER BY data_utworzenia DESC, id DESC");
        const odpowiedzHistoria = zapytanieHistoria.all(idNaprawy);
        res.status(200).json({historia: odpowiedzHistoria});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({blad: "BLAD ODCZYTU"});
    }
})

// Opis wykonanych prac: jedno pole na naprawę, edytowane w miejscu.
// Każda zmiana trafia do historii zmian (kto, kiedy, co), a poprzednia wersja
// opisu zostaje zapisana w kolumnie "poprzednio", żeby dało się ją przejrzeć w razie potrzeby.
app.put('/naprawy/:id/opis', (req, res) => {
    try {
        const idNaprawy = req.params.id;
        const opis = req.body?.opis;
        if (typeof opis !== 'string') {
            return res.status(400).json({blad: "Niepoprawny opis"});
        }
        const nowyOpis = opis.trim();
        if (nowyOpis.length > 5000) {
            return res.status(400).json({blad: "Opis jest za dlugi (maksymalnie 5000 znakow)"});
        }
        const naprawa = db.prepare("SELECT opis_prac FROM NAPRAWY WHERE id = ?").get(idNaprawy);
        if (naprawa === undefined) {
            return res.status(404).json({blad: "Nie znaleziono naprawy o podanym ID"});
        }
        const staryOpis = (naprawa.opis_prac || "").trim();
        if (staryOpis === nowyOpis) {
            return res.status(200).json({wiadomosc: "Bez zmian", opis: nowyOpis});
        }
        let wpis;
        if (staryOpis === "") {
            wpis = `Opis prac: dodano opis „${skroc(nowyOpis, 50)}”`;
        }
        else if (nowyOpis === "") {
            wpis = "Opis prac: usunięto opis";
        }
        else {
            wpis = `Opis prac: zmieniono opis (${staryOpis.length} → ${nowyOpis.length} znaków)`;
        }
        const zapiszOpis = db.transaction(() => {
            db.prepare("UPDATE NAPRAWY SET opis_prac = ? WHERE id = ?").run(nowyOpis, idNaprawy);
            zapiszLog(idNaprawy, wpis, autorZmiany(req), staryOpis === "" ? null : staryOpis);
        });
        zapiszOpis();
        res.status(200).json({wiadomosc: "Zapisano opis", opis: nowyOpis});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({blad: "BLAD ZAPISU OPISU"});
    }
})

app.listen(PORT, ()=> {
    console.log(`SERWER DZIALA NA adresie http://localhost:${PORT}`);
});
