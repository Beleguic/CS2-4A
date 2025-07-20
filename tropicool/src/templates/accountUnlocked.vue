<template>
  <div class="email-template">
    <div class="email-header">
      <img src="/src/assets/logo-troupicool.png" alt="Tropicool Logo" class="logo" />
      <h1>🔓 Compte Déverrouillé</h1>
    </div>

    <div class="email-content">
      <p>Bonjour {{ firstName }} {{ lastName }},</p>

      <div class="success-box">
        <h2>Votre compte a été déverrouillé</h2>
        <p>
          <strong>Bonne nouvelle !</strong> Votre compte Tropicool a été déverrouillé 
          et vous pouvez maintenant vous connecter normalement.
        </p>
      </div>

      <div class="action-section">
        <h3>Vous pouvez maintenant vous connecter</h3>
        <p>
          Votre compte est à nouveau accessible. Assurez-vous d'utiliser 
          vos identifiants corrects lors de votre prochaine connexion.
        </p>

        <div class="cta-button">
          <a :href="loginUrl" class="button">
            🔐 Se connecter maintenant
          </a>
        </div>
      </div>

      <div class="security-reminder">
        <h3>Rappel de sécurité</h3>
        <p>
          Pour éviter un nouveau verrouillage de votre compte, 
          veuillez vous assurer de :
        </p>
        <ul>
          <li>Utiliser le bon email et mot de passe</li>
          <li>Vérifier que votre clavier n'est pas en mode majuscules</li>
          <li>Ne pas partager vos identifiants avec d'autres personnes</li>
          <li>Utiliser un mot de passe fort et unique</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>Besoin d'aide ?</h3>
        <p>
          Si vous avez oublié votre mot de passe ou rencontrez des difficultés, 
          n'hésitez pas à nous contacter :
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
        </div>
      </div>
    </div>

    <div class="email-footer">
      <p>
        Cet email a été envoyé automatiquement pour vous informer du déverrouillage de votre compte.
      </p>
      <p>
        Cordialement,<br>
        L'équipe Tropicool
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  username: String,
  firstName: String,
  lastName: String,
  loginUrl: String
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

.success-box {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.success-box h2 {
  color: #155724;
  margin-top: 0;
  font-size: 20px;
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

.action-section p {
  margin: 0 0 20px 0;
  color: #333;
}

.cta-button {
  text-align: center;
  margin: 25px 0;
}

.button {
  display: inline-block;
  background: #28a745;
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  transition: background 0.3s ease;
}

.button:hover {
  background: #218838;
}

.security-reminder {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.security-reminder h3 {
  color: #856404;
  margin-top: 0;
  font-size: 18px;
}

.security-reminder ul {
  margin: 15px 0;
  padding-left: 20px;
}

.security-reminder li {
  margin-bottom: 8px;
  color: #856404;
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