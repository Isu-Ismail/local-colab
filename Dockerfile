# Use an official lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Create a non-root user for security purposes
RUN useradd -m nonroot
USER nonroot

# The command to run when the container starts
# We will override this, but it's good practice to have a default
CMD ["python"]