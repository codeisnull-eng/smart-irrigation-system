# CI/CD Demonstration Description

In this project, CI/CD is implemented using GitHub Actions and Docker.
A GitHub repository is created to manage the project source code, and Docker Hub is used to store the built Docker images.

A CI workflow is configured in GitHub Actions to automatically run on every push to the main branch. The workflow installs dependencies, builds the dashboard application, creates a Docker image using a Dockerfile, and pushes the image to Docker Hub.

Both a successful (functional) workflow and a failed (non-functional) workflow are shown to demonstrate correct configuration and error handling.

Finally, the Docker image is pulled from Docker Hub and the application is run inside a Docker container to verify that it works correctly.

## Running the Application

After the CI/CD pipeline builds and pushes the Docker image, you can run it locally:

```bash
docker pull <your-dockerhub-username>/smart-irrigation-dashboard:latest
docker run -p 3000:3000 <your-dockerhub-username>/smart-irrigation-dashboard:latest
```

Then, open http://localhost:3000 in your browser to verify the application works.
