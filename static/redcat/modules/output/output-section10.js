/** Red Cat - Section 10: Networking */

function generateSection10Output(command, input, tokens) {
    // nmcli connection show [name]
    if (command === 'nmcli' && (input.includes('connection show') || input.includes('c s') || input.includes('con show'))) {
        // Showing details of 'office' connection
        if (input.includes('office')) {
            const progress = appState.sectionProgress[appState.currentSectionId];
            const done = progress ? progress.completedTasks : [];
            const hasIP = done.includes(2);
            const hasGW = done.includes(3);
            const hasDNS = done.includes(3);
            const method = done.includes(2) ? 'manual' : 'auto';
            return `connection.id:                          office\nconnection.uuid:                        a1b2c3d4-e5f6-7890-abcd-ef1234567890\nconnection.interface-name:              enp0s8\nconnection.type:                        802-3-ethernet\nipv4.method:                            ${method}\nipv4.addresses:                         ${hasIP ? '10.0.0.50/24' : ''}\nipv4.gateway:                           ${hasGW ? '10.0.0.1' : ''}\nipv4.dns:                               ${hasDNS ? '10.0.0.2' : ''}\nGENERAL.STATE:                          activated`;
        }
        // Showing details of eth0 connection
        if (input.includes('eth0')) {
            const progress = appState.sectionProgress[appState.currentSectionId];
            const done = progress ? progress.completedTasks : [];
            return `connection.id:                          eth0\nconnection.uuid:                        b2c3d4e5-f6a7-8901-bcde-f12345678901\nconnection.interface-name:              eth0\nconnection.type:                        802-3-ethernet\nipv4.method:                            ${done.includes(2) ? 'manual' : 'auto'}\nipv4.addresses:                         ${done.includes(1) ? '192.168.1.100/24' : '192.168.1.50/24'}\nipv4.gateway:                           ${done.includes(3) ? '192.168.1.1' : ''}\nipv4.dns:                               ${done.includes(4) ? '8.8.8.8,8.8.4.4' : ''}\nGENERAL.STATE:                          activated`;
        }
        // List all connections
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        if (done.includes(1)) {
            return 'NAME    UUID                                  TYPE      DEVICE \noffice  a1b2c3d4-e5f6-7890-abcd-ef1234567890  ethernet  enp0s8\nens160  b2c3d4e5-f6a7-8901-bcde-f12345678901  ethernet  ens160\nvirbr0  fedcba98-7654-3210-fedc-ba9876543210  bridge    virbr0';
        }
        return 'NAME    UUID                                  TYPE      DEVICE \nens160  b2c3d4e5-f6a7-8901-bcde-f12345678901  ethernet  ens160\nvirbr0  fedcba98-7654-3210-fedc-ba9876543210  bridge    virbr0';
    }

    // nmcli device show
    if (command === 'nmcli' && input.includes('device show')) {
        return 'GENERAL.DEVICE:                         ens160\nGENERAL.TYPE:                           ethernet\nGENERAL.HWADDR:                         00:0C:29:12:34:56\nGENERAL.MTU:                            1500\nGENERAL.STATE:                          100 (connected)\nGENERAL.CONNECTION:                     ens160\nIP4.ADDRESS[1]:                         192.168.1.50/24\nIP4.GATEWAY:                            192.168.1.1\nIP4.DNS[1]:                             192.168.1.1';
    }

    // nmcli connection add
    if (command === 'nmcli' && (input.includes('connection add') || input.includes('con add'))) {
        if (input.includes('office')) {
            return 'Connection \'office\' (a1b2c3d4-e5f6-7890-abcd-ef1234567890) successfully added.';
        }
        if (input.includes('static-eth')) {
            return 'Connection \'static-eth\' (fedcba98-7654-3210-fedc-ba9876543210) successfully added.';
        }
        return 'Connection successfully added.';
    }

    // nmcli connection modify
    if (command === 'nmcli' && (input.includes('connection modify') || input.includes('con mod'))) {
        return null; // silent success
    }

    // nmcli connection up
    if (command === 'nmcli' && (input.includes('connection up') || input.includes('con up'))) {
        if (input.includes('office')) {
            return 'Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)';
        }
        return 'Connection successfully activated';
    }

    // nmcli connection down
    if (command === 'nmcli' && (input.includes('connection down') || input.includes('con down'))) {
        return 'Connection successfully deactivated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)';
    }

    // nmcli connection delete
    if (command === 'nmcli' && (input.includes('connection delete') || input.includes('con del'))) {
        return null; // silent success
    }

    // nmcli connection reload
    if (command === 'nmcli' && (input.includes('connection reload') || input.includes('con reload'))) {
        return null; // silent success
    }

    // ip addr show
    if (command === 'ip' && (input.includes('addr show') || input.includes('addr') || input === 'a' || input.endsWith(' a'))) {
        return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n    inet6 ::1/128 scope host \n       valid_lft forever preferred_lft forever\n2: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 00:0c:29:12:34:56 brd ff:ff:ff:ff:ff:ff\n    altname enp2s0\n    inet 192.168.1.50/24 brd 192.168.1.255 scope global noprefixroute ens160\n       valid_lft forever preferred_lft forever\n    inet6 fe80::20c:29ff:fe12:3456/64 scope link noprefixroute \n       valid_lft forever preferred_lft forever';
    }

    // hostnamectl [status]
    if (command === 'hostnamectl' && (!input.includes('set-hostname'))) {
        return ' Static hostname: localhost.localdomain\n       Icon name: computer-vm\n         Chassis: vm\n      Machine ID: a1b2c3d4e5f67890abcdef1234567890\n         Boot ID: fedcba9876543210fedcba9876543210\n  Virtualization: vmware\nOperating System: Red Hat Enterprise Linux 9.3 (Plow)\n     CPE OS Name: cpe:/o:redhat:enterprise_linux:9::baseos\n          Kernel: Linux 5.14.0-362.el9.x86_64\n    Architecture: x86-64';
    }

    // hostnamectl set-hostname
    if (command === 'hostnamectl' && input.includes('set-hostname')) {
        return null; // silent success
    }

    // cat /etc/hostname
    if (command === 'cat' && input.includes('/etc/hostname')) {
        return 'localhost.localdomain';
    }

    // nslookup
    if (command === 'nslookup') {
        const target = tokens[1] || 'redhat.com';
        return `Server:\t\t192.168.1.1\nAddress:\t192.168.1.1#53\n\nNon-authoritative answer:\nName:\t${target}\nAddress: 52.200.142.250`;
    }

    // dig
    if (command === 'dig') {
        const target = tokens[1] || 'redhat.com';
        return `; <<>> DiG 9.16.23-RH <<>> ${target}\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n;; QUESTION SECTION:\n;${target}.\t\t\tIN\tA\n\n;; ANSWER SECTION:\n${target}.\t\t300\tIN\tA\t52.200.142.250\n\n;; Query time: 12 msec\n;; SERVER: 192.168.1.1#53(192.168.1.1)\n;; WHEN: Mon Apr  7 10:30:00 EST 2026\n;; MSG SIZE  rcvd: 55`;
    }

    // host
    if (command === 'host') {
        const target = tokens[1] || 'redhat.com';
        return `${target} has address 52.200.142.250\n${target} mail is handled by 10 mx1.${target}.`;
    }

    // ping
    if (command === 'ping') {
        const target = tokens[1] || '8.8.8.8';
        return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=115 time=12.3 ms\n64 bytes from ${target}: icmp_seq=2 ttl=115 time=11.8 ms\n64 bytes from ${target}: icmp_seq=3 ttl=115 time=12.1 ms\n\n--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms\nrtt min/avg/max/mdev = 11.825/12.067/12.283/0.189 ms`;
    }

    // ss : socket statistics
    if (command === 'ss') {
        if (input.includes('-tulnp') || input.includes('-tulpn')) {
            return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process\ntcp    LISTEN  0       128            0.0.0.0:22             0.0.0.0:*      users:(("sshd",pid=1098,fd=3))\ntcp    LISTEN  0       511            0.0.0.0:80             0.0.0.0:*      users:(("httpd",pid=1234,fd=4))\ntcp    LISTEN  0       511            0.0.0.0:443            0.0.0.0:*      users:(("httpd",pid=1234,fd=6))\ntcp    LISTEN  0       128               [::]:22                [::]:*      users:(("sshd",pid=1098,fd=4))\nudp    UNCONN  0       0              0.0.0.0:68             0.0.0.0:*      users:(("NetworkManager",pid=1045,fd=23))';
        }
        if (input.includes('-s')) {
            return 'Total: 187\nTCP:   45 (estab 12, closed 5, orphaned 0, timewait 3)\nTransport Total     IP        IPv6\nUDP\t  12        8         4\nTCP\t  40        25        15\nINET\t  52        33        19';
        }
        return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port\ntcp    ESTAB   0       0        192.168.1.50:22       192.168.1.10:54321\ntcp    ESTAB   0       0        192.168.1.50:80       192.168.1.15:48292';
    }

    // who : logged-in users
    if (command === 'who') {
        return 'root     pts/0        2026-04-07 10:15 (192.168.1.10)\nalice    pts/1        2026-04-07 11:30 (192.168.1.11)';
    }

    // SSH key file commands
    if (command === 'ls' && input.includes('.ssh')) {
        if (input.includes('-l') || input.includes('-la')) {
            return 'total 16\n-rw------- 1 root root 1679 Jan 20 10:00 id_rsa\n-rw-r--r-- 1 root root  395 Jan 20 10:00 id_rsa.pub\n-rw------- 1 root root  395 Jan 20 10:00 authorized_keys';
        }
        return 'authorized_keys  id_rsa  id_rsa.pub';
    }

    if (command === 'stat' && input.includes('id_rsa') && !input.includes('id_rsa.pub')) {
        return '  File: /root/.ssh/id_rsa\n  Size: 1679      \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 12345      Links: 1\nAccess: (0600/-rw-------)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500';
    }

    if (command === 'cat' && input.includes('authorized_keys')) {
        return 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDVeKGAp3FiuToqeXxYm1qVpayMeS2mDXBfHBF+gTmLz8JlKjPbZW8QkNrD1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL user@workstation';
    }

    if (command === 'cat' && input.includes('id_rsa.pub')) {
        return 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDVeKGAp3FiuToqeXxYm1qVpayMeS2mDXBfHBF+gTmLz8JlKjPbZW8QkNrD1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL root@server1.example.com';
    }

    if (command === 'ssh-keygen') {
        if (input.includes('-t') && input.includes('rsa')) {
            return 'Generating public/private rsa key pair.\nEnter file in which to save the key (/root/.ssh/id_rsa): \nCreated directory \'/root/.ssh\'.\nEnter passphrase (empty for no passphrase): \nEnter same passphrase again: \nYour identification has been saved in /root/.ssh/id_rsa\nYour public key has been saved in /root/.ssh/id_rsa.pub\nThe key fingerprint is:\nSHA256:mK3ABcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd root@server1.example.com\nThe key\'s randomart image is:\n+---[RSA 4096]----+\n|   .o .          |\n|   ooo           |\n|  .=o.+          |\n| o.=.= .         |\n|..+.+.+ S        |\n|.o.o.o.= .       |\n| o+o..+ o        |\n|..**+=.+         |\n|.o=OB*+.         |\n+----[SHA256]-----+';
        }
        // ssh-keygen -l fingerprint check
        return '2048 SHA256:mK3ABcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd root@server1.example.com (RSA)';
    }

    return null;
}

function generateSection10PreCheck(task, command, input, tokens) {
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);

    // Set 2, Task 1: Show connections before creating 'office'
    if (questionSetIndex === 2 && task.id === 1) {
        if (command === 'nmcli' && (input.includes('connection show') || input.includes('c s'))) {
            if (input.includes('office')) {
                return 'Error: connection \'office\' not found';
            }
            return 'NAME    UUID                                  TYPE      DEVICE \nens160  b2c3d4e5-f6a7-8901-bcde-f12345678901  ethernet  ens160\nvirbr0  fedcba98-7654-3210-fedc-ba9876543210  bridge    virbr0';
        }
    }

    // Set 2, Task 2: Show office without IP assigned yet
    if (questionSetIndex === 2 && task.id === 2) {
        if (command === 'nmcli' && input.includes('connection show') && input.includes('office')) {
            return 'connection.id:                          office\nconnection.uuid:                        a1b2c3d4-e5f6-7890-abcd-ef1234567890\nconnection.interface-name:              enp0s8\nconnection.type:                        802-3-ethernet\nipv4.method:                            auto\nipv4.addresses:                         \nipv4.gateway:                           \nipv4.dns:                               \nGENERAL.STATE:                          activated';
        }
    }

    return null;
}
