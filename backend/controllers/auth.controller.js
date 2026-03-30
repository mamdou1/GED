const bcrypt = require("bcrypt");
const { Agent, Token } = require("../models");
const { sendEmail } = require("../utils/email.utils");
const jwt = require("jsonwebtoken");
const HistoriqueService = require("../services/historique.service");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/token.utils");

// 🔹 Inscription
exports.inscription = async (req, res) => {
  try {
    const {
      num_matricule,
      fonction,
      email,
      telephone,
      username,
      password,
      nom,
      prenom,
    } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await Agent.create({
      fonction,
      password: hash,
      // role: "ADMIN",
      telephone,
      username,
      nom,
      num_matricule,
      prenom,
      email,
    });

    const userAdmin = await Agent.findByPk(user.id);

    res.status(201).json({
      message: "Inscription réussie",
      userAdmin,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Connexion
// exports.connexion = async (req, res) => {
//   try {
//     const { telephone, password } = req.body;
//     const agent = await Agent.findOne({ where: { telephone } });
//     if (!agent)
//       return res.status(404).json({ message: "Utilisateur non trouvé." });
//     const valid = await bcrypt.compare(password, agent.password);
//     if (!valid)
//       return res.status(401).json({ message: "Mot de passe incorrect" });
//     const accessToken = generateAccessToken(agent);
//     const refreshToken = generateRefreshToken(agent);
//     await Token.create({ token: refreshToken, agent_id: agent.id });
//     res.json({ accessToken, refreshToken });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.connexion = async (req, res) => {
  try {
    const { username, password } = req.body;

    const agent = await Agent.findOne({ where: { username } });
    if (!agent) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const valid = await bcrypt.compare(password, agent.password);
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const accessToken = generateAccessToken(agent);
    const refreshToken = generateRefreshToken(agent);

    console.log(
      "🎟️ AccessToken généré (début) :",
      accessToken.substring(0, 20),
      "...",
    );
    console.log(
      "🎟️ RefreshToken généré (début) :",
      refreshToken.substring(0, 20),
      "...",
    );

    await Token.create({ token: refreshToken, agent_id: agent.id });

    await HistoriqueService.log({
      agent_id: agent.id,
      action: "login",
      resource: "auth/connexion",
      resource_id: req.params.pieceId,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: req.files?.map((f) => f.filename),
    });
    console.log(
      "💾 RefreshToken enregistré en base pour l’agent ID :",
      agent.id,
    );

    await agent.update({
      is_on_line: true,
      last_activity: new Date(),
    });

    res.json({ accessToken, refreshToken });
    console.log("✅ Connexion réussie pour l’agent ID :", agent.id);
  } catch (err) {
    console.error("🔥 Erreur lors de la connexion :", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Rafraîchir le token
exports.refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(403).json({ message: "Token manquant" });

  const stored = await Token.findOne({ where: { token } });
  if (!stored)
    return res.status(403).json({ message: "Refresh token invalide" });

  try {
    const decoded = verifyToken(token, process.env.REFRESH_SECRET);

    const freshAccess = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    res.json({ accessToken: freshAccess });
  } catch {
    res.status(403).json({ message: "Token expiré" });
  }
};

// 🔹 Déconnexion
exports.deconnexion = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token requis" });

    await Token.destroy({ where: { token } });

    await HistoriqueService.log({
      agent_id: req.user.id,
      action: "logout", // ✅ action correcte pour une déconnexion
      resource: "auth/deconnexion",
      resource_id: req.user.id,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    await Agent.update(
      {
        is_on_line: false,
        last_activity: new Date(),
      },
      {
        where: { id: req.user.id },
      },
    );

    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Envoi du code de vérification
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Agent.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await user.update({
      code_verification: code,
      reset_code_expiry: Date.now() + 86400000,
      is_verified_for_reset: false,
    });

    await sendEmail(email, "Réinitialisation", `Code: ${code}`);

    // ✅ Le token doit contenir purpose
    const token = jwt.sign(
      {
        id: user.id,
        purpose: "reset-password", // ✅ Important !
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Token valable 1 heure
    );

    res.json({ token, message: "Code envoyé par email" });
  } catch (err) {
    console.error("❌ Erreur forgotPassword:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Vérification du code et réinitialisation
// exports.verifyAndReset = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     const { code } = req.body;
//     if (!token) return res.status(401).json({ message: "Token manquant" });

//     const decoded = verifyToken(token, process.env.JWT_SECRET);
//     if (decoded.purpose !== "reset-password")
//       return res.status(401).json({ message: "Token invalide" });

//     const user = await Agent.findByPk(decoded.id);
//     if (!user)
//       return res.status(404).json({ message: "Utilisateur introuvable" });

//     if (!user.codeVerification || user.codeVerification !== code)
//       return res.status(400).json({ message: "Code de vérification invalide" });

//     if (Date.now() > user.resetCodeExpiry)
//       return res.status(400).json({ message: "Code expiré" });

//     user.password = await bcrypt.hash("Temp1234", 10);
//     user.codeVerification = null;
//     user.resetCodeExpiry = null;
//     user.isVerifiedForReset = true;
//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Mot de passe réinitialisé à 'Temp1234'." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// 🔹 Vérification du code et réinitialisation
exports.verifyAndReset = async (req, res) => {
  try {
    console.log("=".repeat(60));
    console.log("🔍 VERIFY AND RESET - Début");
    console.log("📅 Timestamp:", new Date().toISOString());

    // Log des headers
    console.log("📨 Headers reçus:", {
      authorization: req.headers.authorization ? "Présent" : "Absent",
      contentType: req.headers["content-type"],
    });

    // Extraire le token
    const token = req.headers.authorization?.split(" ")[1];
    console.log(
      "🔑 Token extrait:",
      token ? `${token.substring(0, 15)}...` : "Aucun",
    );

    const { code } = req.body;
    console.log("📦 Code reçu du body:", code);
    console.log("📦 Body complet reçu:", req.body);

    if (!token) {
      console.log("❌ Token manquant");
      return res.status(401).json({ message: "Token manquant" });
    }

    if (!code) {
      console.log("❌ Code manquant");
      return res.status(400).json({ message: "Code de vérification requis" });
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token décodé avec succès:", decoded);
    } catch (jwtError) {
      console.error("❌ Erreur de vérification du token:", jwtError.message);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // Vérifier le purpose
    if (decoded.purpose !== "reset-password") {
      console.log(
        `❌ Purpose invalide: ${decoded.purpose}, attendu: reset-password`,
      );
      return res.status(401).json({ message: "Token invalide" });
    }

    console.log("🔍 Recherche utilisateur avec ID:", decoded.id);
    const user = await Agent.findByPk(decoded.id);

    if (!user) {
      console.log(`❌ Utilisateur ${decoded.id} non trouvé`);
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    console.log("✅ Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      code_verification: user.code_verification,
      reset_code_expiry: user.reset_code_expiry,
      is_verified_for_reset: user.is_verified_for_reset,
    });

    // Comparer les codes
    console.log(
      `🔐 Comparaison: Reçu="${code}" | Base="${user.code_verification}"`,
    );

    if (!user.code_verification) {
      console.log("❌ Aucun code de vérification en base");
      return res
        .status(400)
        .json({ message: "Aucun code de vérification trouvé" });
    }

    if (user.code_verification !== code) {
      console.log("❌ Codes ne correspondent pas");
      return res.status(400).json({ message: "Code de vérification invalide" });
    }

    // Vérifier l'expiration
    const now = Date.now();
    console.log(
      `⏰ Vérification expiration: now=${now}, expiry=${user.reset_code_expiry}`,
    );

    if (now > user.reset_code_expiry) {
      console.log("❌ Code expiré");
      return res.status(400).json({ message: "Code expiré" });
    }

    console.log("✅ Code valide, mise à jour du mot de passe temporaire...");

    // Mot de passe temporaire
    user.password = await bcrypt.hash("Temp1234", 10);
    user.code_verification = null;
    user.reset_code_expiry = null;
    user.is_verified_for_reset = true;
    await user.save();

    console.log("✅ Utilisateur mis à jour avec succès");
    console.log("=".repeat(60));

    res.status(200).json({
      message:
        "Code vérifié. Vous pouvez maintenant changer votre mot de passe.",
      verified: true,
    });
  } catch (err) {
    console.error("=".repeat(60));
    console.error("❌❌❌ ERREUR verifyAndReset ❌❌❌");
    console.error("📅 Timestamp:", new Date().toISOString());
    console.error("❌ Message:", err.message);
    console.error("❌ Stack:", err.stack);
    console.error("=".repeat(60));

    res.status(500).json({ error: err.message });
  }
};

// 🔹 Mise à jour du mot de passe temporaire
exports.updatePassword = async (req, res) => {
  try {
    console.log("=".repeat(60));
    console.log("🔍 UPDATE PASSWORD - Début");

    const token = req.headers.authorization?.split(" ")[1];
    const { newPassword } = req.body;

    console.log("🔑 Token présent:", !!token);
    console.log("📦 Nouveau mot de passe reçu:", newPassword ? "Oui" : "Non");

    if (!token) {
      console.log("❌ Token manquant");
      return res.status(401).json({ message: "Token manquant" });
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token décodé:", decoded);
    } catch (err) {
      console.error("❌ Erreur vérification token:", err.message);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    if (decoded.purpose !== "reset-password") {
      console.log(`❌ Purpose invalide: ${decoded.purpose}`);
      return res.status(401).json({ message: "Token invalide" });
    }

    // Chercher l'utilisateur
    const user = await Agent.findByPk(decoded.id);
    if (!user) {
      console.log(`❌ Utilisateur ${decoded.id} non trouvé`);
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    console.log("✅ Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      // ✅ Utiliser le bon nom de champ
      is_verified_for_reset: user.is_verified_for_reset,
    });

    // ✅ CORRECTION : is_verified_for_reset (snake_case)
    if (!user.is_verified_for_reset) {
      console.log("❌ Utilisateur non vérifié pour la réinitialisation");
      return res.status(403).json({
        message: "Accès refusé - Veuillez d'abord vérifier votre code",
      });
    }

    // Mettre à jour le mot de passe
    console.log("🔐 Hashage du nouveau mot de passe...");
    user.password = await bcrypt.hash(newPassword, 10);
    user.is_verified_for_reset = false; // ✅ snake_case
    await user.save();

    console.log("✅ Mot de passe mis à jour avec succès");
    console.log("=".repeat(60));

    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("❌ Erreur updatePassword:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Changer le mot de passe après connexion
exports.changerPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Agent.findByPk(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.changerPassword = async (req, res) => {
//   try {
//     console.log("=".repeat(50));
//     console.log("🔐 CHANGEMENT DE MOT DE PASSE");
//     console.log("📅 Timestamp:", new Date().toISOString());
//     console.log("👤 User ID depuis token:", req.user?.id);
//     console.log("📦 Body reçu:", {
//       oldPassword: req.body.oldPassword ? "********" : "non fourni",
//       newPassword: req.body.newPassword ? "********" : "non fourni",
//     });

//     const { oldPassword, newPassword } = req.body;

//     // Validation des champs requis
//     if (!oldPassword || !newPassword) {
//       console.log("❌ Champs manquants:", {
//         oldPassword: !oldPassword ? "manquant" : "présent",
//         newPassword: !newPassword ? "manquant" : "présent",
//       });
//       return res.status(400).json({
//         message: "Les deux mots de passe sont requis",
//       });
//     }

//     // Recherche de l'utilisateur
//     console.log(`🔍 Recherche de l'utilisateur avec ID: ${req.user.id}`);
//     const user = await Agent.findByPk(req.user.id);

//     if (!user) {
//       console.log(`❌ Utilisateur avec ID ${req.user.id} non trouvé en base`);
//       return res.status(404).json({ message: "Utilisateur non trouvé" });
//     }

//     console.log("✅ Utilisateur trouvé:", {
//       id: user.id,
//       email: user.email,
//       hasPassword: !!user.password,
//     });

//     // Vérification de l'ancien mot de passe
//     console.log("🔑 Vérification de l'ancien mot de passe...");
//     const valid = await bcrypt.compare(oldPassword, user.password);
//     console.log(
//       "🔐 Résultat comparaison:",
//       valid ? "✅ VALIDE" : "❌ INVALIDE",
//     );

//     if (!valid) {
//       console.log("❌ Ancien mot de passe incorrect");
//       return res.status(400).json({ message: "Ancien mot de passe incorrect" });
//     }

//     // Hashage du nouveau mot de passe
//     console.log("🔒 Hashage du nouveau mot de passe...");
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     console.log("✅ Hashage réussi");

//     // Mise à jour
//     console.log("💾 Mise à jour de l'utilisateur...");
//     user.password = hashedPassword;
//     await user.save();
//     console.log("✅ Mot de passe mis à jour avec succès");

//     console.log(
//       "🎉 Changement de mot de passe réussi pour l'utilisateur:",
//       user.id,
//     );
//     console.log("=".repeat(50));

//     res.json({ message: "Mot de passe modifié avec succès." });
//   } catch (err) {
//     console.error("=".repeat(50));
//     console.error("❌❌❌ ERREUR CHANGEMENT MOT DE PASSE ❌❌❌");
//     console.error("📅 Timestamp:", new Date().toISOString());
//     console.error("❌ Message:", err.message);
//     console.error("❌ Nom:", err.name);
//     console.error("❌ Stack:", err.stack);

//     // Erreurs spécifiques Sequelize
//     if (err.name === "SequelizeValidationError") {
//       console.error(
//         "❌ Erreur de validation:",
//         err.errors.map((e) => e.message),
//       );
//     }
//     if (err.name === "SequelizeConnectionError") {
//       console.error("❌ Erreur de connexion BD");
//     }

//     console.error("=".repeat(50));

//     res.status(500).json({
//       message: "Erreur serveur lors du changement de mot de passe",
//       error: err.message,
//     });
//   }
// };
