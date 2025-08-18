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

// Vrijeme cekanja
const LOCKOUT_TIME = 1 * 60 * 1000;



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



// Uredjivanje profila
app.put('/edit-profile', authenticateToken, async (req, res) => {
    const korisnikId = req.user.idKORISNIK;
    const {
        Ime,
        Prezime,
        NazivAgencije,
        DatumRodjenja,
        NovaLozinka,
        StaraLozinka,
        Email
    } = req.body;

    try {
        // Dohvati trenutne podatke korisnika
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE idKORISNIK = ?",
            [korisnikId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        const user = rows[0];

        // Ako korisnik pokušava promijeniti lozinku:
        if (NovaLozinka) {
            if (!StaraLozinka) {
                return res.status(400).json({ error: "Unesite staru lozinku radi potvrde." });
            }

            // Provjeri broj pokusaja
            const attempt = failedAttempts[korisnikId] || { count: 0, lastAttempt: null };
            if (attempt.count >= MAX_ATTEMPTS) {
                const timeLeft = LOCKOUT_TIME - (Date.now() - attempt.lastAttempt);
                if (timeLeft > 0) {
                    return res.status(403).json({
                        error: `Previše neuspjelih pokušaja. Pokušajte ponovo za ${Math.ceil(timeLeft / 1000)} sekundi.`
                    });
                }
            }
            const match = await bcrypt.compare(StaraLozinka, user.Lozinka);

            if (!match) {
                failedAttempts[korisnikId] = {
                    count: attempt.count + 1,
                    lastAttempt: Date.now()
                };

                const remaining = MAX_ATTEMPTS - failedAttempts[korisnikId].count;
                return res.status(401).json({
                    error: `Pogrešna lozinka. Možete pokušati još ${remaining} puta ili resetovati lozinku.`,
                    allowReset: attempt.count + 1 < MAX_ATTEMPTS
                });
            }

            // Ako se lozinke poklapaju
            const hashedNew = await bcrypt.hash(NovaLozinka, 10);
            await db.promise().query(
                "UPDATE korisnik SET Lozinka = ? WHERE idKORISNIK = ?",
                [hashedNew, korisnikId]
            );

            delete failedAttempts[korisnikId];
        }

        const novoIme = Ime !== undefined ? Ime : user.Ime;
        const novoPrezime = Prezime !== undefined ? Prezime : user.Prezime;
        const noviNazivAgencije = NazivAgencije !== undefined ? NazivAgencije : user.NazivAgencije;
        const noviEmail = Email !== undefined ? Email : user.Email;
        const noviDatumRodjenja = DatumRodjenja !== undefined ? DatumRodjenja : user.DatumRodjenja;

        await db.promise().query(`
            UPDATE korisnik
            SET Ime = ?, Prezime = ?, NazivAgencije = ?, DatumRodjenja = ?, Email = ?
            WHERE idKORISNIK = ?
        `, [novoIme, novoPrezime, noviNazivAgencije, noviDatumRodjenja, noviEmail, korisnikId]);


        const [updatedRows] = await db.promise().query(
            "SELECT idKORISNIK, Ime, Prezime, NazivAgencije, DatumRodjenja, Email FROM korisnik WHERE idKORISNIK = ?",
            [korisnikId]
        );

        res.json({
            message: "Profil uspješno ažuriran.",
            user: updatedRows[0]
        });

    } catch (err) {
        console.error("Greška prilikom ažuriranja profila:", err);
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

// pregled svih profila (samo za administratore)
app.get('/all-profiles', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                idKORISNIK, 
                Ime, 
                Prezime, 
                NazivAgencije, 
                DatumRodjenja, 
                KorisnickoIme, 
                TipKorisnika, 
                StatusNaloga, 
                Email
            FROM korisnik
            WHERE StatusNaloga = 1
        `;

        const [rows] = await db.promise().query(query);

        res.json({
            message: "Lista svih korisničkih profila uspješno učitana.",
            korisnici: rows
        });

    } catch (err) {
        console.error("Greška pri učitavanju svih profila:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});



// Dohvatanje svih suspendovanih naloga (samo admin)
app.get('/suspended-accounts', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE StatusNaloga = -1"
        );

        res.json({
            message: "Suspendovani nalozi uspješno dohvaćeni.",
            suspendovaniNalozi: rows
        });
    } catch (err) {
        console.error("Greška pri dohvatanju suspendovanih naloga:", err);
        res.status(500).json({ error: "Greška na serveru prilikom dohvatanja suspendovanih naloga." });
    }
});



// Suspendovanje naloga (samo admin)
app.put('/suspend-account/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const idKorisnik = req.params.id;

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE idKORISNIK = ? AND StatusNaloga = 1",
            [idKorisnik]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        if (parseInt(idKorisnik) === req.user.idKORISNIK) {
            return res.status(400).json({ error: "Ne možete suspendovati svoj nalog." });
        }

        await db.promise().query(
            "UPDATE korisnik SET StatusNaloga = -1 WHERE idKORISNIK = ?",
            [idKorisnik]
        );

        return res.json({ message: "Nalog korisnika je suspendovan." });

    } catch (err) {
        console.error("Greška pri suspendovanju naloga:", err);
        return res.status(500).json({ error: "Greška na serveru prilikom suspendovanja naloga." });
    }
});



// Reaktivacija naloga (samo admin)
app.put('/reactivate-account/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const idKorisnik = req.params.id;

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE idKORISNIK = ? AND StatusNaloga = -1",
            [idKorisnik]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        await db.promise().query(
            "UPDATE korisnik SET StatusNaloga = 1 WHERE idKORISNIK = ?",
            [idKorisnik]
        );

        res.json({ message: "Nalog korisnika je ponovo aktiviran." });

    } catch (err) {
        console.error("Greška pri aktivaciji naloga:", err);
        res.status(500).json({ error: "Greška na serveru prilikom aktivacije naloga." });
    }
});




// Svi zahtjevi za odobravanje naloga turistickih agencija (samo admin)
app.get('/agency-requests', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT idKORISNIK, NazivAgencije, KorisnickoIme, Email 
             FROM korisnik 
             WHERE TipKorisnika = 1 AND StatusNaloga = 0`
        );

        res.json({
            message: "Zahtjevi agencija uspješno dohvaćeni.",
            agencyRequests: rows
        });
    } catch (err) {
        console.error("Greška pri dohvatanju zahtjeva:", err);
        res.status(500).json({ error: "Greška na serveru prilikom dohvatanja zahtjeva." });
    }
});



// Odobravanje naloga turisticke agencije (samo admin)
app.put('/agency-requests/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const idKorisnik = req.params.id;

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM korisnik WHERE idKORISNIK = ?",
            [idKorisnik]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronađen." });
        }

        if (parseInt(rows[0].StatusNaloga) === 1) {
            return res.status(400).json({ error: "Nalog je već odobren." });
        }

        if (parseInt(rows[0].StatusNaloga) === -1) {
            return res.status(400).json({ error: "Nalog je suspendovan. Ne može biti odobren." });
        }

        await db.promise().query(
            "UPDATE korisnik SET StatusNaloga = 1 WHERE idKORISNIK = ?",
            [idKorisnik]
        );

        const [updatedRows] = await db.promise().query(
            "SELECT idKorisnik, NazivAgencije, KorisnickoIme, Email, StatusNaloga FROM korisnik WHERE idKorisnik = ?",
            [idKorisnik]
        );

        res.json({
            message: "Nalog je uspješno odobren.",
            approvedAccount: updatedRows[0]
        });
    } catch (err) {
        console.error("Greška pri odobravanju naloga:", err);
        res.status(500).json({ error: "Greška na serveru prilikom odobravanja naloga." });
    }
});


app.post('/zahtjevi-ponuda', authenticateToken, authenticateAgency, async (req, res) => {
    const {
        cijena,
        opis,
        datumPolaska,
        datumPovratka,
        tipPrevoza,
        brojSlobodnihMjesta,
        najatraktivnijaPonuda,
        idDESTINACIJA // Dodajemo ID destinacije u tijelo zahtjeva
    } = req.body;

    if (!idDESTINACIJA) {
        return res.status(400).json({ error: "ID destinacije je obavezan." });
    }

    if (brojSlobodnihMjesta === undefined || brojSlobodnihMjesta < 1) {
        return res.status(400).json({ error: "Broj slobodnih mjesta ne može biti manji od 1." });
    }

    const idKorisnik = req.user.idKORISNIK;
    const datumObjavljivanja = new Date();
    const statusPonude = 0;

    try {
        // Prvo unosimo ponudu
        const [result] = await db.promise().query(`
            INSERT INTO ponuda (
                Cijena,
                Opis,
                DatumObjavljivanja,
                DatumPolaska,
                DatumPovratka,
                TipPrevoza,
                BrojSlobodnihMjesta,
                NajatraktivnijaPonuda,
                idKORISNIK,
                StatusPonude
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            cijena,
            opis,
            datumObjavljivanja,
            datumPolaska,
            datumPovratka,
            tipPrevoza,
            brojSlobodnihMjesta,
            najatraktivnijaPonuda ? 1 : 0,
            idKorisnik,
            statusPonude
        ]);

        const idPONUDA = result.insertId; // Dobijamo ID kreirane ponude

        // Zatim unosimo vezu ponuda <-> destinacija
        await db.promise().query(`
            INSERT INTO ponuda_has_destinacija (idPONUDA, idDESTINACIJA)
            VALUES (?, ?)
        `, [idPONUDA, idDESTINACIJA]);

        res.status(201).json({ message: "Ponuda uspješno kreirana i povezana s destinacijom. Čeka odobrenje administratora." });
    } catch (err) {
        console.error("Greška pri kreiranju ponude:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});



//odobravanje ili odbijanje zahtjeva za ponudu - administrator
app.put('/zahtjevi-ponuda/:id/status', authenticateToken, authenticateAdmin, async (req, res) => {
    const idPonude = req.params.id;
    const { StatusPonude } = req.body; // sada se očekuje broj: 1 ili -1

    if (![1, -1].includes(StatusPonude)) {
        return res.status(400).json({ error: "Dozvoljene vrijednosti za StatusPonude su 1 (odobrena) i -1 (poništena)." });
    }

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM ponuda WHERE idPONUDA = ?",
            [idPonude]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena." });
        }

        await db.promise().query(
            "UPDATE ponuda SET StatusPonude = ? WHERE idPONUDA = ?",
            [StatusPonude, idPonude]
        );

        const akcija = StatusPonude === 1 ? 'odobrena' : 'poništena';
        res.json({ message: `Ponuda je ${akcija}.` });
    } catch (err) {
        console.error("Greška pri ažuriranju ponude:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});

//pregled svih zahtjeva za kreiranje ponuda 
app.get('/zahtjevi-ponuda', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const [ponude] = await db.promise().query(
            "SELECT * FROM ponuda WHERE StatusPonude = 0"
        );
        res.json(ponude);
    } catch (err) {
        console.error("Greška pri dobavljanju ponuda:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});

//pregled pojedinacnog zahtjeva za ponude - administrator
app.get('/zahtjevi-ponuda/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const idPonude = req.params.id;

    try {
        const [rows] = await db.promise().query(`
            SELECT 
                p.idPONUDA,
                p.Cijena,
                p.Opis,
                p.DatumObjavljivanja,
                p.DatumPolaska,
                p.DatumPovratka,
                p.TipPrevoza,
                p.BrojSlobodnihMjesta,
                p.NajatraktivnijaPonuda,
                p.StatusPonude,
                k.Ime,
                k.Prezime,
                k.NazivAgencije,
                k.KorisnickoIme
            FROM ponuda p
            JOIN korisnik k ON p.idKORISNIK = k.idKORISNIK
            WHERE p.idPONUDA = ?
        `, [idPonude]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Greška pri dobavljanju ponude:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});




app.get('/ponude', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.idPONUDA,
                p.Cijena,
                p.Opis,
                p.DatumObjavljivanja,
                p.DatumPolaska,
                p.DatumPovratka,
                p.TipPrevoza,
                p.BrojSlobodnihMjesta,
                p.NajatraktivnijaPonuda,
                p.idKORISNIK,
                d.idDESTINACIJA,
                d.Naziv AS NazivDestinacije,
                d.Opis AS OpisDestinacije,
                d.Tip AS TipDestinacije
            FROM 
                ponuda p
            LEFT JOIN 
                ponuda_has_destinacija phd ON p.idPONUDA = phd.idPONUDA
            LEFT JOIN 
                destinacija d ON phd.idDESTINACIJA = d.idDESTINACIJA
            WHERE 
                p.StatusPonude = 1
            ORDER BY 
                p.DatumObjavljivanja DESC
        `;

        const [rows] = await db.promise().query(query);

        // Grupisanje ponuda po idPONUDA
        const ponudeMap = {};

        for (const row of rows) {
            if (!ponudeMap[row.idPONUDA]) {
                ponudeMap[row.idPONUDA] = {
                    idPONUDA: row.idPONUDA,
                    Cijena: row.Cijena,
                    Opis: row.Opis,
                    DatumObjavljivanja: row.DatumObjavljivanja,
                    DatumPolaska: row.DatumPolaska,
                    DatumPovratka: row.DatumPovratka,
                    TipPrevoza: row.TipPrevoza,
                    BrojSlobodnihMjesta: row.BrojSlobodnihMjesta,
                    NajatraktivnijaPonuda: !!row.NajatraktivnijaPonuda,
                    idKORISNIK: row.idKORISNIK,
                    Destinacije: []
                };
            }

            ponudeMap[row.idPONUDA].Destinacije.push({
                idDESTINACIJA: row.idDESTINACIJA,
                Naziv: row.NazivDestinacije,
                Opis: row.OpisDestinacije,
                Tip: row.TipDestinacije
            });
        }

        const ponude = Object.values(ponudeMap);
        res.json(ponude);

    } catch (err) {
        console.error("Greška pri dobavljanju ponuda:", err);
        res.status(500).json({ error: "Greška na serveru prilikom dobavljanja ponuda." });
    }
});


app.get('/ponuda/:id', async (req, res) => {
    const ponudaId = req.params.id;

    try {
        const query = `
            SELECT 
                p.idPONUDA,
                p.Cijena,
                p.Opis,
                p.DatumObjavljivanja,
                p.DatumPolaska,
                p.DatumPovratka,
                p.TipPrevoza,
                p.BrojSlobodnihMjesta,
                p.NajatraktivnijaPonuda,
                p.idKORISNIK,
                d.idDESTINACIJA,
                d.Naziv AS NazivDestinacije,
                d.Opis AS OpisDestinacije,
                d.Tip AS TipDestinacije
            FROM 
                ponuda p
            JOIN 
                ponuda_has_destinacija phd ON p.idPONUDA = phd.idPONUDA
            JOIN 
                destinacija d ON phd.idDESTINACIJA = d.idDESTINACIJA
            WHERE 
                p.idPONUDA = ?
        `;

        //Potencijalni ce i ovdje mozda trebati dodati where statusponude=1

        const [rows] = await db.promise().query(query, [ponudaId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena." });
        }

        const ponuda = {
            idPONUDA: rows[0].idPONUDA,
            Cijena: rows[0].Cijena,
            Opis: rows[0].Opis,
            DatumObjavljivanja: rows[0].DatumObjavljivanja,
            DatumPolaska: rows[0].DatumPolaska,
            DatumPovratka: rows[0].DatumPovratka,
            TipPrevoza: rows[0].TipPrevoza,
            BrojSlobodnihMjesta: rows[0].BrojSlobodnihMjesta,
            NajatraktivnijaPonuda: !!rows[0].NajatraktivnijaPonuda,
            idKORISNIK: rows[0].idKORISNIK,
            Destinacije: []
        };

        for (const row of rows) {
            ponuda.Destinacije.push({
                idDESTINACIJA: row.idDESTINACIJA,
                Naziv: row.NazivDestinacije,
                Opis: row.OpisDestinacije,
                Tip: row.TipDestinacije
            });
        }

        res.json(ponuda);

    } catch (err) {
        console.error("Greška pri dobavljanju ponude:", err);
        res.status(500).json({ error: "Greška na serveru prilikom dobavljanja ponude." });
    }
});


app.delete('/obrisi-ponudu/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const idPONUDA = req.params.id;

    try {
        // Prvo obriši sve veze između ponude i destinacija
        await db.promise().query(
            "DELETE FROM ponuda_has_destinacija WHERE idPONUDA = ?",
            [idPONUDA]
        );

        // Zatim obriši samu ponudu
        const [result] = await db.promise().query(
            "DELETE FROM ponuda WHERE idPONUDA = ?",
            [idPONUDA]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena." });
        }

        res.json({ message: "Ponuda uspješno obrisana." });

    } catch (err) {
        console.error("Greška pri brisanju ponude:", err);
        res.status(500).json({ error: "Greška na serveru prilikom brisanja ponude." });
    }
});

app.get('/destinacije', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM destinacija");
        res.json(rows);
    } catch (err) {
        console.error("Greška pri dohvaćanju destinacija:", err);
        res.status(500).json({ error: "Greška na serveru prilikom dohvaćanja destinacija." });
    }
});


app.post('/dodaj-destinaciju', authenticateToken, authenticateAdmin, async (req, res) => {
    const { Naziv, Opis, Tip } = req.body;

    if (!Naziv || !Opis || !Tip) {
        return res.status(400).json({ error: "Sva polja (Naziv, Opis, Tip) su obavezna." });
    }

    try {
        const [result] = await db.promise().query(
            "INSERT INTO destinacija (Naziv, Opis, Tip) VALUES (?, ?, ?)",
            [Naziv, Opis, Tip]
        );

        res.status(201).json({ message: "Destinacija uspješno dodana.", id: result.insertId });
    } catch (err) {
        console.error("Greška pri dodavanju destinacije:", err);
        res.status(500).json({ error: "Greška na serveru prilikom dodavanja destinacije." });
    }
});

app.delete('/destinacija/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {

        const [existing] = await db.promise().query(
            "SELECT * FROM destinacija WHERE idDESTINACIJA = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: "Destinacija nije pronađena." });
        }

        await db.promise().query(
            "DELETE FROM destinacija WHERE idDESTINACIJA = ?",
            [id]
        );

        res.json({ message: "Destinacija je uspješno obrisana." });
    } catch (err) {
        console.error("Greška pri brisanju destinacije:", err);
        res.status(500).json({ error: "Greška na serveru prilikom brisanja destinacije." });
    }
});


//pregled svojih ponuda - agencija 
app.get('/ponude/moje', authenticateToken, authenticateAgency, async (req, res) => {
    try {
        const idAgencije = req.user.idKORISNIK; // direktno iz tokena

        console.log("ID agencije koja šalje zahtjev:", idAgencije);

        const [ponude] = await db.promise().query(`
            SELECT * FROM ponuda WHERE idKorisnik = ?
        `, [idAgencije]);

        return res.json(ponude);

    } catch (err) {
        console.error("Greška pri dohvatu ponuda:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


// pregled pojedinacne ponude - agencija (moze samo svoje ponude gledati)
app.get('/ponude/moje/:id', authenticateToken, authenticateAgency, async (req, res) => {
    const idPONUDA = req.params.id;
    const idKorisnik = req.user.idKORISNIK;  // Koristimo idKORISNIK iz tokena direktno

    try {
        const [rows] = await db.promise().query(`
            SELECT 
                p.*, 
                d.Naziv AS NazivDestinacije, 
                d.Opis,
                d.Tip
            FROM ponuda p
            JOIN ponuda_has_destinacija phd ON p.idPONUDA = phd.idPONUDA
            JOIN destinacija d ON phd.idDESTINACIJA = d.idDESTINACIJA
            WHERE p.idPONUDA = ? AND p.idKORISNIK = ?
        `, [idPONUDA, idKorisnik]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena ili ne pripada ovoj agenciji." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Greška pri dohvaćanju ponude:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});




// izmjena ponude - agencija može mijenjati samo svoje ponude

app.put('/izmjenaponude/:id', authenticateToken, authenticateAgency, async (req, res) => {
    const idPONUDA = req.params.id;
    const idKorisnik = req.user.idKORISNIK;

    const {
        cijena,
        opis,
        datumPolaska,
        datumPovratka,
        tipPrevoza,
        brojSlobodnihMjesta,
        najatraktivnijaPonuda,
        idDESTINACIJA
    } = req.body;

    if (brojSlobodnihMjesta !== undefined && brojSlobodnihMjesta < 1) {
        return res.status(400).json({ error: "Broj slobodnih mjesta ne može biti manji od 1." });
    }

    try {
        // Provjeri da li ponuda pripada toj agenciji
        const [check] = await db.promise().query(`
            SELECT * FROM ponuda WHERE idPONUDA = ? AND idKORISNIK = ?
        `, [idPONUDA, idKorisnik]);

        if (check.length === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena ili ne pripada ovoj agenciji." });
        }

        // Ažuriranje ponude

        await db.promise().query(`
			UPDATE ponuda
			SET 
				Cijena = ?, 
				Opis = ?, 
				DatumPolaska = ?, 
				DatumPovratka = ?, 
				TipPrevoza = ?, 
				BrojSlobodnihMjesta = ?, 
				NajatraktivnijaPonuda = ?,
				StatusPonude = 0          -- reset statusa na "na čekanju odobrenja"
			WHERE idPONUDA = ?
		`, [
            cijena,
            opis,
            datumPolaska,
            datumPovratka,
            tipPrevoza,
            brojSlobodnihMjesta,
            najatraktivnijaPonuda ? 1 : 0,
            idPONUDA
        ]);


        if (idDESTINACIJA) {
            // Ažuriranje destinacije
            await db.promise().query(`
                UPDATE ponuda_has_destinacija 
                SET idDESTINACIJA = ? 
                WHERE idPONUDA = ?
            `, [idDESTINACIJA, idPONUDA]);
        }
        //ponuda kad se azurira ponovo postaje zahtjev i treba je administrator odobriti/odbiti
        res.json({ message: "Ponuda uspješno ažurirana." });
    } catch (err) {
        console.error("Greška pri ažuriranju ponude:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


// Pregled svih zahtjeva za rezervacije (turisticka agencija)
app.get('/zahtjevi-rezervacija', authenticateToken, authenticateAgency, async (req, res) => {
    const idAgencije = req.user.idKORISNIK;

    try {
        const [rezervacije] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.Datum,
                r.StatusRezervacije,
                k.Ime AS ImeKorisnika,
                k.Prezime AS PrezimeKorisnika,
                p.Opis AS NazivPonude
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON r.idKORISNIK = k.idKORISNIK
            WHERE r.StatusRezervacije = 0 AND p.idKORISNIK = ?
        `, [idAgencije]);

        res.json(rezervacije);
    } catch (err) {
        console.error("Greška pri dobavljanju zahtjeva za rezervaciju:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


// Pregled pojedinacnog zahtjeva za rezervaciju (turisticka agencija)
app.get('/zahtjevi-rezervacija/:id', authenticateToken, authenticateAgency, async (req, res) => {
    const idAgencije = req.user.idKORISNIK;
    const idRezervacije = req.params.id;

    try {
        const [rows] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.Datum,
                r.BrojOdraslih,
                r.BrojDjece,
                r.StatusRezervacije,
                k.Ime AS ImeKorisnika,
                k.Prezime AS PrezimeKorisnika,
                k.Email,
                p.Opis AS NazivPonude,
                p.Cijena AS CijenaPoOsobi
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON r.idKORISNIK = k.idKORISNIK
            WHERE r.idREZERVACIJA = ? AND p.idKORISNIK = ?
        `, [idRezervacije, idAgencije]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Rezervacija nije pronađena ili ne pripada vašoj agenciji." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Greška pri dohvatanju rezervacije:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


//Prihvatanje ili odbijanje zahtjeva za rezervaciju (turisticka agencija)
app.put('/zahtjevi-rezervacija/:id/status', authenticateToken, authenticateAgency, async (req, res) => {
    const idAgencije = req.user.idKORISNIK;
    const idRezervacije = req.params.id;
    const { status } = req.query; // Status: 1 (prihvaćeno), 0 (na čekanju), -1 (odbijeno)

    try {
        if (status === undefined || ![1, 0, -1].includes(Number(status))) {
            return res.status(400).json({ error: "Dozvoljene vrijednosti za status su: 1 (prihvaćeno), 0 (na čekanju) ili -1 (odbijeno)." });
        }

        const [rows] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.idKORISNIK AS idKlijenta,
                r.StatusRezervacije,
                p.Opis AS NazivPonude
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            WHERE r.idREZERVACIJA = ? AND p.idKORISNIK = ?
        `, [idRezervacije, idAgencije]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Rezervacija nije pronađena ili ne pripada vašoj agenciji." });
        }

        const rezervacija = rows[0];

        if (rezervacija.StatusRezervacije !== 0) {
            return res.status(400).json({ error: "Ova rezervacija je već procesuirana." });
        }

        // Ažuriraj status rezervacije
        await db.promise().query(`
            UPDATE rezervacija
            SET StatusRezervacije = ?
            WHERE idREZERVACIJA = ?
        `, [status, idRezervacije]);

        // Tekst obavještenja
        const akcija = status == 1 ? 'prihvaćena' : (status == -1 ? 'odbijena' : 'na čekanju');
        const sadrzaj = `Vaša rezervacija za ponudu "${rezervacija.NazivPonude}" je ${akcija}.`;

        // Insert u obavještenje
        await db.promise().query(`
            INSERT INTO obavještenje (Sadržaj, DatumVrijeme, Pročitano, idKORISNIK)
            VALUES (?, NOW(), 0, ?)
        `, [sadrzaj, rezervacija.idKlijenta]);

        return res.json({ message: `Rezervacija je ${akcija}.` });

    } catch (err) {
        console.error("Greška pri odgovaranju na rezervaciju:", err);
        return res.status(500).json({ error: "Greška na serveru." });
    }
});


// Pregled svih prihvacenih rezervacija (turistička agencija)
app.get('/sve-rezervacije', authenticateToken, authenticateAgency, async (req, res) => {
    const idAgencije = req.user.idKORISNIK;

    try {
        const [rezervacije] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.Datum,
                r.StatusRezervacije,
                k.Ime AS ImeKorisnika,
                k.Prezime AS PrezimeKorisnika,
                p.Opis AS NazivPonude
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON r.idKORISNIK = k.idKORISNIK
            WHERE p.idKORISNIK = ? AND r.StatusRezervacije = 1  
        `, [idAgencije]);

        if (rezervacije.length === 0) {
            return res.status(404).json({ error: "Nema prihvaćenih rezervacija za ovu agenciju." });
        }

        res.json(rezervacije);
    } catch (err) {
        console.error("Greška pri dobavljanju svih prihvaćenih rezervacija:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});

// Pregled pojedinacne rezervacije (turistička agencija)
app.get('/sve-rezervacije/:id', authenticateToken, authenticateAgency, async (req, res) => {
    const idAgencije = req.user.idKORISNIK;
    const idRezervacije = req.params.id;

    try {
        const [rows] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.Datum,
                r.BrojOdraslih,
                r.BrojDjece,
                r.StatusRezervacije,
                k.Ime AS ImeKorisnika,
                k.Prezime AS PrezimeKorisnika,
                k.Email,
                p.Opis AS NazivPonude,
                p.Cijena AS CijenaPoOsobi
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON r.idKORISNIK = k.idKORISNIK
            WHERE r.idREZERVACIJA = ? AND p.idKORISNIK = ?
        `, [idRezervacije, idAgencije]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Rezervacija nije pronađena ili ne pripada vašoj agenciji." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Greška pri dohvatanju pojedinačne rezervacije:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


// Pregled svih odbijenih rezervacija (turistič=cka agencija)
app.get('/odbijene-rezervacije', authenticateToken, authenticateAgency, async (req, res) => {
    const idAgencije = req.user.idKORISNIK;

    try {
        const [rezervacije] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.Datum,
                r.BrojOdraslih,
                r.BrojDjece,
                r.StatusRezervacije,
                k.Ime AS ImeKorisnika,
                k.Prezime AS PrezimeKorisnika,
                p.Opis AS NazivPonude,
                p.Cijena AS CijenaPoOsobi
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON r.idKORISNIK = k.idKORISNIK
            WHERE r.StatusRezervacije = -1 AND p.idKORISNIK = ?
        `, [idAgencije]);

        res.json(rezervacije);
    } catch (err) {
        console.error("Greška pri dobavljanju odbijenih rezervacija:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


//Pregled liste četova korisnika
app.get('/chatovi', authenticateToken, async (req, res) => {
    const idKorisnik = req.user.idKORISNIK;

    try {
        const [chatovi] = await db.promise().query(`
            SELECT 
                c.idČET,
                k1.idKORISNIK AS idSagovornik,
                k1.Ime,
                k1.Prezime,
                k1.NazivAgencije,
                k1.KorisnickoIme
            FROM čet c
            JOIN korisnik k1 ON (k1.idKORISNIK = IF(c.idKORISNIK1 = ?, c.idKORISNIK2, c.idKORISNIK1))
            WHERE c.idKORISNIK1 = ? OR c.idKORISNIK2 = ?
        `, [idKorisnik, idKorisnik, idKorisnik]);

        res.json(chatovi);
    } catch (err) {
        console.error("Greška pri dohvaćanju četova:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


//Pregled poruka u jednom četu
app.get('/chatovi/:idCET/poruke', authenticateToken, async (req, res) => {
    const idKorisnik = req.user.idKORISNIK;
    const idČET = req.params.idCET;

    try {
        // Provjera da li korisnik pripada tom četu
        const [check] = await db.promise().query(`
            SELECT * FROM čet WHERE idČET = ? AND (idKORISNIK1 = ? OR idKORISNIK2 = ?)
        `, [idČET, idKorisnik, idKorisnik]);

        if (check.length === 0) {
            return res.status(403).json({ error: "Nemate pristup ovom četu." });
        }

        const [poruke] = await db.promise().query(`
            SELECT 
                p.idPORUKA,
                p.Sadržaj,
                p.VrijemeSlanja,
                p.Pročitano,
                p.idČET,
                p.idPOŠILJALAC,
                k.Ime AS ImePosiljaoca,
                k.Prezime AS PrezimePosiljaoca,
                k.KorisnickoIme AS KorisnickoIme,
                k.NazivAgencije AS NazivAgencije
            FROM poruka p
            JOIN korisnik k ON k.idKORISNIK = p.idPOŠILJALAC
            WHERE p.idČET = ?
            ORDER BY p.VrijemeSlanja ASC
        `, [idČET]);

        res.json(poruke);
    } catch (err) {
        console.error("Greška pri dohvaćanju poruka:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


// Slanje poruke ka drugom korisniku
app.post('/poruka', authenticateToken, async (req, res) => {
    const idKorisnik1 = req.user.idKORISNIK;
    const { idKorisnik2, sadrzaj, idČET, korisnickoImePrimaoca } = req.body;

    if (!sadrzaj) {
        return res.status(400).json({ error: "Sadržaj poruke je obavezan." });
    }

    try {
        let chatId = idČET;

        // Ako je prosleđen idČET, znači da se šalje u postojeći chat
        if (chatId) {
            const [check] = await db.promise().query(`
                SELECT * FROM čet WHERE idČET = ? AND (idKORISNIK1 = ? OR idKORISNIK2 = ?)
            `, [chatId, idKorisnik1, idKorisnik1]);

            if (check.length === 0) {
                return res.status(403).json({ error: "Nemate pristup ovom četu." });
            }
        } else {
            // Ako nema idČET → kreira se novi chat
            let idPrimaoca = idKorisnik2;

            // Ako je prosleđeno korisničko ime, pronađi ID
            if (!idPrimaoca && korisnickoImePrimaoca) {
                const [rows] = await db.promise().query(
                    "SELECT idKORISNIK FROM korisnik WHERE KorisnickoIme = ?",
                    [korisnickoImePrimaoca]
                );

                if (rows.length === 0) {
                    return res.status(404).json({ error: "Korisnik sa tim korisničkim imenom ne postoji." });
                }

                idPrimaoca = rows[0].idKORISNIK;
            }

            if (!idPrimaoca) {
                return res.status(400).json({ error: "Nije pronađen primalac." });
            }

            // Provjeri postoji li već čet
            const [existingChat] = await db.promise().query(`
                SELECT idČET FROM čet
                WHERE (idKORISNIK1 = ? AND idKORISNIK2 = ?) OR (idKORISNIK1 = ? AND idKORISNIK2 = ?)
            `, [idKorisnik1, idPrimaoca, idPrimaoca, idKorisnik1]);

            if (existingChat.length > 0) {
                chatId = existingChat[0].idČET;
            } else {
                const [chatResult] = await db.promise().query(`
                    INSERT INTO čet (idKORISNIK1, idKORISNIK2) VALUES (?, ?)
                `, [idKorisnik1, idPrimaoca]);
                chatId = chatResult.insertId;
            }
        }

        // Ubaci poruku
        await db.promise().query(`
            INSERT INTO poruka (Sadržaj, VrijemeSlanja, Pročitano, idČET, idPOŠILJALAC)
            VALUES (?, NOW(), 0, ?, ?)
        `, [sadrzaj, chatId, idKorisnik1]);

        res.status(201).json({ message: "Poruka uspješno poslana.", idČET: chatId });
    } catch (err) {
        console.error("Greška pri slanju poruke:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});




app.post('/recenzija', authenticateToken, async (req, res) => {
    const idKorisnik = req.user.idKORISNIK;
    const { idPONUDA, Komentar, Ocjena } = req.body;

    if (!idPONUDA || !Ocjena) {
        return res.status(400).json({ error: "PONUDA i ocjena su obavezni." });
    }

    try {
        // Provjera da li je već ostavio recenziju
        const [postojeca] = await db.promise().query(`
            SELECT * FROM recenzija WHERE idKORISNIK = ? AND idPONUDA = ?
        `, [idKorisnik, idPONUDA]);

        if (postojeca.length > 0) {
            return res.status(409).json({ error: "Već ste ostavili recenziju za ovu ponudu." });
        }

        // Unos recenzije
        await db.promise().query(`
            INSERT INTO recenzija (idKORISNIK, idPONUDA, Komentar, Ocjena, DatumIVrijeme)
            VALUES (?, ?, ?, ?, NOW())
        `, [idKorisnik, idPONUDA, Komentar || null, Ocjena]);

        res.status(201).json({ message: "Recenzija je uspješno dodana." });
    } catch (err) {
        console.error("Greška prilikom dodavanja recenzije:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});

router.get('/ponuda/:id/ocjena', async (req, res) => {
    const idPONUDA = parseInt(req.params.id);

    try {
        const [rows] = await pool.query('CALL GetAverageRating(?, @avgRating); SELECT @avgRating AS averageRating;', [idPONUDA]);

        const averageRating = rows[1][0].averageRating;
        res.json({ averageRating: averageRating || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Greška pri dobijanju ocjene' });
    }
});

app.get('/recenzije/:idPONUDA', authenticateToken, async (req, res) => {
    const idPONUDA = req.params.idPONUDA;

    try {
        const [recenzije] = await db.promise().query(`
            SELECT 
                r.idKORISNIK,
                r.Ocjena,
                r.Komentar,
                r.DatumIVrijeme,
                k.KorisnickoIme
            FROM recenzija r
            JOIN korisnik k ON r.idKORISNIK = k.idKORISNIK
            WHERE r.idPONUDA = ?
            ORDER BY r.DatumIVrijeme DESC
        `, [idPONUDA]);

        res.json(recenzije);
    } catch (err) {
        console.error("Greška pri dohvaćanju recenzija:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});




app.post('/prijavi-problem', authenticateToken, async (req, res) => {
    const idKORISNIK = req.user.idKORISNIK;
    const { Naslov, Sadrzaj } = req.body;

    if (!Naslov || !Sadrzaj) {
        return res.status(400).json({ error: "Naslov i sadržaj su obavezni." });
    }

    try {
        await db.promise().query(`
            INSERT INTO problem (Naslov, Sadržaj, idKORISNIK)
            VALUES (?, ?, ?)
        `, [Naslov, Sadrzaj, idKORISNIK]);

        res.status(201).json({ message: "Problem uspješno prijavljen." });
    } catch (err) {
        console.error("Greška pri prijavi problema:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});




app.get('/problemi', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const [problemi] = await db.promise().query(`
            SELECT 
                p.idPROBLEM,
                p.Naslov,
                p.Sadržaj,
                p.idKORISNIK,
                k.KorisnickoIme
            FROM problem p
            JOIN korisnik k ON p.idKORISNIK = k.idKORISNIK
            ORDER BY p.idPROBLEM DESC
        `);

        res.json(problemi);
    } catch (err) {
        console.error("Greška pri dohvatu problema:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});


// http://localhost:5000/ponude/uporedi?id1=1&id2=2
app.get('/ponude/uporedi', authenticateToken, async (req, res) => {
    const id1 = req.query.id1;
    const id2 = req.query.id2;

    if (!id1 || !id2) {
        return res.status(400).json({ error: "Oba ID-a ponuda moraju biti navedena kao query parametri." });
    }

    try {
        const query = `
            SELECT 
                p.idPONUDA,
                p.Cijena,
                p.Opis,
                p.DatumObjavljivanja,
                p.DatumPolaska,
                p.DatumPovratka,
                p.TipPrevoza,
                p.BrojSlobodnihMjesta,
                p.NajatraktivnijaPonuda,
                p.idKORISNIK,
                d.idDESTINACIJA,
                d.Naziv AS NazivDestinacije,
                d.Opis AS OpisDestinacije,
                d.Tip AS TipDestinacije
            FROM 
                ponuda p
            JOIN 
                ponuda_has_destinacija phd ON p.idPONUDA = phd.idPONUDA
            JOIN 
                destinacija d ON phd.idDESTINACIJA = d.idDESTINACIJA
            WHERE 
                p.idPONUDA IN (?, ?) AND p.StatusPonude = 1
        `;

        const [rows] = await db.promise().query(query, [id1, id2]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Nijedna ponuda nije pronađena." });
        }

        const ponudeMap = {};

        for (const row of rows) {
            if (!ponudeMap[row.idPONUDA]) {
                ponudeMap[row.idPONUDA] = {
                    idPONUDA: row.idPONUDA,
                    Cijena: row.Cijena,
                    Opis: row.Opis,
                    DatumObjavljivanja: row.DatumObjavljivanja,
                    DatumPolaska: row.DatumPolaska,
                    DatumPovratka: row.DatumPovratka,
                    TipPrevoza: row.TipPrevoza,
                    BrojSlobodnihMjesta: row.BrojSlobodnihMjesta,
                    NajatraktivnijaPonuda: !!row.NajatraktivnijaPonuda,
                    idKORISNIK: row.idKORISNIK,
                    Destinacije: []
                };
            }

            ponudeMap[row.idPONUDA].Destinacije.push({
                idDESTINACIJA: row.idDESTINACIJA,
                Naziv: row.NazivDestinacije,
                Opis: row.OpisDestinacije,
                Tip: row.TipDestinacije
            });
        }

        const ponude = Object.values(ponudeMap);
        res.json({ ponuda1: ponude[0], ponuda2: ponude[1] });

    } catch (err) {
        console.error("Greška pri upoređivanju ponuda:", err);
        res.status(500).json({ error: "Greška na serveru prilikom upoređivanja ponuda." });
    }
});

app.get('/ponude/filter', async (req, res) => {
    try {
        const {
            minCijena,
            maxCijena,
            destinacija,
            tipDestinacije,
            datumPolaska,
            datumPovratka,
            najatraktivnije
        } = req.query;

        // Osnovni upit
        let query = `
            SELECT 
                p.idPONUDA,
                p.Cijena,
                p.Opis,
                p.DatumPolaska,
                p.DatumPovratka,
                p.TipPrevoza,
                p.BrojSlobodnihMjesta,
                p.NajatraktivnijaPonuda,
                k.NazivAgencije,
                GROUP_CONCAT(d.Naziv SEPARATOR ', ') AS Destinacije
            FROM ponuda p
            JOIN korisnik k ON p.idKORISNIK = k.idKORISNIK
            JOIN ponuda_has_destinacija phd ON p.idPONUDA = phd.idPONUDA
            JOIN destinacija d ON phd.idDESTINACIJA = d.idDESTINACIJA
            WHERE p.StatusPonude = 1
        `;

        const params = [];

        // Dodavanje filtera
        if (minCijena) {
            query += ` AND p.Cijena >= ?`;
            params.push(minCijena);
        }

        if (maxCijena) {
            query += ` AND p.Cijena <= ?`;
            params.push(maxCijena);
        }

        if (destinacija) {
            query += ` AND d.Naziv LIKE ?`;
            params.push(`%${destinacija}%`);
        }

        if (tipDestinacije) {
            query += ` AND d.Tip = ?`;
            params.push(tipDestinacije);
        }

        if (datumPolaska) {
            query += ` AND p.DatumPolaska >= ?`;
            params.push(datumPolaska);
        }

        if (datumPovratka) {
            query += ` AND p.DatumPovratka <= ?`;
            params.push(datumPovratka);
        }

        if (najatraktivnije === 'true') {
            query += ` AND p.NajatraktivnijaPonuda = 1`;
        }

        query += ` GROUP BY p.idPONUDA`;

        const [ponude] = await db.promise().query(query, params);

        res.json(ponude);

    } catch (err) {
        console.error("Greška pri filtriranju:", err);
        res.status(500).json({ error: "Greška na serveru" });
    }
});


app.get('/moje-rezervacije', authenticateToken, async (req, res) => {
    const idKorisnik = req.user.idKORISNIK;

    try {
        const [rezervacije] = await db.promise().query(`
            SELECT 
                r.idREZERVACIJA,
                r.Datum,
                r.BrojOdraslih,
                r.BrojDjece,
                r.StatusRezervacije,
                p.idPONUDA,
                p.Cijena,
                p.Opis AS OpisPonude,
                p.DatumPolaska,
                p.DatumPovratka,
                p.TipPrevoza,
                k.NazivAgencije,
                GROUP_CONCAT(d.Naziv SEPARATOR ', ') AS Destinacije
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON p.idKORISNIK = k.idKORISNIK
            JOIN ponuda_has_destinacija phd ON p.idPONUDA = phd.idPONUDA
            JOIN destinacija d ON phd.idDESTINACIJA = d.idDESTINACIJA
            WHERE r.idKORISNIK = ?
            GROUP BY r.idREZERVACIJA
        `, [idKorisnik]);

        const rezervacijeSaStatusom = rezervacije.map(r => ({
            ...r,
            StatusText:
                r.StatusRezervacije === 1 ? 'Odobreno' :
                    r.StatusRezervacije === 0 ? 'Na čekanju' :
                        r.StatusRezervacije === -1 ? 'Odbijeno' :
                            r.StatusRezervacije === -2 ? 'Otkazano' : 'Nepoznato',
            UkupnaCijena: (r.BrojOdraslih + r.BrojDjece) * r.Cijena
        }));

        res.json({
            message: "Lista vaših rezervacija",
            rezervacije: rezervacijeSaStatusom
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

// Get details for a specific reservation
app.get('/moje-rezervacije/:id', authenticateToken, async (req, res) => {
    const idRezervacija = req.params.id;
    const idKorisnik = req.user.idKORISNIK;

    try {
        // Get basic reservation info
        const [rezervacija] = await db.promise().query(`
            SELECT 
                r.*,
                p.*,
                k.NazivAgencije
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            JOIN korisnik k ON p.idKORISNIK = k.idKORISNIK
            WHERE r.idREZERVACIJA = ? AND r.idKORISNIK = ?
        `, [idRezervacija, idKorisnik]);

        if (rezervacija.length === 0) {
            return res.status(404).json({ error: "Rezervacija nije pronađena." });
        }

        // Get destinations for this offer
        const [destinacije] = await db.promise().query(`
            SELECT d.* 
            FROM destinacija d
            JOIN ponuda_has_destinacija phd ON d.idDESTINACIJA = phd.idDESTINACIJA
            WHERE phd.idPONUDA = ?
        `, [rezervacija[0].idPONUDA]);

        // Format response
        const response = {
            ...rezervacija[0],
            Destinacije: destinacije,
            UkupnaCijena: (rezervacija[0].BrojOdraslih + rezervacija[0].BrojDjece) * rezervacija[0].Cijena
        };

        res.json(response);

    } catch (err) {
        console.error("Greška pri dohvatu detalja rezervacije:", err);
        res.status(500).json({ error: "Greška na serveru." });
    }
});

// Rezervacija ponude iz pregleda
app.post('/rezervisi-ponudu', authenticateToken, async (req, res) => {
    const { idPONUDA, BrojOdraslih, BrojDjece } = req.body;
    const idKorisnik = req.user.idKORISNIK;

    // Validacija
    if (!idPONUDA || BrojOdraslih === undefined || BrojDjece === undefined) {
        return res.status(400).json({ error: "idPONUDA, BrojOdraslih i BrojDjece su obavezni." });
    }

    try {
        // 1. Provjera ponude
        const [ponuda] = await db.promise().query(`
            SELECT p.*, k.NazivAgencije 
            FROM ponuda p
            JOIN korisnik k ON p.idKORISNIK = k.idKORISNIK
            WHERE p.idPONUDA = ? AND p.StatusPonude = 1
        `, [idPONUDA]);

        if (ponuda.length === 0) {
            return res.status(404).json({ error: "Ponuda nije pronađena ili nije odobrena." });
        }

        // 2. Provjera kapaciteta
        if (ponuda[0].BrojSlobodnihMjesta < (BrojOdraslih + BrojDjece)) {
            return res.status(400).json({
                error: "Nema dovoljno slobodnih mjesta.",
                slobodnaMjesta: ponuda[0].BrojSlobodnihMjesta
            });
        }

        // 3. Kreiranje rezervacije
        const [rezervacija] = await db.promise().query(`
            INSERT INTO rezervacija (Datum, BrojOdraslih, BrojDjece, StatusRezervacije, idPONUDA, idKORISNIK)
            VALUES (NOW(), ?, ?, 0, ?, ?)
        `, [BrojOdraslih, BrojDjece, idPONUDA, idKorisnik]);

        // 4. Ažuriranje kapaciteta
        await db.promise().query(`
            UPDATE ponuda 
            SET BrojSlobodnihMjesta = BrojSlobodnihMjesta - ? 
            WHERE idPONUDA = ?
        `, [BrojOdraslih + BrojDjece, idPONUDA]);

        // 5. Obavijest agenciji
        await db.promise().query(`
            INSERT INTO obavještenje (Sadržaj, DatumVrijeme, Pročitano, idKORISNIK)
            VALUES (?, NOW(), 0, ?)
        `, [
            `Nova rezervacija za ponudu: ${ponuda[0].Opis}`,
            ponuda[0].idKORISNIK
        ]);

        res.status(201).json({
            message: "Rezervacija uspješno kreirana",
            idREZERVACIJA: rezervacija.insertId,
            ukupnaCijena: (BrojOdraslih + BrojDjece) * ponuda[0].Cijena
        });

    } catch (err) {
        console.error("Greška pri rezervaciji:", err);
        res.status(500).json({ error: "Greška na serveru" });
    }
});


// Otkazivanje rezervacije (bez polja RazlogOtkazivanja)
app.put('/moje-rezervacije/:id/otkazi', authenticateToken, async (req, res) => {
    const idRezervacija = req.params.id;
    const { razlogOtkazivanja } = req.body;
    const idKorisnik = req.user.idKORISNIK;

    if (!razlogOtkazivanja) {
        return res.status(400).json({ error: "Razlog otkazivanja je obavezan." });
    }

    try {
        // 1. Provjera rezervacije
        const [rezervacija] = await db.promise().query(`
            SELECT r.*, p.idKORISNIK as idAgencije, p.Opis as nazivPonude
            FROM rezervacija r
            JOIN ponuda p ON r.idPONUDA = p.idPONUDA
            WHERE r.idREZERVACIJA = ? AND r.idKORISNIK = ?
        `, [idRezervacija, idKorisnik]);

        if (rezervacija.length === 0) {
            return res.status(404).json({ error: "Rezervacija nije pronađena." });
        }

        // 2. Provjera statusa
        if (rezervacija[0].StatusRezervacije !== 0 && rezervacija[0].StatusRezervacije !== 1) {
            return res.status(400).json({ error: "Rezervacija se ne može otkazati." });
        }

        // 3. Otkazivanje rezervacije (samo promjena statusa)
        await db.promise().query(`
            UPDATE rezervacija 
            SET StatusRezervacije = -2
            WHERE idREZERVACIJA = ?
        `, [idRezervacija]);

        // 4. Vraćanje kapaciteta
        await db.promise().query(`
            UPDATE ponuda 
            SET BrojSlobodnihMjesta = BrojSlobodnihMjesta + ?
            WHERE idPONUDA = ?
        `, [rezervacija[0].BrojOdraslih + rezervacija[0].BrojDjece, rezervacija[0].idPONUDA]);

        // 5. Obavještenje agenciji (sa razlogom)
        await db.promise().query(`
            INSERT INTO obavještenje (Sadržaj, DatumVrijeme, Pročitano, idKORISNIK)
            VALUES (?, NOW(), 0, ?)
        `, [
            `Rezervacija #${idRezervacija} otkazana. Razlog: ${razlogOtkazivanja}`,
            rezervacija[0].idAgencije
        ]);

        // 6. Obavještenje klijentu
        await db.promise().query(`
            INSERT INTO obavještenje (Sadržaj, DatumVrijeme, Pročitano, idKORISNIK)
            VALUES (?, NOW(), 0, ?)
        `, [
            `Otkazali ste rezervaciju #${idRezervacija}`,
            idKorisnik
        ]);

        res.json({
            message: "Rezervacija uspješno otkazana.",
            vraceniKapacitet: rezervacija[0].BrojOdraslih + rezervacija[0].BrojDjece
        });

    } catch (err) {
        console.error("Greška pri otkazivanju:", err);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
