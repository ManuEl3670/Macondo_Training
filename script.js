document.addEventListener('DOMContentLoaded', () => {

    // --- 1. NAVIGAZIONE DEL MENU ---
    const menuItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // rimuove la calsse active da tutti i link del menu
            menuItems.forEach(i => i.classList.remove('active'));
            // nasconde tutte le sezioni di pagina
            sections.forEach(s => s.classList.remove('active-view'));

            // attiva il link cliccato e mostra la sezione corrispondente
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active-view');
        });
    });

    // bottone rapido nella dashboard per andare subito alla scheda allenamento
    const quickStartBtn = document.getElementById('quick-start-btn');
    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', () => {
            document.querySelector('[data-target="workout-view"]').click();
        });
    }

    // --- 2. CALENDARIO DI SISTEMA DIRETTO ---
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const oggi = new Date();
        const opzioni = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = oggi.toLocaleDateString('it-IT', opzioni);

        // --- 3. CRONOMETRO DI RECUPERO ---
        let timerIntervallo;
        let secondi = 0;
        const timerDisplay = document.getElementById('workout-timer');

        function avviaTimer() {
            if (!timerIntervallo) {
                timerIntervallo = setInterval(() => {
                    secondi++;
                    let min = Math.floor(secondi / 60).toString().padStart(2, '0');
                    let sec = (secondi % 60).toString().padStart(2, '0');
                    timerDisplay.textContent = `${min}:${sec}`;
                }, 1000);
            }
        }
    // IL timer si avvia da solo appena l'atleta apre la schermata nuovo allenamento
    document.querySelector('[data-target="workout-view"]').addEventListener('click', avviaTimer);

    // --- 4. AGGIUNTA DEI SET ALLA TABELLA ---
    const tbody = document.getElementById('workout-sets-tbody');
    const addSetBtn = document.getElementById('add-set-btn');
    let setCount = 0;

    addSetBtn.addEventListener('click', () => {
        setCount++;
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><strong>${setCount}</strong></td>
        <td><input type="number" class="input-weight" placeholder="0"> kg</td>
        <td><input type="number" class="input-reps" placeholder="0"></td>
        <td><input type="number" class="input-rpe" min="1" max="10" placeholder="10"></td>
        <td><button class="btn-danger remove-set-btn"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(row);
     
        // Sistema di eliminazione della singola riga inserita
        row.querySelector('.remove-set-btn').addEventListener('click', () => {
            row.remove();
            ricalcolaNumeriSet();
        });
    });

    function ricalcolaNumeriSet() {
        const righe = tbody.querySelectorAll('tr');
        setCount = righe.length;
        righe.forEach((riga, index) => {
            riga.querySelector('td:first-child').innerHTML = `<strong>${index + 1}</strong>`;
        });
    }
    
    // --- 5. COMPORTAMENTO TASTO SALVA ---
    const saveBtn = document.getElementById('save-workout-btn');
    saveBtn.addEventListener('click', () => {
        const righe = tbody.querySelectorAll('tr');
        if (righe.length === 0) {
            alert("Attenzione: Inserisci almeno una serie prima di chiudere la sessione!");
            return;
        }

        // Trova il picco di carico massimo per aggiornare il contatore in dashboard
        let maxWeight = 0;
        righe.forEach(riga => {
            const peso = parseFloat(riga.querySelector('.input-weight').value) || 0;
            if (peso > maxWeight) maxWeight = peso;
        });

        const esercizioSelezionato = document.getElementById('exercise-select').value;

        // Se l'esercizio era lo squat, aggiorna il widget delal dashboard
        if (esercizioSelezionato === 'squat' && maxWeight > 0){
            document.getElementById('dash-squat').textContent = `${maxWeight} kg`;
        }
        
        //resetta la tabella pulendola per il prossimo allenamento
        tbody.innerHTML = '';
        setCount = 0;

        alert("Sessione salvata nel registro locale!");

        //riporta l'utente automaticamente alla dashboard principale
        document.querySelector('[data-target="dashboard-view"]').click();
    });
});