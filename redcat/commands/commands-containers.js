// Container Management Commands - podman
// Part of Red Cat RHCSA Terminal Simulator

class ContainerCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.podmanContainers = sharedState.podmanContainers;
        this.podmanImages = sharedState.podmanImages;
    }

    podman(args) {
        if (args.length === 0) {
            return { error: 'podman: missing command' };
        }
        
        const command = args[0];
        
        if (!this.podmanContainers) {
            this.podmanContainers = [
                { id: 'a1b2c3d4e5f6', image: 'registry.access.redhat.com/ubi9/ubi:latest', name: 'web-server', status: 'Up 2 hours', ports: '8080->80/tcp' },
                { id: 'f6e5d4c3b2a1', image: 'docker.io/library/postgres:15', name: 'database', status: 'Up 3 hours', ports: '5432->5432/tcp' }
            ];
        }
        
        if (!this.podmanImages) {
            this.podmanImages = [
                { id: '1234567890ab', repository: 'registry.access.redhat.com/ubi9/ubi', tag: 'latest', created: '2 weeks ago', size: '234 MB' },
                { id: 'ab0987654321', repository: 'docker.io/library/postgres', tag: '15', created: '3 weeks ago', size: '412 MB' },
                { id: 'fedcba098765', repository: 'docker.io/library/nginx', tag: 'latest', created: '1 week ago', size: '187 MB' }
            ];
        }
        
        if (command === 'ps') {
            const flags = this.parseFlags(args.slice(1), ['a']);
            let output = 'CONTAINER ID  IMAGE                                              COMMAND               CREATED      STATUS          PORTS                   NAMES\n';
            
            for (const container of this.podmanContainers) {
                output += `${container.id}  ${container.image.padEnd(50)} /bin/sh           2 hours ago  ${container.status.padEnd(15)} ${container.ports.padEnd(23)} ${container.name}\n`;
            }
            
            return { output };
        }
        
        if (command === 'images') {
            let output = 'REPOSITORY                                TAG         IMAGE ID      CREATED        SIZE\n';
            
            for (const image of this.podmanImages) {
                output += `${image.repository.padEnd(45)} ${image.tag.padEnd(11)} ${image.id}  ${image.created.padEnd(14)} ${image.size}\n`;
            }
            
            return { output };
        }
        
        if (command === 'pull') {
            const image = args[1];
            if (!image) {
                return { error: 'podman pull: missing image name' };
            }
            
            return { output: `Trying to pull ${image}...
Getting image source signatures
Copying blob 123abc456def done  
Copying blob 789ghi012jkl done  
Copying blob 345mno678pqr done  
Copying config abcdef123456 done  
Writing manifest to image destination
Storing signatures
${this.generateUUID().slice(0, 12)}` };
        }
        
        if (command === 'run') {
            const flags = this.parseFlags(args.slice(1), ['d', 'it', 'p', 'name', 'rm']);
            const image = flags.args[0];
            
            if (!image) {
                return { error: 'podman run: missing image name' };
            }
            
            const containerId = this.generateUUID().slice(0, 12);
            
            if (flags.d) {
                return { output: containerId };
            }
            
            return { output: `Running container ${containerId} from image ${image}...\n[Container output would appear here]` };
        }
        
        if (command === 'build') {
            const flags = this.parseFlags(args.slice(1), ['t', 'f']);
            
            return { output: `STEP 1/5: FROM registry.access.redhat.com/ubi9/ubi:latest
STEP 2/5: RUN dnf install -y httpd
--> Using cache 123abc456def
STEP 3/5: COPY index.html /var/www/html/
--> 456def789ghi
STEP 4/5: EXPOSE 80
--> 789ghi012jkl
STEP 5/5: CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]
COMMIT my-web-app
--> 012jkl345mno
Successfully tagged localhost/my-web-app:latest
012jkl345mno` };
        }
        
        if (command === 'stop') {
            const containerName = args[1];
            if (!containerName) {
                return { error: 'podman stop: missing container name or ID' };
            }
            
            return { output: containerName };
        }
        
        if (command === 'rm') {
            const containerName = args[1];
            if (!containerName) {
                return { error: 'podman rm: missing container name or ID' };
            }
            
            return { output: containerName };
        }
        
        if (command === 'rmi') {
            const imageName = args[1];
            if (!imageName) {
                return { error: 'podman rmi: missing image name or ID' };
            }
            
            return { output: `Untagged: ${imageName}\nDeleted: sha256:${this.generateUUID()}` };
        }
        
        return { error: `podman: unknown command: ${command}` };
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    parseFlags(args, validFlags) {
        const flags = {};
        const remainingArgs = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                const flagChars = arg.slice(1).split('');
                for (const char of flagChars) {
                    if (validFlags.includes(char)) {
                        flags[char] = true;
                    }
                }
            } else {
                remainingArgs.push(arg);
            }
        }
        
        flags.args = remainingArgs;
        return flags;
    }
}

if (typeof window !== 'undefined') {
    window.ContainerCommands = ContainerCommands;
}
