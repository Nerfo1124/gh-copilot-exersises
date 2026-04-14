def test_get_activities_returns_all_activities(client):
    # Arrange
    expected_keys = {
        "Chess Club",
        "Programming Class",
        "Gym Class",
        "Basketball Team",
        "Swimming Club",
        "Drama Club",
        "School Band",
        "Math Olympiad",
        "Debate Society",
    }

    # Act
    response = client.get("/activities")
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert expected_keys.issubset(payload.keys())
    assert "participants" in payload["Chess Club"]
    assert "max_participants" in payload["Chess Club"]
