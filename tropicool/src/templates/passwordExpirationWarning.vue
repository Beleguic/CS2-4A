<template>
  <div class="email-container">
    <div class="email-header">
      <img src="/logo-troupicool.png" alt="Tropicool Logo" class="logo">
      <h1>⚠️ Avertissement d'Expiration</h1>
    </div>

    <div class="email-content">
      <p class="greeting">Bonjour {{ firstName }} {{ lastName }},</p>

      <div class="warning-box">
        <h2>🔔 Votre mot de passe expire bientôt</h2>
        <p>
          Votre mot de passe actuel expirera dans <strong>{{ daysUntilExpiration }} jour(s)</strong> 
          (le {{ expirationDate }}).
        </p>
        <p>
          Pour maintenir la sécurité de votre compte et respecter nos politiques de sécurité, 
          nous vous demandons de changer votre mot de passe avant cette date.
        </p>
      </div>

      <div class="action-section">
        <h3>🔄 Comment procéder ?</h3>
        <ol>
          <li>Connectez-vous à votre compte Tropicool</li>
          <li>Accédez à votre profil utilisateur</li>
          <li>Cliquez sur "Changer le mot de passe"</li>
          <li>Choisissez un nouveau mot de passe sécurisé</li>
        </ol>

        <div class="cta-button">
          <a :href="changePasswordUrl" class="button">
            🔐 Changer mon mot de passe
          </a>
        </div>
      </div>

      <div class="security-tips">
        <h3>🔒 Conseils de sécurité</h3>
        <ul>
          <li>Utilisez au moins 12 caractères</li>
          <li>Incluez des lettres majuscules et minuscules</li>
          <li>Ajoutez des chiffres et des symboles</li>
          <li>Évitez les informations personnelles</li>
          <li>Ne réutilisez pas d'anciens mots de passe</li>
        </ul>
      </div>

      <div class="important-note">
        <p>
          <strong>Important :</strong> Si vous ne changez pas votre mot de passe avant le 
          {{ expirationDate }}, votre compte sera temporairement verrouillé pour des raisons de sécurité.
        </p>
      </div>
    </div>

    <div class="email-footer">
      <p>
        Cet email a été envoyé automatiquement par le système de sécurité de Tropicool.
        Si vous avez des questions, contactez notre équipe support.
      </p>
      <p class="footer-links">
        <a href="https://tropicool.com">Tropicool</a> | 
        <a href="https://tropicool.com/support">Support</a> | 
        <a href="https://tropicool.com/privacy">Confidentialité</a>
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  daysUntilExpiration: {
    type: Number,
    required: true
  },
  expirationDate: {
    type: String,
    required: true
  },
  changePasswordUrl: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.email-container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #ffffff;
}

.email-header {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px 10px 0 0;
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
  padding: 30px 20px;
}

.greeting {
  font-size: 18px;
  margin-bottom: 25px;
  color: #555;
}

.warning-box {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-left: 5px solid #ff6b35;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.warning-box h2 {
  margin: 0 0 15px 0;
  color: #d63031;
  font-size: 20px;
}

.warning-box p {
  margin: 10px 0;
  color: #2d3436;
}

.action-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.action-section h3 {
  margin: 0 0 15px 0;
  color: #2d3436;
  font-size: 18px;
}

.action-section ol {
  margin: 15px 0;
  padding-left: 20px;
}

.action-section li {
  margin: 8px 0;
  color: #555;
}

.cta-button {
  text-align: center;
  margin: 25px 0;
}

.button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.security-tips {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 5px solid #00b894;
}

.security-tips h3 {
  margin: 0 0 15px 0;
  color: #00b894;
  font-size: 18px;
}

.security-tips ul {
  margin: 15px 0;
  padding-left: 20px;
}

.security-tips li {
  margin: 8px 0;
  color: #2d3436;
}

.important-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.important-note p {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

.email-footer {
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
  border-radius: 0 0 10px 10px;
  border-top: 1px solid #e9ecef;
}

.email-footer p {
  margin: 10px 0;
  color: #6c757d;
  font-size: 14px;
}

.footer-links {
  margin-top: 15px;
}

.footer-links a {
  color: #667eea;
  text-decoration: none;
  margin: 0 10px;
}

.footer-links a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .email-container {
    margin: 10px;
  }
  
  .email-header {
    padding: 20px 15px;
  }
  
  .email-content {
    padding: 20px 15px;
  }
  
  .action-section,
  .security-tips {
    padding: 15px;
  }
}
</style> 