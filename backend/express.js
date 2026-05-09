// server.js
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY || "SECRET_DEV";

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "banque_db",
});

// --------------------
// Middleware auth gérant
// --------------------
const authGerant = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.status(401).json({ error: "Token manquant" });
  try {
    const user = jwt.verify(token, SECRET_KEY);
    if(user.role !== "gerant") return res.status(403).json({ error: "Accès refusé" });
    req.user = user;
    next();
  } catch(e) {
    res.status(401).json({ error: "Token invalide" });
  }
};

// --------------------
// Register gérant
// --------------------
app.post("/register-gerant", async (req,res) => {
  const { username, password, agence_id } = req.body;
  try {
    const hash = await bcrypt.hash(password,10);
    await db.query(
      "INSERT INTO users (username, password, role, agence_id) VALUES (?, ?, 'gerant', ?)",
      [username, hash, agence_id]
    );
    res.json({ message: "Gérant créé" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Login gérant
// --------------------
app.post("/login-gerant", async (req,res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username=?", [username]);
    if(rows.length === 0) return res.status(401).json({ error: "Utilisateur non trouvé" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(401).json({ error: "Mot de passe incorrect" });
    const token = jwt.sign(
      { id: user.id, role: user.role, agence_id: user.agence_id },
      SECRET_KEY,
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// CREATE client
// --------------------
app.post("/client", authGerant, async (req,res) => {
  const { nom, sexe, solde } = req.body;
  const agence_id = req.user.agence_id;
  const prefix = nom.substring(0,3).toUpperCase();
  const sexeCode = sexe === "H" ? "01" : "02";
  const year = new Date().getFullYear();

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // récupérer code registre agence
    const [agences] = await connection.query("SELECT code_registre FROM agence WHERE id=?", [agence_id]);
    if(agences.length === 0) throw new Error("Agence non trouvée");
    const registre = agences[0].code_registre;

    // récupérer ou créer compteur
    const [rows] = await connection.query(
      "SELECT * FROM compteur WHERE prefix=? AND sexe=? AND registre=? AND annee=? FOR UPDATE",
      [prefix, sexeCode, registre, year]
    );

    let count;
    if(rows.length === 0){
      count = 1;
      await connection.query(
        "INSERT INTO compteur(prefix, sexe, registre, annee, valeur) VALUES (?, ?, ?, ?, ?)",
        [prefix, sexeCode, registre, year, count]
      );
    } else {
      count = rows[0].valeur +1;
      await connection.query(
        "UPDATE compteur SET valeur=? WHERE id=?",
        [count, rows[0].id]
      );
    }

    const numCompte = `${prefix}-${sexeCode}-${registre}-${year}-${String(count).padStart(4,"0")}`;

    // Insert client
    await connection.query(
      "INSERT INTO client (nom, sexe, solde, agence_id, numCompte) VALUES (?, ?, ?, ?, ?)",
      [nom, sexeCode, solde, agence_id, numCompte]
    );

    await connection.commit();
    res.json({ numCompte });
  } catch(err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// --------------------
// READ clients (affiche numCompte, nom, solde, statut)
// --------------------
app.get("/clients", authGerant, async (req,res) => {
  try {
    const [clients] = await db.query(
      "SELECT id, numCompte, nom, solde FROM client WHERE agence_id=?",
      [req.user.agence_id]
    );
    console.log('Clients retournés par /clients:', clients); // Debug
    const result = clients.map(c => ({
      ...c,
      statut: c.solde < 1000 ? "Insuffisant" : c.solde <= 5000 ? "Moyen" : "Élevé"
    }));
    res.json(result);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// UPDATE client
// --------------------
app.put("/client/:id", authGerant, async (req, res) => {
  const { nom, solde, operation } = req.body; // solde ici = montant (ajout ou retrait)
  const id = req.params.id;
  
  console.log('PUT client - ID reçu:', id); // Debug

  try {
    const montant = parseFloat(solde);
    if (Number.isNaN(montant)) {
      return res.status(400).json({ error: "Montant invalide" });
    }
    if (montant < 0) {
      return res.status(400).json({ error: "Le montant doit être positif" });
    }

    const operationType = operation || "depot";
    if (!["depot", "retrait"].includes(operationType)) {
      return res.status(400).json({ error: "Opération invalide" });
    }

    // Récupérer le solde actuel - accepter soit l'ID soit le numCompte
    const [clients] = await db.query(
      "SELECT solde FROM client WHERE (id=? OR numCompte=?) AND agence_id=?",
      [id, id, req.user.agence_id]
    );
    console.log('Clients trouvés:', clients.length); // Debug
    
    if (clients.length === 0) return res.status(404).json({ error: "Client non trouvé" });

    const soldeActuel = parseFloat(clients[0].solde);
    const nouveauSolde = operationType === "retrait"
      ? soldeActuel - montant
      : soldeActuel + montant;

    if (nouveauSolde < 0) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }

    // Mettre à jour le client
    await db.query(
      "UPDATE client SET nom=?,  solde=? WHERE (id=? OR numCompte=?) AND agence_id=?",
      [nom,  nouveauSolde, id, id, req.user.agence_id]
    );

    // Calculer le statut
    const statut = nouveauSolde < 1000 ? "Insuffisant" :
                   nouveauSolde <= 5000 ? "Moyen" : "Élevé";

    res.json({ message: "Client mis à jour", solde: nouveauSolde, statut });
  } catch (err) {
    console.error('Erreur UPDATE client:', err); // Debug
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// DELETE client
// --------------------
app.delete("/client/:id", authGerant, async (req,res) => {
  const id = req.params.id;
  try {
    await db.query(
      "DELETE FROM client WHERE id=? AND agence_id=?",
      [id, req.user.agence_id]
    );
    res.json({ message: "Client supprimé" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));