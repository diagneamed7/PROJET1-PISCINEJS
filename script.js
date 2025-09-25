/* =======================
   Bibliothèque JS simplifié
======================= */

// ----- Données globales -----
let livres = [];
let utilisateurs = [];
let emprunts = [];

let prochainIdLivre = 1;
let prochainIdUtilisateur = 1;
let prochainIdEmprunt = 1;

// ----- LocalStorage -----
function saveData() {
    localStorage.setItem('bibliotheque', JSON.stringify({livres, utilisateurs, emprunts, prochainIdLivre, prochainIdUtilisateur, prochainIdEmprunt}));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('bibliotheque'));
    if (data) {
        livres = data.livres || [];
        utilisateurs = data.utilisateurs || [];
        emprunts = data.emprunts || [];
        prochainIdLivre = data.prochainIdLivre || 1;
        prochainIdUtilisateur = data.prochainIdUtilisateur || 1;
        prochainIdEmprunt = data.prochainIdEmprunt || 1;
    }
}

// ----- Gestion Livres -----
function ajouterLivre(titre, auteur, quantite) {
    if (!titre || !auteur || !quantite) return alert('Remplir tous les champs');
    livres.push({id: prochainIdLivre++, titre, auteur, quantiteTotal: Number(quantite), quantiteDisponible: Number(quantite)});
    saveData();
    afficherLivres();
    remplirSelectsEmprunt();
}

function afficherLivres() {
    const liste = document.getElementById('liste-livres');
    liste.innerHTML = livres.map(l => `
        <div class="card"><div>
        <div><strong>${l.titre}</strong> — ${l.auteur}</div>
        <div class="muted">Disponible: ${l.quantiteDisponible}/${l.quantiteTotal}</div></div>
        <div class="row">
        <button class="small" onclick="ouvrirEditionLivre(${l.id})">Modifier</button>
        <button class="small" onclick="supprimerLivre(${l.id})">Supprimer</button>
        </div></div>
    `).join('');
}

function supprimerLivre(id) {
    // Vérifie si le livre est emprunté
    const encours = emprunts.find(e => e.livreId === id && e.statut === 'actif');
    if (encours) return alert('Livre actuellement emprunté !');
    livres = livres.filter(l => l.id !== id);
    saveData();
    afficherLivres();
    remplirSelectsEmprunt();
}

// Modifier un livre
function modifierLivre(id, champs) {
    const livre = livres.find(l => l.id === id);
    if (!livre) return alert('Livre introuvable');
    const nouveauTitre = champs.titre?.trim();
    const nouvelAuteur = champs.auteur?.trim();
    const nouvelleQuantiteTotal = champs.quantiteTotal !== undefined ? Number(champs.quantiteTotal) : undefined;

    if (nouveauTitre !== undefined && nouveauTitre.length === 0) return alert('Titre invalide');
    if (nouvelAuteur !== undefined && nouvelAuteur.length === 0) return alert('Auteur invalide');
    if (nouvelleQuantiteTotal !== undefined && (!Number.isInteger(nouvelleQuantiteTotal) || nouvelleQuantiteTotal <= 0)) return alert('Quantité invalide');

    if (nouveauTitre !== undefined) livre.titre = nouveauTitre;
    if (nouvelAuteur !== undefined) livre.auteur = nouvelAuteur;
    if (nouvelleQuantiteTotal !== undefined) {
        const diff = nouvelleQuantiteTotal - livre.quantiteTotal;
        const quantiteDisponibleCible = livre.quantiteDisponible + diff;
        if (quantiteDisponibleCible < 0) return alert('Quantité totale inférieure aux emprunts en cours');
        livre.quantiteTotal = nouvelleQuantiteTotal;
        livre.quantiteDisponible = quantiteDisponibleCible;
    }

    saveData();
    afficherLivres();
    remplirSelectsEmprunt();
}

// ----- Gestion Utilisateurs -----
function ajouterUtilisateur(nom, prenom, email) {
    if (!nom || !prenom || !email) return alert('Remplir tous les champs');
    utilisateurs.push({id: prochainIdUtilisateur++, nom, prenom, email});
    saveData();
    afficherUtilisateurs();
    remplirSelectsEmprunt();
}

function afficherUtilisateurs() {
    const liste = document.getElementById('liste-utilisateurs');
    liste.innerHTML = utilisateurs.map(u => `
        <div class="card"><div>
        <div><strong>${u.prenom} ${u.nom}</strong></div>
        <div class="muted">${u.email}</div></div>
        <div class="row">
        <button class="small" onclick="ouvrirEditionUtilisateur(${u.id})">Modifier</button>
        <button class="small" onclick="supprimerUtilisateur(${u.id})">Supprimer</button>
        </div></div>
    `).join('');
}

function supprimerUtilisateur(id) {
    const encours = emprunts.find(e => e.utilisateurId === id && e.statut === 'actif');
    if (encours) return alert('Utilisateur a un emprunt actif !');
    utilisateurs = utilisateurs.filter(u => u.id !== id);
    saveData();
    afficherUtilisateurs();
    remplirSelectsEmprunt();
}

// Modifier un utilisateur
function modifierUtilisateur(id, champs) {
    const user = utilisateurs.find(u => u.id === id);
    if (!user) return alert('Utilisateur introuvable');
    const nouveauNom = champs.nom?.trim();
    const nouveauPrenom = champs.prenom?.trim();
    const nouvelEmail = champs.email?.trim();

    if (nouveauNom !== undefined && nouveauNom.length === 0) return alert('Nom invalide');
    if (nouveauPrenom !== undefined && nouveauPrenom.length === 0) return alert('Prénom invalide');
    if (nouvelEmail !== undefined && nouvelEmail.length === 0) return alert('Email invalide');

    if (nouveauNom !== undefined) user.nom = nouveauNom;
    if (nouveauPrenom !== undefined) user.prenom = nouveauPrenom;
    if (nouvelEmail !== undefined) user.email = nouvelEmail;

    saveData();
    afficherUtilisateurs();
    remplirSelectsEmprunt();
}

// ----- Gestion Emprunts -----
function emprunterLivre(utilisateurId, livreId) {
    const user = utilisateurs.find(u => u.id === utilisateurId);
    const livre = livres.find(l => l.id === livreId);
    if (!user || !livre) return alert('Utilisateur ou livre introuvable');
    if (livre.quantiteDisponible <= 0) return alert('Livre indisponible');
    // Vérifie que l'utilisateur n'a pas déjà emprunté ce livre
    const deja = emprunts.find(e => e.utilisateurId === utilisateurId && e.livreId === livreId && e.statut === 'actif');
    if (deja) return alert('Utilisateur a déjà emprunté ce livre');
    emprunts.push({id: prochainIdEmprunt++, utilisateurId, livreId, dateEmprunt: new Date().toLocaleDateString(), statut: 'actif'});
    livre.quantiteDisponible--;
    saveData();
    afficherEmprunts();
    afficherLivres();
    remplirSelectsEmprunt();
}

function retournerLivre(empruntId) {
    const emp = emprunts.find(e => e.id === empruntId);
    if (!emp || emp.statut !== 'actif') return;
    emp.statut = 'retourné';
    const livre = livres.find(l => l.id === emp.livreId);
    if (livre) livre.quantiteDisponible++;
    saveData();
    afficherEmprunts();
    afficherLivres();
    remplirSelectsEmprunt();
}

function afficherEmprunts() {
    const liste = document.getElementById('liste-emprunts');
    const actifs = emprunts.filter(e => e.statut === 'actif');
    liste.innerHTML = actifs.map(e => {
        const user = utilisateurs.find(u => u.id === e.utilisateurId);
        const livre = livres.find(l => l.id === e.livreId);
        return `<div class="card"><div>
        <div><strong>${user ? user.prenom+' '+user.nom : '?'}</strong> → ${livre ? livre.titre : '?'}</div>
        <div class="muted">${e.dateEmprunt}</div></div>
        <div class="row"><button class="small" onclick="retournerLivre(${e.id})">Retourner</button></div></div>`;
    }).join('');
}

// ----- Modal Edition -----
function ouvrirEditionLivre(id) {
    const l = livres.find(x => x.id === id);
    if (!l) return;
    const modal = document.getElementById('modal');
    const form = document.getElementById('modal-form');
    document.getElementById('modal-title').textContent = 'Modifier le livre';
    form.setAttribute('data-type', 'livre');
    form.setAttribute('data-id', String(id));
    document.getElementById('modal-field-1-label').textContent = 'Titre';
    document.getElementById('modal-field-1').value = l.titre;
    document.getElementById('modal-field-2-label').textContent = 'Auteur';
    document.getElementById('modal-field-2').value = l.auteur;
    document.getElementById('modal-field-3-wrap').style.display = '';
    document.getElementById('modal-field-3-label').textContent = 'Quantité totale';
    document.getElementById('modal-field-3').value = String(l.quantiteTotal);
    modal.classList.add('open');
}

function ouvrirEditionUtilisateur(id) {
    const u = utilisateurs.find(x => x.id === id);
    if (!u) return;
    const modal = document.getElementById('modal');
    const form = document.getElementById('modal-form');
    document.getElementById('modal-title').textContent = 'Modifier l\'utilisateur';
    form.setAttribute('data-type', 'utilisateur');
    form.setAttribute('data-id', String(id));
    document.getElementById('modal-field-1-label').textContent = 'Nom';
    document.getElementById('modal-field-1').value = u.nom;
    document.getElementById('modal-field-2-label').textContent = 'Prénom';
    document.getElementById('modal-field-2').value = u.prenom;
    document.getElementById('modal-field-3-wrap').style.display = '';
    document.getElementById('modal-field-3-label').textContent = 'Email';
    document.getElementById('modal-field-3').value = u.email;
    modal.classList.add('open');
}

function fermerModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('open');
}

// ----- Remplissage selects -----
function remplirSelectsEmprunt() {
    const selUser = document.getElementById('emp-user');
    const selLivre = document.getElementById('emp-livre');
    if (!selUser || !selLivre) return;

    selUser.innerHTML = '<option value="">Choisir un utilisateur</option>';
    utilisateurs.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.nom + ' ' + u.prenom;
        selUser.appendChild(opt);
    });

    selLivre.innerHTML = '<option value="">Choisir un livre</option>';
    livres.filter(l => l.quantiteDisponible > 0).forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.titre + ' — ' + l.auteur + ' (' + l.quantiteDisponible + ')';
        selLivre.appendChild(opt);
    });
}

// ----- Listeners -----
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    afficherLivres();
    afficherUtilisateurs();
    afficherEmprunts();
    remplirSelectsEmprunt();

    // Formulaire ajout livre
    document.getElementById('form-livre').addEventListener('submit', e => {
        e.preventDefault();
        const titre = e.target['titre'].value;
        const auteur = e.target['auteur'].value;
        const quantite = e.target['quantite'].value;
        ajouterLivre(titre, auteur, quantite);
        e.target.reset();
    });

    // Formulaire ajout utilisateur
    document.getElementById('form-utilisateur').addEventListener('submit', e => {
        e.preventDefault();
        const nom = e.target['nom'].value;
        const prenom = e.target['prenom'].value;
        const email = e.target['email'].value;
        ajouterUtilisateur(nom, prenom, email);
        e.target.reset();
    });

    // Formulaire emprunt
    document.getElementById('form-emprunt').addEventListener('submit', e => {
        e.preventDefault();
        const userId = Number(e.target['user'].value);
        const livreId = Number(e.target['livre'].value);
        emprunterLivre(userId, livreId);
        e.target.reset();
    });

    // Soumission du modal d'édition
    document.getElementById('modal-form').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        const type = form.getAttribute('data-type');
        const id = Number(form.getAttribute('data-id'));
        const v1 = document.getElementById('modal-field-1').value.trim();
        const v2 = document.getElementById('modal-field-2').value.trim();
        const v3 = document.getElementById('modal-field-3').value.trim();
        if (type === 'livre') {
            const payload = {};
            if (v1) payload.titre = v1;
            if (v2) payload.auteur = v2;
            if (v3) payload.quantiteTotal = Number(v3);
            modifierLivre(id, payload);
            afficherLivres();
            remplirSelectsEmprunt();
        } else if (type === 'utilisateur') {
            const payload = {};
            if (v1) payload.nom = v1;
            if (v2) payload.prenom = v2;
            if (v3) payload.email = v3;
            modifierUtilisateur(id, payload);
            afficherUtilisateurs();
            remplirSelectsEmprunt();
        }
        fermerModal();
    });
});
