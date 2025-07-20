<template>
  <div class="email-container">
    <div class="email-header">
      <img src="/logo-troupicool.png" alt="Tropicool Logo" class="logo">
      <h1>🔒 Mot de Passe Expiré</h1>
    </div>

    <div class="email-content">
      <p class="greeting">Bonjour {{ firstName }} {{ lastName }},</p>

      <div class="alert-box">
        <h2>⚠️ Votre mot de passe a expiré</h2>
        <p>
          Votre mot de passe a expiré pour des raisons de sécurité. 
          Votre compte est temporairement verrouillé jusqu'à ce que vous changiez votre mot de passe.
        </p>
        <p>
          <strong>Action requise :</strong> Vous devez changer votre mot de passe pour accéder à votre compte.
        </p>
      </div>

      <div class="action-section">
        <h3>🔄 Comment débloquer votre compte ?</h3>
        <ol>
          <li>Cliquez sur le bouton ci-dessous</li>
          <li>Vous serez redirigé vers la page de changement de mot de passe</li>
          <li>Choisissez un nouveau mot de passe sécurisé</li>
          <li>Votre compte sera automatiquement débloqué</li>
        </ol>

        <div class="cta-button">
          <a :href="changePasswordUrl" class="button">
            🔓 Débloquer mon compte
          </a>
        </div>
      </div>

      <div class="security-requirements">
        <h3>🔒 Exigences de sécurité</h3>
        <p>Votre nouveau mot de passe doit respecter ces critères :</p>
        <ul>
          <li>✅ Au moins 12 caractères</li>
          <li>✅ Au moins une lettre minuscule (a-z)</li>
          <li>✅ Au moins une lettre majuscule (A-Z)</li>
          <li>✅ Au moins un chiffre (0-9)</li>
          <li>✅ Au moins un caractère spécial (!@#$%^&*)</li>
          <li>❌ Ne pas réutiliser vos 5 derniers mots de passe</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>❓ Besoin d'aide ?</h3>
        <p>
          Si vous rencontrez des difficultés pour changer votre mot de passe, 
          contactez notre équipe support :
        </p>
        <div class="contact-info">
          <p>📧 Email : <a :href="`mailto:${supportEmail}`">{{ supportEmail }}</a></p>
          <p>🕒 Support disponible du lundi au vendredi, 9h-18h</p>
        </div>
      </div>

      <div class="important-note">
        <p>
          <strong>⚠️ Important :</strong> Pour votre sécurité, ce lien de changement de mot de passe 
          expire dans 24 heures. Si vous ne changez pas votre mot de passe dans ce délai, 
          vous devrez contacter notre support.
        </p>
      </div>
    </div>

    <div class="email-footer">
      <p>
        Cet email a été envoyé automatiquement par le système de sécurité de Tropicool.
        Si vous n'avez pas demandé ce changement, contactez immédiatement notre support.
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
  changePasswordUrl: {
    type: String,
    required: true
  },
  supportEmail: {
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
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
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

.alert-box {
  background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%);
  border-left: 5px solid #e74c3c;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  color: white;
}

.alert-box h2 {
  margin: 0 0 15px 0;
  font-size: 20px;
}

.alert-box p {
  margin: 10px 0;
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
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.security-requirements {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 5px solid #00b894;
}

.security-requirements h3 {
  margin: 0 0 15px 0;
  color: #00b894;
  font-size: 18px;
}

.security-requirements p {
  margin: 10px 0;
  color: #2d3436;
}

.security-requirements ul {
  margin: 15px 0;
  padding-left: 20px;
}

.security-requirements li {
  margin: 8px 0;
  color: #2d3436;
  font-weight: 500;
}

.help-section {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 5px solid #2196f3;
}

.help-section h3 {
  margin: 0 0 15px 0;
  color: #2196f3;
  font-size: 18px;
}

.help-section p {
  margin: 10px 0;
  color: #2d3436;
}

.contact-info {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
}

.contact-info p {
  margin: 8px 0;
  color: #555;
}

.contact-info a {
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;
}

.contact-info a:hover {
  text-decoration: underline;
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
  .security-requirements,
  .help-section {
    padding: 15px;
  }
}
</style> 