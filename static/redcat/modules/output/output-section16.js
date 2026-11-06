/** Red Cat - Section 16: Rootless Containers */

function generateSection16Output(command, input, tokens) {

    // ── podman ────────────────────────────────────────────────────────────────
    if (command === 'podman') {
        const sub = tokens[1];

        // podman images [filter]
        if (sub === 'images') {
            if (input.includes('httpd')) {
                return 'REPOSITORY                    TAG         IMAGE ID      CREATED       SIZE\ndocker.io/library/httpd       latest      5f2ef45b4ab4  3 weeks ago   148 MB';
            }
            if (input.includes('nginx')) {
                return 'REPOSITORY                    TAG         IMAGE ID      CREATED       SIZE\ndocker.io/library/nginx       alpine      7d2a5c8b9f12  2 weeks ago   23.7 MB';
            }
            if (input.includes('mymariadb')) {
                return 'REPOSITORY                    TAG         IMAGE ID      CREATED       SIZE\ndocker.io/library/mariadb     latest      c3d4e5f6a7b8  1 week ago    404 MB\nlocalhost/mymariadb           v1          a1b2c3d4e5f6  3 minutes ago 404 MB\nlocalhost/mymariadb           latest      a1b2c3d4e5f6  3 minutes ago 404 MB';
            }
            if (input.includes('mariadb')) {
                return 'REPOSITORY                    TAG         IMAGE ID      CREATED       SIZE\ndocker.io/library/mariadb     latest      c3d4e5f6a7b8  1 week ago    404 MB';
            }
            // default: all images
            return 'REPOSITORY                    TAG         IMAGE ID      CREATED       SIZE\ndocker.io/library/httpd       latest      5f2ef45b4ab4  3 weeks ago   148 MB\ndocker.io/library/nginx       alpine      7d2a5c8b9f12  2 weeks ago   23.7 MB\ndocker.io/library/mariadb     latest      c3d4e5f6a7b8  1 week ago    404 MB';
        }

        // podman image <subcommand>
        if (sub === 'image') {
            const isub = tokens[2];
            if (isub === 'ls') {
                return 'REPOSITORY                    TAG         IMAGE ID      CREATED       SIZE\ndocker.io/library/httpd       latest      5f2ef45b4ab4  3 weeks ago   148 MB\ndocker.io/library/nginx       alpine      7d2a5c8b9f12  2 weeks ago   23.7 MB\ndocker.io/library/mariadb     latest      c3d4e5f6a7b8  1 week ago    404 MB';
            }
            if (isub === 'inspect') {
                const imgName = tokens[3] || 'nginx:alpine';
                return `[\n    {\n        "Id": "7d2a5c8b9f120a3e55dc1b7a9f8e4d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6",\n        "Digest": "sha256:7d2a5c8b9f120a3e55dc1b7a9f8e4d2c",\n        "RepoTags": [\n            "docker.io/library/${imgName}"\n        ],\n        "Created": "2026-03-17T10:30:00Z",\n        "Architecture": "amd64",\n        "Os": "linux",\n        "Size": 24874189,\n        "VirtualSize": 24874189,\n        "Config": {\n            "Cmd": [\n                "nginx",\n                "-g",\n                "daemon off;"\n            ],\n            "ExposedPorts": {\n                "80/tcp": {}\n            }\n        }\n    }\n]`;
            }
            if (isub === 'prune') {
                if (input.includes('-a') || input.includes('--all')) {
                    return '7d2a5c8b9f12\n5f2ef45b4ab4\n\nTotal reclaimed space: 171 MB';
                }
                return 'Total reclaimed space: 0 B';
            }
            if (isub === 'rm') {
                const img = tokens[3] || 'httpd';
                return `Untagged: docker.io/library/${img}:latest\nDeleted: 5f2ef45b4ab435c86b9e8d1cd5a0a3f7b9e2d4c6a8f0b2d4e6a8c0e2f4a6b8`;
            }
            if (isub === 'tag') {
                return '';
            }
        }

        // podman pull <image>
        if (sub === 'pull') {
            const imgArg = tokens[2] || 'httpd';
            const hasTag = imgArg.includes(':');
            const tag = hasTag ? imgArg.split(':')[1] : 'latest';
            const baseName = imgArg.split('/').pop().split(':')[0];
            const fullRef = imgArg.includes('/') ? imgArg : `docker.io/library/${imgArg}`;
            const fullRefTagged = hasTag ? fullRef : `${fullRef}:${tag}`;
            return `Trying to pull ${fullRefTagged}...\nGetting image source signatures\nCopying blob sha256:5d20c808ce19 done  \nCopying blob sha256:a3d6f7b9e1c2 done  \nCopying blob sha256:b4e7d0c1f2a3 done  \nCopying config sha256:5f2ef45b4ab4 done  \nWriting manifest to image destination\nStoring signatures\n${fullRefTagged}`;
        }

        // podman run
        if (sub === 'run') {
            if (input.includes('-d')) {
                return 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
            }
            return '';
        }

        // podman ps
        if (sub === 'ps') {
            const showAll = input.includes('-a') || input.includes('--all');
            if (input.includes('--format')) {
                return 'webserver 0.0.0.0:9090->80/tcp';
            }
            if (showAll) {
                return 'CONTAINER ID  IMAGE                            COMMAND               CREATED         STATUS                    PORTS                   NAMES\na1b2c3d4e5f6  docker.io/library/httpd:latest   httpd-foreground      12 minutes ago  Exited (0) 2 minutes ago  0.0.0.0:8080->80/tcp    webapp\n7d2e9f0a1b2c  docker.io/library/nginx:alpine   nginx -g daemon off   8 minutes ago   Up 7 minutes             0.0.0.0:9090->80/tcp    webserver';
            }
            return 'CONTAINER ID  IMAGE                            COMMAND               CREATED        STATUS       PORTS                   NAMES\n7d2e9f0a1b2c  docker.io/library/nginx:alpine   nginx -g daemon off   8 minutes ago  Up 7 minutes  0.0.0.0:9090->80/tcp    webserver';
        }

        // podman container <subcommand>
        if (sub === 'container') {
            const csub = tokens[2];
            if (csub === 'ls') {
                return 'CONTAINER ID  IMAGE                            COMMAND               CREATED        STATUS       PORTS                   NAMES\n7d2e9f0a1b2c  docker.io/library/nginx:alpine   nginx -g daemon off   8 minutes ago  Up 7 minutes  0.0.0.0:9090->80/tcp    webserver';
            }
            if (csub === 'inspect') {
                const cname = tokens[3] || 'webapp';
                return generateContainerInspectOutput(cname);
            }
            if (csub === 'stop' || csub === 'start' || csub === 'restart') {
                return tokens[tokens.length - 1];
            }
            if (csub === 'rm') {
                return tokens[tokens.length - 1];
            }
            if (csub === 'logs') {
                const cname = tokens[3] || 'webserver';
                return generateContainerLogsOutput(cname, input);
            }
            if (csub === 'commit') {
                return 'Getting image source signatures\nCopying blob sha256:a1b2c3d4e5f6 done  \nCopying config sha256:a1b2c3d4e5f6 done  \nWriting manifest to image destination\nStoring signatures\na1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
            }
        }

        // podman inspect <name>
        if (sub === 'inspect') {
            const cname = tokens[2] || 'webapp';
            return generateContainerInspectOutput(cname);
        }

        // podman stop / start / restart
        if (sub === 'stop' || sub === 'start' || sub === 'restart') {
            return tokens[tokens.length - 1];
        }

        // podman rm
        if (sub === 'rm') {
            return tokens[tokens.length - 1];
        }

        // podman rmi
        if (sub === 'rmi') {
            const img = tokens[2] || 'httpd';
            return `Untagged: docker.io/library/${img}:latest\nDeleted: 5f2ef45b4ab435c86b9e8d1cd5a0a3f7b9e2d4c6a8f0b2d4e6a8c0e2f4a6b8`;
        }

        // podman search
        if (sub === 'search') {
            const term = tokens[2] || 'nginx';
            return `INDEX       NAME                                       DESCRIPTION                                  STARS       OFFICIAL    AUTOMATED\ndocker.io   docker.io/library/${term}                  Official build of ${term}                    20194       [OK]        \ndocker.io   docker.io/bitnami/${term}                  Bitnami ${term} Docker Image                203                     [OK]\ndocker.io   docker.io/${term}/${term}-ingress           NGINX and NGINX Plus Ingress Controllers      97                      \ndocker.io   docker.io/${term}inc/${term}-unprivileged   Unprivileged regular user ${term} image       136                     [OK]`;
        }

        // podman logs
        if (sub === 'logs') {
            // find the container name (last non-flag arg)
            const cname = tokens.filter(t => !t.startsWith('-') && t !== 'logs').pop() || 'webserver';
            return generateContainerLogsOutput(cname, input);
        }

        // podman top
        if (sub === 'top') {
            const cname = tokens[2] || 'webserver';
            if (cname === 'database') {
                return 'USER        PID   PPID   %CPU    ELAPSED         TTY   TIME   COMMAND\nmysql       1     0      0.200   12m42.443521s   ?     1s     mariadbd --datadir=/var/lib/mysql --basedir=/usr\nmysql       45    1      0.010   12m41.982341s   ?     0s     mariadbd: slave SQL thread';
            }
            return 'USER        PID   PPID   %CPU    ELAPSED         TTY   TIME   COMMAND\nroot        1     0      0.000   7m52.123415s    ?     0s     nginx: master process nginx -g daemon off;\nnginx       30    1      0.000   7m52.112562s    ?     0s     nginx: worker process';
        }

        // podman port
        if (sub === 'port') {
            if (input.includes('-a')) {
                return 'webserver\n  80/tcp -> 0.0.0.0:9090\nwebapp\n  80/tcp -> 0.0.0.0:8080';
            }
            const cname = tokens[2] || 'webserver';
            if (cname === 'webapp') return '80/tcp -> 0.0.0.0:8080';
            return '80/tcp -> 0.0.0.0:9090';
        }

        // podman exec
        if (sub === 'exec') {
            if (input.includes('env')) {
                return 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOSTNAME=database\nMYSQL_ROOT_PASSWORD=secret123\nMARIADB_MAJOR=10.11\nMARIADB_VERSION=1:10.11.6+maria~ubu2204\nGOSU_VERSION=1.17';
            }
            if (input.includes('ps') && input.includes('aux')) {
                return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  1.2  56392  6144 ?        Ss   10:05   0:00 nginx: master process nginx -g daemon off;\nnginx       30  0.0  0.4  56876  2048 ?        S    10:05   0:00 nginx: worker process';
            }
            if (input.includes('ls') && (input.includes('/app/data') || input.includes('/data'))) {
                return 'config.txt\ndata.db\nlogs/';
            }
            if (input.includes('df') && input.includes('-h')) {
                return 'Filesystem      Size  Used Avail Use% Mounted on\noverlay         100G  3.2G   97G   4% /\ntmpfs            64M     0   64M   0% /dev\ntmpfs           7.8G     0  7.8G   0% /sys/fs/cgroup\n/dev/sda1       100G  3.2G   97G   4% /app/data';
            }
            if (input.includes('mysql') || input.includes('SELECT')) {
                return '+---+\n| 1 |\n+---+\n| 1 |\n+---+';
            }
            return '';
        }

        // podman commit
        if (sub === 'commit') {
            return 'Getting image source signatures\nCopying blob sha256:a1b2c3d4e5f6 done  \nCopying config sha256:a1b2c3d4e5f6 done  \nWriting manifest to image destination\nStoring signatures\na1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
        }

        // podman tag
        if (sub === 'tag') {
            return '';
        }

        // podman volume
        if (sub === 'volume') {
            const vsub = tokens[2];
            if (vsub === 'create') {
                return tokens[3] || 'appdata';
            }
            if (vsub === 'ls') {
                return 'DRIVER      VOLUME NAME\nlocal       appdata\nlocal       olddata';
            }
            if (vsub === 'inspect') {
                const vname = tokens[3] || 'appdata';
                return `[\n    {\n        "Name": "${vname}",\n        "Driver": "local",\n        "Mountpoint": "/home/student/.local/share/containers/storage/volumes/${vname}/_data",\n        "CreatedAt": "2026-04-07T10:05:00.123456789Z",\n        "Labels": {},\n        "Scope": "local",\n        "Options": {}\n    }\n]`;
            }
            if (vsub === 'prune') {
                return 'VOLUME ID\nolddata\n\nTotal reclaimed space: 0 B';
            }
            if (vsub === 'rm') {
                return tokens[3] || 'olddata';
            }
        }

        // podman cp
        if (sub === 'cp') {
            return '';
        }

        // podman generate systemd
        if (sub === 'generate' && input.includes('systemd')) {
            const nameIdx = tokens.indexOf('--name');
            const cname = nameIdx >= 0 ? tokens[nameIdx + 1] : 'webserver';
            return `# container-${cname}.service\n# autogenerated by Podman 4.9.4\n# Mon Apr  7 10:15:00 EDT 2026\n\n[Unit]\nDescription=Podman container-${cname}.service\nDocumentation=man:podman-generate-systemd(1)\nWants=network-online.target\nAfter=network-online.target\nRequiresMountsFor=%t/containers\n\n[Service]\nEnvironment=PODMAN_SYSTEMD_UNIT=%n\nRestart=on-failure\nTimeoutStopSec=70\nExecStart=/usr/bin/podman start ${cname}\nExecStop=/usr/bin/podman stop -t 10 ${cname}\nExecStopPost=/usr/bin/podman stop -t 10 ${cname}\nPIDFile=%t/containers/auto-${cname}.pid\nType=forking\n\n[Install]\nWantedBy=default.target`;
        }

        // podman stats
        if (sub === 'stats') {
            if (input.includes('--all')) {
                return 'ID            NAME        CPU %   MEM USAGE / LIMIT     MEM %   NET IO           BLOCK IO\na1b2c3d4e5f6  webserver   0.12%   12.45MiB / 7.63GiB   0.16%   1.12kB / 648B    0B / 0B\n7d2e9f0a1b2c  database    1.53%   187.2MiB / 7.63GiB   2.40%   4.45kB / 2.1kB   12kB / 8kB';
            }
            return 'ID            NAME        CPU %   MEM USAGE / LIMIT     MEM %   NET IO           BLOCK IO\n7d2e9f0a1b2c  webserver   0.12%   12.45MiB / 7.63GiB   0.16%   1.12kB / 648B    0B / 0B';
        }

        // podman events
        if (sub === 'events') {
            return '2026-04-07 10:05:13.234512345 +0000 UTC container create a1b2c3d4e5f6 (image=docker.io/library/nginx:alpine, name=webserver)\n2026-04-07 10:05:13.557234567 +0000 UTC container init   a1b2c3d4e5f6 (image=docker.io/library/nginx:alpine, name=webserver)\n2026-04-07 10:05:13.712345678 +0000 UTC container start  a1b2c3d4e5f6 (image=docker.io/library/nginx:alpine, name=webserver)';
        }

        // podman healthcheck run
        if (sub === 'healthcheck') {
            return 'healthy';
        }

        // podman diff
        if (sub === 'diff') {
            return 'C /run\nA /run/nginx.pid\nC /var/cache/nginx\nA /var/cache/nginx/client_temp\nA /var/cache/nginx/fastcgi_temp\nA /var/cache/nginx/proxy_temp\nA /var/cache/nginx/scgi_temp\nA /var/cache/nginx/uwsgi_temp';
        }

        // podman system
        if (sub === 'system') {
            if (tokens[2] === 'df') {
                return 'Type           Total   Active  Size        Reclaimable\nImages         3       2       576 MB      148 MB (25%)\nContainers     2       1       2.5 kB      0 B (0%)\nLocal Volumes  2       1       0 B         0 B (0%)';
            }
            if (tokens[2] === 'prune') {
                return 'WARNING! This will remove:\n        - all stopped containers\n        - all volumes not used by at least one container\n        - all images without at least one container associated with them\n\nTotal reclaimed space: 576 MB';
            }
        }
    }

    // ── systemctl --user ──────────────────────────────────────────────────────
    if (command === 'systemctl' && input.includes('--user')) {
        if (input.includes('daemon-reload')) return '';
        if (input.includes('enable')) {
            return 'Created symlink /home/student/.config/systemd/user/default.target.wants/container-webserver.service → /home/student/.config/systemd/user/container-webserver.service.';
        }
        if (input.includes('start') || input.includes('restart')) return '';
        if (input.includes('is-active')) return 'active';
        if (input.includes('status')) {
            if (input.includes('container-webserver')) {
                return '● container-webserver.service - Podman container-webserver.service\n     Loaded: loaded (/home/student/.config/systemd/user/container-webserver.service; enabled; vendor preset: disabled)\n     Active: active (running) since Tue 2026-04-07 10:15:05 EDT; 2min 30s ago\n   Main PID: 12345 (conmon)\n      Tasks: 15 (limit: 23152)\n     Memory: 15.2M\n        CPU: 320ms\n     CGroup: /user.slice/user-1000.slice/user@1000.service/app.slice/container-webserver.service\n             └─12345 /usr/bin/conmon --api-version 1 -c a1b2c3d4e5f6 -n webserver\n\nApr 07 10:15:05 rhel9 systemd[1234]: Started Podman container-webserver.service.';
            }
            return '● container-webserver.service\n     Loaded: loaded; enabled\n     Active: active (running)';
        }
    }

    // ── loginctl ──────────────────────────────────────────────────────────────
    if (command === 'loginctl') {
        if (input.includes('enable-linger')) return '';
        if (input.includes('show-user')) {
            return 'UID=1000\nName=student\nTimestamp=Tue 2026-04-07 09:00:01 EDT\nTimestampMonotonic=456789\nRuntimePath=/run/user/1000\nService=user@1000.service\nSlice=user-1000.slice\nDisplay=1\nState=active\nSessions=1\nIdleHint=no\nIdleSinceHint=0\nIdleSinceHintMonotonic=0\nLinger=yes';
        }
    }

    // ── journalctl --user container-webserver ─────────────────────────────────
    if (command === 'journalctl' && input.includes('--user') && input.includes('container-webserver')) {
        return '-- Journal begins at Mon 2026-04-07 09:00:00 EDT. --\nApr 07 10:15:05 rhel9 systemd[1234]: Starting Podman container-webserver.service...\nApr 07 10:15:05 rhel9 podman[12340]: 2026-04-07 10:15:05.123456789 +0000 UTC INFO Starting container webserver\nApr 07 10:15:06 rhel9 systemd[1234]: Started Podman container-webserver.service.\nApr 07 10:16:02 rhel9 podman[12340]: 192.168.1.105 - - [07/Apr/2026:10:16:02 +0000] "GET / HTTP/1.1" 200 615';
    }

    // ── ls helpers used as pre-checks ─────────────────────────────────────────
    if (command === 'ls') {
        if (input.includes('/var/lib/systemd/linger')) {
            return 'student';
        }
        if (input.includes('/opt/data')) {
            return 'config.txt  data.db  logs/';
        }
        if (input.includes('/etc/config')) {
            return 'app.conf  db.conf  nginx.conf';
        }
    }

    // ── df -h (pre-check) ─────────────────────────────────────────────────────
    if (command === 'df' && hasFlags(input, 'h')) {
        return 'Filesystem      Size  Used Avail Use% Mounted on\ndevtmpfs        3.9G     0  3.9G   0% /dev\ntmpfs           3.9G  1.6M  3.9G   1% /run\n/dev/sda1        50G  8.2G   42G  17% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm';
    }

    return null;
}

// ── Private helpers ────────────────────────────────────────────────────────────

function generateContainerInspectOutput(cname) {
    const portMap = cname === 'webapp' ? '8080' : '9090';
    const image = cname === 'database' ? 'docker.io/library/mariadb:latest' : cname === 'webapp' ? 'docker.io/library/httpd:latest' : 'docker.io/library/nginx:alpine';
    return `[\n    {\n        "Id": "a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f678",\n        "Name": "${cname}",\n        "State": {\n            "Status": "running",\n            "Running": true,\n            "Paused": false,\n            "OOMKilled": false,\n            "Dead": false,\n            "ExitCode": 0\n        },\n        "Image": "${image}",\n        "Mounts": [],\n        "NetworkSettings": {\n            "Ports": {\n                "80/tcp": [\n                    {\n                        "HostIp": "0.0.0.0",\n                        "HostPort": "${portMap}"\n                    }\n                ]\n            }\n        },\n        "Config": {\n            "Hostname": "${cname}",\n            "Env": [\n                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n            ]\n        }\n    }\n]`;
}

function generateContainerLogsOutput(cname, input) {
    if (cname === 'failing') {
        return '[error] Failed to connect to database: connection refused\n[error] Retrying in 5 seconds...\n[error] Failed to connect to database: connection refused\n[warn]  Max retries exceeded, shutting down\n[notice] Signal received: terminating\n[error] AH00016: Configuration Failed';
    }
    if (cname === 'webserver' || cname === 'nginx') {
        return '192.168.1.105 - - [07/Apr/2026:10:23:11 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.76.1"\n192.168.1.105 - - [07/Apr/2026:10:23:45 +0000] "GET /index.html HTTP/1.1" 200 615 "-" "Mozilla/5.0"\n192.168.1.105 - - [07/Apr/2026:10:24:02 +0000] "GET /favicon.ico HTTP/1.1" 404 153 "-" "Mozilla/5.0"';
    }
    return `${cname} started\nListening on port 80`;
}
