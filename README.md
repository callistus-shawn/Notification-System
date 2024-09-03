# Notification System
 This project implements a WebSocket-based notification service using FastAPI. It interacts with a SQLite database to store and manage notifications.

 ## Explanation:
- **`database/notif.db`**: SQLite database for storing notifications.
  
- **`templates/index.html`**: Front-end template served by FastAPI.
  
- **`rag/function.py`**: Contains the core logic for handling HTML responses, WebSocket connections, and notification management using SQL Queries.
  
- **`model.py`**: Defines data models, such as the `Input` model used for handling inputs.
- **`conn.py`**: Connection Manager that manages WebSocket connections.
- **`main.py`**: The main application file that includes the endpoints and WebSocket logic
  
## Outputs
### FastApi- Test UI (Swagger Docs)
#### - To pass the notifications
  
![Screenshot 2024-09-03 154449](https://github.com/user-attachments/assets/cba0f22e-87be-4225-9bf7-bbe83b71bf1f)
### HTML CSS Template
#### - Bell icon with counter installed upon

![Screenshot 2024-09-03 154507](https://github.com/user-attachments/assets/6bcbe02e-096d-4861-8dd6-7d15f56b140f)
### Notification Window along with Acknowlegment/Reject button
![Screenshot 2024-09-03 154521](https://github.com/user-attachments/assets/1465bc52-7fbc-4d8f-947b-f9dbe32b2bbd)
### Status Updated on UI as well as Database
![Screenshot 2024-09-03 154533](https://github.com/user-attachments/assets/53036a1d-20fe-4526-89de-e4e30b5ebe96)
