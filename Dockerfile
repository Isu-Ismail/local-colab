# Use a slim Python base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install all the libraries listed in the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# This line is no longer needed, as we mount scripts at runtime
# COPY script.py /app/

# The CMD is also not needed, as we specify the command in our websocket-server
# CMD ["python", "script.py"]