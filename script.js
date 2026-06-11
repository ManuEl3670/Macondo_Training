document.addEventListener('DOMContentLoaded', () => {

    // --- 1. NAVIGAZIONE DEL MENU ---
    const menuItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-view'));

            item.classList.add('active');
            const target = item.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add('active-view');
            }
        });
    });

    const quickStartBtn = document.getElementById('quick-start-btn');
    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', () => {
            const workoutTab = document.querySelector('[data-target="workout-view"]');
            if (workoutTab) workoutTab.click();
        });
    }

    // --- 2. CALENDARIO DI SISTEMA DIRETTO ---
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const oggi = new Date();
        const opzioni = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = oggi.toLocaleDateString('it-IT', opzioni);
    }

    // --- 3. CRONOMETRO DI RECUPERO ---
    let timerIntervallo;
    let secondi = 0;
    const timerDisplay = document.getElementById('workout-timer');

    function avviaTimer() {
        if (!timerIntervallo && timerDisplay) {
            timerIntervallo = setInterval(() => {
                secondi++;
                let min = Math.floor(secondi / 60).toString().padStart(2, '0');
                let sec = (secondi % 60).toString().padStart(2, '0');
                timerDisplay.textContent = `${min}:${sec}`;
            }, 1000);
        }
    }
    
    const workoutViewBtn = document.querySelector('[data-target="workout-view"]');
    if (workoutViewBtn) {
        workoutViewBtn.addEventListener('click', avviaTimer);
    }

    // --- 4. AGGIUNTA DEI SET ALLA TABELLA ---
    const tbody = document.getElementById('workout-sets-tbody');
    const addSetBtn = document.getElementById('add-set-btn');
    let setCount = 0;

    if (addSetBtn && tbody) {
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
        
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', calcolaLive1RM);
            });

            row.querySelector('.remove-set-btn').addEventListener('click', () => {
                row.remove();
                ricalcolaNumeriSet();
                calcolaLive1RM();
            });
        });
    }

    function ricalcolaNumeriSet() {
        if (!tbody) return;
        const righe = tbody.querySelectorAll('tr');
        setCount = righe.length;
        righe.forEach((riga, index) => {
            const firstTd = riga.querySelector('td:first-child');
            if (firstTd) {
                firstTd.innerHTML = `<strong>${index + 1}</strong>`;
            }
        });
    }
    
    // --- CALCOLO LIVE 1RM CORRETTO (Sistemata la variabile numerica che rompeva tutto) ---
    function calcolaLive1RM() {
        if (!tbody) return;
        const righe = tbody.querySelectorAll('tr');
        let max1RMCorrente = 0;

        righe.forEach(riga => {
            const pesoInput = riga.querySelector('.input-weight');
            const repsInput = riga.querySelector('.input-reps');
            const rpeInput = riga.querySelector('.input-rpe');

            const peso = pesoInput ? (parseFloat(pesoInput.value) || 0) : 0;
            const rep = repsInput ? (parseInt(repsInput.value) || 0) : 0; 
            const rpe = rpeInput ? (parseFloat(rpeInput.value) || 10) : 10;

            if (peso > 0 && rep > 0) {
                const repVirtuali = rep + (10 - rpe);
                const formula1RM = peso * (1 + repVirtuali / 30); // 1rm -> formula1RM
                if (formula1RM > max1RMCorrente) {
                    max1RMCorrente = formula1RM;
                }
            }
        });
        
        const liveDisplay = document.getElementById('live-1rm-val');
        if (liveDisplay) {
            liveDisplay.textContent = `${Math.round(max1RMCorrente)} kg`;
        }
        return max1RMCorrente
    }

    // --- 5. COMPORTAMENTO TASTO SALVA ---
    const saveBtn = document.getElementById('save-workout-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!tbody) return;
            const righe = tbody.querySelectorAll('tr');
            if (righe.length === 0) {
                alert("Attenzione: Inserisci almeno una serie prima di chiudere la sessione!");
                return;
            }

            const miglior1RMSessione=Math.round(calcolaLive1RM());
            const exerciseSelect=document.getElementById('exercise-select')
            const esercizioSelezionato=exerciseSelect ? exerciseSelect.value:'';

            //aggiorna widget della dashboard
            if (miglior1RMSessione> 0) {
                if (esercizioSelezionato === 'squat') {
                    const el = document.getElementById('dash-squat');
                    if (el) el.textContent = `${miglior1RMSessione} kg`;
                } else if (esercizioSelezionato === 'bench') {
                    const el = document.getElementById('dash-bench');
                    if (el) el.textContent = `${miglior1RMSessione} kg`;
                } else if (esercizioSelezionato === 'deadlift') {
                    const el = document.getElementById('dash-deadlift');
                    if (el) el.textContent = `${miglior1RMSessione} kg`;
                }
            }
            
            // reset tabella
            tbody.innerHTML = '';
            setCount = 0;

            const liveDisplay = document.getElementById('live-1rm-val');
            if (liveDisplay) liveDisplay.textContent = '0 kg';

            alert("Sessione salvata nel registro locale!");

            const dashTab = document.querySelector('[data-target="dashboard-view"]');
            if (dashTab) dashTab.click();
        });
    }
});