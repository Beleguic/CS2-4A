import { z } from 'zod'

// Schéma de validation des mots de passe selon les exigences CNIL
export const passwordSchema = z
  .string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un symbole spécial')
  .refine((password) => {
    // Vérifier qu'il n'y a pas de caractères répétés plus de 3 fois consécutivement
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return false
      }
    }
    return true
  }, 'Le mot de passe ne doit pas contenir plus de 3 caractères identiques consécutifs')
  .refine((password) => {
    // Vérifier qu'il n'y a pas de séquences de caractères (123, abc, etc.)
    const sequences = ['123', '234', '345', '456', '567', '678', '789', '012', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz']
    return !sequences.some(seq => password.toLowerCase().includes(seq))
  }, 'Le mot de passe ne doit pas contenir de séquences de caractères (123, abc, etc.)')

// Schéma pour la confirmation de mot de passe
export const confirmPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirmNewPassword']
})

// Fonction pour évaluer la force du mot de passe
export const evaluatePasswordStrength = (password: string): {
  score: number
  level: 'très faible' | 'faible' | 'moyen' | 'fort' | 'très fort'
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  // Longueur
  if (password.length >= 12) {
    score += 2
  } else if (password.length >= 8) {
    score += 1
    feedback.push('Augmentez la longueur du mot de passe')
  } else {
    feedback.push('Le mot de passe est trop court')
  }

  // Complexité
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  // Vérifications supplémentaires
  if (password.length >= 16) score += 1
  if (/[^a-zA-Z0-9]{2,}/.test(password)) score += 1 // Plusieurs symboles consécutifs

  // Pénalités
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    feedback.push('Évitez les caractères répétés')
  }

  if (/123|234|345|456|567|678|789|012|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    score -= 1
    feedback.push('Évitez les séquences de caractères')
  }

  // Déterminer le niveau
  let level: 'très faible' | 'faible' | 'moyen' | 'fort' | 'très fort'
  if (score <= 2) level = 'très faible'
  else if (score <= 4) level = 'faible'
  else if (score <= 6) level = 'moyen'
  else if (score <= 8) level = 'fort'
  else level = 'très fort'

  // Ajouter des suggestions selon le niveau
  if (level === 'très faible' || level === 'faible') {
    feedback.push('Utilisez des mots de passe plus complexes')
  }

  return { score, level, feedback }
}

// Fonction pour valider un mot de passe
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
  strength: ReturnType<typeof evaluatePasswordStrength>
} => {
  try {
    passwordSchema.parse(password)
    return {
      isValid: true,
      errors: [],
      strength: evaluatePasswordStrength(password)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message),
        strength: evaluatePasswordStrength(password)
      }
    }
    return {
      isValid: false,
      errors: ['Erreur de validation inconnue'],
      strength: evaluatePasswordStrength(password)
    }
  }
}

// Fonction pour obtenir les exigences CNIL
export const getCNILRequirements = () => ({
  minLength: 12,
  requirements: [
    'Au moins 12 caractères',
    'Au moins une lettre minuscule (a-z)',
    'Au moins une lettre majuscule (A-Z)',
    'Au moins un chiffre (0-9)',
    'Au moins un symbole spécial (!@#$%^&*...)',
    'Pas plus de 3 caractères identiques consécutifs',
    'Pas de séquences de caractères (123, abc, etc.)'
  ]
})

// Composable principal
export const usePasswordValidation = () => {
  return {
    passwordSchema,
    confirmPasswordSchema,
    changePasswordSchema,
    validatePassword,
    evaluatePasswordStrength,
    getCNILRequirements
  }
} 