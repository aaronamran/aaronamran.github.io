// Output handlers for Section 18: Flatpak
function generateSection18Output(input, tokens) {
    const command = tokens[0];
    
    // DNF install flatpak
    if (command === 'dnf' && input.includes('install') && input.includes('flatpak')) {
        return `Last metadata expiration check: 0:12:34 ago on ${new Date().toDateString()}.
Dependencies resolved.
================================================================================
 Package         Architecture    Version              Repository         Size
================================================================================
Installing:
 flatpak         x86_64          1.15.6-1.el10        appstream          1.8 M
Installing dependencies:
 ostree          x86_64          2024.5-2.el10        appstream          542 k
 libostree       x86_64          2024.5-2.el10        baseos             402 k

Transaction Summary
================================================================================
Install  3 Packages

Total download size: 2.7 M
Installed size: 9.2 M
Downloading Packages:
(1/3): libostree-2024.5-2.el10.x86_64.rpm        312 kB/s | 402 kB     00:01
(2/3): ostree-2024.5-2.el10.x86_64.rpm          421 kB/s | 542 kB     00:01
(3/3): flatpak-1.15.6-1.el10.x86_64.rpm         1.2 MB/s | 1.8 MB     00:01
--------------------------------------------------------------------------------
Total                                            1.8 MB/s | 2.7 MB     00:01
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Preparing        :                                                        1/1
  Installing       : libostree-2024.5-2.el10.x86_64                        1/3
  Installing       : ostree-2024.5-2.el10.x86_64                           2/3
  Installing       : flatpak-1.15.6-1.el10.x86_64                          3/3
  Running scriptlet: flatpak-1.15.6-1.el10.x86_64                          3/3
  Verifying        : flatpak-1.15.6-1.el10.x86_64                          1/3
  Verifying        : ostree-2024.5-2.el10.x86_64                           2/3
  Verifying        : libostree-2024.5-2.el10.x86_64                        3/3

Installed:
  flatpak-1.15.6-1.el10.x86_64    ostree-2024.5-2.el10.x86_64
  libostree-2024.5-2.el10.x86_64

Complete!`;
    }
    
    // Add Flathub remote
    if (command === 'flatpak' && input.includes('remote-add') && input.includes('flathub')) {
        const isUser = input.includes('--user');
        const scope = isUser ? 'user' : 'system';
        return `Note: --if-not-exists was used, remote will not be added if it already exists
Adding remote 'flathub' (${scope})
Downloading remotes...
Remote 'flathub' successfully added`;
    }
    
    // Search for applications
    if (command === 'flatpak' && input.includes('search') && input.includes('firefox')) {
        return `Name                    Description                              Application ID            Version    Branch Remotes
Firefox                 Web Browser                              org.mozilla.firefox       121.0      stable flathub
Firefox ESR             Extended Support Release                 org.mozilla.FirefoxESR    115.6.0esr stable flathub
Waterfox                Privacy-focused web browser              net.waterfox.waterfox     G6.0.7     stable flathub`;
    }
    
    // Install application
    if (command === 'flatpak' && input.includes('install')) {
        let appName = '';
        let appId = '';
        
        if (input.includes('org.mozilla.firefox')) {
            appName = 'Firefox';
            appId = 'org.mozilla.firefox';
        } else if (input.includes('org.gimp.GIMP')) {
            appName = 'GIMP';
            appId = 'org.gimp.GIMP';
        } else if (input.includes('org.libreoffice.LibreOffice')) {
            appName = 'LibreOffice';
            appId = 'org.libreoffice.LibreOffice';
        }
        
        const isUser = input.includes('--user');
        const scope = isUser ? 'user' : 'system';
        const remote = input.includes('usb-repo') ? 'usb-repo' : 'flathub';
        
        let size = '262.3 MB';
        if (appId === 'org.gimp.GIMP') size = '184.7 MB';
        if (appId === 'org.libreoffice.LibreOffice') size = '456.2 MB';
        
        return `Looking for matches…
Required runtime for ${appId}/x86_64/stable found in remote ${remote}

${appId} permissions:
    ipc                network              pulseaudio           wayland
    x11                dri                  file access [1]

    [1] home, xdg-download

        ID                                  Branch       Op       Remote      Download
 1. [✓] org.freedesktop.Platform.GL.default 23.08        i        ${remote}      < 157.9 MB
 2. [✓] org.freedesktop.Platform            23.08        i        ${remote}      < 254.1 MB
 3. [✓] ${appId}                             stable       i        ${remote}      < ${size}

Installation complete.`;
    }
    
    // List applications
    if (command === 'flatpak' && input.includes('list') && input.includes('--app')) {
        const isUser = input.includes('--user');
        let output = `Name       Application ID              Version   Branch  Installation\n`;
        
        if (!isUser) {
            output += `Firefox    org.mozilla.firefox         121.0     stable  system\n`;
        } else {
            output += `GIMP       org.gimp.GIMP               2.10.36   stable  user\n`;
        }
        
        return output.trim();
    }
    
    // List runtimes
    if (command === 'flatpak' && input.includes('list') && input.includes('--runtime')) {
        return `Name                         Application ID                        Version Branch  Installation
Freedesktop Platform         org.freedesktop.Platform              23.08   23.08   system
Freedesktop Platform         org.freedesktop.Platform.GL.default   23.08   23.08   system
GNOME Platform               org.gnome.Platform                    45      45      system
Mesa                         org.freedesktop.Platform.GL.default   23.08   23.08   system`;
    }
    
    // List remotes
    if (command === 'flatpak' && (input === 'flatpak remotes' || input.includes('remote-ls'))) {
        if (input.includes('usb-repo')) {
            return `Ref                                                      Options
app/org.libreoffice.LibreOffice/x86_64/stable
app/org.mozilla.firefox/x86_64/stable
app/org.gimp.GIMP/x86_64/stable
runtime/org.freedesktop.Platform/x86_64/23.08
runtime/org.gnome.Platform/x86_64/45`;
        }
        return `Name     Options
flathub  system`;
    }
    
    // Run application
    if (command === 'flatpak' && input.includes('run')) {
        if (input.includes('org.mozilla.firefox')) {
            return `Launching Firefox...
[GFX1]: glxtest: libEGL initialize failed
[GFX1]: glxtest: libEGL missing
Firefox 121.0 started successfully`;
        }
    }
    
    // Show application info
    if (command === 'flatpak' && input.includes('info')) {
        if (input.includes('--show-permissions')) {
            return `[Context]
shared=network;ipc;
sockets=x11;wayland;pulseaudio;
devices=dri;
filesystems=xdg-download:rw;home;

[Session Bus Policy]
org.freedesktop.Notifications=talk
org.freedesktop.ScreenSaver=talk
org.freedesktop.secrets=talk

[System Bus Policy]
org.freedesktop.NetworkManager=talk`;
        }
        
        if (input.includes('org.mozilla.firefox')) {
            return `Firefox - Web Browser

          ID: org.mozilla.firefox
         Ref: app/org.mozilla.firefox/x86_64/stable
        Arch: x86_64
      Branch: stable
     Version: 121.0
     License: MPL-2.0
      Origin: flathub
  Collection: org.flathub.Stable
Installation: system
   Installed: 262.3 MB
     Runtime: org.freedesktop.Platform/x86_64/23.08
         Sdk: org.freedesktop.Sdk/x86_64/23.08

      Commit: 7f8a9c3b5d2e1a4f6b8c9d0e2f3a4b5c6d7e8f9a
      Parent: 5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d
     Subject: Update to 121.0 (76a8c9d4)
        Date: 2024-01-15 14:23:45 +0000`;
        }
    }
    
    // Override permissions
    if (command === 'flatpak' && input.includes('override')) {
        if (input.includes('--filesystem=home')) {
            return `Overriding permissions for org.mozilla.firefox:
  Added filesystem access: home
Changes will take effect on next application launch`;
        }
        if (input.includes('--reset')) {
            return `Resetting permissions for org.mozilla.firefox to defaults
All custom overrides removed`;
        }
    }
    
    // Update applications
    if (command === 'flatpak' && input.includes('update') && !input.includes('--runtime')) {
        return `Looking for updates…
Nothing to do.`;
    }
    
    // Uninstall
    if (command === 'flatpak' && input.includes('uninstall')) {
        if (input.includes('--unused')) {
            return `Unused runtimes:
  org.freedesktop.Platform.GL.default/x86_64/21.08
  org.gnome.Platform/x86_64/43

Uninstalling 2 unused runtimes
Uninstalling org.freedesktop.Platform.GL.default/x86_64/21.08
Uninstalling org.gnome.Platform/x86_64/43
Uninstall complete.`;
        }
        
        if (input.includes('--delete-data')) {
            return `Uninstalling org.gimp.GIMP/x86_64/stable
Pruning objects
Deleting files: 2847
Removing app data for org.gimp.GIMP
Uninstall complete.`;
        }
        
        return `Uninstalling org.mozilla.firefox/x86_64/stable
Pruning objects
Deleting files: 4521
Uninstall complete.`;
    }
    
    // Remote delete
    if (command === 'flatpak' && input.includes('remote-delete')) {
        return `Removing remote 'usb-repo'
Remote 'usb-repo' successfully removed`;
    }
    
    // Repair
    if (command === 'flatpak' && input.includes('repair')) {
        return `Verifying system flatpak installation...
Checking refs...
Verifying commit metadata...
Pruning orphaned objects...
Repair completed successfully
No issues found`;
    }
    
    return "Command executed";
}

function generateSection18PreCheck(input, tokens) {
    const command = tokens[0];
    
    // Pre-checks for commands that show current state
    if (command === 'flatpak' && input.includes('list')) {
        return generateSection18Output(input, tokens);
    }
    
    if (command === 'flatpak' && input.includes('info')) {
        return generateSection18Output(input, tokens);
    }
    
    if (command === 'flatpak' && input.includes('search')) {
        return generateSection18Output(input, tokens);
    }
    
    if (command === 'flatpak' && input.includes('remote-ls')) {
        return generateSection18Output(input, tokens);
    }
    
    return "";
}
