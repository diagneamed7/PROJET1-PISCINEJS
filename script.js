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
        <div>${l.titre} — ${l.auteur} (Disponible: ${l.quantiteDisponible}) 
        <button onclick="supprimerLivre(${l.id})">Supprimer</button></div>
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
        <div>${u.nom} ${u.prenom} (${u.email}) 
        <button onclick="supprimerUtilisateur(${u.id})">Supprimer</button></div>
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
        return `<div>${user ? user.nom+' '+user.prenom : '?'} → ${livre ? livre.titre : '?'} 
        <button onclick="retournerLivre(${e.id})">Retourner</button></div>`;
    }).join('');
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
});
