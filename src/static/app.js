document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  async function unregisterParticipant(activity, email) {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );

    return response.json().then((result) => ({
      ok: response.ok,
      result,
    }));
  }

  async function updateParticipantEmail(activity, currentEmail, newEmail) {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/participants?current_email=${encodeURIComponent(currentEmail)}&new_email=${encodeURIComponent(newEmail)}`,
      {
        method: "PUT",
      }
    );

    return response.json().then((result) => ({
      ok: response.ok,
      result,
    }));
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsList = details.participants.length
          ? details.participants
            .map(
              (participant) => `
                <li>
                  <span class="participant-email">${participant}</span>
                  <div class="participant-actions">
                    <button
                      type="button"
                      class="edit-participant-btn"
                      data-activity="${encodeURIComponent(name)}"
                      data-email="${encodeURIComponent(participant)}"
                      aria-label="Edit email for ${participant} in ${name}"
                      title="Edit participant email"
                    >
                      &#9998;
                    </button>
                    <button
                      type="button"
                      class="delete-participant-btn"
                      data-activity="${encodeURIComponent(name)}"
                      data-email="${encodeURIComponent(participant)}"
                      aria-label="Unregister ${participant} from ${name}"
                      title="Unregister participant"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              `
            )
            .join("")
          : '<li class="empty-participants">No participants yet</li>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title">Current Participants</p>
            <ul class="participants-list">
              ${participantsList}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
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
        showMessage(result.message, "success");
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const editBtn = event.target.closest(".edit-participant-btn");
    if (editBtn) {
      const activity = decodeURIComponent(editBtn.dataset.activity);
      const currentEmail = decodeURIComponent(editBtn.dataset.email);
      const newEmail = window.prompt("Update participant email:", currentEmail);

      if (newEmail === null) {
        return;
      }

      const trimmedEmail = newEmail.trim();
      if (!trimmedEmail) {
        showMessage("Email cannot be empty.", "error");
        return;
      }

      if (trimmedEmail === currentEmail) {
        showMessage("Email unchanged.", "info");
        return;
      }

      try {
        const { ok, result } = await updateParticipantEmail(activity, currentEmail, trimmedEmail);

        if (ok) {
          showMessage(result.message, "success");
          fetchActivities();
        } else {
          showMessage(result.detail || "Failed to update participant email.", "error");
        }
      } catch (error) {
        showMessage("Failed to update participant email. Please try again.", "error");
        console.error("Error updating participant email:", error);
      }

      return;
    }

    const deleteBtn = event.target.closest(".delete-participant-btn");
    if (!deleteBtn) {
      return;
    }

    const activity = decodeURIComponent(deleteBtn.dataset.activity);
    const email = decodeURIComponent(deleteBtn.dataset.email);

    try {
      const { ok, result } = await unregisterParticipant(activity, email);

      if (ok) {
        showMessage(result.message, "success");
        fetchActivities();
      } else {
        showMessage(result.detail || "Failed to unregister participant.", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister participant. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
