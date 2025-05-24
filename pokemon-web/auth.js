{
  "users": [
    {
      "id": "user123",
      "username": "AshKetchum",
      "collection": [
        {
          "pokemonId": 25,
          "obtainedDate": "2023-05-12",
          "status": "available"
        }
      ]
    }
  ]
}
async function fetchUserCollection(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/collection`);
        const data = await response.json();
        return data.collection;
    } catch (error) {
        console.error("Error fetching collection:", error);
        return [];
    }
}
