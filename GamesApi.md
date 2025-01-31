# API Documentation

## For Witch Runner

## Endpoints

## 1. Health Check

### GET /

Checks if the server and database are running.

Response:

200 OK

```json
{
  "message": "Server is running and database is connected!"
}
```

503 Service Unavailable
```json
{
  "error": "Database not connected yet"
}
```
## 2. Fetch Leaderboard

### GET /players
Endpoint: `https://sf-games-apis.onrender.com/players`

Retrieves all players from the leaderboard, ranked by their points.

Response:

200 OK
```json
{
  "code": 0,
  "message": "Players Fetched Successfully",
  "players": [
    {
      "user_name": "John",
      "points": 120,
      "players_rank": 1
    }
  ]
}
```

401 Unauthorized
```json
{
  "code": 1,
  "message": "Could not fetch the data",
  "error": "error_message"
}
```

## 3. Add or Update Player

### POST /player
Endpoint: `https://sf-games-apis.onrender.com/player`

Adds a new player or updates their score if they already exist.

Request Body:
```json
{
  "user_name": "John",
  "pin": "1235",
  "points": 3000
}
```

Response:

200 OK (Score updated)
```json
{
  "code": 0,
  "message": "Score updated successfully"
}
```

```json
{
  "code": 0,
  "message": "Player added successfully"
}
```

```json
{
  "message": "Invalid input data"
}
```

## 4. Check Existing Player

### POST /player
Endpoint: `https://sf-games-apis.onrender.com/checkPlayer`

Checks if the user is an existing user or a new user.

Request Body:
```json
{
  "user_name": "Stark",
  "pin": "1235"
}
```

Response:

200 OK (Score updated)
```json
{
  "code": 0,
  "message": "New User"
}
```

```json
{
  "code": 0,
  "message": "Enter the game" //for an existing user
}
```

400 Bad Request
```json
{
  "code": 10,
  "message": "User name and pin did not match"
}
```

401 Unauthorized
```json
{
  "code": 5,
  "message": "Could not fetch the data",
  "error": "error_message"
}
```

## 5. Fetch Single Player

### GET /player
Endpoint: `https://sf-games-apis.onrender.com/player?user_name=${user_name}`

Fetches details of a single player by their user_name.

Query Parameters:

user_name (required): The unique user_name of the player.

Response:

200 OK
```json
{
  "code": 0,
  "message": "Player's details fetched successfully",
  "player": {
    "user_name": "John",
    "points": 3000
  }
}
```

400 Bad Request
```json
{
  "code": 1,
  "message": "user_name is required"
}
```

401 Unauthorized
```json
{
  "code": 5,
  "message": "Could not fetch the data",
  "error": "error_message"
}
```

## 6. Fetch Smash the Cans Leaderboard

### GET /cans/players
Endpoint: `https://sf-games-apis.onrender.com/cans/players`

Retrieves the leaderboard for the "Smash the Cans" game, ranked by points_m.

Response:

200 OK
```json
{
  "code": 0,
  "message": "Players Fetched Successfully",
  "players": [
    {
      "user_name": "Stark",
      "points_m": 200,
      "players_rank": 1
    }
  ]
}
```

401 Unauthorized
```json
{
  "code": 1,
  "message": "Could not fetch the data",
  "error": "error_message"
}
```

## 7. Add or Update Smash the Cans Player

### POST /cans/player
Endpoint: `https://sf-games-apis.onrender.com/cans/player`

Adds a new player or updates their score in the "Smash the Cans" leaderboard.

Request Body:
```json
{
  "user_name": "Stark",
  "pin": "1235",
  "points_m": 3000
}
```

Response:

200 OK (Score updated)
```json
{
  "code": 0,
  "message": "Score updated successfully"
}
```

200 OK (New player added)
```json
{
  "code": 0,
  "message": "Player added successfully"
}
```

400 Bad Request
```json
{
  "message": "Invalid input data"
}
```
## 8. Check Existing Player

### POST /cans/player
Endpoint: `https://sf-games-apis.onrender.com/cans/checkPlayer`

Checks if the user is an existing user or a new user.

Request Body:
```json
{
  "user_name": "Stark",
  "pin": "1235"
}```

Response:

200 OK (Score updated)
```json
{
  "code": 0,
  "message": "New User"
}
```

```json
{
  "code": 0,
  "message": "Enter the game" //for an existing user
}
```

400 Bad Request
```json
{
  "code": 10,
  "message": "User name and pin did not match"
}
```

401 Unauthorized
```json
{
  "code": 5,
  "message": "Could not fetch the data",
  "error": "error_message"
}
```

## 9. Fetch Single Smash the Cans Player

### GET /cans/player
Endpoint: `https://sf-games-apis.onrender.com/cans/player?user_name=${user_name}`

Fetches details of a single "Smash the Cans" player by their user_name.

Query Parameters:

user_name (required): The unique user_name of the player.

Response:

200 OK
```json
{
  "code": 0,
  "message": "Player's details fetched successfully",
  "player": {
    "user_name": "Stark",
    "points_m": 250
  }
}
```

400 Bad Request
```json
{
  "code": 1,
  "message": "user_name is required"
}
```

401 Unauthorized
```json
{
  "code": 5,
  "message": "Could not fetch the data",
  "error": "error_message"
}
```