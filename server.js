const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import baze
const db = require('./db');

// Test ruta
app.get('/', (req, res) => {
    res.send('ePutovanje backend radi!');
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Pristup odbijen. Token nije dostavljen." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Neispravan token." });

        req.user = user;
        next();
    });
}

function authenticateAdmin(req, res, next) {
    if (!req.user || !req.user.KorisnickoIme) {
        return res.status(401).json({ error: "Pristup odbijen. Token ne sadrži korisničko ime." });
    }

    const korisnickoIme = req.user.KorisnickoIme;

    const query = "SELECT TipKorisnika FROM korisnik WHERE KorisnickoIme = ?";
    db.query(query, [korisnickoIme], (err, results) => {
        if (err) {
            console.error("Greška pri provjeri tipa korisnika:", err);
            return res.status(500).json({ error: "Greška na serveru." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const tip = results[0].TipKorisnika;
        if (tip !== 0) {
            return res.status(403).json({ error: "Pristup dozvoljen samo administratorima." });
        }

        next();
    });
}

app.post('/register', async (req, res) => {
    const {
        Ime,
        Prezime,
        NazivAgencije,
        DatumRodjenja,
        KorisnickoIme,
        Lozinka,
        TipKorisnika
    } = req.body;

    //  Validacija: Dozvoljeni su samo tipovi 1 (agencija) i 2 (klijent)
    if (TipKorisnika !== 1 && TipKorisnika !== 2) {
        return res.status(400).json({ error: "Nevažeći tip korisnika." });
    }

    //  Validacija obaveznih polja
    if (!KorisnickoIme || !Lozinka) {
        return res.status(400).json({ error: "Korisničko ime i lozinka su obavezni." });
    }

    if (TipKorisnika === 2) {
        if (!Ime || !Prezime || !DatumRodjenja) {
            return res.status(400).json({ error: "Ime, prezime i datum rođenja su obavezni za klijente." });
        }
    } else if (TipKorisnika === 1) {
        if (!NazivAgencije) {
            return res.status(400).json({ error: "Naziv agencije je obavezan za turističke agencije." });
        }
    }

    try {
        //  Heširanje lozinke
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Lozinka, saltRounds);

        //  Provjera da li korisničko ime već postoji
        const [existing] = await db.promise().query(
            "SELECT * FROM korisnik WHERE KorisnickoIme = ?",
            [KorisnickoIme]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: "Korisničko ime već postoji." });
        }

        //  Određivanje statusa naloga
        const StatusNaloga = TipKorisnika === 1 ? 0 : 1;

        //  Upit za ubacivanje u bazu
        const insertQuery = `
            INSERT INTO korisnik 
            (Ime, Prezime, NazivAgencije, DatumRodjenja, KorisnickoIme, Lozinka, TipKorisnika, StatusNaloga)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.promise().query(insertQuery, [
            TipKorisnika === 2 ? Ime : null,
            TipKorisnika === 2 ? Prezime : null,
            TipKorisnika === 1 ? NazivAgencije : null,
            TipKorisnika === 2 ? DatumRodjenja : null,
            KorisnickoIme,
            hashedPassword,
            TipKorisnika,
            StatusNaloga
        ]);

        return res.status(201).json({ message: "Korisnik uspješno registrovan." });
    } catch (err) {
        console.error("Greška pri registraciji:", err);
        return res.status(500).json({ error: "Greška na serveru prilikom registracije." });
    }
});




app.put('/login', async (req, res) => {
    const { KorisnickoIme, Lozinka } = req.body;

    if (!KorisnickoIme || !Lozinka) {
        return res.status(400).json({ error: "Unesite korisničko ime i lozinku." });
    }

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE KorisnickoIme = ?",
            [KorisnickoIme]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Pogrešno korisničko ime ili lozinka." });
        }

        const user = rows[0];

        // Provjera statusa naloga (0 = neaktivan, 1 = aktivan)
        if (user.StatusNaloga === 0) {
            return res.status(403).json({ error: "Vaš nalog još nije odobren od strane administratora." });
        }

        const passwordMatch = await bcrypt.compare(Lozinka, user.Lozinka);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Pogrešno korisničko ime ili lozinka." });
        }

        // Kreiranje JWT tokena
        const token = jwt.sign(
            {
                idKORISNIK: user.idKORISNIK,
                KorisnickoIme: user.KorisnickoIme
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Uspješno ste prijavljeni.",
            token,
            korisnik: {
                idKORISNIK: user.idKORISNIK,
                KorisnickoIme: user.KorisnickoIme,
                TipKorisnika: user.TipKorisnika
            }
        });

    } catch (err) {
        console.error("Greška prilikom prijave:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});








// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
