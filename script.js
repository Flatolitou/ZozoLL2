// Charger la liste des musiques
fetch('musiques.json')
    .then(response => response.json())
    .then(data => {
        let musiques = data;  // La liste des musiques
        let progression = []; // Liste vide pour stocker l'ordre des musiques
        let currentIndex = 0;

        // Afficher les deux premières musiques du duel
        function showDuel() {
            if (currentIndex >= musiques.length) {
                alert("Le classement est terminé !");
                return;
            }

            const music1 = musiques[currentIndex];
            const music2 = musiques[currentIndex + 1];

            document.getElementById('music1-name').innerText = music1.name;
            document.getElementById('music2-name').innerText = music2.name;

            document.getElementById('music1-source').src = music1.link;
            document.getElementById('music2-source').src = music2.link;

            document.getElementById('music1-player').load();
            document.getElementById('music2-player').load();
        }

        // Choisir une musique gagnante et la placer dans la liste triée
        function chooseWinner(winner) {
            const music1 = musiques[currentIndex];
            const music2 = musiques[currentIndex + 1];

            if (winner === 'music1') {
                progression.push(music1);
                musiques.splice(currentIndex, 1); // Enlever la musique perdante
            } else {
                progression.push(music2);
                musiques.splice(currentIndex + 1, 1); // Enlever la musique perdante
            }

            currentIndex += 1; // Passer au prochain duel
            showDuel();
        }

        // Ajouter les événements sur les boutons
        document.getElementById('choose-music1').addEventListener('click', () => chooseWinner('music1'));
        document.getElementById('choose-music2').addEventListener('click', () => chooseWinner('music2'));

        // Initialiser le premier duel
        showDuel();
    })
    .catch(error => console.error('Erreur lors du chargement des musiques:', error));