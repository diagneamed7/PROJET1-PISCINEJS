// ===== DONNÉES GLOBALES (TABLEAUX ET OBJETS) =====
let livres = [];
let utilisateurs = [];
let emprunts = [];
let prochainIdLivre = 1;
let prochainIdUtilisateur = 1;
let prochainIdEmprunt = 1;

// ===== GESTION DES LIVRES =====
function ajouterLivre(titre, auteur, quantite) {
    // Créer un OBJET livre
    const nouveauLivre = {
        id: prochainIdLivre++,
        titre: titre,
        auteur: auteur,
        quantiteTotal: parseInt(quantite),
        quantiteDisponible: parseInt(quantite)
    };
    
    // Ajouter l'objet au TABLEAU des livres
    livres.push(nouveauLivre);
    console.log("Livre ajouté:", nouveauLivre);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('bibliotheque_livres', JSON.stringify(livres));
    localStorage.setItem('bibliotheque_ids', JSON.stringify({
        prochainIdLivre, prochainIdUtilisateur, prochainIdEmprunt
    }));
    
    afficherLivres();
    return true;
}

function afficherLivres() {
    const listeLivres = document.getElementById('liste-livres');
    
    // Vider la liste
    listeLivres.innerHTML = '';
    
    // PARCOURIR le tableau des livres
    for (let i = 0; i < livres.length; i++) {
        const livre = livres[i]; // OBJET livre
        
        // Créer l'HTML pour chaque livre
        const divLivre = document.createElement('div');
        divLivre.className = 'item';
        divLivre.innerHTML = `
            <h4>${livre.titre}</h4>
            <p><strong>Auteur:</strong> ${livre.auteur}</p>
            <p><strong>Quantité:</strong> ${livre.quantiteDisponible}/${livre.quantiteTotal}</p>
            <button onclick="supprimerLivre(${livre.id})">Supprimer</button>
        `;
        
        listeLivres.appendChild(divLivre);
    }
    
    // Mettre à jour les selects
    mettreAJourSelectLivres();
}

function supprimerLivre(id) {
    // RECHERCHER dans le tableau et supprimer
    for (let i = 0; i < livres.length; i++) {
        if (livres[i].id === id) {
            livres.splice(i, 1); // Supprimer du tableau
            break;
        }
    }
    
    console.log("Livre supprimé, livres restants:", livres);
    localStorage.setItem('bibliotheque_livres', JSON.stringify(livres));
    afficherLivres();
}

// ===== GESTION DES UTILISATEURS =====
function ajouterUtilisateur(nom, prenom, email) {
    // Créer un OBJET utilisateur
    const nouvelUtilisateur = {
        id: prochainIdUtilisateur++,
        nom: nom,
        prenom: prenom,
        email: email
    };
    
    // Ajouter l'objet au TABLEAU des utilisateurs
    utilisateurs.push(nouvelUtilisateur);
    console.log("Utilisateur ajouté:", nouvelUtilisateur);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('bibliotheque_utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('bibliotheque_ids', JSON.stringify({
        prochainIdLivre, prochainIdUtilisateur, prochainIdEmprunt
    }));
    
    afficherUtilisateurs();
    return true;
}

function afficherUtilisateurs() {
    const listeUtilisateurs = document.getElementById('liste-utilisateurs');
    
    // Vider la liste
    listeUtilisateurs.innerHTML = '';
    
    // PARCOURIR le tableau des utilisateurs
    for (let i = 0; i < utilisateurs.length; i++) {
        const utilisateur = utilisateurs[i]; // OBJET utilisateur
        
        // Créer l'HTML pour chaque utilisateur
        const divUtilisateur = document.createElement('div');
        divUtilisateur.className = 'item';
        divUtilisateur.innerHTML = `
            <h4>${utilisateur.prenom} ${utilisateur.nom}</h4>
            <p><strong>Email:</strong> ${utilisateur.email}</p>
            <button onclick="supprimerUtilisateur(${utilisateur.id})">Supprimer</button>
        `;
        
        listeUtilisateurs.appendChild(divUtilisateur);
    }
    
    // Mettre à jour les selects
    mettreAJourSelectUtilisateurs();
}

function supprimerUtilisateur(id) {
    // RECHERCHER dans le tableau et supprimer
    for (let i = 0; i < utilisateurs.length; i++) {
        if (utilisateurs[i].id === id) {
            utilisateurs.splice(i, 1); // Supprimer du tableau
            break;
        }
    }
    
    console.log("Utilisateur supprimé, utilisateurs restants:", utilisateurs);
    localStorage.setItem('bibliotheque_utilisateurs', JSON.stringify(utilisateurs));
    afficherUtilisateurs();
}

// ===== GESTION DES EMPRUNTS =====
function emprunterLivre(utilisateurId, livreId) {
    // Convertir en nombres
    utilisateurId = parseInt(utilisateurId);
    livreId = parseInt(livreId);
    
    // RECHERCHER les objets dans les tableaux
    const utilisateur = obtenirUtilisateurParId(utilisateurId);
    const livre = obtenirLivreParId(livreId);
    
    if (!utilisateur || !livre) {
        alert("Utilisateur ou livre introuvable");
        return false;
    }
    
    // Vérifier la disponibilité
    if (livre.quantiteDisponible <= 0) {
        alert("Ce livre n'est plus disponible");
        return false;
    }
    
    // Vérifier si déjà emprunté
    if (verifierEmpruntExistant(utilisateurId, livreId)) {
        alert("Cet utilisateur a déjà emprunté ce livre");
        return false;
    }
    
    // Créer un OBJET emprunt
    const nouvelEmprunt = {
        id: prochainIdEmprunt++,
        utilisateurId: utilisateurId,
        livreId: livreId,
        dateEmprunt: new Date().toLocaleDateString(),
        statut: "actif"
    };
    
    // Ajouter l'objet au TABLEAU des emprunts
    emprunts.push(nouvelEmprunt);
    
    // MODIFIER l'objet livre (décrémenter quantité)
    livre.quantiteDisponible--;
    
    console.log("Emprunt créé:", nouvelEmprunt);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('bibliotheque_emprunts', JSON.stringify(emprunts));
    localStorage.setItem('bibliotheque_livres', JSON.stringify(livres));
    localStorage.setItem('bibliotheque_ids', JSON.stringify({
        prochainIdLivre, prochainIdUtilisateur, prochainIdEmprunt
    }));
    
    afficherEmprunts();
    afficherLivres();
    return true;
}

function retournerLivre(empruntId) {
    // RECHERCHER l'emprunt dans le tableau
    let emprunt = null;
    for (let i = 0; i < emprunts.length; i++) {
        if (emprunts[i].id === empruntId) {
            emprunt = emprunts[i];
            break;
        }
    }
    
    if (!emprunt || emprunt.statut !== 'actif') {
        alert("Emprunt introuvable ou déjà retourné");
        return;
    }
    
    // RECHERCHER le livre associé
    const livre = obtenirLivreParId(emprunt.livreId);
    if (!livre) {
        alert("Livre introuvable");
        return;
    }
    
    // MODIFIER l'objet emprunt
    emprunt.statut = 'retourné';
    emprunt.dateRetour = new Date().toLocaleDateString();
    
    // MODIFIER l'objet livre (incrémenter quantité)
    livre.quantiteDisponible++;
    
    console.log("Livre retourné:", emprunt);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('bibliotheque_emprunts', JSON.stringify(emprunts));
    localStorage.setItem('bibliotheque_livres', JSON.stringify(livres));
    
    afficherEmprunts();
    afficherLivres();
}

function afficherEmprunts() {
    const listeEmprunts = document.getElementById('liste-emprunts');
    
    // Vider la liste
    listeEmprunts.innerHTML = '';
    
    // FILTRER les emprunts actifs du tableau
    const empruntsActifs = [];
    for (let i = 0; i < emprunts.length; i++) {
        if (emprunts[i].statut === 'actif') {
            empruntsActifs.push(emprunts[i]);
        }
    }
    
    // PARCOURIR les emprunts actifs
    for (let i = 0; i < empruntsActifs.length; i++) {
        const emprunt = empruntsActifs[i]; // OBJET emprunt
        
        // RECHERCHER les objets associés
        const utilisateur = obtenirUtilisateurParId(emprunt.utilisateurId);
        const livre = obtenirLivreParId(emprunt.livreId);
        
        if (utilisateur && livre) {
            // Créer l'HTML pour chaque emprunt
            const divEmprunt = document.createElement('div');
            divEmprunt.className = 'item';
            divEmprunt.innerHTML = `
                <h4>${livre.titre}</h4>
                <p><strong>Emprunté par:</strong> ${utilisateur.prenom} ${utilisateur.nom}</p>
                <p><strong>Date:</strong> ${emprunt.dateEmprunt}</p>
                <button onclick="retournerLivre(${emprunt.id})">Retourner</button>
            `;
            
            listeEmprunts.appendChild(divEmprunt);
        }
    }
}

// ===== FONCTIONS UTILITAIRES (RECHERCHE DANS TABLEAUX) =====
function obtenirLivreParId(id) {
    // PARCOURIR le tableau des livres
    for (let i = 0; i < livres.length; i++) {
        if (livres[i].id === id) {
            return livres[i]; // Retourner l'OBJET trouvé
        }
    }
    return null; // Non trouvé
}

function obtenirUtilisateurParId(id) {
    // PARCOURIR le tableau des utilisateurs
    for (let i = 0; i < utilisateurs.length; i++) {
        if (utilisateurs[i].id === id) {
            return utilisateurs[i]; // Retourner l'OBJET trouvé
        }
    }
    return null; // Non trouvé
}

function verifierEmpruntExistant(utilisateurId, livreId) {
    // PARCOURIR le tableau des emprunts
    for (let i = 0; i < emprunts.length; i++) {
        const emprunt = emprunts[i]; // OBJET emprunt
        if (emprunt.utilisateurId === utilisateurId && 
            emprunt.livreId === livreId && 
            emprunt.statut === 'actif') {
            return true; // Emprunt existant trouvé
        }
    }
    return false; // Aucun emprunt existant
}

// ===== MISE À JOUR DES SELECTS =====
function mettreAJourSelectUtilisateurs() {
    const select = document.getElementById('emprunt-utilisateur');
    if (!select) return;
    
    // Vider le select
    select.innerHTML = '<option value="">Sélectionner un utilisateur</option>';
    
    // PARCOURIR le tableau des utilisateurs
    for (let i = 0; i < utilisateurs.length; i++) {
        const user = utilisateurs[i]; // OBJET utilisateur
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.prenom} ${user.nom}`;
        select.appendChild(option);
    }
}

function mettreAJourSelectLivres() {
    const select = document.getElementById('emprunt-livre');
    if (!select) return;
    
    // Vider le select
    select.innerHTML = '<option value="">Sélectionner un livre</option>';
    
    // FILTRER et PARCOURIR les livres disponibles
    for (let i = 0; i < livres.length; i++) {
        const livre = livres[i]; // OBJET livre
        if (livre.quantiteDisponible > 0) {
            const option = document.createElement('option');
            option.value = livre.id;
            option.textContent = `${livre.titre} (${livre.quantiteDisponible} disponible(s))`;
            select.appendChild(option);
        }
    }
}

// ===== CHARGEMENT DEPUIS LOCALSTORAGE =====
function chargerDonnees() {
    try {
        // Charger les TABLEAUX depuis localStorage
        const livresStockes = localStorage.getItem('bibliotheque_livres');
        const utilisateursStockes = localStorage.getItem('bibliotheque_utilisateurs');
        const empruntsStockes = localStorage.getItem('bibliotheque_emprunts');
        const idsStockes = localStorage.getItem('bibliotheque_ids');

        if (livresStockes) {
            livres = JSON.parse(livresStockes); // Convertir JSON en TABLEAU d'OBJETS
        }
        if (utilisateursStockes) {
            utilisateurs = JSON.parse(utilisateursStockes); // Convertir JSON en TABLEAU d'OBJETS
        }
        if (empruntsStockes) {
            emprunts = JSON.parse(empruntsStockes); // Convertir JSON en TABLEAU d'OBJETS
        }
        if (idsStockes) {
            const ids = JSON.parse(idsStockes);
            prochainIdLivre = ids.prochainIdLivre || 1;
            prochainIdUtilisateur = ids.prochainIdUtilisateur || 1;
            prochainIdEmprunt = ids.prochainIdEmprunt || 1;
        }

        // Si aucune donnée, charger les données de test
        if (livres.length === 0) {
            chargerDonneesTest();
        }
        
        console.log("Données chargées:");
        console.log("Livres:", livres);
        console.log("Utilisateurs:", utilisateurs);
        console.log("Emprunts:", emprunts);
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        chargerDonneesTest();
    }
}

function chargerDonneesTest() {
    // TABLEAUX avec des OBJETS de test
    livres = [
        {
            id: 1,
            titre: "Le Petit Prince",
            auteur: "Antoine de Saint-Exupéry",
            quantiteTotal: 3,
            quantiteDisponible: 2
        },
        {
            id: 2,
            titre: "1984",
            auteur: "George Orwell",
            quantiteTotal: 2,
            quantiteDisponible: 1
        }
    ];

    utilisateurs = [
        {
            id: 1,
            nom: "Dupont",
            prenom: "Jean",
            email: "jean.dupont@email.com"
        },
        {
            id: 2,
            nom: "Martin",
            prenom: "Marie",
            email: "marie.martin@email.com"
        }
    ];

    emprunts = [
        {
            id: 1,
            utilisateurId: 1,
            livreId: 1,
            dateEmprunt: new Date().toLocaleDateString(),
            statut: "actif"
        }
    ];

    prochainIdLivre = 3;
    prochainIdUtilisateur = 3;
    prochainIdEmprunt = 2;

    // Sauvegarder les données de test
    localStorage.setItem('bibliotheque_livres', JSON.stringify(livres));
    localStorage.setItem('bibliotheque_utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('bibliotheque_emprunts', JSON.stringify(emprunts));
    localStorage.setItem('bibliotheque_ids', JSON.stringify({
        prochainIdLivre, prochainIdUtilisateur, prochainIdEmprunt
    }));
}

// ===== GESTION DES FORMULAIRES =====
function gererFormulaires() {
    // Formulaire livre
    const formLivre = document.getElementById('form-livre');
    if (formLivre) {
        formLivre.addEventListener('submit', function(e) {
            e.preventDefault();
            const titre = document.getElementById('livre-titre').value;
            const auteur = document.getElementById('livre-auteur').value;
            const quantite = document.getElementById('livre-quantite').value;
            
            if (titre && auteur && quantite) {
                ajouterLivre(titre, auteur, quantite);
                formLivre.reset();
            } else {
                alert('Veuillez remplir tous les champs');
            }
        });
    }

    // Formulaire utilisateur
    const formUtilisateur = document.getElementById('form-utilisateur');
    if (formUtilisateur) {
        formUtilisateur.addEventListener('submit', function(e) {
            e.preventDefault();
            const nom = document.getElementById('utilisateur-nom').value;
            const prenom = document.getElementById('utilisateur-prenom').value;
            const email = document.getElementById('utilisateur-email').value;
            
            if (nom && prenom && email) {
                ajouterUtilisateur(nom, prenom, email);
                formUtilisateur.reset();
            } else {
                alert('Veuillez remplir tous les champs');
            }
        });
    }

    // Formulaire emprunt
    const formEmprunt = document.getElementById('form-emprunt');
    if (formEmprunt) {
        formEmprunt.addEventListener('submit', function(e) {
            e.preventDefault();
            const utilisateurId = document.getElementById('emprunt-utilisateur').value;
            const livreId = document.getElementById('emprunt-livre').value;
            
            if (utilisateurId && livreId) {
                emprunterLivre(utilisateurId, livreId);
                formEmprunt.reset();
            } else {
                alert('Veuillez sélectionner un utilisateur et un livre');
            }
        });
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== SYSTÈME DE BIBLIOTHÈQUE ===');
    console.log('Chargement des données...');
    
    // Charger les données
    chargerDonnees();
    
    // Configurer les formulaires
    gererFormulaires();
    
    // Affichage initial
    afficherLivres();
    afficherUtilisateurs();
    afficherEmprunts();
    
    console.log('Système initialisé avec succès !');
    console.log(`${livres.length} livres, ${utilisateurs.length} utilisateurs`);
});