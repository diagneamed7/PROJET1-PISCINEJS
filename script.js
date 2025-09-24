// ===================================
// EXERCICE 1 : SYSTÈME DE GESTION DE BIBLIOTHÈQUE
// ===================================

// Objectif : Créer un système complet de gestion de bibliothèque
// Utilise : variables, opérateurs, conditions, boucles, fonctions

// Structure de données principales
const bibliotheque = {
    livres: [],
    utilisateurs: [],
    emprunts: [],
    prochainIdLivre: 1,
    prochainIdUtilisateur: 1,
    prochainIdEmprunt: 1
};


 //Mettre à jour un livre
function mettreAjourLivre(id, nouvellesInfos){
    const Livre = bibliotheque.livres.find(livre => livre.id === id);
    if (livre){
        if (nouvellesInfos.titre) livre.titre = nouvellesInfos.titre;
        if (nouvellesInfos.auteur) livre.auteur = nouvellesInfos.auteur;
        if (nouvellesInfos.annee) livre.annee = nouvellesInfos.annee;
        console.log("Livre mis à jour :", livre);
        return livre;
    }
    else{
        console.log("Livre non trouvé");
        return null;
    }
}

//Supprimer un livre
function supprimerLivre(id) {
    const index = bibliotheque.livres.findIndex(livre => livre.id === id);

    if (index !== -1) {
        // splice retourne un tableau des éléments supprimés
        const livreSupprime = bibliotheque.livres.splice(index, 1)[0];
        console.log(`Livre "${livreSupprime.titre}" supprimé`);
        return livreSupprime;
    }
    
    console.log(`Livre avec ID ${id} non trouvé`);
    return null;
}

//2. Gestion des Utilisateurs
//✅ Ajouter un utilisateur : Nom, prénom, email
//✅ Afficher tous les utilisateurs : Liste simple
//✅ Supprimer un utilisateur : Retirer un utilisateur

//Ajouter un utilisateur. 
 function ajouterUtilisateur(nom, email, telephone) {
    // TODO: Implémenter l'ajout d'utilisateur
    // - Valider l'email (format correct)
    if (!email.includes('@') || !email.includes('.')) {
        return { succes: false, message: "Email invalide" };
    }
    // - Valider le téléphone (10 chiffres)
    /**
        if (!/^\d{10}$/.test(telephone)) {
        return { succes: false, message: "Téléphone invalide" };
    }
     */

    // - Vérifier que l'email n'existe pas déjà
    const utilisateurExistant = bibliotheque.utilisateurs.find(utilisateur => utilisateur.email === email);
    if (utilisateurExistant) {
        return { succes: false, message: "Cet utilisateur existe déjà" };
    }
    // - Créer l'utilisateur avec ID unique
    const nouvelUtilisateur = {
        id: bibliotheque.prochainIdUtilisateur,
        nom: nom,
        email: email,
        telephone: telephone
    };
    bibliotheque.prochainIdUtilisateur++;
    
    bibliotheque.utilisateurs.push(nouvelUtilisateur);
    return { succes: true, message: "Utilisateur ajouté avec succès", utilisateur: nouvelUtilisateur };
}
