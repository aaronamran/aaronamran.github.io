/**
 * Section 9: Containers
 * 3 unique question sets for practice variety
 */

const section9Data = {
    id: 9,
    title: "Containers",
    description: "Manage containers using Podman - pull images, run, inspect, and remove containers",
    totalPoints: 24,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "List all container images on the system",
                expected: [
                    { command: "podman", requiredValues: ["images"] },
                    { command: "podman", requiredValues: ["image", "ls"] }
                ],
                explanation: "podman images shows locally stored container images.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Pull the httpd:latest image from the registry",
                expected: [
                    { command: "podman", requiredValues: ["pull", "httpd"] },
                    { command: "podman", requiredValues: ["pull", "httpd:latest"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "podman pull downloads images from container registries.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify httpd image is available locally",
                expected: [
                    { command: "podman", requiredValues: ["images", "httpd"] },
                    { command: "podman", requiredValues: ["image", "ls"] }
                ],
                explanation: "Check httpd image appears in local image list.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Run httpd container detached named 'webapp' with port 8080 mapped to container port 80",
                expected: [
                    { command: "podman", requiredFlags: ["run", "-d", "--name"], requiredValues: ["webapp", "-p", "8080:80", "httpd"] },
                    { command: "podman", requiredFlags: ["run", "-d"], requiredValues: ["--name=webapp", "-p", "8080:80", "httpd"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "podman run -d runs containers in background. -p maps ports.",
                points: 4
            },
            {
                id: 5,
                category: "Audit",
                description: "List running containers to verify webapp is active",
                expected: [
                    { command: "podman", requiredValues: ["ps"] },
                    { command: "podman", requiredValues: ["container", "ls"] }
                ],
                explanation: "podman ps shows currently running containers.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Inspect the webapp container to see details",
                expected: [
                    { command: "podman", requiredValues: ["inspect", "webapp"] },
                    { command: "podman", requiredValues: ["container", "inspect", "webapp"] }
                ],
                explanation: "podman inspect displays comprehensive container configuration.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Stop the webapp container",
                expected: [
                    { command: "podman", requiredValues: ["stop", "webapp"] },
                    { command: "podman", requiredValues: ["container", "stop", "webapp"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "podman stop gracefully stops running containers.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "List all containers including stopped ones",
                expected: [
                    { command: "podman", requiredFlags: ["ps", "-a"] },
                    { command: "podman", requiredValues: ["ps", "--all"] }
                ],
                explanation: "podman ps -a shows both running and stopped containers.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Remove the webapp container",
                expected: [
                    { command: "podman", requiredValues: ["rm", "webapp"] },
                    { command: "podman", requiredValues: ["container", "rm", "webapp"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredFlags: ["ps", "-a"] }
                ],
                explanation: "podman rm removes stopped containers.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Remove the httpd image",
                expected: [
                    { command: "podman", requiredValues: ["rmi", "httpd"] },
                    { command: "podman", requiredValues: ["image", "rm", "httpd"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "podman rmi removes container images from local storage.",
                points: 3
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Search for nginx images in registries",
                expected: [
                    { command: "podman", requiredValues: ["search", "nginx"] }
                ],
                allowedPreChecks: [],
                explanation: "podman search queries container registries for available images.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Pull the nginx:alpine image",
                expected: [
                    { command: "podman", requiredValues: ["pull", "nginx:alpine"] },
                    { command: "podman", requiredValues: ["pull", "docker.io/library/nginx:alpine"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "nginx:alpine is a smaller image using Alpine Linux base.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Display detailed information about the nginx:alpine image",
                expected: [
                    { command: "podman", requiredValues: ["inspect", "nginx:alpine"] },
                    { command: "podman", requiredValues: ["image", "inspect", "nginx:alpine"] }
                ],
                explanation: "Inspect shows image layers, configuration, and metadata.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Run nginx:alpine container named 'webserver' with port 9090 mapped to port 80, detached",
                expected: [
                    { command: "podman", requiredFlags: ["run", "-d", "--name"], requiredValues: ["webserver", "-p", "9090:80", "nginx:alpine"] },
                    { command: "podman", requiredFlags: ["run", "-d"], requiredValues: ["--name=webserver", "-p", "9090:80", "nginx:alpine"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "Run nginx with custom port mapping in detached mode.",
                points: 4
            },
            {
                id: 5,
                category: "Audit",
                description: "Show logs from the webserver container",
                expected: [
                    { command: "podman", requiredValues: ["logs", "webserver"] },
                    { command: "podman", requiredValues: ["container", "logs", "webserver"] }
                ],
                explanation: "podman logs displays container stdout/stderr output.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "View running processes inside webserver container",
                expected: [
                    { command: "podman", requiredValues: ["top", "webserver"] },
                    { command: "podman", requiredValues: ["exec", "webserver", "ps", "aux"] }
                ],
                explanation: "podman top shows container processes from host perspective.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Restart the webserver container",
                expected: [
                    { command: "podman", requiredValues: ["restart", "webserver"] },
                    { command: "podman", requiredValues: ["container", "restart", "webserver"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "podman restart stops and starts a container.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Display port mappings for webserver container",
                expected: [
                    { command: "podman", requiredValues: ["port", "webserver"] },
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "podman port shows which host ports map to container ports.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Forcefully remove the running webserver container",
                expected: [
                    { command: "podman", requiredFlags: ["rm", "-f"], requiredValues: ["webserver"] },
                    { command: "podman", requiredValues: ["rm", "--force", "webserver"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "podman rm -f removes running containers without stopping first.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Remove all unused images to free space",
                expected: [
                    { command: "podman", requiredValues: ["image", "prune"] },
                    { command: "podman", requiredFlags: ["image", "prune", "-a"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "podman image prune removes dangling and unused images.",
                points: 3
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Pull the mariadb:latest image",
                expected: [
                    { command: "podman", requiredValues: ["pull", "mariadb"] },
                    { command: "podman", requiredValues: ["pull", "mariadb:latest"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "Download MariaDB database container image.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Check disk space usage of all images",
                expected: [
                    { command: "podman", requiredValues: ["system", "df"] },
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "podman system df shows space used by images, containers, volumes.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Run mariadb container named 'database' with environment variable MYSQL_ROOT_PASSWORD=secret123, detached",
                expected: [
                    { command: "podman", requiredFlags: ["run", "-d", "--name"], requiredValues: ["database", "-e", "MYSQL_ROOT_PASSWORD=secret123", "mariadb"] },
                    { command: "podman", requiredFlags: ["run", "-d"], requiredValues: ["--name=database", "--env", "MYSQL_ROOT_PASSWORD=secret123", "mariadb"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "-e sets environment variables needed by container applications.",
                points: 4
            },
            {
                id: 4,
                category: "Audit",
                description: "Check if database container is healthy and running",
                expected: [
                    { command: "podman", requiredValues: ["ps"] },
                    { command: "podman", requiredValues: ["healthcheck", "run", "database"] }
                ],
                explanation: "Verify container state and health status.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Execute mysql command inside database container to test connectivity",
                expected: [
                    { command: "podman", requiredValues: ["exec", "database", "mysql", "-uroot", "-psecret123", "-e", "SELECT 1;"] },
                    { command: "podman", requiredValues: ["exec", "-it", "database", "mysql", "-uroot", "-psecret123"] }
                ],
                allowedPreChecks: [],
                explanation: "podman exec runs commands inside running containers.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Display environment variables set in database container",
                expected: [
                    { command: "podman", requiredValues: ["exec", "database", "env"] },
                    { command: "podman", requiredValues: ["inspect", "database"] }
                ],
                explanation: "View runtime environment configuration of containers.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Commit database container changes to new image named 'mymariadb:v1'",
                expected: [
                    { command: "podman", requiredValues: ["commit", "database", "mymariadb:v1"] },
                    { command: "podman", requiredValues: ["container", "commit", "database", "mymariadb:v1"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "podman commit creates new image from container changes.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify mymariadb:v1 image was created",
                expected: [
                    { command: "podman", requiredValues: ["images", "mymariadb"] },
                    { command: "podman", requiredValues: ["image", "ls"] }
                ],
                explanation: "Confirm custom image appears in local repository.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Stop and remove the database container",
                expected: [
                    { command: "podman", requiredValues: ["stop", "database"] },
                    { command: "podman", requiredValues: ["rm", "database"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredFlags: ["ps", "-a"] }
                ],
                explanation: "Clean up by stopping and removing test container.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Tag mymariadb:v1 as mymariadb:latest",
                expected: [
                    { command: "podman", requiredValues: ["tag", "mymariadb:v1", "mymariadb:latest"] },
                    { command: "podman", requiredValues: ["image", "tag", "mymariadb:v1", "mymariadb:latest"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["images"] }
                ],
                explanation: "podman tag creates additional names/tags for images.",
                points: 2
            }
        ],
        
        // Set 4: Container volumes
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Create container with bind mount from /opt/data to /data inside container.",
                expected: [
                    { command: "podman", requiredValues: ["run", "-d", "-v", "/opt/data:/data", "--name", "datacon", "nginx"] },
                    { command: "podman", requiredValues: ["run", "-d", "--mount", "type=bind,source=/opt/data,target=/data", "--name", "datacon", "nginx"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/opt/data"] },
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "-v creates bind mount. Host directory accessible inside container.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify volume mount in datacon container.",
                expected: [
                    { command: "podman", requiredValues: ["inspect", "datacon"] },
                    { command: "podman", requiredValues: ["exec", "datacon", "ls", "/data"] }
                ],
                explanation: "inspect shows Mounts section. exec verifies directory inside container.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create named volume 'appdata' for persistent storage.",
                expected: [
                    { command: "podman", requiredValues: ["volume", "create", "appdata"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["volume", "ls"] }
                ],
                explanation: "Named volumes are managed by Podman, survive container removal.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "List all volumes and display info about appdata volume.",
                expected: [
                    { command: "podman", requiredValues: ["volume", "ls"] },
                    { command: "podman", requiredValues: ["volume", "inspect", "appdata"] }
                ],
                explanation: "volume inspect shows mount point and driver details.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Run container using the appdata volume mounted at /app/data.",
                expected: [
                    { command: "podman", requiredValues: ["run", "-d", "-v", "appdata:/app/data", "--name", "app", "alpine"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["volume", "ls"] }
                ],
                explanation: "Named volumes persist data even after container is removed.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify app container uses appdata volume.",
                expected: [
                    { command: "podman", requiredValues: ["inspect", "app"] },
                    { command: "podman", requiredValues: ["exec", "app", "df", "-h"] }
                ],
                explanation: "df shows mounted filesystems inside container.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create read-only bind mount from /etc/config to /config in container.",
                expected: [
                    { command: "podman", requiredValues: ["run", "-d", "-v", "/etc/config:/config:ro", "--name", "readonly", "nginx"] },
                    { command: "podman", requiredValues: ["run", "-d", "--mount", "type=bind,source=/etc/config,target=/config,readonly", "--name", "readonly", "nginx"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/etc/config"] }
                ],
                explanation: ":ro makes mount read-only. Container cannot modify host files.",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Remove unused volumes to free disk space.",
                expected: [
                    { command: "podman", requiredValues: ["volume", "prune"] }
                ],
                explanation: "Removes volumes not used by any container.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Copy file from host to container's volume.",
                expected: [
                    { command: "podman", requiredValues: ["cp", "/tmp/config.txt", "app:/app/data/"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["exec", "app", "ls", "/app/data/"] }
                ],
                explanation: "podman cp transfers files between host and containers.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Remove specific volume 'olddata'.",
                expected: [
                    { command: "podman", requiredValues: ["volume", "rm", "olddata"] }
                ],
                explanation: "Volume must not be in use by any containers to remove it.",
                points: 2
            }
        ],
        
        // Set 5: Systemd integration
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Generate systemd unit file for container 'webserver'.",
                expected: [
                    { command: "podman", requiredValues: ["generate", "systemd", "--name", "webserver"] },
                    { command: "podman", requiredValues: ["generate", "systemd", "--new", "--name", "webserver"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps", "-a"] }
                ],
                explanation: "Generates systemd service unit to manage container lifecycle.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Save systemd unit file to user systemd directory.",
                expected: [
                    { command: "podman", requiredValues: ["generate", "systemd", "--name", "webserver", ">", "~/.config/systemd/user/container-webserver.service"] }
                ],
                explanation: "User systemd units go in ~/.config/systemd/user/.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Reload user systemd daemon to recognize new unit.",
                expected: [
                    { command: "systemctl", requiredValues: ["--user", "daemon-reload"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["--user", "status"] }
                ],
                explanation: "daemon-reload refreshes systemd configuration.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Enable container service to start at boot.",
                expected: [
                    { command: "systemctl", requiredValues: ["--user", "enable", "container-webserver.service"] }
                ],
                explanation: "Container automatically starts when user logs in.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Start container using systemd.",
                expected: [
                    { command: "systemctl", requiredValues: ["--user", "start", "container-webserver.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["--user", "status", "container-webserver.service"] }
                ],
                explanation: "systemctl manages container like any other service.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Check status of container service.",
                expected: [
                    { command: "systemctl", requiredValues: ["--user", "status", "container-webserver.service"] },
                    { command: "systemctl", requiredValues: ["--user", "is-active", "container-webserver.service"] }
                ],
                explanation: "Verify container is running under systemd control.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Enable linger for current user to run containers at boot without login.",
                expected: [
                    { command: "loginctl", requiredValues: ["enable-linger"] },
                    { command: "loginctl", requiredValues: ["enable-linger", "$USER"] }
                ],
                allowedPreChecks: [
                    { command: "loginctl", requiredValues: ["show-user", "$USER"] }
                ],
                explanation: "Linger allows user services to run without active login session.",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify linger is enabled for user.",
                expected: [
                    { command: "loginctl", requiredValues: ["show-user", "$USER"] },
                    { command: "ls", requiredValues: ["/var/lib/systemd/linger/"] }
                ],
                explanation: "Linger status shown in user properties. File appears in /var/lib/systemd/linger/.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Restart container service.",
                expected: [
                    { command: "systemctl", requiredValues: ["--user", "restart", "container-webserver.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["--user", "status", "container-webserver.service"] }
                ],
                explanation: "Restart recreates container with same configuration.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "View logs for container service.",
                expected: [
                    { command: "journalctl", requiredValues: ["--user", "-u", "container-webserver.service"] },
                    { command: "journalctl", requiredValues: ["--user", "-u", "container-webserver.service", "-f"] }
                ],
                explanation: "Container logs integrated with systemd journal.",
                points: 2
            }
        ],
        
        // Set 6: Advanced troubleshooting
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Display detailed information about nginx container.",
                expected: [
                    { command: "podman", requiredValues: ["inspect", "nginx"] }
                ],
                explanation: "inspect shows complete container configuration, network, mounts, etc.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Show real-time resource usage statistics for all containers.",
                expected: [
                    { command: "podman", requiredValues: ["stats"] },
                    { command: "podman", requiredValues: ["stats", "--all"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["ps"] }
                ],
                explanation: "stats shows CPU, memory, network, and disk I/O usage.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display processes running inside nginx container.",
                expected: [
                    { command: "podman", requiredValues: ["top", "nginx"] },
                    { command: "podman", requiredValues: ["exec", "nginx", "ps", "aux"] }
                ],
                explanation: "podman top shows container processes from host perspective.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "View last 50 lines of logs from failing container.",
                expected: [
                    { command: "podman", requiredValues: ["logs", "--tail", "50", "failing"] },
                    { command: "podman", requiredValues: ["logs", "--tail=50", "failing"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["logs", "failing"] }
                ],
                explanation: "--tail limits output to last N lines. Useful for large logs.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Display container events for troubleshooting.",
                expected: [
                    { command: "podman", requiredValues: ["events"] },
                    { command: "podman", requiredValues: ["events", "--since", "10m"] }
                ],
                explanation: "Events show container lifecycle actions: create, start, stop, die, remove.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Check disk space used by all containers and images.",
                expected: [
                    { command: "podman", requiredValues: ["system", "df"] }
                ],
                allowedPreChecks: [
                    { command: "df", requiredFlags: ["-h"], requiredValues: [] }
                ],
                explanation: "Shows space used by images, containers, and volumes.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Display port mappings for all running containers.",
                expected: [
                    { command: "podman", requiredValues: ["port", "-a"] },
                    { command: "podman", requiredValues: ["ps", "--format", "\"{{.Names}} {{.Ports}}\""] }
                ],
                explanation: "Verify which host ports are mapped to container ports.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Run health check on container 'webapp'.",
                expected: [
                    { command: "podman", requiredValues: ["healthcheck", "run", "webapp"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["inspect", "webapp"] }
                ],
                explanation: "Manually trigger health check defined in container configuration.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Display differences between container and its base image.",
                expected: [
                    { command: "podman", requiredValues: ["diff", "nginx"] }
                ],
                explanation: "Shows files added (A), changed (C), or deleted (D) in container.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Clean up stopped containers, unused images, and volumes.",
                expected: [
                    { command: "podman", requiredValues: ["system", "prune", "-a"] },
                    { command: "podman", requiredValues: ["system", "prune", "--all", "--volumes"] }
                ],
                allowedPreChecks: [
                    { command: "podman", requiredValues: ["system", "df"] }
                ],
                explanation: "system prune removes unused data. -a includes unused images.",
                points: 3
            }
        ]
    }
};
