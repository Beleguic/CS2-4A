<template>
  <div class="email-template">
    <div class="email-header">
      <img src="/src/assets/logo-troupicool.png" alt="Tropicool Logo" class="logo" />
      <h1>🔒 Compte Temporairement Verrouillé</h1>
    </div>

    <div class="email-content">
      <p>Bonjour {{ firstName }} {{ lastName }},</p>

      <div class="alert-box">
        <h2>Votre compte a été verrouillé</h2>
        <p>
          <strong>{{ loginAttempts }} tentatives de connexion échouées</strong> ont été détectées 
          sur votre compte Tropicool.
        </p>
        <p>
          Pour protéger votre compte contre les accès non autorisés, 
          nous avons temporairement verrouillé votre compte.
        </p>
      </div>

      <div class="lock-details">
        <h3>Détails du verrouillage</h3>
        <div class="detail-item">
          <span class="detail-label">Durée du verrouillage :</span>
          <span class="detail-value">{{ lockDuration }} heures</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Déverrouillage automatique :</span>
          <span class="detail-value">{{ lockUntil }}</span>
        </div>
      </div>

      <div class="action-section">
        <h3>Que faire maintenant ?</h3>
        <ol>
          <li>Attendez que le verrouillage expire automatiquement</li>
          <li>Assurez-vous de vous souvenir de votre mot de passe</li>
          <li>Si vous avez oublié votre mot de passe, utilisez la fonction "Mot de passe oublié"</li>
        </ol>

        <div class="important-note">
          <p>
            <strong>⚠️ Important :</strong> Les tentatives de connexion supplémentaires 
            prolongeront la durée du verrouillage.
          </p>
        </div>
      </div>

      <div class="security-tips">
        <h3>Conseils de sécurité</h3>
        <ul>
          <li>Vérifiez que vous utilisez le bon email et mot de passe</li>
          <li>Assurez-vous que votre clavier n'est pas en mode majuscules</li>
          <li>Vérifiez que vous n'avez pas de logiciel malveillant sur votre appareil</li>
          <li>Si vous pensez que quelqu'un d'autre tente d'accéder à votre compte, contactez-nous immédiatement</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>Besoin d'aide ?</h3>
        <p>
          Si vous pensez qu'il s'agit d'une erreur ou si vous avez besoin d'aide, 
          contactez notre support :
        </p>
        <div class="contact-info">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>support@tropicool.fr</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span>01 23 45 67 89</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">💬</span>
            <span>Chat en ligne disponible sur notre site</span>
          </div>
        </div>
      </div>
    </div>

    <div class="email-footer">
      <p>
        Cet email a été envoyé automatiquement pour la sécurité de votre compte. 
        Si vous n'êtes pas à l'origine de ces tentatives de connexion, 
        contactez immédiatement notre support.
      </p>
      <p>
        Cordialement,<br>
        L'équipe sécurité Tropicool
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  username: String,
  firstName: String,
  lastName: String,
  loginAttempts: Number,
  lockDuration: Number,
  lockUntil: String,
  unlockUrl: String
});
</script>

<style scoped>
.email-template {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.email-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.logo {
  height: 60px;
  margin-bottom: 15px;
}

.email-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.email-content {
  padding: 30px;
  background: white;
}

.alert-box {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.alert-box h2 {
  color: #721c24;
  margin-top: 0;
  font-size: 20px;
}

.lock-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.lock-details h3 {
  color: #1D1F96;
  margin-top: 0;
  font-size: 18px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #495057;
}

.detail-value {
  font-weight: 500;
  color: #dc3545;
}

.action-section {
  background: #e3f2fd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.action-section h3 {
  color: #1976d2;
  margin-top: 0;
  font-size: 18px;
}

.action-section ol {
  margin: 15px 0;
  padding-left: 20px;
}

.action-section li {
  margin-bottom: 8px;
}

.important-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
}

.important-note p {
  color: #856404;
  margin: 0;
  font-weight: 500;
}

.security-tips {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.security-tips h3 {
  color: #0c5460;
  margin-top: 0;
  font-size: 18px;
}

.security-tips ul {
  margin: 15px 0;
  padding-left: 20px;
}

.security-tips li {
  margin-bottom: 8px;
}

.help-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.help-section h3 {
  color: #495057;
  margin-top: 0;
  font-size: 18px;
}

.help-section p {
  margin: 0 0 15px 0;
  color: #666;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.contact-icon {
  font-size: 16px;
  width: 20px;
}

.email-footer {
  padding: 20px 30px;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.email-footer p {
  margin: 10px 0;
}
</style> 