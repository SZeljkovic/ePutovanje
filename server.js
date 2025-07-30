const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require('crypto');

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

// Pracenje broja neuspjelih pokusaja
const failedAttempts = {};

// Max broj pokusaja
const MAX_ATTEMPTS = 3;



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


async function authenticateAdmin(req, res, next) {
    if (!req.user || !req.user.KorisnickoIme) {
        return res.status(401).json({ error: "Pristup odbijen. Token ne sadrži korisničko ime." });
    }

    const korisnickoIme = req.user.KorisnickoIme;

    try {
        const [results] = await db.promise().query("SELECT TipKorisnika FROM korisnik WHERE KorisnickoIme = ?", [korisnickoIme]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const tip = results[0].TipKorisnika;
        if (tip !== 0) {
            return res.status(403).json({ error: "Pristup dozvoljen samo administratorima." });
        }

        next(); 
    } catch (err) {
        console.error("Greška pri provjeri tipa korisnika:", err);
        return res.status(500).json({ error: "Greška na serveru." });
    }
}


async function authenticateAgency(req, res, next) {
    if (!req.user || !req.user.KorisnickoIme) {
        return res.status(401).json({ error: "Pristup odbijen. Token ne sadrži korisničko ime." });
    }

    const korisnickoIme = req.user.KorisnickoIme;

    try {
        const [results] = await db.promise().query("SELECT TipKorisnika FROM korisnik WHERE KorisnickoIme = ?", [korisnickoIme]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const tip = results[0].TipKorisnika;
        if (tip !== 1) {
            return res.status(403).json({ error: "Pristup dozvoljen samo turističkim agencijama." });
        }

        next(); 
    } catch (err) {
        console.error("Greška pri provjeri tipa korisnika:", err);
        return res.status(500).json({ error: "Greška na serveru." });
    }
}



app.post('/register', async (req, res) => {
    const {
        Ime,
        Prezime,
        NazivAgencije,
        DatumRodjenja,
        KorisnickoIme,
        Lozinka,
        TipKorisnika,
        Email
    } = req.body;

    //  Validacija: Dozvoljeni su samo tipovi 1 (agencija) i 2 (klijent)
    if (TipKorisnika !== 1 && TipKorisnika !== 2) {
        return res.status(400).json({ error: "Nevažeći tip korisnika." });
    }

    //  Validacija obaveznih polja
    if (!KorisnickoIme || !Lozinka || !Email) {
        return res.status(400).json({ error: "Korisničko ime, lozinka i email su obavezni." });
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
            (Ime, Prezime, NazivAgencije, DatumRodjenja, KorisnickoIme, Lozinka, TipKorisnika, StatusNaloga, Email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.promise().query(insertQuery, [
            TipKorisnika === 2 ? Ime : null,
            TipKorisnika === 2 ? Prezime : null,
            TipKorisnika === 1 ? NazivAgencije : null,
            TipKorisnika === 2 ? DatumRodjenja : null,
            KorisnickoIme,
            hashedPassword,
            TipKorisnika,
            StatusNaloga,
            Email
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




//Pregled profila
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const korisnikId = req.user.idKORISNIK; 

        const query = `
            SELECT 
                k.idKORISNIK, 
                k.Ime, 
                k.Prezime, 
                k.NazivAgencije, 
                k.DatumRodjenja, 
                k.KorisnickoIme, 
                k.TipKorisnika,
                k.StatusNaloga,
                k.Email
            FROM korisnik k
            WHERE k.idKORISNIK = ?
        `;

        const [rows] = await db.promise().query(query, [korisnikId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const user = rows[0]; // id

        res.json({
            message: "Profil uspješno učitan.",
            user: user
        });
    } catch (err) {
        console.error("Greška pri učitavanju profila:", err);
        res.status(500).json({ error: "Greška na serveru prilikom učitavanja profila." });
    }
});



//Pregled tudjeg profila
app.get('/profile/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.idKORISNIK;

    try {
        // Tip korisnika koji salje zahtjev
        const [requesterRow] = await db.promise().query(
            "SELECT TipKorisnika FROM korisnik WHERE idKORISNIK = ?",
            [requesterId]
        );

        if (requesterRow.length === 0) {
            return res.status(404).json({ error: "Requester korisnik nije pronađen." });
        }

        const requesterTip = requesterRow[0].TipKorisnika;

        if (requesterTip === 2) {
            return res.status(403).json({ error: "Klijenti ne mogu pregledati tuđe profile." });
        }

        // Dohvati target korisnika
        const [targetRow] = await db.promise().query(
            "SELECT idKORISNIK, Ime, Prezime, NazivAgencije, DatumRodjenja, KorisnickoIme, TipKorisnika, Email FROM korisnik WHERE idKORISNIK = ?",
            [id]
        );

        if (targetRow.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const targetUser = targetRow[0];

        // Ako je requester agencija, a target nije klijent – zabrani
        if (requesterTip === 1 && targetUser.TipKorisnika !== 2) {
            return res.status(403).json({ error: "Agencije mogu pregledati samo profile klijenata." });
        }


        res.json({
            message: "Profil korisnika uspješno učitan.",
            user: targetUser
        });

    } catch (err) {
        console.error("Greška pri učitavanju profila:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});

//kreiranje administratorskog naloga (samo administrator moze kreirati ostale administratorske naloge)
app.post('/register-admin', authenticateToken, authenticateAdmin, async (req, res) => {
    const { Ime, Prezime, KorisnickoIme, Lozinka, Email } = req.body;

    if (!Ime || !Prezime || !KorisnickoIme || !Lozinka || !Email) {
        return res.status(400).json({ error: "Sva polja su obavezna za administratorski nalog." });
    }

    try {
        // Provjera da li korisničko ime već postoji
        const [existing] = await db.promise().query(
            "SELECT * FROM korisnik WHERE KorisnickoIme = ?",
            [KorisnickoIme]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: "Korisničko ime već postoji." });
        }

        // Heširanje lozinke
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Lozinka, saltRounds);

        // TipKorisnika za admina je 0, StatusNaloga odmah aktivan (1)
        const TipKorisnika = 0;
        const StatusNaloga = 1;

        // Ubacivanje u bazu
        const insertQuery = `
            INSERT INTO korisnik
            (Ime, Prezime, KorisnickoIme, Lozinka, TipKorisnika, StatusNaloga, Email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.promise().query(insertQuery, [
            Ime,
            Prezime,
            KorisnickoIme,
            hashedPassword,
            TipKorisnika,
            StatusNaloga,
            Email
        ]);

        return res.status(201).json({ message: "Administratorski nalog uspješno kreiran." });
    } catch (err) {
        console.error("Greška pri kreiranju administratorskog naloga:", err);
        return res.status(500).json({ error: "Greška na serveru." });
    }
});



app.post('/forgot-password', async (req, res) => {
    const { KorisnickoIme } = req.body;

    if (!KorisnickoIme) {
        return res.status(400).json({ error: "Unesite korisničko ime." });
    }

    try {
        // Provjera da li korisnik postoji
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE KorisnickoIme = ?",
            [KorisnickoIme]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const korisnik = rows[0];

        // Generiši novu privremenu lozinku
        const novaLozinka = crypto.randomBytes(6).toString('hex'); // npr. 12 karaktera
        const hashedLozinka = await bcrypt.hash(novaLozinka, 10);

        // Ažuriraj lozinku u bazi
        await db.promise().query(
            "UPDATE korisnik SET Lozinka = ? WHERE KorisnickoIme = ?",
            [hashedLozinka, KorisnickoIme]
        );

        // Pošalji mejl sa novom lozinkom
        const transporter = nodemailer.createTransport({
            host: "live.smtp.mailtrap.io",
            port: 587,
            secure: false,
            auth: {
                user: "api",
                pass: "a2a56baeace0bb97be50120d4be74573",
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        /*const info = await transporter.sendMail({
            from: '"ePutovanje" <eputovanje@gmail.com>',
            to: korisnik.Email,
            subject: "Privremena lozinka",
            text: `Vaša nova privremena lozinka je: ${novaLozinka}`,
            html: `<p>Poštovani,</p><p>Vaša nova privremena lozinka je: <b>${novaLozinka}</b></p><p>Preporučujemo da je odmah promijenite nakon prijave.</p>`,
        });*/

        //console.log("Mejl poslat:", info.messageId);

        // Vrati korisniku novu lozinku u odgovoru (za testiranje)
        res.status(200).json({
            message: "Nova lozinka je poslana na e-mail.",
            novaLozinka: novaLozinka // ovo ukloniti u produkciji
        });

    } catch (error) {
        console.error("Greška pri resetu lozinke:", error);
        res.status(500).json({ error: "Greška na serveru pri resetu lozinke." });
    }
});


app.delete('/delete-profile/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const idKorisnik = req.params.id;

    try {
        // Provjera da li korisnik postoji
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE idKORISNIK = ?",
            [idKorisnik]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        // Ne dozvoli adminu da obriše sam sebe
        if (parseInt(idKorisnik) === req.user.idKORISNIK) {
            return res.status(400).json({ error: "Ne možete obrisati svoj administratorski nalog." });
        }

        // Brisanje korisnika
        await db.promise().query(
            "DELETE FROM korisnik WHERE idKORISNIK = ?",
            [idKorisnik]
        );

        res.json({ message: "Korisnik je uspješno obrisan." });

    } catch (err) {
        console.error("Greška pri brisanju korisnika:", err);
        res.status(500).json({ error: "Greška na serveru prilikom brisanja korisnika." });
    }
});









// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
