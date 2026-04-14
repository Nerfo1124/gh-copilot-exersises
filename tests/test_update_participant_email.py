def test_update_participant_email_success(client):
    # Arrange
    activity_name = "Chess Club"
    current_email = "michael@mergington.edu"
    new_email = "michael.fixed@mergington.edu"

    # Act
    response = client.put(
        f"/activities/{activity_name}/participants",
        params={"current_email": current_email, "new_email": new_email},
    )
    activities_response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    assert response.json()["message"] == f"Updated participant email to {new_email} in {activity_name}"
    participants = activities_response.json()[activity_name]["participants"]
    assert new_email in participants
    assert current_email not in participants


def test_update_participant_email_activity_not_found(client):
    # Arrange
    activity_name = "Unknown Club"

    # Act
    response = client.put(
        f"/activities/{activity_name}/participants",
        params={"current_email": "a@mergington.edu", "new_email": "b@mergington.edu"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_update_participant_email_participant_not_found(client):
    # Arrange
    activity_name = "Chess Club"

    # Act
    response = client.put(
        f"/activities/{activity_name}/participants",
        params={"current_email": "ghost@mergington.edu", "new_email": "fixed@mergington.edu"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found in this activity"


def test_update_participant_email_invalid_format(client):
    # Arrange
    activity_name = "Chess Club"

    # Act
    response = client.put(
        f"/activities/{activity_name}/participants",
        params={"current_email": "michael@mergington.edu", "new_email": "invalid-email"},
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid email format"


def test_update_participant_email_already_registered(client):
    # Arrange
    activity_name = "Chess Club"

    # Act
    response = client.put(
        f"/activities/{activity_name}/participants",
        params={
            "current_email": "michael@mergington.edu",
            "new_email": "daniel@mergington.edu",
        },
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered in this activity"
