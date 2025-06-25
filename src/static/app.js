document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Monta a lista de participantes com ícone de deletar
        let participantsHTML = '';
        if (details.participants.length > 0) {
          participantsHTML = `<ul class="participants-list">` +
            details.participants.map(p => `
              <li style="display: flex; align-items: center; gap: 8px;">
                <span>${p}</span>
                <button class="delete-participant-btn" title="Remover participante" data-activity="${name}" data-email="${p}" style="background: none; border: none; cursor: pointer; color: #c62828; font-size: 1.1em; padding: 0;">
                  🗑️
                </button>
              </li>
            `).join('') + `</ul>`;
        } else {
          participantsHTML = '<p class="no-participants">Nenhum participante inscrito ainda.</p>';
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Agenda:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidade:</strong> ${spotsLeft} vagas disponíveis</p>
          <div class="participants-section">
            <strong>Participantes:</strong>
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Adiciona listeners para os botões de deletar participantes
      document.querySelectorAll('.delete-participant-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const activity = btn.getAttribute('data-activity');
          const email = btn.getAttribute('data-email');
          if (!activity || !email) return;
          if (!confirm(`Remover ${email} da atividade "${activity}"?`)) return;
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
              method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message || 'Participante removido com sucesso.';
              messageDiv.className = 'success';
              messageDiv.classList.remove('hidden');
              fetchActivities();
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 5000);
            } else {
              messageDiv.textContent = result.detail || 'Erro ao remover participante.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 5000);
            }
          } catch (err) {
            messageDiv.textContent = 'Erro ao remover participante.';
            messageDiv.className = 'error';
            messageDiv.classList.remove('hidden');
            setTimeout(() => {
              messageDiv.classList.add('hidden');
            }, 5000);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Por favor, tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a lista de atividades/participantes
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na inscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na inscrição:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
