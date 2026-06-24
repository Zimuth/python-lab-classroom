from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "healthy!"}

def test_websocket_execute():
    with client.websocket_connect("/ws/execute") as websocket:
        websocket.send_text('print("Hola Mundo")')
        
        data = websocket.receive_json()
        assert data["status"] == "running"
        assert "Hola Mundo" in data["output"]
        assert data["stream"] == "stdout"
        
        data2 = websocket.receive_json()
        assert data2["status"] == "success"
        assert data2["returncode"] == 0
        assert data2["stream"] == "system"

def test_websocket_execute_error():
    with client.websocket_connect("/ws/execute") as websocket:
        websocket.send_text('print(1/0)')
        
        has_error_output = False
        final_system_msg = None
        
        while True:
            data = websocket.receive_json()
            
            if data["stream"] == "stderr" and "ZeroDivisionError" in data["output"]:
                has_error_output = True
                
            if data["stream"] == "system":
                final_system_msg = data
                break
                
        assert has_error_output == True
        assert final_system_msg is not None
        assert final_system_msg["status"] == "error"
        assert final_system_msg["returncode"] != 0
