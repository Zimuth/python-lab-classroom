import sys
import asyncio
import os
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

EXECUTIONS_DIR = "executions"
os.makedirs(EXECUTIONS_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "healthy!"}

@app.websocket("/ws/execute")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            code = await websocket.receive_text()
            
            # Create a unique file for this execution
            file_id = str(uuid.uuid4())
            file_path = os.path.join(EXECUTIONS_DIR, f"{file_id}.py")
            
            # Write the code to the file
            with open(file_path, "w") as f:
                f.write(code)
                
            try:
                process = await asyncio.create_subprocess_exec(
                    sys.executable, "-u", file_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                async def read_stream(stream, stream_type):
                    while True:
                        line = await stream.readline()
                        if line:
                            await websocket.send_json({
                                "status": "running",
                                "output": line.decode(),
                                "stream": stream_type
                            })
                        else:
                            break

                async def run_and_stream():
                    await asyncio.gather(
                        read_stream(process.stdout, "stdout"),
                        read_stream(process.stderr, "stderr")
                    )
                    await process.wait()
                    
                try:
                    await asyncio.wait_for(run_and_stream(), timeout=60.0)
                    await websocket.send_json({
                        "status": "success" if process.returncode == 0 else "error",
                        "output": f"\nProcess exited with code {process.returncode}",
                        "returncode": process.returncode,
                        "stream": "system"
                    })
                except asyncio.TimeoutError:
                    process.kill()
                    await process.wait()
                    await websocket.send_json({
                        "status": "error",
                        "output": "\nExecution timed out (60s limit).",
                        "returncode": -1,
                        "stream": "system"
                    })
                    
            except Exception as e:
                await websocket.send_json({
                    "status": "error",
                    "output": str(e),
                    "returncode": -1,
                    "stream": "system"
                })
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)
                
    except WebSocketDisconnect:
        print("Client disconnected")


